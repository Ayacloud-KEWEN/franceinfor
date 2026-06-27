'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { submitPlaybookRequestAction } from '@/app/actions/playbook-requests';
import { Lightbulb, Check, Loader2 } from 'lucide-react';

export function PlaybookRequest() {
  const t = useTranslations('playbooks');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function action(formData: FormData) {
    setPending(true);
    try {
      const res = await submitPlaybookRequestAction(formData);
      if (res.ok) setDone(true);
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <Card className="border-primary/40 bg-primary/5 p-4 text-sm">
        <div className="flex items-center gap-2 font-medium text-primary">
          <Check size={16} /> {t('requestThanks')}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 text-sm font-medium hover:text-primary"
        >
          <Lightbulb size={16} className="text-primary" /> {t('requestTitle')}
        </button>
      ) : (
        <form action={action} className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Lightbulb size={16} className="text-primary" /> {t('requestTitle')}
          </div>
          <p className="text-sm text-muted-foreground">{t('requestIntro')}</p>
          <input type="hidden" name="locale" value={locale} />
          <div className="space-y-2">
            <Input name="title" required placeholder={t('requestPlaceholder')} aria-label={t('requestField')} />
            <Input name="sector" placeholder={t('requestSector')} />
            <textarea
              name="detail"
              rows={3}
              placeholder={t('requestDetail')}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t('requestSubmit')}
          </Button>
        </form>
      )}
    </Card>
  );
}
