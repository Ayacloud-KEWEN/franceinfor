import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth';
import { parseProfile } from '@/lib/profile';
import { PageHeader } from '@/components/page-header';
import { MarketsExplorer } from '@/components/markets/markets-explorer';
import { MarketSearch } from '@/components/markets/market-search';
import { getIndustriesWithRealStats } from '@/lib/sources/market-stats';

export default async function MarketsPage() {
  const [t, industries, user] = await Promise.all([
    getTranslations('markets'),
    getIndustriesWithRealStats(),
    getCurrentUser(),
  ]);
  const profile = parseProfile(user);
  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <MarketSearch initial={profile?.industry || profile?.product || ''} />
      <MarketsExplorer industries={industries} />
    </div>
  );
}
