'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { STAGE_ORDER } from '@/lib/saved-stages';
import { Building2, Gavel, Target, User, Trash2, ExternalLink } from 'lucide-react';
import type { ItemType, Stage } from '@prisma/client';

export type WatchItem = {
  id: string;
  type: ItemType;
  refId: string;
  label: string;
  note: string | null;
  stage: Stage;
  tags: string[];
  data: unknown;
};

const TYPE_ICON: Record<ItemType, typeof Building2> = {
  COMPANY: Building2,
  TENDER: Gavel,
  OPPORTUNITY: Target,
  CONTACT: User,
};

// Internal href for an item, when we can deep-link to it.
function hrefFor(item: WatchItem): string | null {
  if (item.type === 'COMPANY') return `/companies/${item.refId}`;
  return null;
}

export function WatchlistBoard({ initial }: { initial: WatchItem[] }) {
  const t = useTranslations('watchlist');
  const [items, setItems] = useState(initial);

  const byStage = useMemo(() => {
    const map: Record<Stage, WatchItem[]> = { LEAD: [], CONTACTED: [], NEGOTIATING: [], WON: [], LOST: [] };
    for (const it of items) map[it.stage].push(it);
    return map;
  }, [items]);

  async function patch(id: string, body: Record<string, unknown>) {
    await fetch('/api/saved', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, ...body }),
    });
  }

  function setStage(id: string, stage: Stage) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, stage } : i)));
    patch(id, { stage });
  }

  function setNote(id: string, note: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, note } : i)));
  }

  async function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/saved?id=${id}`, { method: 'DELETE' });
  }

  if (items.length === 0) {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {STAGE_ORDER.map((stage) => (
        <div key={stage} className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t(`stage.${stage}`)}
            </span>
            <Badge tone="muted">{byStage[stage].length}</Badge>
          </div>

          <div className="space-y-3">
            {byStage[stage].map((item) => {
              const Icon = TYPE_ICON[item.type];
              const href = hrefFor(item);
              return (
                <Card key={item.id} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-2">
                      <Icon size={15} className="mt-0.5 shrink-0 text-primary" />
                      <div className="min-w-0">
                        {href ? (
                          <Link href={href} className="line-clamp-2 text-sm font-medium hover:text-primary hover:underline">
                            {item.label}
                          </Link>
                        ) : (
                          <span className="line-clamp-2 text-sm font-medium">{item.label}</span>
                        )}
                        <div className="mt-0.5 text-[11px] text-muted-foreground">{t(`type.${item.type}`)}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => remove(item.id)}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      aria-label={t('remove')}
                      title={t('remove')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <textarea
                    defaultValue={item.note ?? ''}
                    placeholder={t('notePlaceholder')}
                    onBlur={(e) => {
                      if (e.target.value !== (item.note ?? '')) {
                        setNote(item.id, e.target.value);
                        patch(item.id, { note: e.target.value });
                      }
                    }}
                    rows={2}
                    className="mt-2 w-full resize-none rounded-md border border-input bg-background px-2 py-1.5 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <select
                      value={item.stage}
                      onChange={(e) => setStage(item.id, e.target.value as Stage)}
                      className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                    >
                      {STAGE_ORDER.map((s) => (
                        <option key={s} value={s}>
                          {t(`stage.${s}`)}
                        </option>
                      ))}
                    </select>
                    {href && (
                      <Link href={href} className="text-muted-foreground hover:text-primary" aria-label={t('open')}>
                        <ExternalLink size={13} />
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
