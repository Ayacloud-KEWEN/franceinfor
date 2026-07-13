import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Compass, ArrowRight, CircleDot, Circle } from 'lucide-react';
import { nextSteps, planProgress, type PlanStep } from '@/lib/data/entry-plan';
import { type EntryProfile, type EntryProgress, type Loc } from '@/lib/profile';

// Dashboard surface of the market-entry spine: overall progress + the next
// few recommended steps, deep-linked. This is the "what do I do next" answer.
export async function EntryPlanCard({
  profile,
  progress,
  loc,
}: {
  profile: EntryProfile | null;
  progress: EntryProgress;
  loc: Loc;
}) {
  const t = await getTranslations('plan');
  const { done, total, pct } = planProgress(progress);
  const upcoming: PlanStep[] = nextSteps(progress, profile, 3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <Compass size={16} className="text-primary" /> {t('cardTitle')}
        </CardTitle>
        <Link href="/plan" className="text-xs text-primary hover:underline">{t('viewPlan')}</Link>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t('overallProgress')}</span>
            <span>{done}/{total} · {pct}%</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="text-xs font-medium text-muted-foreground">{t('nextSteps')}</div>
        <div className="mt-1.5 space-y-1.5">
          {upcoming.map((s) => {
            const doing = progress[s.id] === 'doing';
            return (
              <Link
                key={s.id}
                href={s.href}
                className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 hover:bg-muted/40"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {doing ? <CircleDot size={15} className="shrink-0 text-primary" /> : <Circle size={15} className="shrink-0 text-muted-foreground" />}
                  <span className="truncate text-sm">{s.title[loc]}</span>
                </div>
                <ArrowRight size={13} className="shrink-0 text-muted-foreground" />
              </Link>
            );
          })}
          {upcoming.length === 0 && (
            <p className="rounded-lg border border-dashed border-accent/40 bg-accent/5 px-3 py-2 text-sm text-accent">
              🎉 {t('allDone')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
