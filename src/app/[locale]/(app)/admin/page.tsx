import { notFound } from 'next/navigation';
import { getAdminUser } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeadStatusSelect } from '@/components/admin/lead-status-select';
import type { Plan } from '@prisma/client';

export const dynamic = 'force-dynamic';

function fmt(d: Date): string {
  return new Date(d).toISOString().slice(0, 16).replace('T', ' ');
}

const PLAN_TONE: Record<Plan, 'muted' | 'primary' | 'accent'> = {
  FREE: 'muted',
  PROFESSIONAL: 'primary',
  BUSINESS: 'accent',
  ENTERPRISE: 'accent',
};

export default async function AdminPage() {
  const admin = await getAdminUser();
  if (!admin) notFound();

  const [users, events, leads, totalUsers, paidUsers, newLeads, planGroups] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
    prisma.event.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
    prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.user.count(),
    prisma.user.count({ where: { plan: { in: ['PROFESSIONAL', 'BUSINESS', 'ENTERPRISE'] } } }),
    prisma.lead.count({ where: { status: 'NEW' } }),
    prisma.user.groupBy({ by: ['plan'], _count: true }),
  ]);

  const planCount = (p: Plan) => planGroups.find((g) => g.plan === p)?._count ?? 0;

  const stats = [
    { label: 'Users', value: totalUsers },
    { label: 'Paid', value: paidUsers },
    { label: 'Professional', value: planCount('PROFESSIONAL') },
    { label: 'Business', value: planCount('BUSINESS') },
    { label: 'New leads', value: newLeads },
  ];

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader title="Admin" subtitle="Users, billing events & service inquiries" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leads */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-foreground">Leads ({leads.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {leads.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leads yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-3">When</th>
                  <th className="py-2 pr-3">Kind</th>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Company</th>
                  <th className="py-2 pr-3">Message</th>
                  <th className="py-2 pr-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-t border-border align-top">
                    <td className="py-2 pr-3 whitespace-nowrap text-xs text-muted-foreground">{fmt(l.createdAt)}</td>
                    <td className="py-2 pr-3">{l.kind}</td>
                    <td className="py-2 pr-3 font-medium">{l.name}</td>
                    <td className="py-2 pr-3">{l.email}</td>
                    <td className="py-2 pr-3">{l.company ?? '—'}</td>
                    <td className="py-2 pr-3 max-w-xs truncate" title={l.message ?? ''}>{l.message ?? '—'}</td>
                    <td className="py-2 pr-3"><LeadStatusSelect id={l.id} status={l.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Users */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-foreground">Users (latest {users.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="py-2 pr-3">Joined</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Plan</th>
                <th className="py-2 pr-3">Sub status</th>
                <th className="py-2 pr-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="py-2 pr-3 whitespace-nowrap text-xs text-muted-foreground">{fmt(u.createdAt)}</td>
                  <td className="py-2 pr-3">{u.email}</td>
                  <td className="py-2 pr-3">{u.name ?? '—'}</td>
                  <td className="py-2 pr-3"><Badge tone={PLAN_TONE[u.plan]}>{u.plan}</Badge></td>
                  <td className="py-2 pr-3 text-xs text-muted-foreground">{u.subscriptionStatus ?? '—'}</td>
                  <td className="py-2 pr-3 text-xs">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-foreground">Events (latest {events.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-3">When</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Detail</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} className="border-t border-border">
                    <td className="py-2 pr-3 whitespace-nowrap text-xs text-muted-foreground">{fmt(e.createdAt)}</td>
                    <td className="py-2 pr-3 font-medium">{e.type}</td>
                    <td className="py-2 pr-3">{e.email ?? '—'}</td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground">
                      {e.meta ? JSON.stringify(e.meta) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
