// BODACC (Bulletin officiel des annonces civiles et commerciales) — keyless.
// Opendatasoft Explore v2.1. Real legal events: insolvency procedures,
// sales/transfers, modifications, account filings, etc.
const BASE =
  process.env.BODACC_RECORDS_API ||
  'https://bodacc-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/annonces-commerciales';

export interface LegalEvent {
  date: string | null;
  family: string | null; // e.g. "Procédures collectives"
  tribunal: string | null;
  city: string | null;
}

export interface LegalProfile {
  available: boolean;
  total: number;
  events: LegalEvent[];
  collectiveProcedures: number; // insolvency/recovery — the key risk signal
  lastCollectiveDate: string | null;
}

const COLLECTIVE = 'procédures collectives';

export async function getLegalEvents(siren: string): Promise<LegalProfile> {
  const where = encodeURIComponent(`registre like "${siren}"`);
  const url = `${BASE}/records?where=${where}&order_by=${encodeURIComponent('dateparution desc')}&limit=20&select=${encodeURIComponent('familleavis_lib,dateparution,tribunal,ville')}`;

  const res = await fetch(url, { headers: { accept: 'application/json' }, next: { revalidate: 3600 } });
  if (!res.ok) return { available: false, total: 0, events: [], collectiveProcedures: 0, lastCollectiveDate: null };

  const json = await res.json();
  const rows: any[] = json.results ?? [];
  const events: LegalEvent[] = rows.map((r) => ({
    date: r.dateparution ?? null,
    family: r.familleavis_lib ?? null,
    tribunal: r.tribunal ?? null,
    city: r.ville ?? null,
  }));

  const collectives = events.filter((e) => (e.family || '').toLowerCase().includes(COLLECTIVE));

  return {
    available: true,
    total: json.total_count ?? events.length,
    events,
    collectiveProcedures: collectives.length,
    lastCollectiveDate: collectives[0]?.date ?? null,
  };
}

/** Legal-risk score (higher = safer). Driven by real collective-procedure history. */
export function legalRiskScore(p: LegalProfile): number {
  if (!p.available) return 70; // unknown -> neutral
  if (p.collectiveProcedures === 0) return 92;
  // Penalise by count and recency of insolvency procedures.
  let score = 75 - p.collectiveProcedures * 12;
  if (p.lastCollectiveDate) {
    const ageYears = (Date.now() - new Date(p.lastCollectiveDate).getTime()) / (1000 * 3600 * 24 * 365);
    if (ageYears < 2) score -= 20;
    else if (ageYears < 5) score -= 8;
  }
  return Math.max(15, Math.min(90, Math.round(score)));
}
