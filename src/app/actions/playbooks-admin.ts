'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/admin';
import { generatePlaybookDraft } from '@/lib/playbook-draft';
import { checkUrls } from '@/lib/link-check';
import {
  saveDraft,
  updateDraftData,
  publishPlaybook,
  deletePlaybook,
  getRawPlaybook,
} from '@/lib/playbooks-db';
import type { Loc, RawPlaybook, PlaybookRef } from '@/lib/data/playbooks';

type Result = { ok: boolean; error?: string; id?: string; brokenLinks?: string[] };

// Collect every reference URL across the playbook (top-level + per task).
function allUrls(raw: RawPlaybook): string[] {
  const refs: PlaybookRef[] = [
    ...(raw.references ?? []),
    ...((raw.tasks ?? []).flatMap((t) => t.references ?? [])),
  ];
  return refs.map((r) => r.url).filter(Boolean);
}

// AI-draft a playbook from a topic, store it as DRAFT for review.
export async function generateDraftAction(formData: FormData): Promise<Result> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: 'forbidden' };
  const topic = String(formData.get('topic') || '').trim().slice(0, 200);
  if (!topic) return { ok: false, error: 'empty_topic' };
  try {
    const draft = await generatePlaybookDraft(topic, admin.locale as Loc);
    const id = await saveDraft(draft, 'ai');
    revalidatePath(`/${admin.locale}/admin/playbooks`);
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// Save admin edits to a draft's JSON.
export async function saveDraftJsonAction(formData: FormData): Promise<Result> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: 'forbidden' };
  const id = String(formData.get('id') || '');
  const json = String(formData.get('json') || '');
  if (!id || !json) return { ok: false, error: 'missing' };
  let raw: RawPlaybook;
  try {
    raw = JSON.parse(json) as RawPlaybook;
  } catch {
    return { ok: false, error: 'invalid_json' };
  }
  if (!raw.slug || !raw.title || !Array.isArray(raw.tasks)) {
    return { ok: false, error: 'missing_required_fields' };
  }
  await updateDraftData(id, raw);
  revalidatePath(`/${admin.locale}/admin/playbooks`);
  return { ok: true };
}

export async function publishPlaybookAction(formData: FormData): Promise<void> {
  const admin = await getAdminUser();
  if (!admin) return;
  const id = String(formData.get('id') || '');
  if (!id) return;
  await publishPlaybook(id);
  revalidatePath(`/${admin.locale}/admin/playbooks`);
  revalidatePath(`/${admin.locale}/playbooks`);
}

// Publish with a server-side link-reachability gate. Refuses if any reference
// URL is broken (the verification panel surfaces this before the admin gets here).
export async function publishCheckedAction(id: string): Promise<Result> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: 'forbidden' };
  const raw = await getRawPlaybook(id);
  if (!raw) return { ok: false, error: 'not_found' };
  const results = await checkUrls(allUrls(raw));
  const broken = results.filter((r) => !r.ok).map((r) => r.url);
  if (broken.length) return { ok: false, error: 'broken_links', brokenLinks: broken };
  await publishPlaybook(id);
  revalidatePath(`/${admin.locale}/admin/playbooks`);
  revalidatePath(`/${admin.locale}/playbooks`);
  return { ok: true };
}

// One-click: AI-draft a playbook directly from a customer request, then mark the
// request PLANNED so the queue reflects that it's being worked on.
export async function draftFromRequestAction(requestId: string): Promise<Result> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: 'forbidden' };
  const reqRow = await prisma.playbookRequest.findUnique({ where: { id: requestId } });
  if (!reqRow) return { ok: false, error: 'not_found' };
  try {
    const topic = [reqRow.title, reqRow.sector, reqRow.detail].filter(Boolean).join(' — ');
    const draft = await generatePlaybookDraft(topic, (reqRow.locale || admin.locale) as Loc);
    const draftId = await saveDraft(draft, 'ai');
    await prisma.playbookRequest.update({ where: { id: requestId }, data: { status: 'PLANNED' } });
    revalidatePath(`/${admin.locale}/admin/playbook-requests`);
    revalidatePath(`/${admin.locale}/admin/playbooks`);
    return { ok: true, id: draftId };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deletePlaybookAction(formData: FormData): Promise<void> {
  const admin = await getAdminUser();
  if (!admin) return;
  const id = String(formData.get('id') || '');
  if (!id) return;
  await deletePlaybook(id);
  revalidatePath(`/${admin.locale}/admin/playbooks`);
}
