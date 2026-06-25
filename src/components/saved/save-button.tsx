'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { useSavedKeys } from './use-saved-keys';
import type { ItemType } from '@prisma/client';

// Toggle a watchlist bookmark for any entity. Reflects current saved state
// via the shared useSavedKeys cache, so every button on the page stays in sync.
export function SaveButton({
  type,
  refId,
  label,
  data,
  size = 'sm',
}: {
  type: ItemType;
  refId: string;
  label: string;
  data?: unknown;
  size?: 'sm' | 'icon';
}) {
  const t = useTranslations('watchlist');
  const { isSaved, invalidate } = useSavedKeys();
  const [busy, setBusy] = useState(false);
  const saved = isSaved(type, refId);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      if (saved) {
        await fetch(`/api/saved?type=${type}&refId=${encodeURIComponent(refId)}`, { method: 'DELETE' });
      } else {
        await fetch('/api/saved', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ type, refId, label, data }),
        });
      }
      await invalidate();
    } finally {
      setBusy(false);
    }
  }

  const Icon = busy ? Loader2 : saved ? BookmarkCheck : Bookmark;

  if (size === 'icon') {
    return (
      <Button
        variant={saved ? 'accent' : 'outline'}
        size="icon"
        onClick={toggle}
        aria-label={saved ? t('saved') : t('save')}
        title={saved ? t('saved') : t('save')}
      >
        <Icon size={16} className={busy ? 'animate-spin' : ''} />
      </Button>
    );
  }

  return (
    <Button variant={saved ? 'accent' : 'outline'} size="sm" onClick={toggle}>
      <Icon size={15} className={busy ? 'animate-spin' : ''} />
      {saved ? t('saved') : t('save')}
    </Button>
  );
}
