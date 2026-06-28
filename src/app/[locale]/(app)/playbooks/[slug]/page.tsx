import { notFound } from 'next/navigation';
import { dbGetPlaybook, getPlaybookVersions } from '@/lib/playbooks-db';
import { experienceStats } from '@/lib/projects';
import { getAdminUser } from '@/lib/admin';
import { PlaybookView } from '@/components/playbooks/playbook-view';
import type { Loc } from '@/lib/data/playbooks';

export const dynamic = 'force-dynamic';

export default async function PlaybookDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  // Admins can preview unpublished drafts; the public only sees PUBLISHED.
  const admin = await getAdminUser();
  const playbook = await dbGetPlaybook(slug, locale as Loc, { includeDraft: Boolean(admin) });
  if (!playbook) notFound();
  const [versions, stats] = await Promise.all([getPlaybookVersions(slug), experienceStats(slug)]);
  return <PlaybookView playbook={playbook} versions={versions} stats={stats} />;
}
