'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LeadForm } from '@/components/services/lead-form';
import { Link } from '@/i18n/routing';
import { Download, ExternalLink, ArrowLeft, Clock, Euro, AlertTriangle, FileText, Landmark, Sparkles, History } from 'lucide-react';
import type { Playbook } from '@/lib/data/playbooks';

type VersionMeta = { version: string; note: string | null; createdAt: string | Date };

export function PlaybookView({ playbook, versions = [] }: { playbook: Playbook; versions?: VersionMeta[] }) {
  const t = useTranslations('playbooks');
  const p = playbook;
  const fmtDate = (d: string | Date) => new Date(d).toISOString().slice(0, 10);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Link href="/playbooks" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft size={15} /> {t('back')}
        </Link>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Download size={15} /> {t('exportPdf')}
        </Button>
      </div>

      {/* Print header */}
      <div className="hidden print:block">
        <div className="text-lg font-bold">FranceGo — {p.title}</div>
        <div className="text-sm text-muted-foreground">v{p.version} · {p.updated}</div>
        <hr className="my-3" />
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{p.title}</h1>
        <p className="mt-2 text-muted-foreground">{p.summary}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Badge tone="muted" className="inline-flex items-center gap-1"><Clock size={12} /> {p.estTimeline}</Badge>
          <Badge tone="muted" className="inline-flex items-center gap-1"><Euro size={12} /> {p.estCost}</Badge>
          <Badge tone="primary">v{p.version} · {p.updated}</Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="print:break-inside-avoid">
          <CardHeader><CardTitle className="text-sm">{t('applicableTo')}</CardTitle></CardHeader>
          <CardContent><ul className="space-y-1 text-sm text-muted-foreground">{p.applicableTo.map((x, i) => <li key={i}>• {x}</li>)}</ul></CardContent>
        </Card>
        <Card className="print:break-inside-avoid">
          <CardHeader><CardTitle className="text-sm">{t('prerequisites')}</CardTitle></CardHeader>
          <CardContent><ul className="space-y-1 text-sm text-muted-foreground">{p.prerequisites.map((x, i) => <li key={i}>• {x}</li>)}</ul></CardContent>
        </Card>
      </div>

      {/* Tasks */}
      <div>
        <h2 className="mb-3 text-base font-semibold">{t('tasks')}</h2>
        <div className="space-y-3">
          {p.tasks.map((task, i) => (
            <Card key={task.id} className="print:break-inside-avoid">
              <CardHeader>
                <CardTitle className="flex items-start gap-2 text-base text-foreground">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span>
                  {task.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">{task.description}</p>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
                  {task.authority && <span className="inline-flex items-center gap-1"><Landmark size={12} className="text-primary" /> {t('authority')}: <b>{task.authority}</b></span>}
                  {task.permit && <span className="inline-flex items-center gap-1"><FileText size={12} className="text-primary" /> {t('permit')}: <b>{task.permit}</b></span>}
                  {task.timeline && <span className="inline-flex items-center gap-1"><Clock size={12} /> {task.timeline}</span>}
                  {task.cost && <span className="inline-flex items-center gap-1"><Euro size={12} /> {task.cost}</span>}
                </div>
                {task.documents?.length ? (
                  <div className="text-xs"><span className="text-muted-foreground">{t('documents')}: </span>{task.documents.join(' · ')}</div>
                ) : null}
                {task.risks?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {task.risks.map((r, j) => (
                      <span key={j} className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-700 dark:text-amber-400">
                        <AlertTriangle size={11} /> {r}
                      </span>
                    ))}
                  </div>
                ) : null}
                {task.references?.length ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {task.references.map((r) => (
                      <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                        {r.label} <ExternalLink size={11} />
                      </a>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Key risks */}
      <Card className="print:break-inside-avoid">
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle size={15} className="text-amber-500" /> {t('keyRisks')}</CardTitle></CardHeader>
        <CardContent><ul className="space-y-1.5 text-sm text-muted-foreground">{p.risks.map((r, i) => <li key={i}>• {r}</li>)}</ul></CardContent>
      </Card>

      {versions.length > 0 && (
        <Card className="print:hidden">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><History size={15} className="text-muted-foreground" /> {t('versionHistory')}</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm">
              {versions.map((v, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Badge tone={i === 0 ? 'primary' : 'muted'}>v{v.version}</Badge>
                  <span className="text-xs text-muted-foreground">{fmtDate(v.createdAt)}{v.note ? ` · ${v.note}` : ''}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <p className="text-[11px] text-muted-foreground">{t('disclaimer')}</p>

      {/* Consulting + execution CTA */}
      <Card className="border-accent/30 print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-foreground"><Sparkles size={15} className="text-accent" /> {t('ctaTitle')}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{t('ctaIntro')}</p>
        </CardHeader>
        <CardContent><LeadForm kind="COMPANY" /></CardContent>
      </Card>
    </div>
  );
}
