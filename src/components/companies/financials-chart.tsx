'use client';

import { useTranslations } from 'next-intl';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export function FinancialsChart({
  data,
}: {
  data: { year: string; revenue: number | null; netResult: number | null }[];
}) {
  const t = useTranslations('companies');
  const chart = data.map((d) => ({
    year: d.year,
    revenue: d.revenue != null ? Number((d.revenue / 1e6).toFixed(1)) : null,
    net: d.netResult != null ? Number((d.netResult / 1e6).toFixed(1)) : null,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chart} margin={{ left: -10, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="year" fontSize={12} stroke="hsl(var(--muted-foreground))" />
        <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" unit="M" />
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(v: number) => [`€${v}M`, '']}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar name={t('revenue')} dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        <Bar name={t('netResult')} dataKey="net" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
