import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getAdminUser } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { graphStats } from '@/lib/knowledge-graph';
import { reviewNodeAction, reviewEdgeAction, runPipelineAction } from '@/app/actions/knowledge';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { ArrowLeft, Check, X, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminKnowledgePage() {
  const admin = await getAdminUser();
  if (!admin) notFound();
  const t = await getTranslations('admin');

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
        title={t('knowledge.title')}
        subtitle={t('knowledge.subtitle')}
        action={
          <div className="flex gap-2">
            <form action={runPipelineAction}>
              <Button size="sm" type="submit"><Sparkles size={14} /> {t('knowledge.runPipeline')}</Button>
            </form>
            <Link href="/admin"><Button variant="outline" size="sm"><ArrowLeft size={14} /> {t('back')}</Button></Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          [t('knowledge.statNodes'), stats.nodes],
          [t('knowledge.statEdges'), stats.edges],
          [t('knowledge.statApproved'), stats.apprNodes],
          [t('knowledge.statCandNodes'), stats.candNodes],
          [t('knowledge.statCandEdges'), stats.candEdges],
        ].map(([l, v]) => (
          <Card key={l as string}><CardContent className="p-4"><div className="text-2xl font-bold">{v}</div><div className="text-xs text-muted-foreground">{l}</div></CardContent></Card>
        ))}
      </div>

      {/* Candidate nodes */}
      <Card>
        <CardHeader><CardTitle className="text-base">{t('knowledge.candEntities', { n: nodes.length })}</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {nodes.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('knowledge.candEmpty')}</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted-foreground"><th className="py-2 pr-3">{t('knowledge.colType')}</th><th className="pr-3">{t('knowledge.colName')}</th><th className="pr-3">{t('knowledge.colConf')}</th><th className="pr-3">{t('knowledge.colSource')}</th><th /></tr></thead>
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
        <CardHeader><CardTitle className="text-base">{t('knowledge.candRel', { n: edges.length })}</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {edges.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('knowledge.candRelEmpty')}</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted-foreground"><th className="py-2 pr-3">{t('knowledge.colRel')}</th><th className="pr-3">{t('knowledge.colConf')}</th><th /></tr></thead>
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
