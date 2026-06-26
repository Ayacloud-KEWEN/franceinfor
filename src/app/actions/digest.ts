'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function updateDigestAction(
  _prev: { saved?: boolean } | undefined,
  formData: FormData
): Promise<{ saved?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return {};

  const enabled = formData.get('enabled') === 'on';
  const keywords = String(formData.get('keywords') || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 20);

  await prisma.user.update({
    where: { id: user.id },
    data: { digestEnabled: enabled, digestKeywords: keywords },
  });
  revalidatePath(`/${user.locale}/settings`);
  return { saved: true };
}
