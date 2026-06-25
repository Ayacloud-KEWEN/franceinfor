'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, ScorePill } from '@/components/ui/badge';
import { ExternalLink, Languages, Loader2, ChevronDown } from 'lucide-react';
import type { LiveNewsItem, SignalType } from '@/lib/sources/news';

const PAGE = 12;

const toneBySignal: Record<SignalType, 'accent' | 'primary' | 'warning' | 'muted'> = {
  Buying: 'accent',
  Tender: 'primary',
  Partnership: 'accent',
  Investment: 'primary',
  Expansion: 'accent',
  Risk: 'warning',
};

export function NewsList({ items }: { items: LiveNewsItem[] }) {
  const t = useTranslations('modules');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [visible, setVisible] = useState(PAGE);

  // Source headlines are French; translate when the UI is in another language.
  const needsTranslation = locale !== 'fr';
  const shown = items.slice(0, visible);

  // Translate only the titles currently visible (and not yet translated).
  useEffect(() => {
    if (!needsTranslation) return;
    const todo = shown.filter((it) => !(it.id in translations));
    if (!todo.length) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch('/api/news/translate', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ titles: todo.map((i) => i.title), target: locale }),
        });
        const json = await res.json();
        if (!cancelled && Array.isArray(json.translations)) {
          setTranslations((prev) => {
            const next = { ...prev };
            todo.forEach((it, i) => {
              const tr = json.translations[i];
              if (tr && tr !== it.title) next[it.id] = tr;
            });
            return next;
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, needsTranslation, visible, items]);

  const hasTranslations = Object.keys(translations).length > 0;

  return (
    <div className="space-y-3">
      {needsTranslation && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t('translating')}
            </>
          ) : hasTranslations ? (
            <button
              onClick={() => setShowOriginal((v) => !v)}
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <Languages size={14} /> {showOriginal ? t('showTranslated') : t('showOriginal')}
            </button>
          ) : null}
        </div>
      )}

      {shown.map((n) => {
        const translated = translations[n.id];
        const display = !showOriginal && translated ? translated : n.title;
        return (
          <Card key={n.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={toneBySignal[n.signalType]}>{n.signalType}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {n.source}{n.date ? ` · ${n.date}` : ''}
                  </span>
                </div>
                {n.url && n.url !== '#' ? (
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-start gap-1 font-semibold hover:text-primary hover:underline"
                  >
                    {display} <ExternalLink size={13} className="mt-1 shrink-0" />
                  </a>
                ) : (
                  <div className="mt-1.5 font-semibold">{display}</div>
                )}
                {/* Show source headline under the translation for context */}
                {translated && !showOriginal && (
                  <div className="mt-0.5 text-xs text-muted-foreground">{n.title}</div>
                )}
              </div>
              <ScorePill score={n.opportunityScore} />
            </div>
          </Card>
        );
      })}

      {visible < items.length && (
        <div className="pt-2 text-center">
          <Button variant="outline" onClick={() => setVisible((v) => v + PAGE)}>
            <ChevronDown size={15} /> {tc('loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
}
