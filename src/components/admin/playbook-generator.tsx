'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateDraftAction } from '@/app/actions/playbooks-admin';
import { Sparkles, Loader2 } from 'lucide-react';

export function PlaybookGenerator() {
  const router = useRouter();
  const t = useTranslations('admin.generator');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function action(formData: FormData) {
    setLoading(true);
    setError('');
    try {
      const res = await generateDraftAction(formData);
      if (res.ok && res.id) {
        router.push(`./playbooks/${res.id}`);
      } else {
        setError(res.error || 'failed');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles size={15} className="text-primary" /> {t('heading')}
        </div>
        <p className="text-xs text-muted-foreground">
          {t('desc')}
        </p>
        <form action={action} className="flex flex-wrap gap-2">
          <Input
            name="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('placeholder')}
            className="max-w-md"
          />
          <Button type="submit" disabled={loading || !topic.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles size={15} />}
            {t('generate')}
          </Button>
        </form>
        {error && <p className="text-xs text-destructive">{t('error')}: {error}</p>}
      </CardContent>
    </Card>
  );
}
