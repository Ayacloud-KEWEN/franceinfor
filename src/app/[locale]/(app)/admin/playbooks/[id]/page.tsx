import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getAdminUser } from '@/lib/admin';
import { getRawPlaybook } from '@/lib/playbooks-db';
import { PlaybookEditor } from '@/components/admin/playbook-editor';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminPlaybookEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getAdminUser();
  if (!admin) notFound();
  const { id } = await params;
  const t = await getTranslations('admin');
  const raw = await getRawPlaybook(id);
  if (!raw) notFound();

  return (
    <div className="max-w-4xl space-y-4">
      <PageHeader
        title={t('playbooks.editTitle')}
        subtitle={t('playbooks.editSubtitle')}
        action={
          <div className="flex gap-2">
            <Link href="/admin/playbooks">
              <Button variant="outline" size="sm"><ArrowLeft size={14} /> {t('back')}</Button>
            </Link>
            <Link href={`/playbooks/${raw.slug}`} target="_blank">
              <Button variant="outline" size="sm">{t('playbooks.preview')} <ExternalLink size={13} /></Button>
            </Link>
          </div>
        }
      />
      <PlaybookEditor id={id} initialJson={JSON.stringify(raw, null, 2)} />
    </div>
  );
}
