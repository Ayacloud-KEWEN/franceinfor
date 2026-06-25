import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { NetworkExplorer } from '@/components/network/network-explorer';

export default async function NetworkPage() {
  const t = await getTranslations('network');
  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <NetworkExplorer />
    </div>
  );
}
