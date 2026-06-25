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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map(({ key, value, delta, real }) => (
        <Card key={key} className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-muted-foreground">{t(key)}</div>
            {real && <span className="h-1.5 w-1.5 rounded-full bg-accent" title="live data" />}
          </div>
          <div className="mt-1.5 text-2xl font-bold tracking-tight">{value}</div>
          <div className="mt-1 flex items-center gap-1 text-xs text-accent">
            <TrendingUp size={13} /> +{delta}%
          </div>
        </Card>
      ))}
    </div>
  );
}
