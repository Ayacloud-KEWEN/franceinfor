import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth';
import { parseProfile } from '@/lib/profile';
import { PageHeader } from '@/components/page-header';
import { CompanySearch } from '@/components/companies/company-search';
import { ServiceGuide } from '@/components/services/service-guide';
import { LandingPackage } from '@/components/modules/landing-package';
import { EntryCostCalculator } from '@/components/modules/entry-cost-calculator';

export default async function CompaniesPage() {
  const [t, user] = await Promise.all([getTranslations('companies'), getCurrentUser()]);
  const profile = parseProfile(user);
  // Prefill region: profile regions mentioning Paris / Île-de-France → paris.
  const region = /paris|île-de-france|ile-de-france/i.test(profile?.region ?? '') ? 'paris' : undefined;
  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <CompanySearch />
      <EntryCostCalculator initialRegion={region} />
      <LandingPackage />
      <ServiceGuide kind="company" />
    </div>
  );
}
