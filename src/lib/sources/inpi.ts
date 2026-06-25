// INPI RNE (Registre National des Entreprises) client.
// Requires INPI_USERNAME / INPI_PASSWORD (free account at data.inpi.fr).
// Token-based auth; returns null when not configured.

const USER = process.env.INPI_USERNAME || '';
const PASS = process.env.INPI_PASSWORD || '';
const BASE = 'https://registre-national-entreprises.inpi.fr/api';

let cachedToken: { token: string; expires: number } | null = null;

export function inpiConfigured(): boolean {
  return Boolean(USER && PASS);
}

async function getToken(): Promise<string | null> {
  if (!USER || !PASS) return null;
  if (cachedToken && cachedToken.expires > Date.now()) return cachedToken.token;
  const res = await fetch(`${BASE}/sso/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: USER, password: PASS }),
  });
  if (!res.ok) return null;
  const j = await res.json();
  if (!j?.token) return null;
  cachedToken = { token: j.token, expires: Date.now() + 1000 * 60 * 50 };
  return j.token;
}

export interface InpiCompany {
  available: true;
  siren: string;
  denomination: string | null;
  legalForm: string | null;
  capital: number | null;
}

export async function getInpiCompany(siren: string): Promise<InpiCompany | null> {
  const token = await getToken();
  if (!token) return null;
  const res = await fetch(`${BASE}/companies/${encodeURIComponent(siren)}`, {
    headers: { Authorization: `Bearer ${token}`, accept: 'application/json' },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const j = await res.json();
  const ident = j?.formality?.content?.personneMorale?.identite;
  return {
    available: true,
    siren,
    denomination: ident?.entreprise?.denomination ?? null,
    legalForm: ident?.entreprise?.formeJuridique ?? null,
    capital: ident?.description?.montantCapital ?? null,
  };
}
