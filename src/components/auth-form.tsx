'use client';

import { useActionState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/routing';
import { loginAction, registerAction } from '@/app/actions/auth';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const t = useTranslations('auth');
  const locale = useLocale();
  const resetDone = useSearchParams().get('reset') === 'done';
  const action = mode === 'login' ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      {mode === 'login' && resetDone && (
        <p className="rounded-md bg-accent/15 px-3 py-2 text-sm text-accent">{t('resetDone')}</p>
      )}
      {mode === 'register' && (
        <div>
          <label className="mb-1 block text-sm font-medium">{t('name')}</label>
          <Input name="name" autoComplete="name" />
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium">{t('email')}</label>
        <Input name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{t('password')}</label>
        <Input name="password" type="password" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
        {mode === 'login' && (
          <div className="mt-1.5 text-right">
            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              {t('forgotPassword')}
            </Link>
          </div>
        )}
      </div>

      {state?.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {mode === 'login' ? t('login') : t('register')}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {mode === 'login' ? t('noAccount') : t('haveAccount')}{' '}
        <Link
          href={mode === 'login' ? '/register' : '/login'}
          className="font-medium text-primary hover:underline"
        >
          {mode === 'login' ? t('register') : t('login')}
        </Link>
      </p>
    </form>
  );
}
