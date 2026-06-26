'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { recordEvent } from '@/lib/events';
import { notifyEmail } from '@/lib/notify';
import { rateLimit } from '@/lib/rate-limit';
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  createPasswordResetToken,
  consumePasswordResetToken,
  setPassword,
} from '@/lib/auth';

export async function registerAction(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const email = String(formData.get('email') || '').toLowerCase().trim();
  const password = String(formData.get('password') || '');
  const name = String(formData.get('name') || '').trim();
  const locale = String(formData.get('locale') || 'en');

  if (!email || !password) return { error: 'Email and password required.' };
  if (password.length < 6) return { error: 'Password must be at least 6 characters.' };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: 'An account with this email already exists.' };

  const user = await prisma.user.create({
    data: { email, name, passwordHash: await hashPassword(password), locale },
  });
  await recordEvent('USER_REGISTERED', { userId: user.id, email: user.email, meta: { name } });
  await createSession(user.id);
  redirect(`/${locale}/dashboard`);
}

export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const email = String(formData.get('email') || '').toLowerCase().trim();
  const password = String(formData.get('password') || '');
  const locale = String(formData.get('locale') || 'en');

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: 'Invalid email or password.' };
  }
  await createSession(user.id);
  redirect(`/${locale}/dashboard`);
}

// Request a reset link. Always reports success (never reveals whether an
// account exists), rate-limited per email.
export async function requestPasswordResetAction(
  _prev: { sent?: boolean; error?: string } | undefined,
  formData: FormData
): Promise<{ sent?: boolean; error?: string }> {
  const email = String(formData.get('email') || '').toLowerCase().trim();
  const locale = String(formData.get('locale') || 'en');
  if (!email) return { error: 'Email required.' };

  if (!rateLimit(`pwreset:${email}`, 3, 60 * 60_000)) return { sent: true };

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = await createPasswordResetToken(user.id);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const link = `${appUrl}/${locale}/reset-password?token=${token}`;
    await notifyEmail(
      user.email,
      'Reset your FranceGo password',
      `Reset your password using this link (valid 1 hour):\n${link}\n\nIf you didn't request this, ignore this email.`
    );
  }
  return { sent: true };
}

// Complete the reset with a valid token + new password.
export async function resetPasswordAction(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const token = String(formData.get('token') || '');
  const password = String(formData.get('password') || '');
  const confirm = String(formData.get('confirm') || '');
  const locale = String(formData.get('locale') || 'en');

  if (password.length < 6) return { error: 'Password must be at least 6 characters.' };
  if (password !== confirm) return { error: 'Passwords do not match.' };

  const userId = await consumePasswordResetToken(token);
  if (!userId) return { error: 'This reset link is invalid or has expired.' };

  await setPassword(userId, password);
  redirect(`/${locale}/login?reset=done`);
}

export async function logoutAction(locale: string) {
  await destroySession();
  redirect(`/${locale}/login`);
}
