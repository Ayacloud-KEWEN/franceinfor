import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { ComplianceChecklist } from '@/components/compliance/compliance-checklist';

export default async function CompliancePage() {
  const t = await getTranslations('compliance');
  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <ComplianceChecklist />
    </div>
  );
}
