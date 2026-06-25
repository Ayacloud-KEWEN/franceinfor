'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Badge, ScorePill } from '@/components/ui/badge';
import type { LiveNewsItem, SignalType } from '@/lib/sources/news';

const toneBySignal: Record<SignalType, 'accent' | 'primary' | 'warning' | 'muted'> = {
  Buying: 'accent', Tender: 'primary', Partnership: 'accent',
  Investment: 'primary', Expansion: 'accent', Risk: 'warning',
};

export function DashboardFeed({ items }: { items: LiveNewsItem[] }) {
  const tc = useTranslations('common');
  const locale = useLocale();
  const [translations, setTranslations] = useState<Record<string, string>>({});

  // Source headlines are French; translate when UI is in another language.
  useEffect(() => {
    if (locale === 'fr' || !items.length) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/news/translate', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ titles: items.map((i) => i.title), target: locale }),
        });
        const json = await res.json();
        if (!cancelled && Array.isArray(json.translations)) {
          const map: Record<string, string> = {};
          items.forEach((it, i) => {
            const tr = json.translations[i];
            if (tr && tr !== it.title) map[it.id] = tr;
          });
          setTranslations(map);
        }
      } catch {
        /* keep originals on failure */
      }
    })();
    return () => { cancelled = true; };
  }, [locale, items]);

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{tc('noLiveItems')}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((f) => {
        const title = translations[f.id] ?? f.title;
        return (
          <div key={f.id} className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge tone={toneBySignal[f.signalType]}>{f.signalType}</Badge>
                <span className="text-xs text-muted-foreground">{f.source}{f.date ? ` · ${f.date}` : ''}</span>
              </div>
              <ScorePill score={f.opportunityScore} />
            </div>
            {f.url && f.url !== '#' ? (
              <a href={f.url} target="_blank" rel="noopener noreferrer" className="mt-1.5 block text-sm font-medium hover:text-primary hover:underline">
                {title}
              </a>
            ) : (
              <p className="mt-1.5 text-sm font-medium">{title}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
