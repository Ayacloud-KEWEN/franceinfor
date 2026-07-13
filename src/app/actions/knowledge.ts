'use server';

import { revalidatePath } from 'next/cache';
import { getAdminUser } from '@/lib/admin';
import { setNodeStatus, setEdgeStatus, extractPending } from '@/lib/knowledge-graph';
import { indexPending } from '@/lib/knowledge';
import type { KnowledgeStatus } from '@prisma/client';

const STATUSES: KnowledgeStatus[] = ['CANDIDATE', 'APPROVED', 'REJECTED'];

// Admin-triggered L2 pipeline: embed pending docs into the vector store, then
// extract knowledge-graph candidates from recent documents. Idempotent. Lets
// the operator bootstrap the graph without setting up the cron schedule.
export async function runPipelineAction(): Promise<void> {
  const admin = await getAdminUser();
  if (!admin) return;
  try {
    await indexPending();
    await extractPending();
  } catch {
    /* best-effort; partial progress is fine (idempotent) */
  }
  revalidatePath(`/${admin.locale}/admin/knowledge`);
}

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
