'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Markdown } from '@/components/reports/markdown';
import { COPILOT_AGENTS } from '@/lib/data/modules';
import { cn } from '@/lib/utils';
import { Loader2, Check, Workflow, Download } from 'lucide-react';

export function CopilotOrchestrator() {
  const t = useTranslations('modules');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [topic, setTopic] = useState('');
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState<number>(0);
  const [markdown, setMarkdown] = useState('');

  async function orchestrate() {
    setRunning(true);
    setMarkdown('');
    setDone(0);

    // Animate the agent team activating sequentially.
    const timers: ReturnType<typeof setTimeout>[] = [];
    COPILOT_AGENTS.forEach((_, i) => {
      timers.push(setTimeout(() => setDone(i + 1), (i + 1) * 350));
    });

    try {
      const res = await fetch('/api/copilot/orchestrate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ topic, locale }),
      });
      const json = await res.json();
      // Ensure the animation has visibly run.
      await new Promise((r) => setTimeout(r, COPILOT_AGENTS.length * 350));
      setMarkdown(res.ok ? json.markdown : `# ${tc('genericError')}`);
    } finally {
      setDone(COPILOT_AGENTS.length);
      setRunning(false);
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <Workflow size={16} /> {t('agents')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {COPILOT_AGENTS.map((a, i) => {
            const active = i < done;
            return (
              <div
                key={a}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors',
                  active ? 'border-accent/40 bg-accent/10 text-accent' : 'border-border text-muted-foreground'
                )}
              >
                {running && i === done ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : active ? (
                  <Check size={13} />
                ) : (
                  <span className="h-3 w-3 rounded-full border border-current" />
                )}
                {a}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Product / industry / goal..."
            className="max-w-sm"
          />
          <Button variant="accent" onClick={orchestrate} disabled={running}>
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Workflow size={16} />}
            {t('orchestrate')}
          </Button>
          {markdown && (
            <Button variant="outline" onClick={() => window.print()}>
              <Download size={15} /> PDF
            </Button>
          )}
        </div>

        {markdown && (
          <div className="rounded-lg border border-border p-4">
            <Markdown source={markdown} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
