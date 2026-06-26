'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateDigestAction } from '@/app/actions/digest';
import { Check, Mail } from 'lucide-react';

export function DigestPanel({
  enabled,
  keywords,
}: {
  enabled: boolean;
  keywords: string[];
}) {
  const t = useTranslations('settings');
  const [state, formAction, pending] = useActionState(updateDigestAction, undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <Mail size={15} /> {t('digestTitle')}
        </CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">{t('digestIntro')}</p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="enabled"
              defaultChecked={enabled}
              className="h-4 w-4 rounded border-input"
            />
            {t('digestEnable')}
          </label>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('digestKeywords')}</label>
            <Input
              name="keywords"
              defaultValue={keywords.join(', ')}
              placeholder={t('digestKeywordsPlaceholder')}
            />
            <p className="mt-1 text-xs text-muted-foreground">{t('digestKeywordsHint')}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={pending}>{t('save')}</Button>
            {state?.saved && (
              <span className="inline-flex items-center gap-1 text-sm text-accent">
                <Check size={14} /> {t('saved')}
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
