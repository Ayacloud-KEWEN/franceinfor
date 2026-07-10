import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { BrandSearch } from '@/components/modules/brand-search';
import { ServiceGuide } from '@/components/services/service-guide';
import { BrandKnowledge } from '@/components/modules/brand-knowledge';

export default async function BrandsPage() {
  const t = await getTranslations('modules');
  return (
    <div>
      <PageHeader title={t('brandsTitle')} subtitle={t('brandsSubtitle')} />
      <BrandSearch />
      <BrandKnowledge />
      <ServiceGuide kind="brand" />
    </div>
  );
}
