'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LeadForm } from '@/components/services/lead-form';
import { getCompliance, COMPLIANCE_SECTORS } from '@/lib/data/compliance';
import { Scale, Receipt, Users, ShieldCheck, Lock, Check, Sparkles } from 'lucide-react';
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
  const [sector, setSector] = useState('generic');
  const data = getCompliance(sector);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
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
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {data.sections.map((section) => {
          const Icon = SECTION_ICON[section.id];
          return (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-foreground">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={15} />
                  </span>
                  {t(`section.${section.id}`)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <Check size={15} className="mt-0.5 shrink-0 text-accent" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground">{t('disclaimer')}</p>

      {/* Consulting + landing combo: hand off to the registration service */}
      <Card className="border-accent/30">
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
