import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getAdminUser } from '@/lib/admin';
import { listProjects, experienceStats } from '@/lib/projects';
import { createProjectAction, updateProjectAction, addStepAction } from '@/app/actions/projects';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/routing';
import { ArrowLeft, Brain } from 'lucide-react';
import type { ProjectStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

const PROJECT_STATUSES: ProjectStatus[] = ['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const STEP_STATUSES = ['PENDING', 'IN_PROGRESS', 'DONE', 'BLOCKED'];
const inputCls = 'rounded-md border border-input bg-background px-2 py-1.5 text-sm';

export default async function AdminProjectsPage() {
  const admin = await getAdminUser();
  if (!admin) notFound();
  const t = await getTranslations('admin');

  const [projects, stats] = await Promise.all([listProjects(), experienceStats()]);

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title={t('projects.title')}
        subtitle={t('projects.subtitle')}
        action={<Link href="/admin"><Button variant="outline" size="sm"><ArrowLeft size={14} /> {t('back')}</Button></Link>}
      />

      {/* Experience Intelligence */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Brain size={15} className="text-primary" /> {t('projects.ei')}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              [t('projects.statProjects'), stats.total],
              [t('projects.statCompleted'), stats.completed],
              [t('projects.statSuccess'), stats.successRate != null ? `${stats.successRate}%` : '—'],
              [t('projects.statAvgDuration'), stats.avgDays != null ? `${stats.avgDays} d` : '—'],
              [t('projects.statAvgCost'), stats.avgCostEur != null ? `€${stats.avgCostEur.toLocaleString()}` : '—'],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-lg border border-border p-3">
                <div className="text-xl font-bold tabular-nums">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
          {stats.commonProblems.length > 0 && (
            <div className="mt-3 text-sm">
              <span className="text-muted-foreground">{t('projects.commonProblems')} </span>
              {stats.commonProblems.map((p) => `${p.problem} (${p.count})`).join(' · ')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create project */}
      <Card>
        <CardHeader><CardTitle className="text-base">{t('projects.newProject')}</CardTitle></CardHeader>
        <CardContent>
          <form action={createProjectAction} className="grid gap-2 sm:grid-cols-4">
            <Input name="title" required placeholder={t('projects.phTitle')} className="sm:col-span-2" />
            <Input name="playbookSlug" placeholder={t('projects.phSlug')} className="sm:col-span-2" />
            <Input name="sector" placeholder={t('projects.phSector')} />
            <Input name="region" placeholder={t('projects.phRegion')} />
            <div className="sm:col-span-4"><Button type="submit" size="sm">{t('projects.create')}</Button></div>
          </form>
        </CardContent>
      </Card>

      {/* Projects */}
      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('projects.empty')}</p>
      ) : projects.map((proj) => (
        <Card key={proj.id}>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">
              {proj.title}{' '}
              <span className="text-xs font-normal text-muted-foreground">
                {[proj.playbookSlug, proj.sector, proj.region].filter(Boolean).join(' · ')}
              </span>
            </CardTitle>
            <Badge tone={proj.status === 'COMPLETED' ? 'accent' : proj.status === 'CANCELLED' ? 'warning' : 'primary'}>{proj.status}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Update status / outcome */}
            <form action={updateProjectAction} className="flex flex-wrap items-end gap-2 text-sm">
              <input type="hidden" name="id" value={proj.id} />
              <select name="status" defaultValue={proj.status} className={inputCls}>
                {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <Input name="actualDays" type="number" placeholder={t('projects.phActualDays')} defaultValue={proj.actualDays ?? ''} className="w-28" />
              <Input name="actualCostEur" type="number" placeholder={t('projects.phActualCost')} defaultValue={proj.actualCostEur ?? ''} className="w-28" />
              <Button type="submit" variant="outline" size="sm">{t('projects.save')}</Button>
            </form>

            {/* Steps */}
            {proj.steps.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="text-left text-muted-foreground"><th className="py-1 pr-3">{t('projects.colStep')}</th><th className="pr-3">{t('projects.colStatus')}</th><th className="pr-3">{t('projects.colDays')}</th><th className="pr-3">{t('projects.colApproval')}</th><th className="pr-3">{t('projects.colProblem')}</th><th>{t('projects.colLessons')}</th></tr></thead>
                  <tbody>
                    {proj.steps.map((s) => (
                      <tr key={s.id} className="border-t border-border align-top">
                        <td className="py-1.5 pr-3 font-medium">{s.name}{s.authority ? <div className="text-[11px] text-muted-foreground">{s.authority}</div> : null}</td>
                        <td className="pr-3">{s.status}</td>
                        <td className="pr-3">{s.actualDays ?? '—'}</td>
                        <td className="pr-3">{s.approvalDays ?? '—'}</td>
                        <td className="pr-3">{s.problem ? `${s.problem}${s.solution ? ` → ${s.solution}` : ''}` : '—'}</td>
                        <td className="text-muted-foreground">{s.lessons ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add step */}
            <details>
              <summary className="cursor-pointer text-xs font-medium text-primary">{t('projects.addStep')}</summary>
              <form action={addStepAction} className="mt-2 grid gap-2 sm:grid-cols-4">
                <input type="hidden" name="projectId" value={proj.id} />
                <Input name="name" required placeholder={t('projects.phStepName')} className="sm:col-span-2" />
                <select name="status" defaultValue="DONE" className={inputCls}>
                  {STEP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <Input name="authority" placeholder={t('projects.phAuthority')} />
                <Input name="actualDays" type="number" placeholder={t('projects.phActualDays')} />
                <Input name="approvalDays" type="number" placeholder={t('projects.phApprovalDays')} />
                <Input name="partner" placeholder={t('projects.phPartner')} />
                <Input name="problem" placeholder={t('projects.phProblem')} />
                <Input name="solution" placeholder={t('projects.phSolution')} className="sm:col-span-2" />
                <Input name="lessons" placeholder={t('projects.phLessons')} className="sm:col-span-2" />
                <div className="sm:col-span-4"><Button type="submit" size="sm" variant="outline">{t('projects.addStepBtn')}</Button></div>
              </form>
            </details>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
