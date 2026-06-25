'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CreditScore } from '@/lib/data/modules';

interface Profile {
  company: string;
  scores: CreditScore[];
  trust: number;
  realData?: boolean;
  realLegal?: boolean;
}

interface LegalEvent {
  date: string | null;
  family: string | null;
  tribunal: string | null;
  city: string | null;
}

function tone(score: number) {
  return score >= 70 ? 'bg-accent' : score >= 50 ? 'bg-primary' : 'bg-amber-500';
}

export function CreditCheck() {
  const t = useTranslations('modules');
  const tc = useTranslations('common');
  const [input, setInput] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<LegalEvent[]>([]);
  const [loading, setLoading] = useState(false);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/credit?q=${encodeURIComponent(input)}`);
      const json = await res.json();
      setProfile(res.ok ? json.profile : null);
      setEvents(res.ok ? json.events ?? [] : []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={run} className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('creditSearch')} className="max-w-xl" />
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search size={16} />}
          {t('assess')}
        </Button>
      </form>

      {profile && (
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base text-foreground">{profile.company}</CardTitle>
              {profile.realData && (
                <span className="mt-1 inline-flex w-fit rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-accent">
                  ● {tc('live')} data.gouv.fr
                </span>
              )}
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-xs text-muted-foreground">{t('trustScore')}</div>
              <div className={cn('mt-1 text-5xl font-bold', profile.trust >= 70 ? 'text-accent' : profile.trust >= 50 ? 'text-primary' : 'text-amber-500')}>
                {profile.trust}
              </div>
              <div className="text-xs text-muted-foreground">/ 100</div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardContent className="space-y-4 py-5">
              {profile.scores.map((s) => (
                <div key={s.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">{s.label}</span>
                    <span className="text-muted-foreground">{s.score}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className={cn('h-full rounded-full', tone(s.score))} style={{ width: `${s.score}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{s.explanation}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {profile.realLegal && (
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-base text-foreground">{t('legalEvents')}</CardTitle>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('noLegalEvents')}</p>
                ) : (
                  <ul className="divide-y divide-border text-sm">
                    {events.map((e, i) => (
                      <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-2">
                        <span className="font-medium">{e.family || '—'}</span>
                        <span className="text-xs text-muted-foreground">
                          {[e.date, e.tribunal || e.city].filter(Boolean).join(' · ')}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
