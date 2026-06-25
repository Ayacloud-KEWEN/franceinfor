import { cn } from '@/lib/utils';
import type { OrgNode } from '@/lib/data/contacts';

const toneByType: Record<OrgNode['type'], string> = {
  parent: 'bg-primary text-primary-foreground',
  company: 'bg-accent/15 text-accent border border-accent/30',
  subsidiary: 'bg-muted text-muted-foreground',
};

export function OrgTree({ node }: { node: OrgNode }) {
  return (
    <ul className="ml-2 space-y-2 border-l border-border pl-4">
      <li>
        <span
          className={cn(
            'inline-flex rounded-md px-2.5 py-1 text-xs font-medium',
            toneByType[node.type]
          )}
        >
          {node.name}
        </span>
        {node.children?.length ? (
          <div className="mt-2">
            {node.children.map((c) => (
              <OrgTree key={c.name} node={c} />
            ))}
          </div>
        ) : null}
      </li>
    </ul>
  );
}
