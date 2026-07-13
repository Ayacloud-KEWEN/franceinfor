'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import type { Prisma } from '@prisma/client';
import type { EntryProfile, EntryStage, Budget, Goal } from '@/lib/profile';

const STAGES: EntryStage[] = ['exploring', 'planning', 'incorporating', 'operating', 'scaling'];
const BUDGETS: Budget[] = ['lt50k', '50to200k', '200kto1m', 'gt1m'];
const GOALS: Goal[] = ['customers', 'distributors', 'incorporate', 'tenders', 'funding', 'brand', 'hiring'];

// Save the onboarding / profile form. `redirectTo` controls where to go after
// (onboarding → dashboard; settings → back to settings). Returns nothing on
// success (redirect) or an error string.
export async function saveProfileAction(
  _prev: { error?: string; saved?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; saved?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { error: 'unauthorized' };

  const stageRaw = String(formData.get('stage') || '');
  const budgetRaw = String(formData.get('budget') || '');
  const goals = formData
    .getAll('goals')
    .map((g) => String(g))
    .filter((g): g is Goal => (GOALS as string[]).includes(g));

  const profile: EntryProfile = {
    product: String(formData.get('product') || '').trim().slice(0, 160) || undefined,
    industry: String(formData.get('industry') || '').trim().slice(0, 120) || undefined,
    region: String(formData.get('region') || '').trim().slice(0, 120) || undefined,
    stage: (STAGES as string[]).includes(stageRaw) ? (stageRaw as EntryStage) : undefined,
    budget: (BUDGETS as string[]).includes(budgetRaw) ? (budgetRaw as Budget) : undefined,
    goals: goals.length ? goals : undefined,
  };

  await prisma.user.update({
    where: { id: user.id },
    data: { profile: profile as unknown as Prisma.InputJsonValue, onboardedAt: new Date() },
  });

  const redirectTo = String(formData.get('redirectTo') || '');
  const locale = String(formData.get('locale') || user.locale || 'en');
  if (redirectTo === 'settings') return { saved: true };
  redirect(`/${locale}/dashboard`);
}

// Mark onboarding as skipped (sets onboardedAt so we stop prompting) without
// storing a profile.
export async function skipOnboardingAction(locale: string): Promise<void> {
  const user = await getCurrentUser();
  if (user) {
    await prisma.user.update({ where: { id: user.id }, data: { onboardedAt: new Date() } });
  }
  redirect(`/${locale}/dashboard`);
}
