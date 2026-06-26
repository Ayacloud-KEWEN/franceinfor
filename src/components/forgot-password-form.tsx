'use client';

import { useActionState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/routing';
import { requestPasswordResetAction } from '@/app/actions/auth';

export function ForgotPasswordForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, undefined);

  if (state?.sent) {
    return (
      <div className="space-y-4">
        <p className="rounded-md bg-accent/15 px-3 py-2 text-sm text-accent">{t('resetSent')}</p>
        <Link href="/login" className="block text-center text-sm font-medium text-primary hover:underline">
          {t('backToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <p className="text-sm text-muted-foreground">{t('forgotIntro')}</p>
      <div>
        <label className="mb-1 block text-sm font-medium">{t('email')}</label>
        <Input name="email" type="email" required autoComplete="email" />
      </div>
      {state?.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>{t('sendResetLink')}</Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">{t('backToLogin')}</Link>
      </p>
    </form>
  );
}
