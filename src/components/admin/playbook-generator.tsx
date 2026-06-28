'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateDraftAction } from '@/app/actions/playbooks-admin';
import { Sparkles, Loader2 } from 'lucide-react';

export function PlaybookGenerator() {
  const router = useRouter();
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
          <Sparkles size={15} className="text-primary" /> AI draft a new playbook
        </div>
        <p className="text-xs text-muted-foreground">
          Generates a grounded DRAFT (real authorities/links from the Knowledge Base) for you to review and publish. Never auto-published.
        </p>
        <form action={action} className="flex flex-wrap gap-2">
          <Input
            name="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Selling French wine to China / Opening a restaurant in Paris"
            className="max-w-md"
          />
          <Button type="submit" disabled={loading || !topic.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles size={15} />}
            Generate draft
          </Button>
        </form>
        {error && <p className="text-xs text-destructive">Error: {error}</p>}
      </CardContent>
    </Card>
  );
}
