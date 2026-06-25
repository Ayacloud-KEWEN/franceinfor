'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ScorePill } from '@/components/ui/badge';
import type { IntentCompany } from '@/lib/data/modules';

const TENDER_PREFIX = /^Open tender:\s*/;

export function DashboardIntent({ items }: { items: IntentCompany[] }) {
  const t = useTranslations('modules');
  const locale = useLocale();
  const [translations, setTranslations] = useState<Record<string, string>>({});

  // Translate the (French) tender title in each buyer's first signal.
  const titles = items.map((c) => (c.signals[0] ?? '').replace(TENDER_PREFIX, ''));

  useEffect(() => {
    if (locale === 'fr') return;
    const todo = titles.filter(Boolean);
    if (!todo.length) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/news/translate', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ titles: todo, target: locale }),
        });
        const json = await res.json();
        if (!cancelled && Array.isArray(json.translations)) {
          const map: Record<string, string> = {};
          todo.forEach((orig, i) => {
            const tr = json.translations[i];
            if (tr && tr !== orig) map[orig] = tr;
          });
          setTranslations(map);
        }
      } catch {
        /* keep originals */
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, items]);

  // Localise the English industry label produced server-side.
  function industryLabel(industry: string): string {
    if (industry.startsWith('Public sector')) {
      return industry.replace('Public sector', t('publicSector'));
    }
    if (industry === 'Public procurement') return t('publicProcurement');
    return industry; // mock-fallback industries (already meaningful)
  }

  function signalLabel(signal: string | undefined): string | null {
    if (!signal) return null;
    if (TENDER_PREFIX.test(signal)) {
      const title = signal.replace(TENDER_PREFIX, '');
      return `${t('openTender')}: ${translations[title] ?? title}`;
    }
    return signal; // mock-fallback signals
  }

  return (
    <div className="space-y-3">
      {items.map((c) => {
        const sig = signalLabel(c.signals[0]);
        return (
          <div key={c.id} className="flex items-start justify-between gap-2 rounded-lg border border-border p-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{c.name}</div>
              <div className="text-xs text-muted-foreground">{industryLabel(c.industry)}</div>
              {sig && <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{sig}</div>}
            </div>
            <ScorePill score={c.intentScore} />
          </div>
        );
      })}
    </div>
  );
}
