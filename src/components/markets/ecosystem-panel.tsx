import { Link } from '@/i18n/routing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, ArrowRight } from 'lucide-react';
import { searchCompaniesByNaf, type CompanyResult } from '@/lib/sources/recherche-entreprises';
import { ECOSYSTEM_LABELS, type IndustryEcosystem, type Loc } from '@/lib/data/ecosystem';

// Live "who are the real players" panel: for each role of the sector's value
// chain (makers, distributors, operators, service providers…), query the
// official registry by NAF activity code and show the largest companies.
export async function EcosystemPanel({ eco, loc }: { eco: IndustryEcosystem; loc: Loc }) {
  const settled = await Promise.allSettled(eco.roles.map((r) => searchCompaniesByNaf(r.naf, 6)));
  const roles = eco.roles
    .map((role, i) => {
      const s = settled[i];
      return s.status === 'fulfilled'
        ? { role, companies: s.value.results, total: s.value.total }
        : null;
    })
    .filter((x): x is { role: (typeof eco.roles)[number]; companies: CompanyResult[]; total: number } => !!x && x.companies.length > 0);

  if (roles.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <Network size={15} /> {ECOSYSTEM_LABELS.panelTitle[loc]} · {eco.title[loc]}
        </CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">{ECOSYSTEM_LABELS.panelIntro[loc]}</p>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        {roles.map(({ role, companies, total }) => (
          <div key={role.id} className="rounded-lg border border-border p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">{role.label[loc]}</span>
              <span className="text-xs text-muted-foreground">
                {total >= 10000 ? '10,000+' : total.toLocaleString()} {ECOSYSTEM_LABELS.companiesTotal[loc]}
                <span className="ml-2 font-mono text-[10px]">{role.naf.join(' ')}</span>
              </span>
            </div>
            <div className="space-y-1.5">
              {companies.map((c) => (
                <Link
                  key={c.siren}
                  href={`/companies/${c.siren}`}
                  className="flex items-center justify-between gap-2 rounded-md border border-border px-2.5 py-1.5 hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{c.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{c.city || '—'}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {c.category && <Badge tone={c.category === 'GE' ? 'accent' : 'muted'}>{c.category}</Badge>}
                    <ArrowRight size={13} className="text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
