import { notFound } from 'next/navigation';
import { getAdminUser } from '@/lib/admin';
import { adminListPlaybooks } from '@/lib/playbooks-db';
import { deletePlaybookAction } from '@/app/actions/playbooks-admin';
import { PlaybookGenerator } from '@/components/admin/playbook-generator';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { ArrowLeft, Pencil, Rocket, Trash2 } from 'lucide-react';
import type { Loc } from '@/lib/data/playbooks';

export const dynamic = 'force-dynamic';

function fmt(d: Date): string {
  return new Date(d).toISOString().slice(0, 16).replace('T', ' ');
}

export default async function AdminPlaybooksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const admin = await getAdminUser();
  if (!admin) notFound();
  const { locale } = await params;
  const rows = await adminListPlaybooks(locale as Loc);

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Playbooks"
        subtitle="AI-draft, review and publish playbooks. Drafts stay hidden from the public site until published."
        action={<Link href="/admin"><Button variant="outline" size="sm"><ArrowLeft size={14} /> Admin</Button></Link>}
      />

      <PlaybookGenerator />

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No playbooks yet.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{r.title}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        r.status === 'PUBLISHED' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {r.status}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{r.source}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {r.slug} · v{r.version} · {fmt(r.updatedAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/playbooks/${r.id}`}>
                    <Button size="sm" variant={r.status === 'DRAFT' ? 'default' : 'outline'}>
                      {r.status === 'DRAFT' ? <><Rocket size={13} /> Review &amp; publish</> : <><Pencil size={13} /> Edit</>}
                    </Button>
                  </Link>
                  <form action={deletePlaybookAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <Button size="sm" variant="ghost" type="submit"><Trash2 size={13} /></Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
