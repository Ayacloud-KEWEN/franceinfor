// Pappers API client — deep company financials & legal data.
// Requires PAPPERS_API_KEY (free tier available at pappers.fr/api).
// Returns null when no key is configured, so callers fall back gracefully.

const KEY = process.env.PAPPERS_API_KEY || '';
const BASE = 'https://api.pappers.fr/v2';

export interface PappersFinancials {
  available: boolean;
  siren: string;
  revenue: number | null;
  netResult: number | null;
  ebitda: number | null;
  equity: number | null;
  employees: number | null;
  year: string | null;
  vat: string | null;
}

export function pappersConfigured(): boolean {
  return Boolean(KEY);
}

export async function getPappersFinancials(
  siren: string
): Promise<PappersFinancials | null> {
  if (!KEY) return null;
  const url = `${BASE}/entreprise?api_token=${KEY}&siren=${encodeURIComponent(siren)}`;
  const res = await fetch(url, { headers: { accept: 'application/json' }, next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const j = await res.json();
  const last = Array.isArray(j?.finances) && j.finances.length ? j.finances[0] : null;
  return {
    available: true,
    siren,
    revenue: last?.chiffre_affaires ?? null,
    netResult: last?.resultat ?? null,
    ebitda: last?.ebitda ?? null,
    equity: last?.capitaux_propres ?? null,
    employees: j?.effectif ?? null,
    year: last?.annee ? String(last.annee) : null,
    vat: j?.numero_tva_intracommunautaire ?? null,
  };
}
