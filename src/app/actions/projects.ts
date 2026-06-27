'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/admin';
import type { ProjectStatus, StepStatus } from '@prisma/client';

const PROJECT_STATUSES: ProjectStatus[] = ['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const STEP_STATUSES: StepStatus[] = ['PENDING', 'IN_PROGRESS', 'DONE', 'BLOCKED'];

const num = (v: FormDataEntryValue | null) => {
  const n = parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) ? n : null;
};

export async function createProjectAction(formData: FormData): Promise<void> {
  const admin = await getAdminUser();
  if (!admin) return;
  const title = String(formData.get('title') || '').trim();
  if (!title) return;
  await prisma.project.create({
    data: {
      title,
      playbookSlug: String(formData.get('playbookSlug') || '').trim() || null,
      sector: String(formData.get('sector') || '').trim() || null,
      region: String(formData.get('region') || '').trim() || null,
      ownerId: admin.id,
    },
  });
  revalidatePath(`/${admin.locale}/admin/projects`);
}

export async function updateProjectAction(formData: FormData): Promise<void> {
  const admin = await getAdminUser();
  if (!admin) return;
  const id = String(formData.get('id') || '');
  const status = formData.get('status') as ProjectStatus;
  if (!id || !PROJECT_STATUSES.includes(status)) return;
  await prisma.project.update({
    where: { id },
    data: {
      status,
      actualDays: num(formData.get('actualDays')),
      actualCostEur: num(formData.get('actualCostEur')),
      completedAt: status === 'COMPLETED' ? new Date() : null,
    },
  });
  revalidatePath(`/${admin.locale}/admin/projects`);
}

export async function addStepAction(formData: FormData): Promise<void> {
  const admin = await getAdminUser();
  if (!admin) return;
  const projectId = String(formData.get('projectId') || '');
  const name = String(formData.get('name') || '').trim();
  if (!projectId || !name) return;
  const status = formData.get('status') as StepStatus;
  await prisma.projectStep.create({
    data: {
      projectId,
      name,
      status: STEP_STATUSES.includes(status) ? status : 'PENDING',
      actualDays: num(formData.get('actualDays')),
      approvalDays: num(formData.get('approvalDays')),
      authority: String(formData.get('authority') || '').trim() || null,
      partner: String(formData.get('partner') || '').trim() || null,
      problem: String(formData.get('problem') || '').trim() || null,
      solution: String(formData.get('solution') || '').trim() || null,
      lessons: String(formData.get('lessons') || '').trim() || null,
    },
  });
  revalidatePath(`/${admin.locale}/admin/projects`);
}
