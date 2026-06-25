// Real Opportunity Discovery (M2): query the live French company registry with
// category-tuned French search terms, returning real named entities per category.
// Falls back to the deterministic mock per-category on error/empty.
import { searchCompanies } from './recherche-entreprises';
import { discover as discoverMock, type DiscoveryResult, type DiscoveryItem } from '../data/modules';

interface DiscoverInput {
  product: string;
  industry: string;
  target: string;
}

// category -> how to build the registry query from the user's input
const CATEGORY_QUERIES: { category: string; build: (i: DiscoverInput) => string }[] = [
  { category: 'Customers', build: (i) => [i.industry, i.target].filter(Boolean).join(' ') || i.product },
  { category: 'Distributors', build: (i) => `distribution ${i.industry}`.trim() },
  { category: 'Integrators', build: (i) => `intégrateur ${i.industry}`.trim() },
  { category: 'Partners', build: (i) => i.industry || i.product },
  { category: 'Investors', build: () => 'capital investissement' },
  { category: 'Accelerators', build: () => 'incubateur accélérateur' },
  { category: 'Associations', build: (i) => `association ${i.industry}`.trim() },
  { category: 'Public Buyers', build: (i) => `communauté de communes ${i.target}`.trim() },
];

export async function discoverReal(input: DiscoverInput): Promise<DiscoveryResult[]> {
  const mock = discoverMock(input); // for per-category fallback
  const mockByCat = new Map(mock.map((m) => [m.category, m]));

  const results = await Promise.all(
    CATEGORY_QUERIES.map(async ({ category, build }) => {
      const q = build(input).trim();
      try {
        if (!q) throw new Error('empty query');
        const { results } = await searchCompanies(q, 1);
        const items: DiscoveryItem[] = results.slice(0, 10).map((c) => ({
          name: c.name,
          score: c.opportunityScore,
          reason: [c.industry || c.nafCode, c.city].filter(Boolean).join(' · ') || `France`,
        }));
        if (!items.length) throw new Error('no results');
        return { category, items };
      } catch {
        return mockByCat.get(category) ?? { category, items: [] };
      }
    })
  );

  return results;
}
