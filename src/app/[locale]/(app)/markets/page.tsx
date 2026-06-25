import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { MarketsExplorer } from '@/components/markets/markets-explorer';
import { MarketSearch } from '@/components/markets/market-search';
import { getIndustriesWithRealStats } from '@/lib/sources/market-stats';

export default async function MarketsPage() {
  const [t, industries] = await Promise.all([
    getTranslations('markets'),
    getIndustriesWithRealStats(),
  ]);
  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <MarketSearch />
      <MarketsExplorer industries={industries} />
    </div>
  );
}
