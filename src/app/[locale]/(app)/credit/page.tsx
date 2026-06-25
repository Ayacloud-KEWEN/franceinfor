import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { CreditCheck } from '@/components/modules/credit-check';

export default async function CreditPage() {
  const t = await getTranslations('modules');
  return (
    <div>
      <PageHeader title={t('creditTitle')} subtitle={t('creditSubtitle')} />
      <CreditCheck />
    </div>
  );
}
