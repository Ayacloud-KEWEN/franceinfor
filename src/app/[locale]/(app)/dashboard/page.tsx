import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KpiGrid, type KpiItem } from '@/components/dashboard/kpi-grid';
import { DashboardFeed } from '@/components/dashboard/dashboard-feed';
import { DashboardIntent } from '@/components/dashboard/dashboard-intent';
import { Link } from '@/i18n/routing';
import { seededScore } from '@/lib/utils';
import { fetchFranceNews, type LiveNewsItem } from '@/lib/sources/news';
import { searchTenders, type TenderResult } from '@/lib/sources/boamp';
import { buyingIntentReal } from '@/lib/sources/intent';
import { Users, Truck, Gavel, FileText, Bot, Zap } from 'lucide-react';

export default async function DashboardPage() {
  const [t, tc, user] = await Promise.all([
    getTranslations('dashboard'),
    getTranslations('common'),
    getCurrentUser(),
  ]);
  const name = user?.name || user?.email?.split('@')[0] || 'there';

  // Live data: France business news + open public tenders + active buyers.
  const [news, tenders, intent] = await Promise.all([
    fetchFranceNews().catch(() => [] as LiveNewsItem[]),
    searchTenders('', 40).catch(() => ({ results: [] as TenderResult[], total: 0 })),
    buyingIntentReal().catch(() => []),
  ]);

  const fundingSignals = news.filter((n) => n.signalType === 'Investment').length;
  const hiringSignals = news.filter((n) => n.signalType === 'Expansion').length;
  const live = news.length > 0 || tenders.total > 0;

  const kpis: KpiItem[] = [
    { key: 'newOpportunities', value: news.length + tenders.results.length, delta: seededScore('a', 5, 28), real: live },
    { key: 'matchingTenders', value: tenders.total.toLocaleString(), delta: seededScore('b', 3, 20), real: tenders.total > 0 },
    { key: 'highIntentBuyers', value: intent.length, delta: seededScore('c', 4, 22), real: intent.length > 0 },
    { key: 'fundingSignals', value: fundingSignals, delta: seededScore('d', 2, 18), real: news.length > 0 },
    { key: 'hiringSignals', value: hiringSignals, delta: seededScore('e', 2, 16), real: news.length > 0 },
    { key: 'potentialDistributors', value: seededScore('dist', 20, 120), delta: seededScore('f', 1, 14) },
    { key: 'decisionMakers', value: seededScore('dm', 30, 180), delta: seededScore('g', 1, 12) },
    { key: 'pipelineValue', value: `€${(seededScore('pipe', 80, 320) * 1450).toLocaleString()}`, delta: seededScore('h', 2, 20) },
  ];

  const feed = news.slice(0, 6);
  const topBuyers = intent.slice(0, 4);

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
      <div className="gradient-hero overflow-hidden rounded-2xl border border-border p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t('goodMorning')}, {name} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">{t('subtitle')}</p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Card className="p-4">
            <CardTitle>{t('opportunityScore')}</CardTitle>
            <div className="mt-1 text-3xl font-bold text-primary">{seededScore('today-opp', 70, 95)}</div>
          </Card>
          <Card className="p-4">
            <CardTitle>{t('marketActivity')}</CardTitle>
            <div className="mt-1 text-3xl font-bold text-accent">{seededScore('mkt-act', 60, 90)}</div>
          </Card>
          <Card className="p-4 col-span-2 sm:col-span-1">
            <CardTitle>{t('newToday')}</CardTitle>
            <div className="mt-1 text-3xl font-bold">{news.length + tenders.results.length}</div>
          </Card>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {quickActions.map(({ key, href, Icon }) => (
            <Link key={key} href={href}>
              <Button variant={key === 'askCopilot' ? 'accent' : 'default'} size="sm">
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

        {/* HIGH INTENT — live tender buyers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-foreground">{t('highIntent')}</CardTitle>
          </CardHeader>
          <CardContent>
            {topBuyers.length === 0 ? (
              <p className="text-sm text-muted-foreground">—</p>
            ) : (
              <DashboardIntent items={topBuyers} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
