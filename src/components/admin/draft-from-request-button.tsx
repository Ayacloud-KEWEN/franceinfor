'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { draftFromRequestAction } from '@/app/actions/playbooks-admin';
import { Sparkles, Loader2 } from 'lucide-react';

// One-click: AI-draft a playbook from this customer request, then open the draft.
export function DraftFromRequestButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function run() {
    setLoading(true);
    setError('');
    try {
      const res = await draftFromRequestAction(requestId);
      if (res.ok && res.id) {
        router.push(`/admin/playbooks/${res.id}`);
      } else {
        setError(res.error || 'failed');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" onClick={run} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles size={13} />} AI draft
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
