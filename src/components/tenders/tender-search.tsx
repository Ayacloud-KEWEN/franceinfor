'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScorePill } from '@/components/ui/badge';
import { Search, Loader2, ExternalLink, ChevronDown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SaveButton } from '@/components/saved/save-button';
import { AiResultPanel } from '@/components/ai/ai-result-panel';
import type { TenderResult } from '@/lib/sources/boamp';

type Source = 'boamp' | 'ted' | 'place' | 'francemarches';
const PAGE = 15;

async function fetchTenders(q: string, source: Source): Promise<{ results: TenderResult[]; total: number }> {
  const res = await fetch(`/api/tenders/search?source=${source}&limit=60&q=${encodeURIComponent(q)}`);
  if (res.status === 429) throw new Error('quota');
  if (!res.ok) throw new Error('error');
  return res.json();
}

export function TenderSearch() {
  const t = useTranslations('tenders');
  const tc = useTranslations('common');
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('*');
  const [source, setSource] = useState<Source>('boamp');
  const [visible, setVisible] = useState(PAGE);
  const [assistTender, setAssistTender] = useState<TenderResult | null>(null);

  const isExternal = source === 'francemarches';

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ['tenders', source, query],
    queryFn: () => fetchTenders(query === '*' ? '' : query, source),
    enabled: !isExternal,
  });

  // Reset pagination whenever the query or source changes.
  useEffect(() => {
    setVisible(PAGE);
  }, [query, source]);

  const shown = data?.results.slice(0, visible) ?? [];

  const sources: { id: Source; label: string }[] = [
    { id: 'boamp', label: 'BOAMP (France)' },
    { id: 'ted', label: 'TED (EU)' },
    { id: 'place', label: 'PLACE (État)' },
    { id: 'francemarches', label: 'FranceMarches' },
  ];

  const fmUrl = `https://www.francemarches.com/recherche?q=${encodeURIComponent(
    query === '*' ? input.trim() : query
  )}`;

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border border-border p-0.5">
        {sources.map((s) => (
          <button
            key={s.id}
            onClick={() => setSource(s.id)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              source === s.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(input.trim() || '*');
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
          <Search size={16} />
        </Button>
      </form>

      {isExternal && (
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">{t('externalNotice')}</p>
          <a
            href={fmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            {t('openExternal')} <ExternalLink size={14} />
          </a>
        </Card>
      )}

      {isFetching && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> {t('loading')}
        </div>
      )}
      {isError && (
        <p className="text-sm text-destructive">
          {(error as Error).message === 'quota' ? tc('quotaReached') : tc('loadFailed')}
        </p>
      )}

      <div className="space-y-3">
        {shown.map((tn) => (
          <Card key={tn.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="line-clamp-2 font-semibold">{tn.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {t('buyer')}: {tn.buyer || '—'}
                  {tn.deadline ? ` · ${t('deadline')}: ${tn.deadline}` : ''}
                </div>
              </div>
              {query !== '*' && tn.matchScore > 0 && (
                <div className="flex shrink-0 items-center gap-1 text-xs">
                  <span className="text-muted-foreground">{t('match')}</span>
                  <ScorePill score={tn.matchScore} />
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              {tn.url ? (
                <a
                  href={tn.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  {t('view')} <ExternalLink size={12} />
                </a>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setAssistTender(tn)}>
                  <Sparkles size={14} /> {t('assistant')}
                </Button>
                <SaveButton
                  type="TENDER"
                  refId={tn.id}
                  label={tn.title}
                  data={{ buyer: tn.buyer, deadline: tn.deadline, url: tn.url, source }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {data && visible < data.results.length && (
        <div className="text-center">
          <Button variant="outline" onClick={() => setVisible((v) => v + PAGE)}>
            <ChevronDown size={15} /> {tc('loadMore')}
          </Button>
        </div>
      )}

      <AiResultPanel
        open={assistTender != null}
        onClose={() => setAssistTender(null)}
        title={t('assistantTitle')}
        endpoint="/api/tenders/assistant"
        payload={{ tender: assistTender }}
        filename={`tender-response-${assistTender?.id ?? ''}`}
      />
    </div>
  );
}
