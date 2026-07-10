import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { INDUSTRIES } from '@/lib/data/industries';
import { searchCompanies, type CompanyResult } from '@/lib/sources/recherche-entreprises';
import { matchEcosystem, ECOSYSTEM_LABELS, type Loc } from '@/lib/data/ecosystem';
import { EcosystemPanel } from '@/components/markets/ecosystem-panel';
import { fetchFranceNews, type LiveNewsItem } from '@/lib/sources/news';
import { PageHeader } from '@/components/page-header';
import { MarketSearch } from '@/components/markets/market-search';
import { CompanyAiSummary } from '@/components/companies/ai-summary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, ExternalLink, Building2, Newspaper } from 'lucide-react';

function matchCurated(q: string) {
  const ql = q.toLowerCase().trim();
  if (ql.length < 3) return undefined;
  return INDUSTRIES.find((i) => {
    const name = i.name.toLowerCase();
    const fr = i.frTerm.toLowerCase();
    return (
      i.slug === ql ||
      name.includes(ql) ||
      fr.includes(ql) ||
      // the query contains a curated term as a whole word
      ql.split(/\s+/).some((w) => w.length >= 4 && (name.includes(w) || fr.includes(w)))
    );
  });
}

export default async function MarketSearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const [t, tc] = await Promise.all([getTranslations('markets'), getTranslations('common')]);
  const { locale } = await params;
  const loc: Loc = locale === 'fr' ? 'fr' : locale === 'zh' ? 'zh' : 'en';
  const { q = '' } = await searchParams;
  const term = q.trim();

  const curated = term ? matchCurated(term) : undefined;
  const eco = term ? matchEcosystem(term) : undefined;

  let companies: CompanyResult[] = [];
  let total = 0;
  let news: LiveNewsItem[] = [];
  if (term) {
    const [c, n] = await Promise.allSettled([searchCompanies(term, 1), fetchFranceNews(term)]);
    if (c.status === 'fulfilled') {
      companies = c.value.results.slice(0, 8);
      total = c.value.total;
    }
    if (n.status === 'fulfilled') news = n.value.slice(0, 5);
  }

  const aiContext = [
    `Sector / keyword: "${term}" in the French market`,
    `Registered companies matching: ~${total.toLocaleString()}`,
    companies.length ? `Sample companies: ${companies.map((x) => x.name).slice(0, 6).join(', ')}` : '',
  ].filter(Boolean).join('\n');

  return (
    <div className="space-y-6">
      <Link href="/markets" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft size={15} /> {t('back')}
      </Link>

      <PageHeader title={`${t('resultsFor')}: “${term}”`} />
      <MarketSearch initial={term} />

      {/* Curated Eurostat data shortcut */}
      {curated && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-2 py-4">
            <span className="text-sm">
              {t('curatedAvailable')} — <b>{curated.name}</b>
            </span>
            <Link href={`/markets/${curated.slug}`}>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                {t('viewFullData')} <ArrowRight size={14} />
              </span>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Real company count */}
      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">{t('companyCount')}</div>
          <div className="mt-1 text-2xl font-bold">
            {total >= 10000 ? '10,000+' : total.toLocaleString()}
          </div>
          <div className="mt-1 inline-flex items-center gap-1 text-xs text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {tc('live')} data.gouv.fr
          </div>
        </Card>
      </div>

      {/* Real sector players by NAF activity code (value-chain roles) */}
      {eco && <EcosystemPanel eco={eco} loc={loc} />}

      {/* Companies matching by name */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Building2 size={15} /> {eco ? ECOSYSTEM_LABELS.nameMatches[loc] : t('topCompanies')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {companies.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('noCompanies')}</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sector news */}
      {news.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <Newspaper size={15} /> {t('sectorNews')}
            </CardTitle>
          </CardHeader>
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
      {term && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-foreground">{t('aiAnalysis')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CompanyAiSummary context={aiContext} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
