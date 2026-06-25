'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScorePill } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { forecastSeries, type Industry } from '@/lib/data/industries';

function Bar({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="font-medium text-foreground">{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn('h-full rounded-full', tone)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function MarketsExplorer({ industries }: { industries: Industry[] }) {
  const t = useTranslations('markets');
  const [selected, setSelected] = useState<Industry>(industries[0]);
  const data = forecastSeries(selected);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        <h2 className="text-sm font-semibold text-muted-foreground">{t('industries')}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {industries.map((ind) => (
            <button
              key={ind.slug}
              onClick={() => setSelected(ind)}
              className={cn(
                'rounded-xl border p-4 text-left transition-colors',
                selected.slug === ind.slug
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/40'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{ind.name}</span>
                <ScorePill score={ind.opportunityScore} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {t('marketSize')}: €{ind.marketSizeBn}{t('billion')} · {t('growth')}: {ind.cagr}%
              </div>
              <div className="mt-3 space-y-2">
                <Bar label={t('opportunity')} value={ind.opportunityScore} tone="bg-accent" />
                <Bar label={t('difficulty')} value={ind.difficultyScore} tone="bg-amber-500" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base text-foreground">{selected.name}</CardTitle>
            <Link href={`/markets/${selected.slug}`}>
              <Button variant="ghost" size="sm">{t('viewDetails')} <ArrowRight size={14} /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">{t('marketSize')}</div>
                <div className="font-bold">€{selected.marketSizeBn}{t('billion')}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{t('growth')}</div>
                <div className="font-bold text-accent">{selected.cagr}%</div>
              </div>
            </div>
            <div className="mb-1 text-[11px] text-muted-foreground">
              {selected.real ? (
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {t('liveSource')} · NACE {selected.naceCode}
                </span>
              ) : (
                <span>{t('estimated')}</span>
              )}
            </div>
            <div className="mb-2 text-xs font-medium text-muted-foreground">{t('forecast')}</div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={data} margin={{ left: -20, right: 8, top: 4 }}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v) => [`€${v}B`, t('marketSize')]}
                />
                <Area type="monotone" dataKey="size" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
