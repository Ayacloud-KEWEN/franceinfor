import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { consumeSearch } from '@/lib/usage';
import { creditProfile, type LegalInput } from '@/lib/data/modules';
import { searchCompanies } from '@/lib/sources/recherche-entreprises';
import { getLegalEvents, legalRiskScore } from '@/lib/sources/bodacc';
import { getPappersFinancials, pappersConfigured } from '@/lib/sources/pappers';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const q = req.nextUrl.searchParams.get('q')?.trim() || '';
  if (!q) return NextResponse.json({ profile: null });

  const quota = await consumeSearch(user.id, user.plan, 'credit', q);
  if (!quota.ok)
    return NextResponse.json({ error: 'quota_exceeded', limit: quota.limit }, { status: 429 });

  // Pull the top real company match to ground the financial-health score.
  let real: { revenue: number | null; netResult: number | null; year: string | null; source?: string } | undefined;
  let legal: LegalInput | undefined;
  let resolvedName = q;
  let events: Awaited<ReturnType<typeof getLegalEvents>>['events'] = [];
  try {
    const { results } = await searchCompanies(q, 1);
    if (results.length) {
      const best = results.find((r) => r.revenue != null) ?? results[0];
      real = { revenue: best.revenue, netResult: best.netResult, year: best.financeYear, source: 'data.gouv.fr' };
      resolvedName = best.name;

      // Enrich with Pappers when the government registry has no financials
      // (common for smaller companies) — makes financial health real for more.
      if (real.revenue == null && pappersConfigured()) {
        try {
          const pf = await getPappersFinancials(best.siren);
          if (pf?.available && pf.revenue != null) {
            real = { revenue: pf.revenue, netResult: pf.netResult, year: pf.year, source: 'Pappers' };
          }
        } catch {
          // Pappers optional
        }
      }

      // Real legal events from BODACC for the resolved SIREN.
      try {
        const lp = await getLegalEvents(best.siren);
        if (lp.available) {
          legal = {
            available: true,
            collectiveProcedures: lp.collectiveProcedures,
            total: lp.total,
            score: legalRiskScore(lp),
          };
          events = lp.events.slice(0, 6);
        }
      } catch {
        // legal lookup optional
      }
    }
  } catch {
    // fall back to estimated scoring
  }

  return NextResponse.json({ profile: creditProfile(resolvedName, real, legal), events });
}
