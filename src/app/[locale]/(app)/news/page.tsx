import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { NewsList } from '@/components/news/news-list';
import { NEWS } from '@/lib/data/modules';
import { fetchFranceNews, type SignalType, type LiveNewsItem } from '@/lib/sources/news';

export default async function NewsPage() {
  const [t, tc] = await Promise.all([getTranslations('modules'), getTranslations('common')]);

  // Live Google News RSS (French headlines); fall back to the static demo set.
  let items: LiveNewsItem[];
  let live = true;
  try {
    items = await fetchFranceNews(undefined, 48);
    if (!items.length) throw new Error('empty');
  } catch {
    live = false;
    items = NEWS.map((n) => ({
      id: n.id,
      source: n.source,
      title: n.title,
      url: '#',
      signalType: n.signalType as SignalType,
      opportunityScore: n.opportunityScore,
      date: n.date,
    }));
  }

  const sorted = [...items].sort((a, b) => b.opportunityScore - a.opportunityScore);

  return (
    <div>
      <PageHeader
        title={t('newsTitle')}
        subtitle={`${t('newsSubtitle')}${live ? ` · ${tc('live')} Google News` : ''}`}
      />
      <NewsList items={sorted} />
    </div>
  );
}
