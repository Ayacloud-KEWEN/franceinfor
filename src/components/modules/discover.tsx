'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, ChevronDown, ExternalLink } from 'lucide-react';
import { SaveButton } from '@/components/saved/save-button';
import type { DiscoveryResult } from '@/lib/sources/discovery';

const PER_CAT = 4;

export function DiscoverEngine({
  initial = { product: '', industry: '', target: '' },
}: {
  initial?: { product: string; industry: string; target: string };
}) {
  const t = useTranslations('modules');
  const tc = useTranslations('common');
  const [form, setForm] = useState(initial);
  const [results, setResults] = useState<DiscoveryResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [perCat, setPerCat] = useState(PER_CAT);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    setPerCat(PER_CAT);
    try {
      const res = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (res.ok) setResults(json.results);
      else {
        setResults(null);
        setError(true);
      }
    } catch {
      setResults(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const hasMore = results?.some((r) => r.items.length > perCat) ?? false;

  return (
    <div className="space-y-5">
      <form onSubmit={run} className="grid gap-3 sm:grid-cols-3">
        <Input placeholder={t('product')} value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} />
        <Input placeholder={t('industry')} value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
        <Input placeholder={t('target')} value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} />
        <div className="sm:col-span-3">
          <Button type="submit" variant="accent" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles size={16} />}
            {t('run')}
          </Button>
        </div>
      </form>

      {error && <p className="text-sm text-destructive">{tc('loadFailed')}</p>}

      {results && (
        <div className="grid gap-4 md:grid-cols-2">
          {results.map((r) => (
            <Card key={r.category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-foreground">
                  {t(`disc_${r.category.replace(/\s/g, '')}`)}
                  <Badge tone={r.live ? 'accent' : 'muted'}>
                    {r.live ? tc('live') : t('discCurated')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {r.items.slice(0, perCat).map((it) => (
                  <div key={it.name} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
                    <div className="min-w-0">
                      {it.siren ? (
                        <Link href={`/companies/${it.siren}`} className="text-sm font-medium hover:underline">
                          {it.name}
                        </Link>
                      ) : it.url ? (
                        <a href={it.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium hover:underline">
                          {it.name} <ExternalLink size={11} className="text-muted-foreground" />
                        </a>
                      ) : (
                        <div className="text-sm font-medium">{it.name}</div>
                      )}
                      <div className="text-xs text-muted-foreground">{it.reason}</div>
                    </div>
                    <SaveButton
                      size="icon"
                      type="OPPORTUNITY"
                      refId={`${r.category}:${it.name}`}
                      label={it.name}
                      data={{ category: r.category, reason: it.reason, siren: it.siren, url: it.url }}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {results && hasMore && (
        <div className="text-center">
          <Button variant="outline" onClick={() => setPerCat((v) => v + PER_CAT)}>
            <ChevronDown size={15} /> {tc('loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
}
