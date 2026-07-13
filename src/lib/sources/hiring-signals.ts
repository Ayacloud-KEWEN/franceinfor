// France Travail (ex-Pôle emploi) hiring signals: a company posting many fresh
// job offers — especially several roles at once — is a real expansion / buying
// signal. We aggregate the official "Offres d'emploi v2" API by employer and
// rank by posting volume + recency.
//
// OAuth2 client credentials from francetravail.io (FRANCE_TRAVAIL_CLIENT_ID /
// FRANCE_TRAVAIL_CLIENT_SECRET). Returns [] / null when not configured so the
// caller degrades gracefully.
import { searchCompanies } from './recherche-entreprises';
import type { IntentCompany } from '../data/modules';

const ID = process.env.FRANCE_TRAVAIL_CLIENT_ID || '';
const SECRET = process.env.FRANCE_TRAVAIL_CLIENT_SECRET || '';
const TOKEN_URL =
  process.env.FRANCE_TRAVAIL_TOKEN_URL ||
  'https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire';
const API = 'https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search';
const SCOPE = 'api_offresdemploiv2 o2dsoffre';

export function hiringSignalsConfigured(): boolean {
  return Boolean(ID && SECRET);
}

let cachedToken: { token: string; expires: number } | null = null;

async function getToken(): Promise<string | null> {
  if (!ID || !SECRET) return null;
  if (cachedToken && cachedToken.expires > Date.now()) return cachedToken.token;
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: ID,
      client_secret: SECRET,
      scope: SCOPE,
    }).toString(),
  });
  if (!res.ok) return null;
  const j = await res.json();
  if (!j?.access_token) return null;
  cachedToken = { token: j.access_token, expires: Date.now() + (j.expires_in ?? 1400) * 1000 };
  return j.access_token;
}

interface RawOffer {
  intitule?: string;
  entreprise?: { nom?: string };
  lieuTravail?: { libelle?: string };
  romeLibelle?: string;
  dateCreation?: string;
  typeContrat?: string;
}

export interface HiringSignal {
  id: string;
  company: string;
  siren: string | null; // resolved against the registry → deep-linkable
  postings: number; // number of open offers
  roles: string[]; // distinct job titles / families
  location: string | null;
  latestDate: string | null; // most recent posting (yyyy-mm-dd)
  score: number; // expansion/intent score (more + fresher = higher)
}

// Aggregate raw France Travail offers by employer. Exported for testing.
export function aggregateOffers(offers: RawOffer[]): HiringSignal[] {
  const byCompany = new Map<
    string,
    { roles: Set<string>; location: string | null; latest: number | null; count: number }
  >();
  for (const o of offers) {
    const company = (o.entreprise?.nom || '').trim();
    if (!company) continue;
    const e = byCompany.get(company) ?? { roles: new Set(), location: null, latest: null, count: 0 };
    e.count += 1;
    const role = (o.romeLibelle || o.intitule || '').trim();
    if (role) e.roles.add(role);
    if (!e.location && o.lieuTravail?.libelle) e.location = o.lieuTravail.libelle;
    const ts = o.dateCreation ? new Date(o.dateCreation).getTime() : NaN;
    if (!Number.isNaN(ts)) e.latest = e.latest == null ? ts : Math.max(e.latest, ts);
    byCompany.set(company, e);
  }

  const now = Date.now();
  return [...byCompany.entries()]
    .map(([company, e]) => {
      const ageDays = e.latest == null ? 60 : Math.max(0, (now - e.latest) / 86400000);
      // volume weight + recency weight, capped 0–100
      const score = Math.min(
        98,
        Math.round(45 + Math.min(40, e.count * 8) + Math.max(0, 15 - ageDays))
      );
      return {
        id: company.slice(0, 48),
        company,
        siren: null as string | null,
        postings: e.count,
        roles: [...e.roles].slice(0, 4),
        location: e.location,
        latestDate: e.latest != null ? new Date(e.latest).toISOString().slice(0, 10) : null,
        score,
      };
    })
    .sort((a, b) => b.postings - a.postings || b.score - a.score);
}

// Fetch and aggregate hiring signals for a keyword/sector. Companies hiring the
// most (fresh) roles first. Returns [] when not configured or on error.
export async function fetchHiringSignals(query = '', limit = 12): Promise<HiringSignal[]> {
  const token = await getToken();
  if (!token) return [];
  const params = new URLSearchParams({ range: '0-99', sort: '1' });
  if (query.trim()) params.set('motsCles', query.trim());
  const res = await fetch(`${API}?${params.toString()}`, {
    headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
    next: { revalidate: 1800 },
  });
  // France Travail returns 206 (partial content) for ranged results.
  if (!res.ok && res.status !== 206) return [];
  const j = await res.json().catch(() => null);
  const offers: RawOffer[] = j?.resultats ?? [];
  const aggregated = aggregateOffers(offers).slice(0, limit);

  // Best-effort: resolve a SIREN for the top companies so we can deep-link.
  await Promise.all(
    aggregated.slice(0, 8).map(async (s) => {
      try {
        const { results } = await searchCompanies(s.company, 1);
        if (results[0]) s.siren = results[0].siren;
      } catch {
        /* optional */
      }
    })
  );

  return aggregated;
}

// Hiring signals mapped into the shared buying-intent shape, so the Buying
// Intent page can blend "hiring heavily = expanding = buying" with tenders and
// funding. Graceful: [] when not configured.
export async function hiringIntent(limit = 6): Promise<IntentCompany[]> {
  const signals = await fetchHiringSignals('', limit).catch(() => []);
  return signals.map((s) => ({
    id: `hire:${s.id}`,
    name: s.company,
    industry: s.location ? `Hiring · ${s.location}` : 'Hiring / expansion',
    signals: [
      `${s.postings} open role(s)${s.roles.length ? `: ${s.roles.slice(0, 2).join(', ')}` : ''}`,
    ],
    intentScore: s.score,
    urgencyScore: Math.min(95, 55 + s.postings * 4),
    salesScore: Math.min(95, 60 + s.postings * 3),
    action: 'A hiring surge signals expansion — engage before competitors do',
  }));
}
