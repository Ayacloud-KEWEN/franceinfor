import { Link } from '@/i18n/routing';
import { BookOpen, ArrowRight } from 'lucide-react';
import type { Playbook } from '@/lib/data/playbooks';

// Compact playbook list for the Dashboard sidebar — actionable how-to guides.
export function DashboardPlaybooks({ items }: { items: Pick<Playbook, 'slug' | 'title'>[] }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">—</p>;
  return (
    <div className="space-y-1.5">
      {items.map((p) => (
        <Link
          key={p.slug}
          href={`/playbooks/${p.slug}`}
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-primary"
        >
          <BookOpen size={15} className="shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate">{p.title}</span>
          <ArrowRight size={14} className="shrink-0 text-muted-foreground" />
        </Link>
      ))}
    </div>
  );
}
