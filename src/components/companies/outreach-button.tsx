'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { AiResultPanel } from '@/components/ai/ai-result-panel';
import { Mail } from 'lucide-react';

// "Draft compliant outreach" button for a company profile. Opens the shared AI
// panel which generates a GDPR-compliant French outreach email + how to send it.
export function OutreachButton({
  company,
}: {
  company: { name: string; siren: string; city?: string | null; industry?: string | null };
}) {
  const t = useTranslations('ai');
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Mail size={14} /> {t('outreach')}
      </Button>
      <AiResultPanel
        open={open}
        onClose={() => setOpen(false)}
        title={t('outreachTitle')}
        endpoint="/api/outreach"
        payload={{ company }}
        filename={`outreach-${company.siren}`}
      />
    </>
  );
}
