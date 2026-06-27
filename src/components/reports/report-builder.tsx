'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Markdown } from './markdown';
import { REPORT_TEMPLATES } from '@/lib/data/reports';
import { cn } from '@/lib/utils';
import { Loader2, Download, FileText } from 'lucide-react';

export function ReportBuilder() {
  const t = useTranslations('reports');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [template, setTemplate] = useState(REPORT_TEMPLATES[2].slug);
  const [topic, setTopic] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setMarkdown('');
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ template, topic, locale }),
      });
      const json = await res.json();
      setMarkdown(
        res.ok
          ? json.markdown
          : json.error === 'quota_exceeded'
            ? `# ${tc('quotaReached')}`
            : `# ${tc('genericError')}`
      );
    } finally {
      setLoading(false);
    }
  }

  function download() {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template}-report.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Template picker */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">{t('templates')}</h2>
        <div className="space-y-2">
          {REPORT_TEMPLATES.map((tpl) => (
            <button
              key={tpl.slug}
              onClick={() => setTemplate(tpl.slug)}
              className={cn(
                'w-full rounded-lg border p-3 text-left transition-colors',
                template === tpl.slug ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'
              )}
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText size={14} /> {tpl.name}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">{tpl.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Builder + preview */}
      <div className="lg:col-span-2">
        <div className="mb-4 flex flex-wrap gap-2">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('topic')}
            className="max-w-sm"
          />
          <Button onClick={generate} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t('generate')}
          </Button>
          {markdown && (
            <>
              <Button variant="outline" onClick={() => window.print()}>
                <Download size={15} /> {t('download')}
              </Button>
              <Button variant="ghost" onClick={download}>.md</Button>
            </>
          )}
        </div>

        <Card>
          <CardContent className="min-h-[300px] py-5">
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> {t('generating')}
              </div>
            )}
            {!loading && !markdown && (
              <p className="text-sm text-muted-foreground">{t('selectTemplate')}</p>
            )}
            {!loading && markdown && <Markdown source={markdown} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
