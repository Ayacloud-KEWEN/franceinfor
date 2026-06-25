import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { getCompany } from '@/lib/sources/recherche-entreprises';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, ScorePill } from '@/components/ui/badge';
import { FinancialsChart } from '@/components/companies/financials-chart';
import { CompanyAiSummary } from '@/components/companies/ai-summary';
import { SaveButton } from '@/components/saved/save-button';
import { getLegalEvents, type LegalEvent } from '@/lib/sources/bodacc';
import { fetchFranceNews, type LiveNewsItem } from '@/lib/sources/news';
import { ArrowLeft, Building2, MapPin, ExternalLink, GitBranch, Scale } from 'lucide-react';

function fmtEur(n: number | null) {
  if (n == null) return '—';
  if (Math.abs(n) >= 1e9) return `€${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `€${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `€${(n / 1e3).toFixed(0)}K`;
  return `€${n}`;
}

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ locale: string; siren: string }>;
}) {
  const { siren } = await params;
  const [t, tc] = await Promise.all([getTranslations('companies'), getTranslations('common')]);

  let company;
  try {
    company = await getCompany(siren);
  } catch {
    company = null;
  }
  if (!company) {
    return (
      <div>
        <Link href="/companies" className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft size={15} /> {t('back')}
        </Link>
        <p className="text-muted-foreground">{t('notFound')}</p>
      </div>
    );
  }

  const c = company;

  // Real enrichment: corporate shareholders, BODACC legal events, company news.
  const people = c.executives.filter((e) => !e.isCompany);
  const shareholders = c.executives.filter((e) => e.isCompany);

  const [legalRes, newsRes] = await Promise.allSettled([
    getLegalEvents(c.siren),
    fetchFranceNews(`"${c.name}"`),
  ]);
  const legalEvents: LegalEvent[] = legalRes.status === 'fulfilled' ? legalRes.value.events.slice(0, 6) : [];
  const legalAvailable = legalRes.status === 'fulfilled' && legalRes.value.available;
  const news: LiveNewsItem[] = newsRes.status === 'fulfilled' ? newsRes.value.slice(0, 5) : [];

  const overview: [string, string][] = [
    [t('status'), c.status || '—'],
    [t('legalForm'), c.legalForm || '—'],
    [t('category'), c.category || '—'],
    [t('naf'), c.industry || c.nafCode || '—'],
    [t('employees'), c.employees || '—'],
    [t('created'), c.creationDate || '—'],
    [t('establishments'), c.establishmentsCount != null ? String(c.establishmentsCount) : '—'],
    [t('vat'), c.vat || '—'],
  ];

  const aiContext = [
    `Name: ${c.name} (SIREN ${c.siren})`,
    `Activity: ${c.industry || c.nafCode || 'n/a'}`,
    `Location: ${[c.address, c.postalCode, c.city].filter(Boolean).join(', ')}`,
    `Category: ${c.category || 'n/a'}, Employees band: ${c.employees || 'n/a'}`,
    c.financeYear ? `Latest revenue (${c.financeYear}): ${fmtEur(c.revenue)}, net result: ${fmtEur(c.netResult)}` : 'No public financials',
    c.executives.length ? `Executives: ${c.executives.map((e) => `${e.name} (${e.role || '—'})`).join('; ')}` : '',
  ].filter(Boolean).join('\n');

  return (
    <div className="space-y-6">
      <Link href="/companies" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft size={15} /> {t('back')}
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{c.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>SIREN {c.siren}</span>
              {(c.address || c.city) && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={13} /> {[c.address, c.postalCode, c.city].filter(Boolean).join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">{t('score')}</div>
            <ScorePill score={c.opportunityScore} />
          </div>
          <SaveButton
            type="COMPANY"
            refId={c.siren}
            label={c.name}
            data={{ city: c.city, industry: c.industry || c.nafCode, score: c.opportunityScore }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base text-foreground">{t('overview')}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
              {overview.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="mt-0.5 text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        {/* Executives */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-foreground">{t('executives')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {people.length === 0 && <p className="text-sm text-muted-foreground">—</p>}
            {people.map((e, i) => (
              <div key={i} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                <span className="font-medium">{e.name}</span>
                {e.role && <Badge tone="muted">{e.role}</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Financials */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-foreground">{t('financials')}</CardTitle>
        </CardHeader>
        <CardContent>
          {c.financeHistory.length > 0 ? (
            <>
              <p className="mb-2 text-xs text-muted-foreground">{t('financialsTrend')} · {tc('live')} data.gouv.fr</p>
              <FinancialsChart data={c.financeHistory} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{t('noFinancials')}</p>
          )}
        </CardContent>
      </Card>

      {/* Shareholders / corporate network + Legal events */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-foreground">{t('shareholders')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {shareholders.length === 0 ? (
              <p className="text-sm text-muted-foreground">—</p>
            ) : (
              shareholders.map((s, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-sm">
                  <Building2 size={14} className="shrink-0 text-primary" />
                  <span className="min-w-0">
                    {s.siren ? (
                      <Link href={`/companies/${s.siren}`} className="font-medium hover:text-primary hover:underline">{s.name}</Link>
                    ) : (
                      <span className="font-medium">{s.name}</span>
                    )}
                    {s.role && <span className="text-muted-foreground"> · {s.role}</span>}
                  </span>
                </div>
              ))
            )}
            {c.establishmentsCount != null && (
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                <GitBranch size={13} /> {c.establishmentsCount} {t('establishments')}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <Scale size={15} /> {t('legalEvents')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!legalAvailable || legalEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('noLegalEvents')}</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {legalEvents.map((e, i) => (
                  <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <span className="font-medium">{e.family || '—'}</span>
                    <span className="text-xs text-muted-foreground">{[e.date, e.tribunal || e.city].filter(Boolean).join(' · ')}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Company news */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-foreground">{t('news')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {news.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('noNews')}</p>
          ) : (
            news.map((nw) => (
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
            ))
          )}
        </CardContent>
      </Card>

      {/* AI summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-foreground">{t('aiSummary')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyAiSummary context={aiContext} />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">{t('roadmapProfile')}</p>
    </div>
  );
}
