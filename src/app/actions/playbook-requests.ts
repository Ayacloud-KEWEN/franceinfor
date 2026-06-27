'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getAdminUser } from '@/lib/admin';
import type { PlaybookRequestStatus } from '@prisma/client';

const STATUSES: PlaybookRequestStatus[] = ['NEW', 'PLANNED', 'DONE', 'DECLINED'];

// Customer submits a request for a new playbook. Any logged-in user may submit.
export async function submitPlaybookRequestAction(
  formData: FormData
): Promise<{ ok: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false };

  const title = String(formData.get('title') || '').trim().slice(0, 200);
  if (!title) return { ok: false };

  await prisma.playbookRequest.create({
    data: {
      title,
      sector: String(formData.get('sector') || '').trim().slice(0, 100) || null,
      detail: String(formData.get('detail') || '').trim().slice(0, 2000) || null,
      locale: String(formData.get('locale') || user.locale || 'en'),
      userId: user.id,
      userEmail: user.email,
    },
  });
  revalidatePath(`/${user.locale}/playbooks`);
  return { ok: true };
}

// Admin triages a request (status + internal note).
export async function updatePlaybookRequestAction(formData: FormData): Promise<void> {
  const admin = await getAdminUser();
  if (!admin) return;
  const id = String(formData.get('id') || '');
  const status = formData.get('status') as PlaybookRequestStatus;
  if (!id || !STATUSES.includes(status)) return;
  await prisma.playbookRequest.update({
    where: { id },
    data: {
      status,
      adminNote: String(formData.get('adminNote') || '').trim().slice(0, 1000) || null,
    },
  });
  revalidatePath(`/${admin.locale}/admin/playbook-requests`);
}
