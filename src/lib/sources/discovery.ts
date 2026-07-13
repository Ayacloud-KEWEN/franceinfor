// Opportunity Discovery (M2), real data only.
//  - Company categories (Customers, Distributors, Integrators, Partners) come
//    live from the French company registry. Distributors/Integrators use the
//    sector's NAF value-chain (searchCompaniesByNaf) when the query maps to a
//    known ecosystem; otherwise they fall back to a registry search.
//  - Ecosystem categories (Investors, Accelerators, Associations, Public
//    Buyers) come from a curated directory of real French organisations.
// No fabricated scores — items carry real attributes and a link.
import {
  searchCompanies,
  searchCompaniesByNaf,
  type CompanyResult,
} from './recherche-entreprises';
import { matchEcosystem } from '../data/ecosystem';
import { ECOSYSTEM_DIRECTORY } from '../data/ecosystem-directory';

export interface DiscoveryItem {
  name: string;
  reason: string;
  siren?: string | null; // registry company → deep link to /companies/[siren]
  url?: string | null; // curated directory → official external site
}
export interface DiscoveryResult {
  category: string;
  live: boolean; // true = live registry, false = curated directory
  items: DiscoveryItem[];
}

interface DiscoverInput {
  product: string;
  industry: string;
  target: string;
}

function toItem(c: CompanyResult): DiscoveryItem {
  return {
    name: c.name,
    reason: [c.industry || c.nafCode, c.city].filter(Boolean).join(' · ') || 'France',
    siren: c.siren,
  };
}

// Pick the ecosystem roles that act as distributors / integrators.
function rolesByKind(nafByKind: ReturnType<typeof splitRoles>, kind: 'distrib' | 'service') {
  return nafByKind[kind];
}

function splitRoles(eco: NonNullable<ReturnType<typeof matchEcosystem>>) {
  const distrib: string[] = [];
  const service: string[] = [];
  for (const r of eco.roles) {
    const id = r.id.toLowerCase();
    const label = r.label.en.toLowerCase();
    if (/distrib|whole|retail/.test(id + label)) distrib.push(...r.naf);
    else if (/serv|integr|consul|engineer|install|maintenance|operator/.test(id + label))
      service.push(...r.naf);
  }
  return { distrib, service };
}

export async function discoverReal(input: DiscoverInput): Promise<DiscoveryResult[]> {
  const eco = matchEcosystem(input.industry || input.product || input.target || '');
  const roles = eco ? splitRoles(eco) : { distrib: [], service: [] };
  const industryTerm =
    [input.industry, input.target].filter(Boolean).join(' ') || input.product || '';

  const safe = async (fn: () => Promise<DiscoveryItem[]>): Promise<DiscoveryItem[]> => {
    try {
      return await fn();
    } catch {
      return [];
    }
  };

  const [customers, distributors, integrators, partners] = await Promise.all([
    // Customers: real companies in the target industry.
    safe(async () => {
      if (!industryTerm.trim()) return [];
      const { results } = await searchCompanies(industryTerm, 1);
      return results.slice(0, 10).map(toItem);
    }),
    // Distributors: sector NAF value-chain, else registry search.
    safe(async () => {
      if (roles.distrib.length) {
        const { results } = await searchCompaniesByNaf(roles.distrib, 10);
        return results.map(toItem);
      }
      if (!industryTerm.trim()) return [];
      const { results } = await searchCompanies(`distribution ${input.industry}`.trim(), 1);
      return results.slice(0, 10).map(toItem);
    }),
    // Integrators / service providers: sector NAF, else registry search.
    safe(async () => {
      if (roles.service.length) {
        const { results } = await searchCompaniesByNaf(roles.service, 10);
        return results.map(toItem);
      }
      if (!input.industry.trim()) return [];
      const { results } = await searchCompanies(`intégrateur ${input.industry}`.trim(), 1);
      return results.slice(0, 10).map(toItem);
    }),
    // Partners: real companies matching the product/industry.
    safe(async () => {
      const q = (input.product || input.industry).trim();
      if (!q) return [];
      const { results } = await searchCompanies(q, 1);
      return results.slice(0, 10).map(toItem);
    }),
  ]);

  const liveResults: DiscoveryResult[] = [
    { category: 'Customers', live: true, items: customers },
    { category: 'Distributors', live: true, items: distributors },
    { category: 'Integrators', live: true, items: integrators },
    { category: 'Partners', live: true, items: partners },
  ].filter((r) => r.items.length > 0);

  // Curated real directory (sector-agnostic ecosystem players).
  const directoryResults: DiscoveryResult[] = Object.entries(ECOSYSTEM_DIRECTORY).map(
    ([category, entries]) => ({
      category,
      live: false,
      items: entries.map((e) => ({ name: e.name, reason: e.reason, url: e.url })),
    })
  );

  return [...liveResults, ...directoryResults];
}
