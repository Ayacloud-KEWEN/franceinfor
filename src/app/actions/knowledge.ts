'use server';

import { revalidatePath } from 'next/cache';
import { getAdminUser } from '@/lib/admin';
import { setNodeStatus, setEdgeStatus } from '@/lib/knowledge-graph';
import type { KnowledgeStatus } from '@prisma/client';

const STATUSES: KnowledgeStatus[] = ['CANDIDATE', 'APPROVED', 'REJECTED'];

export async function reviewNodeAction(formData: FormData): Promise<void> {
  const admin = await getAdminUser();
  if (!admin) return;
  const id = String(formData.get('id') || '');
  const status = formData.get('status') as KnowledgeStatus;
  if (!id || !STATUSES.includes(status)) return;
  await setNodeStatus(id, status);
  revalidatePath(`/${admin.locale}/admin/knowledge`);
}

export async function reviewEdgeAction(formData: FormData): Promise<void> {
  const admin = await getAdminUser();
  if (!admin) return;
  const id = String(formData.get('id') || '');
  const status = formData.get('status') as KnowledgeStatus;
  if (!id || !STATUSES.includes(status)) return;
  await setEdgeStatus(id, status);
  revalidatePath(`/${admin.locale}/admin/knowledge`);
}
