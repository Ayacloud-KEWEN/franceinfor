'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge, ScorePill } from '@/components/ui/badge';
import { Loader2, Sparkles, ExternalLink, Landmark } from 'lucide-react';
import type { AidType, MatchedSubsidy } from '@/lib/data/subsidies';

const STAGES = ['idea', 'startup', 'growth', 'sme', 'established'] as const;
const NEEDS = ['innovation', 'rd', 'hiring', 'export', 'digital', 'transition', 'investment', 'financing'] as const;

const TYPE_TONE: Record<AidType, 'primary' | 'accent' | 'warning' | 'muted'> = {
  GRANT: 'accent',
  TAX_CREDIT: 'primary',
  LOAN: 'primary',
  GUARANTEE: 'muted',
  EQUITY: 'warning',
  ADVISORY: 'muted',
};

export function FundingMatcher() {
  const t = useTranslations('funding');
  const tc = useTranslations('common');
  const [form, setForm] = useState({ sector: '', stage: '', region: '', need: '' });
  const [results, setResults] = useState<MatchedSubsidy[] | null>(null);
  const [source, setSource] = useState<'live' | 'curated'>('curated');
  const [loading, setLoading] = useState(false);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/aides', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      setResults(res.ok ? json.results : []);
      setSource(json.source ?? 'curated');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={run} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          placeholder={t('sector')}
          value={form.sector}
          onChange={(e) => setForm({ ...form, sector: e.target.value })}
        />
        <select
          value={form.stage}
          onChange={(e) => setForm({ ...form, stage: e.target.value })}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">{t('stagePlaceholder')}</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>{t(`stage.${s}`)}</option>
          ))}
        </select>
        <select
          value={form.need}
          onChange={(e) => setForm({ ...form, need: e.target.value })}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">{t('needPlaceholder')}</option>
          {NEEDS.map((n) => (
            <option key={n} value={n}>{t(`need.${n}`)}</option>
          ))}
        </select>
        <Input
          placeholder={t('region')}
          value={form.region}
          onChange={(e) => setForm({ ...form, region: e.target.value })}
        />
        <div className="sm:col-span-2 lg:col-span-4">
          <Button type="submit" variant="accent" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles size={16} />}
            {t('run')}
          </Button>
        </div>
      </form>

      {results && (
        <>
          <p className="text-xs text-muted-foreground">
            {results.length} {tc('results')} · {source === 'live' ? t('sourceLive') : t('sourceCurated')}
          </p>
          <div className="space-y-3">
            {results.map((s) => (
              <Card key={s.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Landmark size={15} className="shrink-0 text-primary" />
                      <span className="font-semibold">{s.name}</span>
                      <Badge tone={TYPE_TONE[s.type]}>{t(`type.${s.type}`)}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {s.provider} · <span className="font-medium">{s.amount}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">{s.description}</p>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      {t('learnMore')} <ExternalLink size={12} />
                    </a>
                  </div>
                  <div className="shrink-0 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('match')}</div>
                    <ScorePill score={s.score} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">{t('disclaimer')}</p>
        </>
      )}
    </div>
  );
}
