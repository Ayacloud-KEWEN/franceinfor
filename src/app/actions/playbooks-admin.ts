'use server';

import { revalidatePath } from 'next/cache';
import { getAdminUser } from '@/lib/admin';
import { generatePlaybookDraft } from '@/lib/playbook-draft';
import {
  saveDraft,
  updateDraftData,
  publishPlaybook,
  deletePlaybook,
} from '@/lib/playbooks-db';
import type { Loc, RawPlaybook } from '@/lib/data/playbooks';

type Result = { ok: boolean; error?: string; id?: string };

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

export async function deletePlaybookAction(formData: FormData): Promise<void> {
  const admin = await getAdminUser();
  if (!admin) return;
  const id = String(formData.get('id') || '');
  if (!id) return;
  await deletePlaybook(id);
  revalidatePath(`/${admin.locale}/admin/playbooks`);
}
