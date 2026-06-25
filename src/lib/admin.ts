import 'server-only';
import { getCurrentUser } from './auth';
import type { User } from '@prisma/client';

// Returns the current user only if they are an ADMIN, else null.
export async function getAdminUser(): Promise<User | null> {
  const user = await getCurrentUser();
  return user && user.role === 'ADMIN' ? user : null;
}
