'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Send, Sparkles } from 'lucide-react';

// Prominent natural-language ask box on the Dashboard hero. Sends the question
// to the Copilot (which auto-answers via /copilot?q=...).
export function DashboardAsk() {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const [q, setQ] = useState('');

  function submit(text: string) {
    const value = text.trim();
    if (!value) return;
    router.push(`/copilot?q=${encodeURIComponent(value)}`);
  }

  const chips = (t.raw('askChips') as string[]) ?? [];

  return (
    <div className="mt-5">
      <form
        onSubmit={(e) => { e.preventDefault(); submit(q); }}
        className="flex items-center gap-2 rounded-xl border border-border bg-background/80 p-1.5 shadow-sm backdrop-blur focus-within:border-primary"
      >
        <Sparkles size={18} className="ml-2 shrink-0 text-primary" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('askPlaceholder')}
          className="flex-1 bg-transparent px-1 py-2 text-sm outline-none"
        />
        <Button type="submit" variant="accent" size="sm" className="shrink-0">
          <Send size={15} /> {t('askButton')}
        </Button>
      </form>
      {chips.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => submit(c)}
              className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground"
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
