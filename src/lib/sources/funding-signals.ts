// Investment / funding signals: companies that just raised money have fresh
// budget — one of the strongest concrete buying signals. Keyless: reuses the
// Google News RSS layer with fundraising-tuned French queries, then parses the
// company, amount and round out of each headline. Parsed companies are then
// validated/enriched against the official company registry (recherche-
// entreprises, data.gouv) so we can attach a real SIREN, canonical name and
// industry — which also filters out roundup/listicle and people-name noise.
import { fetchFranceNews } from './news';
import { searchCompanies } from './recherche-entreprises';
import { seededScore } from '../utils';
import type { IntentCompany } from '../data/modules';

export interface FundingSignal {
  id: string;
  company: string | null;
  siren: string | null; // when resolved against the registry → deep-linkable
  industry: string | null;
  amount: string | null; // human-readable, e.g. "15 M€"
  round: string | null; // Seed / Série A …
  title: string;
  url: string;
  source: string;
  date: string | null;
  score: number; // buying-intent score (bigger raise / more recent = higher)
}

const FUNDING_QUERY =
  '"levée de fonds" OR "tour de table" OR "série A" OR "série B" OR "lève" startup France';

// Roundups / listicles / explainers — not a single fundable company.
const LISTICLE =
  /^\s*\d+\s|voici|classement|top\s*\d|palmar[èe]s|les\s+\d+\s|choses?\s+à\s+savoir|qu'?il ne fallait|meilleures?\b|r[ée]cap|panorama|hebdo|de la semaine/i;

function amountToEur(num: number, unit: string): number {
  const u = unit.toLowerCase();
  if (u.startsWith('mds') || u.startsWith('milliard') || u === 'md') return num * 1e9;
  if (u.startsWith('m')) return num * 1e6;
  if (u.startsWith('k')) return num * 1e3;
  return num;
}

function parseAmount(title: string): { text: string; eur: number } | null {
  const m = title.match(/(\d+(?:[.,]\d+)?)\s*(milliards?|mds?|millions?|m€|m\b|k€|k\b)/i);
  if (!m) return null;
  const num = parseFloat(m[1].replace(',', '.'));
  if (Number.isNaN(num)) return null;
  const eur = amountToEur(num, m[2]);
  const unit = /milliard|mds?|md/i.test(m[2]) ? 'Md€' : /k/i.test(m[2]) ? 'k€' : 'M€';
  return { text: `${m[1].replace('.', ',')} ${unit}`, eur };
}

function parseRound(title: string): string | null {
  const m = title.match(/(pre-?seed|amor[çc]age|seed|série\s?[a-e]|series\s?[a-e])/i);
  if (!m) return null;
  return m[1].replace(/\s+/g, ' ').replace(/^s/, 'S').trim();
}

// Heuristic: the company is usually the subject before the fundraising verb.
function parseCompany(title: string): string | null {
  if (LISTICLE.test(title)) return null;
  const m = title.match(/^(.*?)\s+(?:l[èe]ve|l[èe]vent|r[ée]alise|boucle|signe|annonce|finalise|cl[ôo]ture|empoche|d[ée]croche)\b/i);
  if (!m) return null;
  let c = m[1].trim();
  // Strip a leading section/city prefix like "Numérique. " or "Palaiseau : ".
  c = c.replace(/^[A-ZÀ-Ÿ][\wÀ-ÿ'’-]{1,18}\s*[:.]\s+/, '');
  // Drop common leading qualifiers.
  c = c.replace(/^(la\s+(start-?up|soci[ée]t[ée]|p[ée]pite|fintech|biotech|scale-?up|licorne)|le\s+groupe|la\s+jeune\s+pousse|start-?up|le\s+fran[çc]ais|la\s+fran[çc]aise)\s+/i, '');
  // Cut descriptive clauses ("AMI, une startup …" → "AMI").
  c = c.split(/[,(]/)[0].trim();
  if (c.length < 2 || c.length > 50) return null;
  return c;
}

function scoreSignal(id: string, eur: number | null, date: string | null, resolved: boolean): number {
  let s = eur ? Math.min(40, Math.round(Math.log10(eur) * 5)) : 12;
  if (date) {
    const days = (Date.now() - new Date(date).getTime()) / 86_400_000;
    if (days <= 7) s += 18;
    else if (days <= 30) s += 12;
    else if (days <= 90) s += 6;
  }
  if (resolved) s += 6; // confirmed against the registry → higher confidence
  return Math.max(45, Math.min(98, 50 + s + seededScore(id, 0, 8)));
}

// Resolve a parsed company name against the official registry. Returns the
// canonical entity when the names clearly overlap (kills false positives like
// people names that happen to match an unrelated company).
async function resolveCompany(
  name: string
): Promise<{ siren: string; name: string; industry: string | null; city: string | null } | null> {
  try {
    const { results } = await searchCompanies(name, 1);
    const top = results[0];
    if (!top) return null;
    // Require a whole-word match (not a substring) so short names like "AMI"
    // don't falsely match "ACTEMIUM"; escape regex-special chars in the token.
    const tokens = name.toLowerCase().split(/\s+/).filter((w) => w.length >= 3);
    const hay = top.name.toLowerCase();
    const wordMatch = (tk: string) => new RegExp(`\\b${tk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(hay);
    if (!tokens.some(wordMatch)) return null;
    return { siren: top.siren, name: top.name, industry: top.industry || top.nafCode || null, city: top.city || null };
  } catch {
    return null;
  }
}

// Run an async map with bounded concurrency (registry is ~7 req/s/IP).
async function mapLimit<T, R>(arr: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < arr.length; i += limit) {
    out.push(...(await Promise.all(arr.slice(i, i + limit).map(fn))));
  }
  return out;
}

export async function fundingSignalsReal(
  query = '',
  limit = 30,
  { enrich = true }: { enrich?: boolean } = {}
): Promise<FundingSignal[]> {
  const q = query.trim() ? `${query} levée de fonds France` : FUNDING_QUERY;
  const news = await fetchFranceNews(q, limit);

  const base = news
    .filter((n) => !LISTICLE.test(n.title))
    .filter((n) => n.signalType === 'Investment' || /lev[ée]e|l[èe]ve|s[ée]rie|fonds|million|financement/i.test(n.title))
    .map((n) => {
      const amt = parseAmount(n.title);
      return {
        id: n.id,
        company: parseCompany(n.title),
        siren: null as string | null,
        industry: null as string | null,
        amount: amt?.text ?? null,
        round: parseRound(n.title),
        title: n.title,
        url: n.url,
        source: n.source,
        date: n.date,
        _eur: amt?.eur ?? null,
      };
    });

  // Enrich the top items against the registry (bounded concurrency).
  if (enrich) {
    const head = base.slice(0, 10).filter((b) => b.company);
    await mapLimit(head, 4, async (b) => {
      const hit = await resolveCompany(b.company!);
      if (hit) {
        b.siren = hit.siren;
        b.company = hit.name; // canonical
        b.industry = [hit.industry, hit.city].filter(Boolean).join(' · ') || null;
      }
    });
  }

  return base
    .map((b) => ({
      id: b.id,
      company: b.company,
      siren: b.siren,
      industry: b.industry,
      amount: b.amount,
      round: b.round,
      title: b.title,
      url: b.url,
      source: b.source,
      date: b.date,
      score: scoreSignal(b.id, b._eur, b.date, Boolean(b.siren)),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Funding signals expressed as buying-intent rows, for the intent page.
export async function fundingIntent(limit = 8): Promise<IntentCompany[]> {
  const signals = await fundingSignalsReal('', limit + 6, { enrich: true });
  return signals
    .filter((s) => s.company) // need a named company to be actionable
    .slice(0, limit)
    .map((s) => {
      const urgency = s.date
        ? Math.max(55, 100 - Math.round((Date.now() - new Date(s.date).getTime()) / 86_400_000))
        : 70;
      return {
        id: `fund-${s.siren ?? s.id}`,
        name: s.company!,
        industry: s.industry || 'Recently funded',
        signals: [
          `Raised ${[s.amount, s.round].filter(Boolean).join(' · ') || 'new round'}`,
          s.title.slice(0, 80),
        ],
        intentScore: s.score,
        urgencyScore: Math.min(98, urgency),
        salesScore: seededScore(s.id + 'sales', 55, 95),
        action: 'Freshly funded — reach out while budget is being allocated',
      } satisfies IntentCompany;
    });
}

// Curated fallback (used only when the live feed errors or returns nothing).
export const FUNDING_SIGNALS_MOCK: FundingSignal[] = [
  { id: 'm1', company: 'Mistral AI', siren: null, industry: 'AI · Paris', amount: '450 M€', round: 'Série B', title: 'Mistral AI lève 450 M€ pour accélérer son développement', url: 'https://news.google.com/search?q=Mistral+AI+lev%C3%A9e', source: 'Sample', date: null, score: 96 },
  { id: 'm2', company: 'Pennylane', siren: null, industry: 'Fintech · Paris', amount: '40 M€', round: 'Série C', title: 'Pennylane lève 40 M€ pour sa plateforme de gestion financière', url: 'https://news.google.com/search?q=Pennylane+lev%C3%A9e', source: 'Sample', date: null, score: 88 },
  { id: 'm3', company: 'Ledger', siren: null, industry: 'Crypto · Paris', amount: '100 M€', round: 'Série C', title: 'Ledger boucle un tour de table de 100 M€', url: 'https://news.google.com/search?q=Ledger+lev%C3%A9e', source: 'Sample', date: null, score: 90 },
];
