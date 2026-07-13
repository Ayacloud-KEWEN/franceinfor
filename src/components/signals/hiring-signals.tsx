'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Badge, ScorePill } from '@/components/ui/badge';
import { SaveButton } from '@/components/saved/save-button';
import { Link } from '@/i18n/routing';
import { Loader2, Briefcase, MapPin } from 'lucide-react';
import type { HiringSignal } from '@/lib/sources/hiring-signals';

// Hiring signals from France Travail — a company posting many fresh roles is a
// real expansion / buying signal. Hidden entirely when the source isn't
// configured (needs FRANCE_TRAVAIL_CLIENT_ID/SECRET).
export function HiringSignals() {
  const t = useTranslations('signals');
  const [results, setResults] = useState<HiringSignal[] | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch('/api/signals/hiring', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '' }),
    })
      .then((r) => r.json())
      .then((j) => {
        if (!active) return;
        setConfigured(j.configured ?? false);
        setResults(j.results ?? []);
      })
      .catch(() => active && setConfigured(false))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  // Not configured → don't render the section at all.
  if (configured === false) return null;

  return (
    <div className="mt-8">
      <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold">
        <Briefcase size={15} className="text-primary" /> {t('hiringTitle')}
      </h2>
      <p className="mb-3 text-xs text-muted-foreground">{t('hiringSubtitle')}</p>

      {loading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> …</div>}

      <div className="space-y-3">
        {(results ?? []).map((s) => (
          <Card key={s.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Briefcase size={15} className="shrink-0 text-primary" />
                  {s.siren ? (
                    <Link href={`/companies/${s.siren}`} className="font-semibold hover:text-primary hover:underline">{s.company}</Link>
                  ) : (
                    <span className="font-semibold">{s.company}</span>
                  )}
                  <Badge tone="primary">{t('openRoles', { n: s.postings })}</Badge>
                  {s.location && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin size={11} /> {s.location}
                    </span>
                  )}
                </div>
                {s.roles.length > 0 && (
                  <p className="mt-1 text-sm text-muted-foreground">{s.roles.join(' · ')}</p>
                )}
                {s.latestDate && (
                  <div className="mt-1.5 text-xs text-muted-foreground">{t('latestPosting')}: {s.latestDate}</div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('intent')}</div>
                  <ScorePill score={s.score} />
                </div>
                <SaveButton
                  size="icon"
                  type="OPPORTUNITY"
                  refId={`hiring:${s.id}`}
                  label={`${s.company} — ${s.postings} roles`}
                  data={{ postings: s.postings, roles: s.roles, siren: s.siren }}
                />
              </div>
            </div>
          </Card>
        ))}
        {results && results.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        )}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">{t('hiringSource')}</p>
    </div>
  );
}
