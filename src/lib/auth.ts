import 'server-only';
import { cookies } from 'next/headers';
import { randomBytes, createHash } from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import type { User } from '@prisma/client';

const SESSION_COOKIE = 'france_os_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function generateSessionToken(): string {
  return randomBytes(24).toString('hex');
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function hashPassword(pwd: string): Promise<string> {
  return bcrypt.hash(pwd, 10);
}

export async function verifyPassword(pwd: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pwd, hash);
}

export async function createSession(userId: string): Promise<void> {
  const token = generateSessionToken();
  const sessionId = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({ data: { id: sessionId, userId, expiresAt } });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { id: hashToken(token) },
    include: { user: true },
  });
  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session.user;
}

const RESET_TTL_MS = 1000 * 60 * 60; // 1 hour

// Create a single-use reset token; returns the raw token for the email link.
export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = generateSessionToken();
  await prisma.passwordResetToken.create({
    data: { id: hashToken(token), userId, expiresAt: new Date(Date.now() + RESET_TTL_MS) },
  });
  return token;
}

// Validate + consume a reset token. Returns the userId, or null if invalid/expired.
export async function consumePasswordResetToken(token: string): Promise<string | null> {
  if (!token) return null;
  const id = hashToken(token);
  const row = await prisma.passwordResetToken.findUnique({ where: { id } });
  if (!row) return null;
  // Single-use: delete regardless of outcome.
  await prisma.passwordResetToken.delete({ where: { id } }).catch(() => {});
  if (row.expiresAt < new Date()) return null;
  return row.userId;
}

// Set a new password and invalidate all existing sessions + reset tokens.
export async function setPassword(userId: string, password: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(password) },
  });
  await prisma.session.deleteMany({ where: { userId } });
  await prisma.passwordResetToken.deleteMany({ where: { userId } });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { id: hashToken(token) } }).catch(() => {});
  }
  cookieStore.delete(SESSION_COOKIE);
}
