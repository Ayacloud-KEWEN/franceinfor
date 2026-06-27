import { notFound } from 'next/navigation';
import { getAdminUser } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { graphStats } from '@/lib/knowledge-graph';
import { reviewNodeAction, reviewEdgeAction } from '@/app/actions/knowledge';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { ArrowLeft, Check, X } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminKnowledgePage() {
  const admin = await getAdminUser();
  if (!admin) notFound();

  const [stats, nodes, edges] = await Promise.all([
    graphStats(),
    prisma.knowledgeNode.findMany({ where: { status: 'CANDIDATE' }, orderBy: { confidence: 'desc' }, take: 100 }),
    prisma.knowledgeEdge.findMany({
      where: { status: 'CANDIDATE' },
      orderBy: { confidence: 'desc' },
      take: 100,
      include: { from: true, to: true },
    }),
  ]);

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Knowledge graph"
        subtitle="Knowledge OS L2 — review AI-extracted entities & relationships before they enter the graph."
        action={<Link href="/admin"><Button variant="outline" size="sm"><ArrowLeft size={14} /> Admin</Button></Link>}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          ['Nodes', stats.nodes],
          ['Edges', stats.edges],
          ['Approved', stats.apprNodes],
          ['Candidate nodes', stats.candNodes],
          ['Candidate edges', stats.candEdges],
        ].map(([l, v]) => (
          <Card key={l as string}><CardContent className="p-4"><div className="text-2xl font-bold">{v}</div><div className="text-xs text-muted-foreground">{l}</div></CardContent></Card>
        ))}
      </div>

      {/* Candidate nodes */}
      <Card>
        <CardHeader><CardTitle className="text-base">Candidate entities ({nodes.length})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {nodes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No candidates. Run extraction (/api/cron/extract) over indexed documents.</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted-foreground"><th className="py-2 pr-3">Type</th><th className="pr-3">Name</th><th className="pr-3">Conf.</th><th className="pr-3">Source</th><th /></tr></thead>
              <tbody>
                {nodes.map((n) => (
                  <tr key={n.id} className="border-t border-border">
                    <td className="py-2 pr-3"><Badge tone="primary">{n.type}</Badge></td>
                    <td className="pr-3 font-medium">{n.name}</td>
                    <td className="pr-3 text-xs text-muted-foreground">{n.confidence.toFixed(2)}</td>
                    <td className="pr-3 max-w-[180px] truncate text-xs text-muted-foreground" title={n.sourceRef ?? ''}>{n.sourceRef ?? '—'}</td>
                    <td className="py-2">
                      <div className="flex gap-1.5">
                        <form action={reviewNodeAction}><input type="hidden" name="id" value={n.id} /><input type="hidden" name="status" value="APPROVED" /><Button size="sm" variant="outline" type="submit"><Check size={13} /></Button></form>
                        <form action={reviewNodeAction}><input type="hidden" name="id" value={n.id} /><input type="hidden" name="status" value="REJECTED" /><Button size="sm" variant="ghost" type="submit"><X size={13} /></Button></form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Candidate edges */}
      <Card>
        <CardHeader><CardTitle className="text-base">Candidate relationships ({edges.length})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {edges.length === 0 ? (
            <p className="text-sm text-muted-foreground">No candidate relationships.</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted-foreground"><th className="py-2 pr-3">Relationship</th><th className="pr-3">Conf.</th><th /></tr></thead>
              <tbody>
                {edges.map((e) => (
                  <tr key={e.id} className="border-t border-border">
                    <td className="py-2 pr-3"><b>{e.from.name}</b> <span className="text-muted-foreground">{e.relation}</span> <b>{e.to.name}</b></td>
                    <td className="pr-3 text-xs text-muted-foreground">{e.confidence.toFixed(2)}</td>
                    <td className="py-2">
                      <div className="flex gap-1.5">
                        <form action={reviewEdgeAction}><input type="hidden" name="id" value={e.id} /><input type="hidden" name="status" value="APPROVED" /><Button size="sm" variant="outline" type="submit"><Check size={13} /></Button></form>
                        <form action={reviewEdgeAction}><input type="hidden" name="id" value={e.id} /><input type="hidden" name="status" value="REJECTED" /><Button size="sm" variant="ghost" type="submit"><X size={13} /></Button></form>
                      </div>
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
