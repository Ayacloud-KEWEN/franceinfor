'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge, ScorePill } from '@/components/ui/badge';
import { Search, Loader2 } from 'lucide-react';
import type { BrandResult } from '@/lib/data/modules';

export function BrandSearch() {
  const t = useTranslations('modules');
  const [input, setInput] = useState('');
  const [results, setResults] = useState<BrandResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/brands/search?q=${encodeURIComponent(input)}`);
      const json = await res.json();
      setResults(res.ok ? json.results : []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={run} className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('brandSearch')} className="max-w-xl" />
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search size={16} />}
        </Button>
      </form>

      {results?.map((b) => (
        <Card key={b.id} className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{b.mark}</span>
                <Badge tone="muted">{b.office}</Badge>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {t('owner')}: {b.owner} · {t('classes')}: {b.classes}
              </div>
            </div>
            <div className="flex gap-4 text-xs">
              <div className="text-center">
                <div className="text-muted-foreground">{t('risk')}</div>
                <ScorePill score={b.riskScore} />
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">{t('similarity')}</div>
                <ScorePill score={b.similarityScore} />
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">{t('availability')}</div>
                <ScorePill score={b.availabilityScore} />
              </div>
            </div>
          </div>
          <div className="mt-2 border-t border-border pt-2 text-xs">
            <span className="text-muted-foreground">{t('recommendation')}: </span>
            <span className="font-medium">{b.recommendation}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
