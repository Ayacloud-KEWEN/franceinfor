import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/page-header';
import { WatchlistBoard, type WatchItem } from '@/components/saved/watchlist-board';

export const dynamic = 'force-dynamic';

export default async function WatchlistPage() {
  const [t, user] = await Promise.all([getTranslations('watchlist'), getCurrentUser()]);
  if (!user) return null;

  const rows = await prisma.savedItem.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
  });

  const items: WatchItem[] = rows.map((r) => ({
    id: r.id,
    type: r.type,
    refId: r.refId,
    label: r.label,
    note: r.note,
    stage: r.stage,
    tags: r.tags,
    data: r.data,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <WatchlistBoard initial={items} />
    </div>
  );
}
