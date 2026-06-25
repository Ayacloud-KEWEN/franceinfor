'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, ScorePill } from '@/components/ui/badge';
import { MapPin, CalendarDays, Users, ExternalLink, ChevronDown } from 'lucide-react';
import type { EnrichedEvent } from '@/lib/sources/events';

const PAGE = 6;

export function EventsList({ events }: { events: EnrichedEvent[] }) {
  const t = useTranslations('modules');
  const tc = useTranslations('common');
  const [visible, setVisible] = useState(PAGE);
  const shown = events.slice(0, visible);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((e) => (
          <Card key={e.id} className="flex flex-col p-4">
            <div className="flex items-start justify-between">
              <div className="font-semibold">{e.name}</div>
              <Badge tone="primary">{e.type}</Badge>
            </div>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><MapPin size={13} /> {e.city}</div>
              <div className="flex items-center gap-1.5"><CalendarDays size={13} /> {e.date}</div>
              <div className="flex items-center gap-1.5"><Users size={13} /> {t('expectedLeads')}: {e.expectedLeads}</div>
            </div>

            {e.latestHeadline && (
              <a
                href={e.headlineUrl ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-start gap-1 rounded-md bg-accent/10 px-2 py-1.5 text-[11px] text-accent hover:underline"
              >
                <span className="line-clamp-2">📰 {e.latestHeadline}</span>
                <ExternalLink size={11} className="mt-0.5 shrink-0" />
              </a>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <div className="text-xs">
                <span className="text-muted-foreground">{t('businessValue')}: </span>
                <b>€{e.businessValueK}K</b>
              </div>
              <div className="flex items-center gap-1 text-xs">
                {e.live && <span className="h-1.5 w-1.5 rounded-full bg-accent" title="live news" />}
                <span className="text-muted-foreground">{t('match')}</span>
                <ScorePill score={e.matchScore} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {visible < events.length && (
        <div className="text-center">
          <Button variant="outline" onClick={() => setVisible((v) => v + PAGE)}>
            <ChevronDown size={15} /> {tc('loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
}
