'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PLAN_LIMITS } from '@/lib/plans';
import { cn } from '@/lib/utils';
import { Loader2, CreditCard, Check } from 'lucide-react';
import type { Plan } from '@prisma/client';

const ORDER: Plan[] = ['FREE', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE'];
const PURCHASABLE: Plan[] = ['PROFESSIONAL', 'BUSINESS'];

export function BillingPanel({
  currentPlan,
  configured,
  hasSubscription,
}: {
  currentPlan: Plan;
  configured: boolean;
  hasSubscription: boolean;
}) {
  const t = useTranslations('settings');
  const params = useSearchParams();
  const billing = params.get('billing');
  const [loading, setLoading] = useState<string | null>(null);

  async function go(path: string, body?: object) {
    setLoading(path + (body ? JSON.stringify(body) : ''));
    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
      else setLoading(null);
    } catch {
      setLoading(null);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base text-foreground">{t('plan')}</CardTitle>
        {hasSubscription && configured && (
          <Button variant="outline" size="sm" onClick={() => go('/api/stripe/portal')}>
            <CreditCard size={14} /> {t('manageBilling')}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {billing === 'success' && (
          <p className="mb-3 rounded-md bg-accent/15 px-3 py-2 text-sm text-accent">{t('billingSuccess')}</p>
        )}
        {billing === 'cancel' && (
          <p className="mb-3 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">{t('billingCanceled')}</p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {ORDER.map((p) => {
            const info = PLAN_LIMITS[p];
            const isCurrent = p === currentPlan;
            // Only offer a purchasable plan that is strictly higher than the
            // current one — never "upgrade" to a lower tier (e.g. an Enterprise
            // user shouldn't see Professional/Business buttons).
            const canBuy =
              PURCHASABLE.includes(p) && ORDER.indexOf(p) > ORDER.indexOf(currentPlan);
            return (
              <div
                key={p}
                className={cn(
                  'flex flex-col rounded-lg border p-4',
                  isCurrent ? 'border-primary bg-primary/5' : 'border-border'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{info.label}</span>
                  {isCurrent && (
                    <Badge tone="primary" className="inline-flex items-center gap-1">
                      <Check size={12} /> {t('currentPlan')}
                    </Badge>
                  )}
                </div>
                <div className="mt-1 text-2xl font-bold">
                  {info.price === 'Custom' ? 'Custom' : `€${info.price}`}
                  {info.price !== 'Custom' && info.price !== '0' && (
                    <span className="text-sm font-normal text-muted-foreground">{t('perMonth')}</span>
                  )}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {info.searchesPerDay === Number.MAX_SAFE_INTEGER
                    ? '∞ searches / day'
                    : `${info.searchesPerDay} searches / day`}
                </div>

                <div className="mt-3">
                  {canBuy && configured && (
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={loading !== null}
                      onClick={() => go('/api/stripe/checkout', { plan: p })}
                    >
                      {loading === `/api/stripe/checkout${JSON.stringify({ plan: p })}` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      {t('upgrade')}
                    </Button>
                  )}
                  {canBuy && !configured && (
                    <p className="text-xs text-muted-foreground">{t('billingUnconfigured')}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
