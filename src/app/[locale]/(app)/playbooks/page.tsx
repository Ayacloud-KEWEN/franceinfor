import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { PlaybookFinder } from '@/components/playbooks/playbook-finder';

export default async function PlaybooksPage() {
  const t = await getTranslations('playbooks');
  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <PlaybookFinder />
    </div>
  );
}
