import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth';
import { searchesUsedToday } from '@/lib/usage';
import { PLAN_LIMITS } from '@/lib/plans';
import { providerStatus } from '@/lib/ai';
import { stripeConfigured } from '@/lib/stripe';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BillingPanel } from '@/components/settings/billing-panel';
import { DigestPanel } from '@/components/settings/digest-panel';

export default async function SettingsPage() {
  const [t, user] = await Promise.all([
    getTranslations('settings'),
    getCurrentUser(),
  ]);
  if (!user) return null;

  const used = await searchesUsedToday(user.id);
  const limit = PLAN_LIMITS[user.plan].searchesPerDay;
  const limitLabel = limit === Number.MAX_SAFE_INTEGER ? '∞' : limit;

  const ai = providerStatus();

  return (
    <div className="max-w-3xl">
      <PageHeader title={t('title')} />
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-foreground">{t('account')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('plan')}</span>
              <Badge tone="primary">{PLAN_LIMITS[user.plan].label}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('usageToday')}</span>
              <span className="font-medium">
                {used} / {limitLabel}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-foreground">{t('ai')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('aiProvider')}</span>
              <Badge tone={ai.mock || !ai.configured ? 'warning' : 'accent'}>
                {ai.label}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('aiModel')}</span>
              <span className="font-medium">{ai.model}</span>
            </div>
            <p className="pt-1 text-xs text-muted-foreground">
              {ai.mock || !ai.configured ? t('aiMockNote') : t('aiOkNote')}
            </p>
          </CardContent>
        </Card>

        <DigestPanel enabled={user.digestEnabled} keywords={user.digestKeywords} />

        <Suspense fallback={null}>
          <BillingPanel
            currentPlan={user.plan}
            configured={stripeConfigured()}
            hasSubscription={Boolean(user.stripeCustomerId)}
          />
        </Suspense>
      </div>
    </div>
  );
}
