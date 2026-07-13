import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { consumeSearch } from '@/lib/usage';
import { searchCompanies } from '@/lib/sources/recherche-entreprises';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const q = req.nextUrl.searchParams.get('q')?.trim() || '';
  if (!q) return NextResponse.json({ profile: null });

  const quota = await consumeSearch(user.id, user.plan, 'network', q);
  if (!quota.ok)
    return NextResponse.json({ error: 'quota_exceeded', limit: quota.limit }, { status: 429 });

  const { results } = await searchCompanies(q, 1);
  if (!results.length) return NextResponse.json({ profile: null });
  // Prefer the match that actually has named directors (skip dormant shells),
  // tie-break on number of establishments.
  const c = [...results].sort((a, b) => {
    const ax = a.executives.length, bx = b.executives.length;
    if (bx !== ax) return bx - ax;
    return (b.establishmentsCount ?? 0) - (a.establishmentsCount ?? 0);
  })[0];

  const people = c.executives.filter((e) => !e.isCompany);
  const parents = c.executives.filter((e) => e.isCompany);

  // Real named directors from the registry — no fabricated influence scores.
  const decisionMakers = people.map((p) => ({ name: p.name, role: p.role }));

  return NextResponse.json({
    profile: {
      company: { name: c.name, siren: c.siren, city: c.city, establishments: c.establishmentsCount },
      decisionMakers,
      parents: parents.map((p) => ({ name: p.name, siren: p.siren })),
    },
  });
}
