// Investment / funding signals (M-fund): companies that just raised money have
// fresh budget — one of the strongest concrete buying signals. Keyless: reuses
// the Google News RSS layer with fundraising-tuned French queries, then parses
// the company, amount and round out of each headline. Falls back to a small
// curated sample on error/empty.
import { fetchFranceNews } from './news';
import { seededScore } from '../utils';

export interface FundingSignal {
  id: string;
  company: string | null;
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

// Normalise a raised amount to euros for scoring.
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
  // Tidy display (e.g. "15 M€").
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
  const m = title.match(/^(.*?)\s+(?:l[èe]ve|l[èe]vent|r[ée]alise|boucle|signe|annonce|finalise|cl[ôo]ture)\b/i);
  if (!m) return null;
  let c = m[1].trim();
  // Strip a leading section/city prefix like "Numérique. " or "Palaiseau : ".
  c = c.replace(/^[A-ZÀ-Ÿ][\wÀ-ÿ'’-]{1,18}\s*[:.]\s+/, '');
  // Drop common leading qualifiers.
  c = c.replace(/^(la\s+(start-?up|soci[ée]t[ée]|p[ée]pite|fintech|biotech|scale-?up)|le\s+groupe|la\s+jeune\s+pousse|start-?up|le\s+fran[çc]ais|la\s+fran[çc]aise)\s+/i, '');
  // Cut descriptive clauses ("AMI, une startup …" → "AMI").
  c = c.split(/[,(]/)[0].trim();
  if (c.length < 2 || c.length > 50) return null;
  return c;
}

function scoreSignal(id: string, eur: number | null, date: string | null): number {
  let s = eur ? Math.min(40, Math.round(Math.log10(eur) * 5)) : 12; // size component
  if (date) {
    const days = (Date.now() - new Date(date).getTime()) / 86_400_000;
    if (days <= 7) s += 18;
    else if (days <= 30) s += 12;
    else if (days <= 90) s += 6;
  }
  return Math.max(45, Math.min(98, 50 + s + (seededScore(id, 0, 10))));
}

export async function fundingSignalsReal(query = '', limit = 30): Promise<FundingSignal[]> {
  const q = query.trim() ? `${query} levée de fonds France` : FUNDING_QUERY;
  const news = await fetchFranceNews(q, limit);

  const signals = news
    // Keep items that look like a fundraising/investment story.
    .filter((n) => n.signalType === 'Investment' || /lev[ée]e|l[èe]ve|s[ée]rie|fonds|million|financement/i.test(n.title))
    .map((n) => {
      const amt = parseAmount(n.title);
      return {
        id: n.id,
        company: parseCompany(n.title),
        amount: amt?.text ?? null,
        round: parseRound(n.title),
        title: n.title,
        url: n.url,
        source: n.source,
        date: n.date,
        score: scoreSignal(n.id, amt?.eur ?? null, n.date),
      } satisfies FundingSignal;
    })
    .sort((a, b) => b.score - a.score);

  return signals.slice(0, limit);
}

// Curated fallback (used only when the live feed errors or returns nothing).
export const FUNDING_SIGNALS_MOCK: FundingSignal[] = [
  { id: 'm1', company: 'Mistral AI', amount: '450 M€', round: 'Série B', title: 'Mistral AI lève 450 M€ pour accélérer son développement', url: 'https://news.google.com/search?q=Mistral+AI+lev%C3%A9e', source: 'Sample', date: null, score: 96 },
  { id: 'm2', company: 'Pennylane', amount: '40 M€', round: 'Série C', title: 'Pennylane lève 40 M€ pour sa plateforme de gestion financière', url: 'https://news.google.com/search?q=Pennylane+lev%C3%A9e', source: 'Sample', date: null, score: 88 },
  { id: 'm3', company: 'Ledger', amount: '100 M€', round: 'Série C', title: 'Ledger boucle un tour de table de 100 M€', url: 'https://news.google.com/search?q=Ledger+lev%C3%A9e', source: 'Sample', date: null, score: 90 },
];
