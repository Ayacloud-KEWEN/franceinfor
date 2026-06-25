import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { BrandSearch } from '@/components/modules/brand-search';
import { ServiceGuide } from '@/components/services/service-guide';

export default async function BrandsPage() {
  const t = await getTranslations('modules');
  return (
    <div>
      <PageHeader title={t('brandsTitle')} subtitle={t('brandsSubtitle')} />
      <BrandSearch />
      <ServiceGuide kind="brand" />
    </div>
  );
}
