import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { parseProgress, type StepStatus } from '@/lib/profile';
import { ALL_STEPS } from '@/lib/data/entry-plan';

const STATUSES: StepStatus[] = ['todo', 'doing', 'done'];
const STEP_IDS = new Set(ALL_STEPS.map((s) => s.id));

// Update the status of one plan step for the current user.
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const stepId = String(body?.stepId || '');
  const status = String(body?.status || '');
  if (!STEP_IDS.has(stepId) || !(STATUSES as string[]).includes(status)) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  const progress = parseProgress(user);
  if (status === 'todo') delete progress[stepId];
  else progress[stepId] = status as StepStatus;

  await prisma.user.update({ where: { id: user.id }, data: { entryProgress: progress } });
  return NextResponse.json({ ok: true, progress });
}
