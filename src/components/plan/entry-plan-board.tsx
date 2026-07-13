'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Circle, CircleDot, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import type { StepStatus, EntryProgress } from '@/lib/profile';

interface ClientStep { id: string; title: string; desc: string; href: string; recommended: boolean }
interface ClientPhase { id: string; title: string; subtitle: string; steps: ClientStep[] }

const NEXT: Record<StepStatus, StepStatus> = { todo: 'doing', doing: 'done', done: 'todo' };

export function EntryPlanBoard({
  phases,
  initialProgress,
}: {
  phases: ClientPhase[];
  initialProgress: EntryProgress;
}) {
  const t = useTranslations('plan');
  const [progress, setProgress] = useState<EntryProgress>(initialProgress);

  const allSteps = useMemo(() => phases.flatMap((p) => p.steps), [phases]);
  const total = allSteps.length;
  const done = allSteps.filter((s) => (progress[s.id] ?? 'todo') === 'done').length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  async function cycle(stepId: string) {
    const current: StepStatus = progress[stepId] ?? 'todo';
    const next = NEXT[current];
    const optimistic = { ...progress };
    if (next === 'todo') delete optimistic[stepId];
    else optimistic[stepId] = next;
    setProgress(optimistic);
    try {
      await fetch('/api/plan', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ stepId, status: next }),
      });
    } catch {
      setProgress(progress); // revert on failure
    }
  }

  const statusIcon = (s: StepStatus) =>
    s === 'done' ? (
      <CheckCircle2 size={20} className="text-accent" />
    ) : s === 'doing' ? (
      <CircleDot size={20} className="text-primary" />
    ) : (
      <Circle size={20} className="text-muted-foreground" />
    );

  return (
    <div className="space-y-6">
      {/* Overall progress */}
      <Card className="p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{t('overallProgress')}</span>
          <span className="text-muted-foreground">{done}/{total} · {pct}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
      </Card>

      {phases.map((phase) => (
        <div key={phase.id}>
          <h3 className="text-sm font-semibold">{phase.title}</h3>
          <p className="mb-3 text-xs text-muted-foreground">{phase.subtitle}</p>
          <div className="space-y-2">
            {phase.steps.map((step) => {
              const status: StepStatus = progress[step.id] ?? 'todo';
              return (
                <Card key={step.id} className={`flex items-start gap-3 p-3 ${status === 'done' ? 'opacity-70' : ''}`}>
                  <button
                    onClick={() => cycle(step.id)}
                    className="mt-0.5 shrink-0"
                    title={t(`status_${status}`)}
                    aria-label={t(`status_${status}`)}
                  >
                    {statusIcon(status)}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-sm font-medium ${status === 'done' ? 'line-through' : ''}`}>{step.title}</span>
                      {step.recommended && (
                        <Badge tone="accent" className="inline-flex items-center gap-1">
                          <Sparkles size={11} /> {t('recommended')}
                        </Badge>
                      )}
                      {status === 'doing' && <Badge tone="primary">{t('status_doing')}</Badge>}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{step.desc}</p>
                  </div>
                  <Link
                    href={step.href}
                    className="mt-0.5 inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-medium text-primary hover:underline"
                  >
                    {t('go')} <ArrowRight size={13} />
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
