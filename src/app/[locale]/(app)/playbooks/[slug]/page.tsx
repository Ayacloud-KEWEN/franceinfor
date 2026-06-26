import { notFound } from 'next/navigation';
import { getPlaybook, PLAYBOOKS } from '@/lib/data/playbooks';
import { PlaybookView } from '@/components/playbooks/playbook-view';

export function generateStaticParams() {
  return PLAYBOOKS.map((p) => ({ slug: p.slug }));
}

export default async function PlaybookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const playbook = getPlaybook(slug);
  if (!playbook) notFound();
  return <PlaybookView playbook={playbook} />;
}
