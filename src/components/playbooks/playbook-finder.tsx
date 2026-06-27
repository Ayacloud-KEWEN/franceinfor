'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, ArrowRight, Clock } from 'lucide-react';
import type { Playbook } from '@/lib/data/playbooks';

// Client-side matcher over the provided playbooks (same logic as the server
// matchPlaybook, but operates on the localized list passed in).
function match(playbooks: Playbook[], query: string): Playbook | null {
  const q = query.toLowerCase();
  let best: { p: Playbook; score: number } | null = null;
  for (const p of playbooks) {
    let score = 0;
    for (const kw of p.keywords) if (q.includes(kw.toLowerCase())) score += 3;
    for (const w of p.title.toLowerCase().split(/\W+/)) if (w.length > 3 && q.includes(w)) score += 1;
    if (score > 0 && (!best || score > best.score)) best = { p, score };
  }
  return best?.p ?? null;
}

export function PlaybookFinder({ playbooks }: { playbooks: Playbook[] }) {
  const t = useTranslations('playbooks');
  const [q, setQ] = useState('');
  const matched = q.trim() ? match(playbooks, q) : null;

  return (
    <div className="space-y-5">
      <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="max-w-xl"
        />
        <Button type="submit"><Search size={16} /></Button>
      </form>

      {q.trim() && (
        matched ? (
          <Card className="border-primary/40 bg-primary/5 p-4">
            <div className="text-xs text-muted-foreground">{t('bestMatch')}</div>
            <Link href={`/playbooks/${matched.slug}`} className="mt-1 flex items-center gap-2 text-lg font-semibold hover:text-primary hover:underline">
              <BookOpen size={18} className="text-primary" /> {matched.title} <ArrowRight size={15} />
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">{matched.summary}</p>
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground">{t('noMatch')}</p>
        )
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{t('library')}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {playbooks.map((p) => (
            <Link key={p.slug} href={`/playbooks/${p.slug}`}>
              <Card className="h-full p-5 transition-colors hover:border-primary">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-primary" />
                  <span className="font-semibold">{p.title}</span>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{p.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <Badge tone="muted" className="inline-flex items-center gap-1"><Clock size={11} /> {p.estTimeline}</Badge>
                  <Badge tone="primary">{p.tasks.length} {t('steps')}</Badge>
                  <Badge tone="muted">v{p.version}</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
