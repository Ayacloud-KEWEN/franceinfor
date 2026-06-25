// EUIPO Trademark Search API client (OAuth2 client credentials).
// Requires EUIPO_CLIENT_ID / EUIPO_CLIENT_SECRET (developer.euipo.europa.eu).
// Returns null when not configured -> caller falls back to mock generator.
import { seededScore } from '../utils';
import type { BrandResult } from '../data/modules';

const ID = process.env.EUIPO_CLIENT_ID || '';
const SECRET = process.env.EUIPO_CLIENT_SECRET || '';
const AUTH = 'https://auth.euipo.europa.eu/oidc/accessToken';
const API = 'https://api.euipo.europa.eu/trademark-search/trademarks';

let cachedToken: { token: string; expires: number } | null = null;

export function euipoConfigured(): boolean {
  return Boolean(ID && SECRET);
}

async function getToken(): Promise<string | null> {
  if (!ID || !SECRET) return null;
  if (cachedToken && cachedToken.expires > Date.now()) return cachedToken.token;
  const basic = Buffer.from(`${ID}:${SECRET}`).toString('base64');
  const res = await fetch(AUTH, {
    method: 'POST',
    headers: {
      authorization: `Basic ${basic}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=uid',
  });
  if (!res.ok) return null;
  const j = await res.json();
  if (!j?.access_token) return null;
  cachedToken = { token: j.access_token, expires: Date.now() + (j.expires_in ?? 3000) * 1000 };
  return j.access_token;
}

export async function searchEuipoTrademarks(q: string): Promise<BrandResult[] | null> {
  const token = await getToken();
  if (!token) return null;
  const url = `${API}?query=${encodeURIComponent(`wordMarkSpecification.verbalElement=="${q}*"`)}&size=10`;
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
    next: { revalidate: 600 },
  });
  if (!res.ok) return null;
  const j = await res.json();
  const items: any[] = j?.trademarks ?? j?.content ?? [];
  return items.slice(0, 10).map((tm, i) => {
    const mark = tm?.wordMarkSpecification?.verbalElement ?? tm?.applicationNumber ?? `${q}-${i}`;
    const id = String(tm?.applicationNumber ?? `${mark}-${i}`);
    const avail = seededScore(id + 'av', 10, 95);
    return {
      id,
      mark,
      owner: tm?.applicants?.[0]?.name ?? '—',
      classes: (tm?.niceClasses ?? []).join(', ') || '—',
      office: 'EUIPO' as const,
      riskScore: seededScore(id + 'rk', 15, 90),
      similarityScore: seededScore(id + 'sim', 20, 95),
      availabilityScore: avail,
      recommendation:
        avail > 65 ? 'Available — proceed to register' : avail > 40 ? 'Caution — refine the mark' : 'High conflict — choose another mark',
    } satisfies BrandResult;
  });
}
