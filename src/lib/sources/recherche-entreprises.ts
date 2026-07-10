// Client for the French government open company API (keyless, no auth).
// Returns REAL data: identity, financials (CA / net result), executives, VAT.
// Docs: https://recherche-entreprises.api.gouv.fr/docs/
import { seededScore } from '../utils';

const BASE =
  process.env.RECHERCHE_ENTREPRISES_API ||
  'https://recherche-entreprises.api.gouv.fr';

export interface Executive {
  name: string;
  role: string | null;
  isCompany: boolean; // true when the director is a legal entity (parent/owner)
  siren: string | null;
}

export interface CompanyResult {
  siren: string;
  name: string;
  legalForm: string | null;
  nafCode: string | null;
  industry: string | null;
  employees: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  creationDate: string | null;
  status: string | null;
  // Real enrichment
  vat: string | null;
  revenue: number | null; // € chiffre d'affaires
  netResult: number | null; // € résultat net
  financeYear: string | null;
  financeHistory: { year: string; revenue: number | null; netResult: number | null }[];
  executives: Executive[];
  category: string | null; // PME / ETI / GE
  establishmentsCount: number | null;
  openEstablishments: number | null;
  section: string | null; // NAF section label
  // Derived demo scores
  opportunityScore: number;
  financialHealthScore: number;
}

interface RawDirigeant {
  nom?: string;
  prenoms?: string;
  denomination?: string;
  qualite?: string;
  siren?: string;
}

interface RawCompany {
  siren: string;
  nom_complet?: string;
  nom_raison_sociale?: string;
  nature_juridique?: string;
  activite_principale?: string;
  tranche_effectif_salarie?: string;
  categorie_entreprise?: string;
  nombre_etablissements?: number;
  nombre_etablissements_ouverts?: number;
  section_activite_principale?: string;
  date_creation?: string;
  etat_administratif?: string;
  tva?: string | string[] | null;
  dirigeants?: RawDirigeant[];
  finances?: Record<string, { ca?: number; resultat_net?: number }>;
  siege?: {
    libelle_commune?: string;
    code_postal?: string;
    adresse?: string;
    activite_principale?: string;
    libelle_activite_principale?: string;
  };
}

function latestFinance(finances?: RawCompany['finances']) {
  if (!finances) return { revenue: null, netResult: null, year: null };
  const years = Object.keys(finances).sort().reverse();
  for (const y of years) {
    const f = finances[y];
    if (f && (f.ca != null || f.resultat_net != null)) {
      return { revenue: f.ca ?? null, netResult: f.resultat_net ?? null, year: y };
    }
  }
  return { revenue: null, netResult: null, year: null };
}

function mapExecutives(dirigeants?: RawDirigeant[]): Executive[] {
  if (!dirigeants?.length) return [];
  return dirigeants.slice(0, 12).map((d) => ({
    name:
      d.denomination ||
      [d.prenoms, d.nom].filter(Boolean).join(' ').trim() ||
      '—',
    role: d.qualite ?? null,
    isCompany: Boolean(d.denomination),
    siren: d.siren ?? null,
  }));
}

function financeHistory(finances?: RawCompany['finances']) {
  if (!finances) return [];
  return Object.keys(finances)
    .sort()
    .map((year) => ({
      year,
      revenue: finances[year]?.ca ?? null,
      netResult: finances[year]?.resultat_net ?? null,
    }))
    .filter((f) => f.revenue != null || f.netResult != null);
}

function mapCompany(c: RawCompany): CompanyResult {
  const fin = latestFinance(c.finances);
  return {
    siren: c.siren,
    name: c.nom_complet || c.nom_raison_sociale || c.siren,
    legalForm: c.nature_juridique ?? null,
    nafCode: c.siege?.activite_principale ?? c.activite_principale ?? null,
    industry: c.siege?.libelle_activite_principale ?? null,
    employees: c.tranche_effectif_salarie ?? null,
    address: c.siege?.adresse ?? null,
    city: c.siege?.libelle_commune ?? null,
    postalCode: c.siege?.code_postal ?? null,
    creationDate: c.date_creation ?? null,
    status: c.etat_administratif === 'A' ? 'Active' : c.etat_administratif ?? null,
    vat: Array.isArray(c.tva) ? (c.tva[0] ?? null) : c.tva ?? null,
    revenue: fin.revenue,
    netResult: fin.netResult,
    financeYear: fin.year,
    financeHistory: financeHistory(c.finances),
    executives: mapExecutives(c.dirigeants),
    category: c.categorie_entreprise ?? null,
    establishmentsCount: c.nombre_etablissements ?? null,
    openEstablishments: c.nombre_etablissements_ouverts ?? null,
    section: c.section_activite_principale ?? null,
    opportunityScore: seededScore(c.siren + 'opp'),
    financialHealthScore: seededScore(c.siren + 'fin'),
  };
}

export async function searchCompanies(
  query: string,
  page = 1
): Promise<{ results: CompanyResult[]; total: number }> {
  const url = `${BASE}/search?q=${encodeURIComponent(query)}&page=${page}&per_page=20`;
  const res = await fetch(url, {
    headers: { accept: 'application/json' },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`recherche-entreprises ${res.status}`);
  const json = await res.json();
  const raw: RawCompany[] = json.results ?? [];
  return { results: raw.map(mapCompany), total: json.total_results ?? raw.length };
}

// INSEE employee-band codes, in ascending size order (for ranking).
const TRANCHE_RANK: Record<string, number> = {
  '00': 0, '01': 1, '02': 2, '03': 3, '11': 4, '12': 5, '21': 6, '22': 7,
  '31': 8, '32': 9, '41': 10, '42': 11, '51': 12, '52': 13, '53': 14,
};
const CATEGORY_RANK: Record<string, number> = { GE: 3, ETI: 2, PME: 1 };

function sizeRank(c: CompanyResult): number {
  return (
    (CATEGORY_RANK[c.category ?? ''] ?? 0) * 100 +
    (TRANCHE_RANK[c.employees ?? ''] ?? 0)
  );
}

// Structured search by NAF activity codes — finds the REAL players of a
// sector (by declared main activity), instead of companies whose NAME merely
// contains the keyword. Large companies (GE/ETI) first; falls back to all
// sizes when a niche sector has few big players.
export async function searchCompaniesByNaf(
  nafCodes: string[],
  limit = 6
): Promise<{ results: CompanyResult[]; total: number }> {
  const base = new URLSearchParams({
    activite_principale: nafCodes.join(','),
    etat_administratif: 'A',
    per_page: '25',
    page: '1',
  });

  const fetchPage = async (extra?: Record<string, string>) => {
    const p = new URLSearchParams(base);
    for (const [k, v] of Object.entries(extra ?? {})) p.set(k, v);
    const res = await fetch(`${BASE}/search?${p.toString()}`, {
      headers: { accept: 'application/json' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`recherche-entreprises ${res.status}`);
    const json = await res.json();
    return {
      results: ((json.results ?? []) as RawCompany[]).map(mapCompany),
      total: (json.total_results as number) ?? 0,
    };
  };

  // Total sector population (all sizes), and the big players (GE/ETI).
  const [all, big] = await Promise.all([
    fetchPage(),
    fetchPage({ categorie_entreprise: 'GE,ETI' }),
  ]);

  // Prefer big players; top up with the largest of the rest if too few.
  const seen = new Set(big.results.map((c) => c.siren));
  const merged = [
    ...big.results,
    ...all.results.filter((c) => !seen.has(c.siren)),
  ].sort((a, b) => sizeRank(b) - sizeRank(a));

  return { results: merged.slice(0, limit), total: all.total };
}

export async function getCompany(siren: string): Promise<CompanyResult | null> {
  const url = `${BASE}/search?q=${encodeURIComponent(siren)}&page=1&per_page=1`;
  const res = await fetch(url, {
    headers: { accept: 'application/json' },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`recherche-entreprises ${res.status}`);
  const json = await res.json();
  const match = (json.results ?? []).find((c: RawCompany) => c.siren === siren) ?? json.results?.[0];
  return match ? mapCompany(match) : null;
}
