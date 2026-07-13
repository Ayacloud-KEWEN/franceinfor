'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, CalendarDays, Building, ExternalLink, ChevronDown } from 'lucide-react';
import { SaveButton } from '@/components/saved/save-button';
import type { EnrichedEvent } from '@/lib/sources/events';

const PAGE = 6;

// Format an ISO yyyy-mm to a localized "Month YYYY".
function fmtMonth(iso: string, locale: string): string {
  const [y, m] = iso.split('-').map(Number);
  try {
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date(y, m - 1, 1));
  } catch {
    return iso;
  }
}

export function EventsList({ events, locale }: { events: EnrichedEvent[]; locale: string }) {
  const t = useTranslations('modules');
  const tc = useTranslations('common');
  const [visible, setVisible] = useState(PAGE);
  const shown = events.slice(0, visible);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((e) => (
          <Card key={e.id} className="flex flex-col p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold">{e.name}</div>
              <Badge tone="primary">{e.type}</Badge>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{e.sector}</div>

            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CalendarDays size={13} /> {t('nextEdition')}: {fmtMonth(e.nextDate, locale)}
                {e.cadence === 'biennial' && <span className="opacity-70">· {t('biennial')}</span>}
              </div>
              <div className="flex items-center gap-1.5"><MapPin size={13} /> {e.city}</div>
              {e.venue && <div className="flex items-center gap-1.5"><Building size={13} /> {e.venue}</div>}
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
              <a
                href={e.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                {t('officialSite')} <ExternalLink size={12} />
              </a>
              <div className="flex items-center gap-2">
                {e.live && <span className="h-1.5 w-1.5 rounded-full bg-accent" title="live news" />}
                <SaveButton
                  size="icon"
                  type="OPPORTUNITY"
                  refId={`event:${e.id}`}
                  label={e.name}
                  data={{ city: e.city, sector: e.sector, date: e.nextDate, url: e.url }}
                />
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
