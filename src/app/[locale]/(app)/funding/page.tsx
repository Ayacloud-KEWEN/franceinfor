import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth';
import { parseProfile } from '@/lib/profile';
import { PageHeader } from '@/components/page-header';
import { FundingMatcher } from '@/components/funding/funding-matcher';

export default async function FundingPage() {
  const [t, user] = await Promise.all([getTranslations('funding'), getCurrentUser()]);
  const profile = parseProfile(user);
  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <FundingMatcher initial={{ sector: profile?.industry || '', region: profile?.region || '' }} />
    </div>
  );
}
