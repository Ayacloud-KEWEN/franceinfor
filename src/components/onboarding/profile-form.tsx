'use client';

import { useActionState, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Loader2, ArrowRight } from 'lucide-react';
import { saveProfileAction } from '@/app/actions/profile';
import {
  STAGE_LABELS, BUDGET_LABELS, GOAL_LABELS, toLoc,
  type EntryProfile, type EntryStage, type Budget, type Goal,
} from '@/lib/profile';

const STAGES = Object.keys(STAGE_LABELS) as EntryStage[];
const BUDGETS = Object.keys(BUDGET_LABELS) as Budget[];
const GOALS = Object.keys(GOAL_LABELS) as Goal[];

export function ProfileForm({
  initial,
  context,
}: {
  initial: EntryProfile | null;
  context: 'onboarding' | 'settings';
}) {
  const t = useTranslations('onboarding');
  const locale = useLocale();
  const loc = toLoc(locale);
  const [state, formAction, pending] = useActionState(saveProfileAction, undefined);

  const [stage, setStage] = useState<EntryStage | ''>(initial?.stage ?? '');
  const [budget, setBudget] = useState<Budget | ''>(initial?.budget ?? '');
  const [goals, setGoals] = useState<Goal[]>(initial?.goals ?? []);

  const toggleGoal = (g: Goal) =>
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="redirectTo" value={context} />
      <input type="hidden" name="stage" value={stage} />
      <input type="hidden" name="budget" value={budget} />
      {goals.map((g) => <input key={g} type="hidden" name="goals" value={g} />)}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">{t('product')}</span>
          <Input name="product" defaultValue={initial?.product ?? ''} placeholder={t('productPh')} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">{t('industry')}</span>
          <Input name="industry" defaultValue={initial?.industry ?? ''} placeholder={t('industryPh')} />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">{t('region')}</span>
        <Input name="region" defaultValue={initial?.region ?? ''} placeholder={t('regionPh')} />
      </label>

      <div>
        <span className="mb-1.5 block text-sm font-medium">{t('stage')}</span>
        <div className="flex flex-wrap gap-2">
          {STAGES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStage(stage === s ? '' : s)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                stage === s ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'
              }`}
            >
              {STAGE_LABELS[s][loc]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium">{t('budget')}</span>
        <div className="flex flex-wrap gap-2">
          {BUDGETS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBudget(budget === b ? '' : b)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                budget === b ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'
              }`}
            >
              {BUDGET_LABELS[b][loc]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium">{t('goals')}</span>
        <div className="flex flex-wrap gap-2">
          {GOALS.map((g) => {
            const on = goals.includes(g);
            return (
              <button
                key={g}
                type="button"
                onClick={() => toggleGoal(g)}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  on ? 'border-accent bg-accent/15 text-accent' : 'border-border hover:bg-muted'
                }`}
              >
                {on && <Check size={13} />} {GOAL_LABELS[g][loc]}
              </button>
            );
          })}
        </div>
      </div>

      {state?.saved && (
        <p className="flex items-center gap-2 rounded-md bg-accent/15 px-3 py-2 text-sm text-accent">
          <Check size={16} /> {t('saved')}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {context === 'onboarding' ? t('finish') : t('save')}
        {context === 'onboarding' && <ArrowRight size={15} />}
      </Button>
    </form>
  );
}
