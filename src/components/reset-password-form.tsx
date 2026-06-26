'use client';

import { useActionState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/routing';
import { resetPasswordAction } from '@/app/actions/auth';

export function ResetPasswordForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const token = useSearchParams().get('token') || '';
  const [state, formAction, pending] = useActionState(resetPasswordAction, undefined);

  if (!token) {
    return (
      <div className="space-y-4">
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{t('resetNoToken')}</p>
        <Link href="/forgot-password" className="block text-center text-sm font-medium text-primary hover:underline">
          {t('sendResetLink')}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="token" value={token} />
      <div>
        <label className="mb-1 block text-sm font-medium">{t('newPassword')}</label>
        <Input name="password" type="password" required autoComplete="new-password" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{t('confirmPassword')}</label>
        <Input name="confirm" type="password" required autoComplete="new-password" />
      </div>
      {state?.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>{t('resetPassword')}</Button>
    </form>
  );
}
