import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { IntentList } from '@/components/intent/intent-list';
import { INTENT_COMPANIES } from '@/lib/data/modules';
import { buyingIntentReal } from '@/lib/sources/intent';

export default async function IntentPage() {
  const t = await getTranslations('modules');

  // Real buying intent from live BOAMP buyers; fall back to mock.
  let items = INTENT_COMPANIES;
  try {
    const live = await buyingIntentReal();
    if (live.length) items = live;
  } catch {
    items = [...INTENT_COMPANIES].sort((a, b) => b.intentScore - a.intentScore);
  }

  return (
    <div>
      <PageHeader title={t('intentTitle')} subtitle={t('intentSubtitle')} />
      <IntentList items={items} />
    </div>
  );
}
