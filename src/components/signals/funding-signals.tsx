'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge, ScorePill } from '@/components/ui/badge';
import { SaveButton } from '@/components/saved/save-button';
import { Search, Loader2, ExternalLink, TrendingUp } from 'lucide-react';
import type { FundingSignal } from '@/lib/sources/funding-signals';

export function FundingSignals() {
  const t = useTranslations('signals');
  const tc = useTranslations('common');
  const [input, setInput] = useState('');
  const [results, setResults] = useState<FundingSignal[] | null>(null);
  const [source, setSource] = useState<'live' | 'mock'>('live');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function load(query: string) {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/signals', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (res.status === 429) { setError(true); setResults([]); return; }
      const json = await res.json();
      setResults(json.results ?? []);
      setSource(json.source ?? 'live');
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  // Load the latest signals on first view.
  useEffect(() => { load(''); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <div className="space-y-4">
      <form onSubmit={(e) => { e.preventDefault(); load(input.trim()); }} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="max-w-xl"
        />
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search size={16} />}
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{tc('quotaReached')}</p>}

      {results && !error && (
        <>
          <p className="text-xs text-muted-foreground">
            {results.length} {tc('results')} · {source === 'live' ? `${tc('live')} Google News` : t('sampleData')}
          </p>
          <div className="space-y-3">
            {results.map((s) => (
              <Card key={s.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <TrendingUp size={15} className="shrink-0 text-accent" />
                      {s.company && <span className="font-semibold">{s.company}</span>}
                      {s.amount && <Badge tone="accent">{s.amount}</Badge>}
                      {s.round && <Badge tone="primary">{s.round}</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{s.title}</p>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{s.source}{s.date ? ` · ${s.date}` : ''}</span>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                        {t('read')} <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="text-center">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('intent')}</div>
                      <ScorePill score={s.score} />
                    </div>
                    <SaveButton
                      size="icon"
                      type="OPPORTUNITY"
                      refId={`funding:${s.id}`}
                      label={s.company ? `${s.company}${s.amount ? ` — ${s.amount}` : ''}` : s.title}
                      data={{ amount: s.amount, round: s.round, url: s.url, source: s.source }}
                    />
                  </div>
                </div>
              </Card>
            ))}
            {results.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground">{t('empty')}</p>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">{t('disclaimer')}</p>
        </>
      )}
    </div>
  );
}
