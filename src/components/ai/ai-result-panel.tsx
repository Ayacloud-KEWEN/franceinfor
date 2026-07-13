'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Markdown } from '@/components/reports/markdown';
import { buildWordDoc } from '@/lib/markdown-doc';
import { Loader2, X, Copy, Check, FileDown, Printer } from 'lucide-react';

// Reusable modal that generates an AI document from an endpoint and lets the
// user copy / export it as a Word (.doc) file / print it. Fetches when opened.
export function AiResultPanel({
  open,
  onClose,
  title,
  endpoint,
  payload,
  filename,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  endpoint: string;
  payload: unknown;
  filename: string;
}) {
  const t = useTranslations('ai');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [markdown, setMarkdown] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'error' | 'done'>('idle');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setState('loading');
    setMarkdown('');
    fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...(payload as object), locale }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((j) => { if (active) { setMarkdown(j.markdown || ''); setState('done'); } })
      .catch(() => active && setState('error'));
    return () => { active = false; };
  }, [open, endpoint, payload, locale]);

  if (!open) return null;

  function copy() {
    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function exportDoc() {
    const blob = new Blob([buildWordDoc(markdown, title)], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="my-auto w-full max-w-2xl rounded-xl border border-border bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label={tc('close')}>
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          {state === 'loading' && (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> {t('generating')}
            </div>
          )}
          {state === 'error' && <p className="py-6 text-sm text-destructive">{tc('loadFailed')}</p>}
          {state === 'done' && markdown && <Markdown source={markdown} />}
        </div>

        {state === 'done' && markdown && (
          <div className="flex flex-wrap gap-2 border-t border-border px-5 py-3">
            <Button size="sm" variant="outline" onClick={copy}>
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? tc('copied') : tc('copy')}
            </Button>
            <Button size="sm" variant="outline" onClick={exportDoc}>
              <FileDown size={14} /> {t('exportDoc')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => window.print()}>
              <Printer size={14} /> {t('print')}
            </Button>
            <p className="w-full pt-1 text-[11px] text-muted-foreground">{t('disclaimer')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
