import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { getIndustry, forecastSeries, type Industry } from '@/lib/data/industries';
import { getIndustriesWithRealStats, fetchSectorHistory } from '@/lib/sources/market-stats';
import { searchCompanies, type CompanyResult } from '@/lib/sources/recherche-entreprises';
import { fetchFranceNews, type LiveNewsItem } from '@/lib/sources/news';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, ScorePill } from '@/components/ui/badge';
import { HistoryChart } from '@/components/markets/history-chart';
import { CompanyAiSummary } from '@/components/companies/ai-summary';
import { ArrowLeft, ArrowRight, ExternalLink, Globe2 } from 'lucide-react';

export default async function MarketDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations('markets');
  const base = getIndustry(slug);
  if (!base) notFound();

  // Real Eurostat stats for this industry + history + sector companies + news.
  let ind: Industry = base;
  let history: { year: string; valueBn: number }[] = [];
  let companies: CompanyResult[] = [];
  let news: LiveNewsItem[] = [];

  try {
    const all = await getIndustriesWithRealStats();
    ind = all.find((i) => i.slug === slug) ?? base;
  } catch {}
  const [h, c, n] = await Promise.allSettled([
    fetchSectorHistory(ind.naceCode),
    searchCompanies(ind.frTerm, 1),
    fetchFranceNews(ind.frTerm),
  ]);
  if (h.status === 'fulfilled') history = h.value;
  if (c.status === 'fulfilled') companies = c.value.results.slice(0, 6);
  if (n.status === 'fulfilled') news = n.value.slice(0, 5);

  const forecast = forecastSeries(ind).map((p) => ({ year: p.year, valueBn: p.size }));

  const aiContext = [
    `Industry: ${ind.name} (France), NACE ${ind.naceCode}`,
    ind.real ? `Real gross value added: €${ind.marketSizeBn}B, YoY growth ${ind.cagr}% (Eurostat)` : `Estimated size €${ind.marketSizeBn}B`,
    `Opportunity score ${ind.opportunityScore}/100, entry difficulty ${ind.difficultyScore}/100`,
    companies.length ? `Leading companies: ${companies.map((x) => x.name).slice(0, 5).join(', ')}` : '',
  ].filter(Boolean).join('\n');

  return (
    <div className="space-y-6">
      <Link href="/markets" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft size={15} /> {t('back')}
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Globe2 size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{ind.name}</h1>
            <div className="mt-1 text-sm text-muted-foreground">
              {ind.real ? (
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {t('liveSource')} · NACE {ind.naceCode}
                </span>
              ) : (
                <span>{t('estimated')} · NACE {ind.naceCode}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">{t('marketSize')}</div>
            <div className="text-xl font-bold">€{ind.marketSizeBn}{t('billion')}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">{t('growth')}</div>
            <div className="text-xl font-bold text-accent">{ind.cagr}%</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">{t('opportunity')}</div>
            <ScorePill score={ind.opportunityScore} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {history.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base text-foreground">{t('history')}</CardTitle></CardHeader>
            <CardContent><HistoryChart data={history} /></CardContent>
          </Card>
        )}
        <Card>
          <CardHeader><CardTitle className="text-base text-foreground">{t('forecast')}</CardTitle></CardHeader>
          <CardContent><HistoryChart data={forecast} /></CardContent>
        </Card>
      </div>

      {/* Leading companies (real) */}
      {companies.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base text-foreground">{t('topCompanies')}</CardTitle></CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {companies.map((c) => (
              <Link
                key={c.siren}
                href={`/companies/${c.siren}`}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.city || c.nafCode || '—'}</div>
                </div>
                <ArrowRight size={14} className="shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Sector news (real) */}
      {news.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base text-foreground">{t('sectorNews')}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {news.map((nw) => (
              <a key={nw.id} href={nw.url} target="_blank" rel="noopener noreferrer"
                 className="flex items-start justify-between gap-2 rounded-lg border border-border px-3 py-2 hover:bg-muted/40">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge tone="primary">{nw.signalType}</Badge>
                    <span className="text-xs text-muted-foreground">{nw.source}{nw.date ? ` · ${nw.date}` : ''}</span>
                  </div>
                  <div className="mt-1 text-sm">{nw.title}</div>
                </div>
                <ExternalLink size={13} className="mt-1 shrink-0 text-muted-foreground" />
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      {/* AI analysis */}
      <Card>
        <CardHeader><CardTitle className="text-base text-foreground">{t('aiAnalysis')}</CardTitle></CardHeader>
        <CardContent><CompanyAiSummary context={aiContext} /></CardContent>
      </Card>
    </div>
  );
}
