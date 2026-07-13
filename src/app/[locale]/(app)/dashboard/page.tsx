import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KpiGrid, type KpiItem } from '@/components/dashboard/kpi-grid';
import { DashboardFeed } from '@/components/dashboard/dashboard-feed';
import { DashboardAsk } from '@/components/dashboard/dashboard-ask';
import { DashboardPlaybooks } from '@/components/dashboard/dashboard-playbooks';
import { EntryPlanCard } from '@/components/dashboard/entry-plan-card';
import { parseProfile, parseProgress, toLoc } from '@/lib/profile';
import { Link } from '@/i18n/routing';
import { fetchFranceNews, type LiveNewsItem } from '@/lib/sources/news';
import { searchTenders, type TenderResult } from '@/lib/sources/boamp';
import { buyingIntentReal } from '@/lib/sources/intent';
import { dbListPlaybooks } from '@/lib/playbooks-db';
import type { Loc } from '@/lib/data/playbooks';
import {
  opportunityScore,
  marketActivity,
  signalCounts,
  soonestTenderDeadline,
} from '@/lib/dashboard-metrics';
import { Users, Truck, Gavel, FileText, Bot, Zap, BookOpen } from 'lucide-react';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [t, tc, user] = await Promise.all([
    getTranslations('dashboard'),
    getTranslations('common'),
    getCurrentUser(),
  ]);
  const name = user?.name || user?.email?.split('@')[0] || 'there';
  const loc = toLoc(locale);
  const profile = parseProfile(user);
  const progress = parseProgress(user);
  const showOnboardingPrompt = user != null && user.onboardedAt == null;
  const profileLine = profile
    ? [profile.product, profile.industry, profile.region].filter(Boolean).join(' · ')
    : '';

  // Live data: France business news + open public tenders + active buyers + playbooks.
  const [news, tenders, intent, playbooks] = await Promise.all([
    fetchFranceNews().catch(() => [] as LiveNewsItem[]),
    searchTenders('', 40).catch(() => ({ results: [] as TenderResult[], total: 0 })),
    buyingIntentReal().catch(() => []),
    dbListPlaybooks(locale as Loc).catch(() => []),
  ]);

  const inputs = { news, tenders, intent };
  const counts = signalCounts(news);
  const live = news.length > 0 || tenders.total > 0;

  // All headline numbers are now computed from the live signals above.
  const oppScore = opportunityScore(inputs);
  const mktActivity = marketActivity(inputs);
  const newToday = news.length + tenders.results.length;
  const soonest = soonestTenderDeadline(tenders.results);

  const kpis: KpiItem[] = [
    { key: 'newOpportunities', value: newToday, real: live, hint: t('hintLast48h') },
    { key: 'matchingTenders', value: tenders.total.toLocaleString(), real: tenders.total > 0,
      hint: soonest != null ? t('hintNextDeadline', { days: soonest }) : undefined },
    { key: 'highIntentBuyers', value: intent.length, real: intent.length > 0, hint: t('hintBuyersSource') },
    { key: 'fundingSignals', value: counts.Investment, real: news.length > 0, hint: t('hintFromNews') },
    { key: 'hiringSignals', value: counts.Expansion, real: news.length > 0, hint: t('hintFromNews') },
    { key: 'partnershipSignals', value: counts.Partnership, real: news.length > 0, hint: t('hintFromNews') },
    { key: 'riskAlerts', value: counts.Risk, real: news.length > 0, hint: t('hintFromNews') },
    { key: 'buyingSignals', value: counts.Buying, real: news.length > 0, hint: t('hintFromNews') },
  ];

  const feed = news.slice(0, 6);
  const topPlaybooks = playbooks.slice(0, 5);

  const quickActions = [
    { key: 'findCustomers', href: '/companies', Icon: Users },
    { key: 'findDistributors', href: '/discover', Icon: Truck },
    { key: 'findTenders', href: '/opportunities', Icon: Gavel },
    { key: 'generateReport', href: '/reports', Icon: FileText },
    { key: 'askCopilot', href: '/copilot', Icon: Bot },
  ] as const;

  return (
    <div className="space-y-6">
      {/* HERO */}
      <div className="gradient-hero overflow-hidden rounded-2xl border border-border p-5 sm:p-8">
        <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
          {t('goodMorning')}, {name} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {profileLine || t('subtitle')}
        </p>
        {showOnboardingPrompt && (
          <Link
            href="/onboarding"
            className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
          >
            {t('completeProfile')} →
          </Link>
        )}

        {/* Prominent natural-language ask box */}
        <DashboardAsk />

        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
          <Card className="p-3 sm:p-4" title={t('opportunityScoreHelp')}>
            <CardTitle className="truncate">{t('opportunityScore')}</CardTitle>
            <div className="mt-1 text-2xl font-bold text-primary sm:text-3xl">{oppScore}<span className="text-base font-medium text-muted-foreground">/100</span></div>
          </Card>
          <Card className="p-3 sm:p-4" title={t('marketActivityHelp')}>
            <CardTitle className="truncate">{t('marketActivity')}</CardTitle>
            <div className="mt-1 text-2xl font-bold text-accent sm:text-3xl">{mktActivity}<span className="text-base font-medium text-muted-foreground">/100</span></div>
          </Card>
          <Card className="col-span-2 p-3 sm:col-span-1 sm:p-4">
            <CardTitle className="truncate">{t('newToday')}</CardTitle>
            <div className="mt-1 text-2xl font-bold sm:text-3xl">{newToday}</div>
          </Card>
        </div>
        {live && (
          <p className="mt-3 text-[11px] text-muted-foreground">{t('metricsNote')}</p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {quickActions.map(({ key, href, Icon }) => (
            <Link
              key={key}
              href={href}
              className={`w-full sm:w-auto ${key === 'askCopilot' ? 'col-span-2 sm:col-span-1' : ''}`}
            >
              <Button
                variant={key === 'askCopilot' ? 'accent' : 'default'}
                size="sm"
                className="w-full justify-center sm:w-auto"
              >
                <Icon size={16} /> {t(key)}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{t('kpis')}</h2>
        <KpiGrid items={kpis} />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* FEED — live news */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base text-foreground">
              {t('feed')}{live ? ` · ${tc('live')}` : ''}
            </CardTitle>
            <Zap size={16} className="text-accent" />
          </CardHeader>
          <CardContent>
            <DashboardFeed items={feed} />
          </CardContent>
        </Card>

        {/* Right column: market-entry spine + playbooks */}
        <div className="space-y-6">
          <EntryPlanCard profile={profile} progress={progress} loc={loc} />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base text-foreground">
                <BookOpen size={16} className="text-primary" /> {t('playbooks')}
              </CardTitle>
              <Link href="/playbooks" className="text-xs text-primary hover:underline">
                {t('playbooksAll')}
              </Link>
            </CardHeader>
            <CardContent>
              <DashboardPlaybooks items={topPlaybooks} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
