import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { CompanySearch } from '@/components/companies/company-search';

export default async function CompaniesPage() {
  const t = await getTranslations('companies');
  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <CompanySearch />
    </div>
  );
}
