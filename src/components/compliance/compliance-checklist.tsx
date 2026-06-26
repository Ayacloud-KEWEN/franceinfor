'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LeadForm } from '@/components/services/lead-form';
import { getCompliance, COMPLIANCE_SECTORS, type Loc } from '@/lib/data/compliance';
import { Scale, Receipt, Users, ShieldCheck, Lock, Check, Sparkles, Download, ExternalLink } from 'lucide-react';
import type { ChecklistSection } from '@/lib/data/compliance';

const SECTION_ICON: Record<ChecklistSection['id'], typeof Scale> = {
  legalForm: Scale,
  tax: Receipt,
  employment: Users,
  sector: ShieldCheck,
  gdpr: Lock,
};

export function ComplianceChecklist() {
  const t = useTranslations('compliance');
  const locale = useLocale() as Loc;
  const [sector, setSector] = useState('generic');
  const data = getCompliance(sector, locale);
  const today = new Date().toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale === 'fr' ? 'fr-FR' : 'en-GB');

  return (
    <div className="space-y-5">
      {/* Controls — hidden when printing */}
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <label className="text-sm font-medium">{t('selectSector')}</label>
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {COMPLIANCE_SECTORS.map((s) => (
            <option key={s} value={s}>{t(`sector.${s}`)}</option>
          ))}
        </select>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="ml-auto">
          <Download size={15} /> {t('exportPdf')}
        </Button>
      </div>

      {/* Print-only header (FranceGo · sector · date) */}
      <div className="hidden print:block">
        <div className="mb-1 text-lg font-bold">FranceGo — {t('title')}</div>
        <div className="text-sm text-muted-foreground">{t(`sector.${sector}`)} · {today}</div>
        <hr className="my-3" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 print:grid-cols-2">
        {data.sections.map((section) => {
          const Icon = SECTION_ICON[section.id];
          return (
            <Card key={section.id} className="print:break-inside-avoid print:border print:shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-foreground">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary print:hidden">
                    <Icon size={15} />
                  </span>
                  {t(`section.${section.id}`)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <Check size={15} className="mt-0.5 shrink-0 text-accent print:hidden" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Official resource links */}
      <Card className="print:break-inside-avoid">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <ExternalLink size={15} className="text-primary" /> {t('resources')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.links.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs text-foreground hover:border-primary hover:text-primary"
              >
                {l.label} <ExternalLink size={11} className="text-muted-foreground" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-[11px] text-muted-foreground">{t('disclaimer')}</p>

      {/* Consulting + landing combo: hand off to the registration service */}
      <Card className="border-accent/30 print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Sparkles size={15} className="text-accent" />
            {t('ctaTitle')}
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{t('ctaIntro')}</p>
        </CardHeader>
        <CardContent>
          <LeadForm kind="COMPANY" />
        </CardContent>
      </Card>
    </div>
  );
}
