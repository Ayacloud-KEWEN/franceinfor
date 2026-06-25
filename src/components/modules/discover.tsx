'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScorePill } from '@/components/ui/badge';
import { Loader2, Sparkles, ChevronDown } from 'lucide-react';
import type { DiscoveryResult } from '@/lib/data/modules';

const PER_CAT = 4;

export function DiscoverEngine() {
  const t = useTranslations('modules');
  const tc = useTranslations('common');
  const [form, setForm] = useState({ product: '', industry: '', target: '' });
  const [results, setResults] = useState<DiscoveryResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [perCat, setPerCat] = useState(PER_CAT);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setPerCat(PER_CAT);
    try {
      const res = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      setResults(res.ok ? json.results : null);
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

      {results && (
        <div className="grid gap-4 md:grid-cols-2">
          {results.map((r) => (
            <Card key={r.category}>
              <CardHeader>
                <CardTitle className="text-base text-foreground">{r.category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {r.items.slice(0, perCat).map((it) => (
                  <div key={it.name} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <div>
                      <div className="text-sm font-medium">{it.name}</div>
                      <div className="text-xs text-muted-foreground">{it.reason}</div>
                    </div>
                    <ScorePill score={it.score} />
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
