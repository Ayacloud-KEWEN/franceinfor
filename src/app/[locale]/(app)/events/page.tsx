import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { EventsList } from '@/components/events/events-list';
import { getEventsWithBuzz, type EnrichedEvent } from '@/lib/sources/events';
import { EVENTS } from '@/lib/data/modules';

export default async function EventsPage() {
  const t = await getTranslations('modules');

  let events: EnrichedEvent[];
  try {
    events = await getEventsWithBuzz();
  } catch {
    events = [...EVENTS]
      .sort((a, b) => b.matchScore - a.matchScore)
      .map((e) => ({ ...e, buzz: 0, latestHeadline: null, headlineUrl: null, live: false }));
  }

  return (
    <div>
      <PageHeader title={t('eventsTitle')} subtitle={t('eventsSubtitle')} />
      <EventsList events={events} />
    </div>
  );
}
