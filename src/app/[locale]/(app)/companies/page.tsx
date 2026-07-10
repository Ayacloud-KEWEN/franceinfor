import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { CompanySearch } from '@/components/companies/company-search';
import { ServiceGuide } from '@/components/services/service-guide';
import { LandingPackage } from '@/components/modules/landing-package';

export default async function CompaniesPage() {
  const t = await getTranslations('companies');
  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <CompanySearch />
      <LandingPackage />
      <ServiceGuide kind="company" />
    </div>
  );
}
