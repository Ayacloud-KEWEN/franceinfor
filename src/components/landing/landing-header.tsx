'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { AuthLocaleSwitch } from '@/components/auth-locale-switch';

export function LandingHeader() {
  const t = useTranslations('landing');
  const tb = useTranslations('brand');

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt={tb('name')} className="h-8 w-8 rounded-lg object-contain" />
          <span className="text-base font-semibold tracking-tight">{tb('name')}</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <AuthLocaleSwitch />
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm">{t('signIn')}</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">{t('getStarted')}</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
