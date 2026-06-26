import { notFound } from 'next/navigation';
import { getPlaybook, playbookSlugs, type Loc } from '@/lib/data/playbooks';
import { PlaybookView } from '@/components/playbooks/playbook-view';

export function generateStaticParams() {
  return playbookSlugs().map((slug) => ({ slug }));
}

export default async function PlaybookDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const playbook = getPlaybook(slug, locale as Loc);
  if (!playbook) notFound();
  return <PlaybookView playbook={playbook} />;
}
