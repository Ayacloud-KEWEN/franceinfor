import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { DiscoverEngine } from '@/components/modules/discover';

export default async function DiscoverPage() {
  const t = await getTranslations('modules');
  return (
    <div>
      <PageHeader title={t('discoverTitle')} subtitle={t('discoverSubtitle')} />
      <DiscoverEngine />
    </div>
  );
}
