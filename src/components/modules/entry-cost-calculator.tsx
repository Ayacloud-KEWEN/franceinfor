'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calculator, TrendingUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  estimateCost, DEFAULT_INPUT,
  type CostInput, type LegalForm, type OfficeType, type Region, type Loc,
} from '@/lib/data/cost-model';

const toLocLabel = (l: string): Loc => (l === 'fr' ? 'fr' : l === 'zh' ? 'zh' : 'en');

const euro = (n: number, locale: string) =>
  new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

function Chips<T extends string>({
  value, options, onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            'rounded-full border px-2.5 py-1 text-xs transition-colors',
            value === o.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function EntryCostCalculator({ initialRegion }: { initialRegion?: Region }) {
  const t = useTranslations('cost');
  const locale = useLocale();
  const loc = toLocLabel(locale);
  const [input, setInput] = useState<CostInput>({
    ...DEFAULT_INPUT,
    region: initialRegion ?? DEFAULT_INPUT.region,
  });
  const set = (patch: Partial<CostInput>) => setInput((p) => ({ ...p, ...patch }));
  const est = useMemo(() => estimateCost(input), [input]);

  const num = (v: string, fallback = 0) => {
    const n = Number(v.replace(/[^\d.]/g, ''));
    return Number.isFinite(n) ? n : fallback;
  };

  return (
    <Card className="mt-8 overflow-hidden border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Calculator size={16} />
          </span>
          {t('title')}
        </CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
      </CardHeader>

      <CardContent className="grid gap-6 lg:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <div className="mb-1.5 text-xs font-medium text-muted-foreground">{t('legalForm')}</div>
            <Chips<LegalForm>
              value={input.legalForm}
              onChange={(legalForm) => set({ legalForm })}
              options={[
                { id: 'sas', label: 'SAS' },
                { id: 'sarl', label: 'SARL' },
                { id: 'branch', label: t('branch') },
              ]}
            />
          </div>

          <div>
            <div className="mb-1.5 text-xs font-medium text-muted-foreground">{t('region')}</div>
            <Chips<Region>
              value={input.region}
              onChange={(region) => set({ region })}
              options={[
                { id: 'paris', label: t('paris') },
                { id: 'other', label: t('otherRegion') },
              ]}
            />
          </div>

          <div>
            <div className="mb-1.5 text-xs font-medium text-muted-foreground">{t('office')}</div>
            <Chips<OfficeType>
              value={input.office}
              onChange={(office) => set({ office })}
              options={[
                { id: 'domiciliation', label: t('domiciliation') },
                { id: 'coworking', label: t('coworking') },
                { id: 'lease', label: t('lease') },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">{t('employees')}</span>
              <Input inputMode="numeric" value={String(input.employees)} onChange={(e) => set({ employees: Math.max(0, Math.min(50, num(e.target.value))) })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">{t('grossSalary')}</span>
              <Input inputMode="numeric" value={String(input.grossSalary)} onChange={(e) => set({ grossSalary: num(e.target.value) })} />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={input.includeTrademark} onChange={(e) => set({ includeTrademark: e.target.checked })} />
            {t('includeTrademark')}
          </label>

          <div className="border-t border-border pt-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <TrendingUp size={13} /> {t('roiInputs')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted-foreground">{t('revenue')}</span>
                <Input inputMode="numeric" value={String(input.revenue)} onChange={(e) => set({ revenue: num(e.target.value) })} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted-foreground">{t('margin')}</span>
                <Input inputMode="numeric" value={String(input.marginPct)} onChange={(e) => set({ marginPct: Math.max(0, Math.min(100, num(e.target.value))) })} />
              </label>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="text-xs text-muted-foreground">{t('year1Total')}</div>
            <div className="text-3xl font-bold text-primary">{euro(est.year1Total, locale)}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {t('setupPlusAnnual', { setup: euro(est.setupTotal, locale), annual: euro(est.annualTotal, locale) })}
            </div>
          </div>

          <div>
            <div className="mb-1 text-xs font-semibold text-muted-foreground">{t('breakdown')}</div>
            <ul className="divide-y divide-border rounded-lg border border-border text-sm">
              {[...est.setup, ...est.annual].map((li) => (
                <li key={li.key} className="flex items-center justify-between gap-2 px-3 py-1.5">
                  <span className="min-w-0">
                    <span className="truncate">{li.label[loc]}</span>
                    {li.note && <span className="ml-1 text-[11px] text-muted-foreground">· {li.note[loc]}</span>}
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">{euro(li.amount, locale)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ROI */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-border p-2">
              <div className="text-[11px] text-muted-foreground">{t('year1Net')}</div>
              <div className={cn('text-sm font-bold', est.roi.year1Net >= 0 ? 'text-accent' : 'text-destructive')}>
                {euro(est.roi.year1Net, locale)}
              </div>
            </div>
            <div className="rounded-lg border border-border p-2">
              <div className="text-[11px] text-muted-foreground">{t('breakeven')}</div>
              <div className="text-sm font-bold">
                {est.roi.breakevenMonths == null ? '—' : t('months', { n: est.roi.breakevenMonths })}
              </div>
            </div>
            <div className="rounded-lg border border-border p-2">
              <div className="text-[11px] text-muted-foreground">{t('roi')}</div>
              <div className={cn('text-sm font-bold', est.roi.roiPct >= 0 ? 'text-accent' : 'text-destructive')}>
                {est.roi.roiPct}%
              </div>
            </div>
          </div>

          <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <Info size={12} className="mt-0.5 shrink-0" />
            {t('cashflowNote')}{' '}
            <Link href="/credit" className="text-primary hover:underline">{t('cashflowLink')}</Link>
          </p>
          <p className="text-[11px] text-muted-foreground">{t('disclaimer')}</p>
        </div>
      </CardContent>
    </Card>
  );
}
