'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Check, ArrowRight } from 'lucide-react';

// Lead-capture form for the value-added service guides. Posts to /api/leads.
export function LeadForm({ kind }: { kind: 'COMPANY' | 'BRAND' }) {
  const t = useTranslations('services.lead');
  const locale = useLocale();
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState('sending');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind,
          name: fd.get('name'),
          email: fd.get('email'),
          company: fd.get('company'),
          message: fd.get('message'),
          locale,
        }),
      });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm text-accent">
        <Check size={16} /> {t('thanks')}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-2.5">
      <p className="text-sm font-medium text-foreground">{t('title')}</p>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <Input name="name" required placeholder={t('name')} autoComplete="name" />
        <Input name="email" type="email" required placeholder={t('email')} autoComplete="email" />
      </div>
      <Input name="company" placeholder={t('company')} autoComplete="organization" />
      <Input name="message" placeholder={t('message')} />
      <div className="flex items-center gap-3">
        <Button type="submit" variant="accent" size="sm" disabled={state === 'sending'}>
          {state === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {t('submit')} <ArrowRight size={14} />
        </Button>
        {state === 'error' && <span className="text-xs text-destructive">{t('error')}</span>}
      </div>
    </form>
  );
}
