// Industry reference data for Market Intelligence (Module 1).
// Market size / growth are overridden by REAL Eurostat France value-added when
// available (see lib/sources/market-stats.ts); the constants below are fallbacks.
import { seededScore } from '../utils';

export interface Industry {
  slug: string;
  name: string;
  naceCode: string; // Eurostat NACE rev.2 sector used for real stats
  frTerm: string; // French search term for listing real companies / news
  marketSizeBn: number; // € billions (fallback; real value injected at runtime)
  cagr: number; // % (fallback)
  opportunityScore: number;
  difficultyScore: number;
  real?: boolean; // true when size/growth came from Eurostat
}

const RAW: Array<Pick<Industry, 'slug' | 'name' | 'naceCode' | 'frTerm' | 'marketSizeBn' | 'cagr'>> = [
  { slug: 'ai', name: 'Artificial Intelligence', naceCode: 'J', frTerm: 'intelligence artificielle', marketSizeBn: 8.2, cagr: 28 },
  { slug: 'robotics', name: 'Robotics', naceCode: 'C28', frTerm: 'robotique', marketSizeBn: 4.1, cagr: 14 },
  { slug: 'cybersecurity', name: 'Cybersecurity', naceCode: 'J', frTerm: 'cybersécurité', marketSizeBn: 6.7, cagr: 16 },
  { slug: 'healthcare', name: 'Healthcare', naceCode: 'Q86', frTerm: 'santé médical', marketSizeBn: 31.5, cagr: 7 },
  { slug: 'education', name: 'Education', naceCode: 'P85', frTerm: 'éducation formation', marketSizeBn: 12.3, cagr: 9 },
  { slug: 'manufacturing', name: 'Manufacturing', naceCode: 'C', frTerm: 'industrie manufacturière', marketSizeBn: 58.0, cagr: 4 },
  { slug: 'luxury', name: 'Luxury', naceCode: 'C', frTerm: 'luxe', marketSizeBn: 42.0, cagr: 6 },
  { slug: 'retail', name: 'Retail', naceCode: 'G47', frTerm: 'commerce de détail', marketSizeBn: 95.0, cagr: 3 },
  { slug: 'food', name: 'Food & Hospitality', naceCode: 'I', frTerm: 'agroalimentaire restauration', marketSizeBn: 67.0, cagr: 3 },
  { slug: 'energy', name: 'Energy', naceCode: 'D', frTerm: 'énergie', marketSizeBn: 73.0, cagr: 11 },
  { slug: 'transportation', name: 'Transportation', naceCode: 'H', frTerm: 'transport logistique', marketSizeBn: 48.0, cagr: 5 },
];

export const INDUSTRIES: Industry[] = RAW.map((r) => ({
  ...r,
  opportunityScore: seededScore(r.slug + 'opp', 55, 95),
  difficultyScore: seededScore(r.slug + 'diff', 30, 85),
}));

export const NACE_CODES = Array.from(new Set(RAW.map((r) => r.naceCode)));

export function getIndustry(slug: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.slug === slug);
}

// 5-year forecast points for a given industry (real base × real/est. growth).
export function forecastSeries(ind: Industry) {
  const year = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => ({
    year: String(year + i),
    size: Number((ind.marketSizeBn * Math.pow(1 + ind.cagr / 100, i)).toFixed(1)),
  }));
}
