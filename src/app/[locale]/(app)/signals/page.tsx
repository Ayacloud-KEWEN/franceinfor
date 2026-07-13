import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { FundingSignals } from '@/components/signals/funding-signals';
import { HiringSignals } from '@/components/signals/hiring-signals';

export default async function SignalsPage() {
  const t = await getTranslations('signals');
  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <FundingSignals />
      <HiringSignals />
    </div>
  );
}
