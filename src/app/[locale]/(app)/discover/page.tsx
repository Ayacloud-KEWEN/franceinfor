import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth';
import { parseProfile } from '@/lib/profile';
import { PageHeader } from '@/components/page-header';
import { DiscoverEngine } from '@/components/modules/discover';

export default async function DiscoverPage() {
  const [t, user] = await Promise.all([getTranslations('modules'), getCurrentUser()]);
  const profile = parseProfile(user);
  return (
    <div>
      <PageHeader title={t('discoverTitle')} subtitle={t('discoverSubtitle')} />
      <DiscoverEngine
        initial={{
          product: profile?.product ?? '',
          industry: profile?.industry ?? '',
          target: profile?.region ?? '',
        }}
      />
    </div>
  );
}
