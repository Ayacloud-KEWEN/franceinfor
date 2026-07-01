import { notFound } from 'next/navigation';
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
  const raw = await getRawPlaybook(id);
  if (!raw) notFound();

  return (
    <div className="max-w-4xl space-y-4">
      <PageHeader
        title="Edit playbook"
        subtitle="Review AI-drafted content. Publish is in the 'Verify & Publish' tab — it unlocks only after you confirm authorities and links."
        action={
          <div className="flex gap-2">
            <Link href="/admin/playbooks">
              <Button variant="outline" size="sm"><ArrowLeft size={14} /> Back</Button>
            </Link>
            <Link href={`/playbooks/${raw.slug}`} target="_blank">
              <Button variant="outline" size="sm">Preview <ExternalLink size={13} /></Button>
            </Link>
          </div>
        }
      />
      <PlaybookEditor id={id} initialJson={JSON.stringify(raw, null, 2)} />
    </div>
  );
}
