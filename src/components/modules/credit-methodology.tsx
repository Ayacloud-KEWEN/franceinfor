import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

// 评分说明：每个维度的含义、评分区间、数据来源（真实/估算）。
const DIMENSIONS: { key: string; real: boolean }[] = [
  { key: 'dimFinancialHealth', real: true },
  { key: 'dimPaymentRisk', real: false },
  { key: 'dimSupplierReliability', real: false },
  { key: 'dimLegalRisk', real: true },
  { key: 'dimGrowth', real: false },
];

export async function CreditMethodology() {
  const t = await getTranslations('modules');

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <Info size={16} /> {t('creditMethodTitle')}
        </CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">{t('creditMethodIntro')}</p>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Score bands */}
        <div>
          <div className="mb-2 text-xs font-medium text-muted-foreground">{t('creditScaleTitle')}</div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-1 text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {t('scaleGood')}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {t('scaleMid')}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-amber-600 dark:text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {t('scaleLow')}
            </span>
          </div>
        </div>

        {/* Dimensions */}
        <ul className="space-y-3">
          {DIMENSIONS.map(({ key, real }) => (
            <li key={key} className="flex flex-col gap-1.5 border-b border-border pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
              <span className="text-sm">{t(key)}</span>
              <Badge tone={real ? 'accent' : 'muted'} className="w-fit shrink-0">
                {real ? `● ${t('creditReal')}` : t('creditEst')}
              </Badge>
            </li>
          ))}
        </ul>

        <p className="text-[11px] leading-relaxed text-muted-foreground">{t('creditDisclaimer')}</p>
      </CardContent>
    </Card>
  );
}
