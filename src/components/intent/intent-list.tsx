'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, ScorePill } from '@/components/ui/badge';
import { ArrowRight, ChevronDown } from 'lucide-react';
import type { IntentCompany } from '@/lib/data/modules';

const PAGE = 6;
const TENDER_PREFIX = /^Open tender:\s*/;

export function IntentList({ items }: { items: IntentCompany[] }) {
  const t = useTranslations('modules');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [visible, setVisible] = useState(PAGE);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const shown = items.slice(0, visible);

  // Translate the French tender titles inside the visible buyers' signals.
  useEffect(() => {
    if (locale === 'fr') return;
    const titles = Array.from(
      new Set(
        shown.flatMap((c) => c.signals)
          .filter((s) => TENDER_PREFIX.test(s))
          .map((s) => s.replace(TENDER_PREFIX, ''))
      )
    ).filter((title) => !(title in translations));
    if (!titles.length) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/news/translate', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ titles, target: locale }),
        });
        const json = await res.json();
        if (!cancelled && Array.isArray(json.translations)) {
          setTranslations((prev) => {
            const next = { ...prev };
            titles.forEach((orig, i) => {
              const tr = json.translations[i];
              if (tr && tr !== orig) next[orig] = tr;
            });
            return next;
          });
        }
      } catch {
        /* keep originals */
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, visible, items]);

  function industryLabel(industry: string): string {
    if (industry.startsWith('Public sector')) return industry.replace('Public sector', t('publicSector'));
    if (industry === 'Public procurement') return t('publicProcurement');
    return industry;
  }
  function signalLabel(s: string): string {
    if (!TENDER_PREFIX.test(s)) return s;
    const title = s.replace(TENDER_PREFIX, '');
    return `${t('openTender')}: ${translations[title] ?? title}`;
  }
  function actionLabel(action: string): string {
    return action.startsWith('Review the open tender') ? t('intentAction') : action;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        {shown.map((c) => (
          <Card key={c.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <div className="truncate font-semibold">{c.name}</div>
                <div className="text-xs text-muted-foreground">{industryLabel(c.industry)}</div>
              </div>
              <ScorePill score={c.intentScore} />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {c.signals.map((s, i) => (
                <Badge key={i} tone="primary">{signalLabel(s)}</Badge>
              ))}
            </div>
            <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
              <span>{t('intentScore')}: <b className="text-foreground">{c.intentScore}</b></span>
              <span>{t('urgency')}: <b className="text-foreground">{c.urgencyScore}</b></span>
              <span>{t('salesScore')}: <b className="text-foreground">{c.salesScore}</b></span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="min-w-0 truncate text-xs text-muted-foreground">{actionLabel(c.action)}</span>
              <Button variant="accent" size="sm" className="shrink-0">{t('action')} <ArrowRight size={14} /></Button>
            </div>
          </Card>
        ))}
      </div>

      {visible < items.length && (
        <div className="text-center">
          <Button variant="outline" onClick={() => setVisible((v) => v + PAGE)}>
            <ChevronDown size={15} /> {tc('loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
}
