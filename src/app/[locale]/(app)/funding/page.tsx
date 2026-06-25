import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { FundingMatcher } from '@/components/funding/funding-matcher';

export default async function FundingPage() {
  const t = await getTranslations('funding');
  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <FundingMatcher />
    </div>
  );
}
