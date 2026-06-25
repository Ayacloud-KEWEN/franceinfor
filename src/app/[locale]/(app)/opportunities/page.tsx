import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { TenderSearch } from '@/components/tenders/tender-search';

export default async function OpportunitiesPage() {
  const t = await getTranslations('tenders');
  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <TenderSearch />
    </div>
  );
}
