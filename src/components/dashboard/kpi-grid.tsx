'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export interface KpiItem {
  key: string;
  value: string | number;
  delta: number;
  real?: boolean;
}

export function KpiGrid({ items }: { items: KpiItem[] }) {
  const t = useTranslations('kpi');
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
      {items.map(({ key, value, delta, real }) => (
        <Card key={key} className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-1">
            <div className="text-[11px] font-medium leading-tight text-muted-foreground sm:text-xs">{t(key)}</div>
            {real && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" title="live data" />}
          </div>
          <div className="mt-1.5 truncate text-xl font-bold tracking-tight tabular-nums sm:text-2xl">{value}</div>
          <div className="mt-1 flex items-center gap-1 text-xs text-accent">
            <TrendingUp size={13} /> +{delta}%
          </div>
        </Card>
      ))}
    </div>
  );
}
