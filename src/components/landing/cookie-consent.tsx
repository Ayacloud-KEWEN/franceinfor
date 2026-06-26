'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export const CONSENT_KEY = 'fg_consent';

// GDPR cookie banner. Stores the choice in localStorage and broadcasts it so
// the Analytics component only loads after explicit consent.
export function CookieConsent() {
  const t = useTranslations('landing.cookie');
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(CONSENT_KEY)) setShow(true);
    } catch {
      /* localStorage unavailable */
    }
  }, []);

  function choose(value: 'granted' | 'denied') {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent('fg-consent', { detail: value }));
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{t('message')}</p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => choose('denied')}>{t('decline')}</Button>
          <Button size="sm" onClick={() => choose('granted')}>{t('accept')}</Button>
        </div>
      </div>
    </div>
  );
}
