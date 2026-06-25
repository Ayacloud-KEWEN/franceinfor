'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { recordEvent } from '@/lib/events';
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
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

export async function logoutAction(locale: string) {
  await destroySession();
  redirect(`/${locale}/login`);
}
