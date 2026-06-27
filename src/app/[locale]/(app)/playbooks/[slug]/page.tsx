import { notFound } from 'next/navigation';
import { dbGetPlaybook, getPlaybookVersions } from '@/lib/playbooks-db';
import { PlaybookView } from '@/components/playbooks/playbook-view';
import type { Loc } from '@/lib/data/playbooks';

export const dynamic = 'force-dynamic';

export default async function PlaybookDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const playbook = await dbGetPlaybook(slug, locale as Loc);
  if (!playbook) notFound();
  const versions = await getPlaybookVersions(slug);
  return <PlaybookView playbook={playbook} versions={versions} />;
}
