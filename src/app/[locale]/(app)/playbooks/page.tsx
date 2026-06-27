import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { PlaybookFinder } from '@/components/playbooks/playbook-finder';
import { PlaybookRequest } from '@/components/playbooks/playbook-request';
import { dbListPlaybooks } from '@/lib/playbooks-db';
import type { Loc } from '@/lib/data/playbooks';

export const dynamic = 'force-dynamic';

export default async function PlaybooksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [t, playbooks] = await Promise.all([
    getTranslations('playbooks'),
    dbListPlaybooks(locale as Loc),
  ]);
  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <PlaybookFinder playbooks={playbooks} />
      <div className="mt-6">
        <PlaybookRequest />
      </div>
    </div>
  );
}
