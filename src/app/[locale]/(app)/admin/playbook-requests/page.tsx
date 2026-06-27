import { notFound } from 'next/navigation';
import { getAdminUser } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { updatePlaybookRequestAction } from '@/app/actions/playbook-requests';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';
import type { PlaybookRequestStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

const STATUSES: PlaybookRequestStatus[] = ['NEW', 'PLANNED', 'DONE', 'DECLINED'];
const inputCls = 'rounded-md border border-input bg-background px-2 py-1.5 text-sm';

function fmt(d: Date): string {
  return new Date(d).toISOString().slice(0, 16).replace('T', ' ');
}

export default async function AdminPlaybookRequestsPage() {
  const admin = await getAdminUser();
  if (!admin) notFound();

  const requests = await prisma.playbookRequest.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Playbook requests"
        subtitle="Customer demand for new playbooks. Triage here; author the playbook in code, then sync."
        action={<Link href="/admin"><Button variant="outline" size="sm"><ArrowLeft size={14} /> Admin</Button></Link>}
      />

      {requests.length === 0 ? (
        <p className="text-sm text-muted-foreground">No requests yet.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Card key={r.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">{r.title}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {fmt(r.createdAt)} · {r.userEmail ?? '—'}
                      {r.sector ? ` · ${r.sector}` : ''} · {r.locale}
                    </div>
                    {r.detail && <p className="mt-2 text-sm text-muted-foreground">{r.detail}</p>}
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{r.status}</span>
                </div>

                <form action={updatePlaybookRequestAction} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  <select name="status" defaultValue={r.status} className={inputCls}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <Input
                    name="adminNote"
                    defaultValue={r.adminNote ?? ''}
                    placeholder="Internal note"
                    className="max-w-xs"
                  />
                  <Button type="submit" size="sm" variant="outline">Save</Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
