import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { EventsList } from '@/components/events/events-list';
import { getEventsWithBuzz, getEventsFallback, type EnrichedEvent } from '@/lib/sources/events';

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('modules');

  let events: EnrichedEvent[];
  try {
    events = await getEventsWithBuzz();
  } catch {
    events = getEventsFallback();
  }

  return (
    <div>
      <PageHeader title={t('eventsTitle')} subtitle={t('eventsSubtitle')} />
      <EventsList events={events} locale={locale} />
    </div>
  );
}
