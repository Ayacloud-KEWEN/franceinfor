'use client';

import { Fragment, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScorePill, Badge } from '@/components/ui/badge';
import { Search, Loader2, ChevronDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import type { CompanyResult } from '@/lib/sources/recherche-entreprises';

async function fetchCompanies(q: string): Promise<{ results: CompanyResult[]; total: number }> {
  const res = await fetch(`/api/companies/search?q=${encodeURIComponent(q)}`);
  if (res.status === 429) throw new Error('quota');
  if (!res.ok) throw new Error('error');
  return res.json();
}

function fmtEur(n: number | null) {
  if (n == null) return null;
  if (n >= 1e9) return `€${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `€${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `€${(n / 1e3).toFixed(0)}K`;
  return `€${n}`;
}

function Detail({ c }: { c: CompanyResult }) {
  const t = useTranslations('companies');
  return (
    <div className="space-y-3 bg-muted/30 px-4 py-3 text-sm">
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
        {c.vat && <span><span className="text-muted-foreground">{t('vat')}: </span>{c.vat}</span>}
        {c.financeYear && (
          <span>
            <span className="text-muted-foreground">{t('revenue')} ({c.financeYear}): </span>
            {fmtEur(c.revenue) ?? '—'}
            {c.netResult != null && c.netResult !== 0 ? ` · net ${fmtEur(c.netResult)}` : ''}
          </span>
        )}
        {!c.financeYear && <span className="text-muted-foreground">{t('noFinancials')}</span>}
      </div>
      {c.executives.length > 0 && (
        <div>
          <div className="mb-1 text-xs font-medium text-muted-foreground">{t('executives')}</div>
          <div className="flex flex-wrap gap-1.5">
            {c.executives.map((e, i) => (
              <Badge key={i} tone="muted">
                {e.name}{e.role ? ` · ${e.role}` : ''}
              </Badge>
            ))}
          </div>
        </div>
      )}
      <Link
        href={`/companies/${c.siren}`}
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        {t('viewProfile')} <ArrowRight size={12} />
      </Link>
    </div>
  );
}

export function CompanySearch() {
  const t = useTranslations('companies');
  const tc = useTranslations('common');
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ['companies', query],
    queryFn: () => fetchCompanies(query),
    enabled: query.length > 0,
  });

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(input.trim());
          setOpen(null);
        }}
        className="flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="max-w-xl"
        />
        <Button type="submit">
          <Search size={16} /> {t('search')}
        </Button>
      </form>

      {isFetching && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> {t('loading')}
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          {(error as Error).message === 'quota' ? tc('quotaReached') : tc('searchFailed')}
        </p>
      )}

      {data && data.results.length === 0 && !isFetching && (
        <p className="text-sm text-muted-foreground">{t('noResults')}</p>
      )}

      {data && data.results.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">{data.total.toLocaleString()} {tc('results')} · {tc('live')} data.gouv.fr</p>

          {/* Desktop table */}
          <Card className="hidden overflow-hidden md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">{t('name')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('industry')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('city')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('revenue')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('score')}</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {data.results.map((c) => (
                  <Fragment key={c.siren}>
                    <tr
                      className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/30"
                      onClick={() => setOpen(open === c.siren ? null : c.siren)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground">SIREN {c.siren}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.industry || c.nafCode || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.city || '—'}</td>
                      <td className="px-4 py-3 font-medium">{fmtEur(c.revenue) ?? '—'}</td>
                      <td className="px-4 py-3"><ScorePill score={c.opportunityScore} /></td>
                      <td className="px-4 py-3">
                        <ChevronDown size={16} className={cn('text-muted-foreground transition-transform', open === c.siren && 'rotate-180')} />
                      </td>
                    </tr>
                    {open === c.siren && (
                      <tr>
                        <td colSpan={6} className="p-0"><Detail c={c} /></td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {data.results.map((c) => (
              <Card key={c.siren} className="overflow-hidden">
                <button className="w-full p-4 text-left" onClick={() => setOpen(open === c.siren ? null : c.siren)}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-xs text-muted-foreground">SIREN {c.siren}</div>
                    </div>
                    <ScorePill score={c.opportunityScore} />
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                    <span>{c.industry || c.nafCode || '—'}</span>
                    <span>{c.city || '—'}</span>
                    <span>{t('revenue')}: {fmtEur(c.revenue) ?? '—'}</span>
                    <span>{c.status || '—'}</span>
                  </div>
                </button>
                {open === c.siren && <Detail c={c} />}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
