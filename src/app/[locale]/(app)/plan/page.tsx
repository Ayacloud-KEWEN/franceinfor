import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth';
import { PageHeader } from '@/components/page-header';
import { EntryPlanBoard } from '@/components/plan/entry-plan-board';
import { ENTRY_PLAN } from '@/lib/data/entry-plan';
import { parseProfile, parseProgress, toLoc, STAGE_LABELS, GOAL_LABELS } from '@/lib/profile';
import { Link } from '@/i18n/routing';

export default async function PlanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = toLoc(locale);
  const [t, user] = await Promise.all([getTranslations('plan'), getCurrentUser()]);

  const profile = parseProfile(user);
  const progress = parseProgress(user);

  // Serialize the localized plan for the client board.
  const phases = ENTRY_PLAN.map((p) => ({
    id: p.id,
    title: p.title[loc],
    subtitle: p.subtitle[loc],
    steps: p.steps.map((s) => ({
      id: s.id,
      title: s.title[loc],
      desc: s.desc[loc],
      href: s.href,
      recommended: !!(s.goals && profile?.goals?.some((g) => s.goals!.includes(g))),
    })),
  }));

  const profileChips = profile
    ? [
        profile.industry,
        profile.region,
        profile.stage ? STAGE_LABELS[profile.stage][loc] : undefined,
        ...(profile.goals ?? []).map((g) => GOAL_LABELS[g][loc]),
      ].filter(Boolean)
    : [];

  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      {profileChips.length > 0 ? (
        <div className="mb-5 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{t('yourProfile')}:</span>
          {profileChips.map((c, i) => (
            <span key={i} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">{c}</span>
          ))}
          <Link href="/settings" className="text-xs text-muted-foreground underline hover:text-foreground">
            {t('editProfile')}
          </Link>
        </div>
      ) : (
        <div className="mb-5 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm">
          {t('noProfile')}{' '}
          <Link href="/onboarding" className="font-medium text-primary hover:underline">{t('completeProfile')}</Link>
        </div>
      )}

      <EntryPlanBoard phases={phases} initialProgress={progress} />
    </div>
  );
}
