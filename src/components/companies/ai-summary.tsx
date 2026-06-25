'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Markdown } from '@/components/reports/markdown';
import { Loader2, Sparkles } from 'lucide-react';

export function CompanyAiSummary({ context }: { context: string }) {
  const t = useTranslations('companies');
  const tc = useTranslations('common');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Write a concise business-development briefing (5-7 bullet points) on this French company for a foreign company evaluating it as a customer/partner. Cover positioning, financial health, and 2 recommended next actions.\n\nCompany data:\n${context}`,
            },
          ],
        }),
      });
      const json = await res.json();
      setText(res.ok ? json.reply : tc('genericError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {!text && (
        <Button variant="accent" size="sm" onClick={generate} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles size={15} />}
          {t('generateSummary')}
        </Button>
      )}
      {text && (
        <div className="rounded-lg border border-border p-4">
          <Markdown source={text} />
        </div>
      )}
    </div>
  );
}
