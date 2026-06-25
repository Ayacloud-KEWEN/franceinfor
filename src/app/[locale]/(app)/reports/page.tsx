import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { ReportBuilder } from '@/components/reports/report-builder';

export default async function ReportsPage() {
  const t = await getTranslations('reports');
  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <ReportBuilder />
    </div>
  );
}
