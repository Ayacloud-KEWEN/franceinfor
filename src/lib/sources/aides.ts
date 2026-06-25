// Funding / subsidy matching (differentiation feature).
//
// Default: rank the curated catalogue of real French programmes against the
// user's profile (lib/data/subsidies.ts) — accurate, keyless, always works.
//
// When AIDES_API_TOKEN is set, also pull live aids from the government
// Aides-territoires API and merge them in, mapped to the same shape. Any error
// degrades silently to the curated result.
import {
  matchSubsidies,
  type FundingProfile,
  type MatchedSubsidy,
  type AidType,
} from '../data/subsidies';

const AIDES_API = process.env.AIDES_API_URL || 'https://aides-territoires.beta.gouv.fr/api';
const TOKEN = process.env.AIDES_API_TOKEN || '';

export function aidesLive(): boolean {
  return Boolean(TOKEN);
}

// Map an Aides-territoires aid_type string onto our AidType enum.
function mapType(raw: string[] | undefined): AidType {
  const s = (raw || []).join(' ').toLowerCase();
  if (s.includes('prêt') || s.includes('pret') || s.includes('avance')) return 'LOAN';
  if (s.includes('garantie')) return 'GUARANTEE';
  if (s.includes('fiscal') || s.includes('impôt') || s.includes('impot')) return 'TAX_CREDIT';
  if (s.includes('fonds propres') || s.includes('investissement en capital')) return 'EQUITY';
  if (s.includes('ingénierie') || s.includes('conseil') || s.includes('accompagnement')) return 'ADVISORY';
  return 'GRANT';
}

interface ATResult {
  id?: number;
  name?: string;
  financers?: string[];
  aid_types?: string[];
  description?: string;
  origin_url?: string;
  application_url?: string;
}

async function fetchLive(profile: FundingProfile): Promise<MatchedSubsidy[]> {
  const params = new URLSearchParams({ targeted_audiences: 'private_sector' });
  const text = [profile.sector, profile.need].filter(Boolean).join(' ').trim();
  if (text) params.set('text', text);

  const res = await fetch(`${AIDES_API}/aids/?${params.toString()}`, {
    headers: { 'X-AUTH-TOKEN': TOKEN, Accept: 'application/json' },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`aides ${res.status}`);
  const json = (await res.json()) as { results?: ATResult[] };
  const results = json.results ?? [];

  // Reuse the same scoring weights against a thin profile so live + curated rank
  // consistently; live aids get a small boost for being locally targeted.
  return results.slice(0, 20).map((r, i) => ({
    id: `at-${r.id ?? i}`,
    name: r.name || 'Aide',
    provider: (r.financers || []).join(', ') || 'Aides-territoires',
    type: mapType(r.aid_types),
    amount: '—',
    description: (r.description || '').replace(/<[^>]+>/g, '').slice(0, 280),
    url: r.application_url || r.origin_url || 'https://aides-territoires.beta.gouv.fr/',
    stages: ['any'],
    needs: profile.need ? [profile.need.toLowerCase()] : ['any'],
    sectors: ['any'],
    regions: ['national'],
    score: 70 - i,
    reasons: ['aides-territoires'],
  }));
}

export async function matchFunding(profile: FundingProfile): Promise<{ results: MatchedSubsidy[]; source: 'live' | 'curated' }> {
  const curated = matchSubsidies(profile);
  if (!aidesLive()) return { results: curated, source: 'curated' };

  try {
    const live = await fetchLive(profile);
    if (!live.length) return { results: curated, source: 'curated' };
    // Merge: live first (locally targeted), then curated national programmes,
    // de-duplicated by name, re-sorted by score.
    const seen = new Set(live.map((l) => l.name.toLowerCase()));
    const merged = [...live, ...curated.filter((c) => !seen.has(c.name.toLowerCase()))];
    merged.sort((a, b) => b.score - a.score);
    return { results: merged, source: 'live' };
  } catch {
    return { results: curated, source: 'curated' };
  }
}
