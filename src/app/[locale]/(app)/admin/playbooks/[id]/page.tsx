import { notFound } from 'next/navigation';
import { getAdminUser } from '@/lib/admin';
import { getRawPlaybook } from '@/lib/playbooks-db';
import { publishPlaybookAction } from '@/app/actions/playbooks-admin';
import { PlaybookEditor } from '@/components/admin/playbook-editor';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { ArrowLeft, Rocket, ExternalLink } from 'lucide-react';

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
        subtitle="Review AI-drafted content. Verify every authority name and reference URL before publishing."
        action={
          <div className="flex gap-2">
            <Link href="/admin/playbooks">
              <Button variant="outline" size="sm"><ArrowLeft size={14} /> Back</Button>
            </Link>
            <Link href={`/playbooks/${raw.slug}`} target="_blank">
              <Button variant="outline" size="sm">Preview <ExternalLink size={13} /></Button>
            </Link>
            <form action={publishPlaybookAction}>
              <input type="hidden" name="id" value={id} />
              <Button size="sm" type="submit"><Rocket size={14} /> Publish</Button>
            </form>
          </div>
        }
      />
      <PlaybookEditor id={id} initialJson={JSON.stringify(raw, null, 2)} />
    </div>
  );
}
