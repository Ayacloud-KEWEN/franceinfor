// Real Buying Intent (M9): public buyers with LIVE open tenders are, by
// definition, actively purchasing — the strongest concrete buying signal.
// Aggregates recent BOAMP tenders by buyer. Falls back to mock on error.
import { searchTenders } from './boamp';
import { fundingIntent } from './funding-signals';
import { hiringIntent } from './hiring-signals';
import { INTENT_COMPANIES, type IntentCompany } from '../data/modules';
import { seededScore } from '../utils';

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr).getTime();
  if (Number.isNaN(d)) return null;
  return Math.round((d - Date.now()) / (1000 * 3600 * 24));
}

export async function buyingIntentReal(query = '', limit = 100): Promise<IntentCompany[]> {
  const { results } = await searchTenders(query, limit);

  // Group live tenders by buyer.
  const byBuyer = new Map<string, { titles: string[]; soonest: number | null; region: string | null }>();
  for (const t of results) {
    const buyer = (t.buyer || '').trim();
    if (!buyer) continue;
    const entry = byBuyer.get(buyer) ?? { titles: [], soonest: null, region: t.region };
    if (t.title) entry.titles.push(t.title);
    const d = daysUntil(t.deadline);
    if (d != null && d >= 0) entry.soonest = entry.soonest == null ? d : Math.min(entry.soonest, d);
    byBuyer.set(buyer, entry);
  }

  const tenderItems: IntentCompany[] = [...byBuyer.entries()].map(([buyer, info]) => {
    const count = info.titles.length;
    // Intent grows with the number of live tenders.
    const intentScore = Math.min(98, 68 + count * 6);
    // Urgency from the nearest deadline (sooner = higher).
    const urgencyScore =
      info.soonest == null ? 60 : Math.max(40, Math.min(98, 100 - info.soonest));
    return {
      id: buyer.slice(0, 40),
      name: buyer,
      industry: info.region ? `Public sector · ${info.region}` : 'Public procurement',
      signals: info.titles.slice(0, 2).map((t) => `Open tender: ${t.slice(0, 70)}`),
      intentScore,
      urgencyScore,
      salesScore: seededScore(buyer + 'sales', 55, 95),
      action: 'Review the open tender(s) and engage the buyer’s procurement team',
    } satisfies IntentCompany;
  });

  // Blend three concrete buying signals on the same 0–100 scale:
  //  · public procurement (open tenders, above)
  //  · private budget (fresh fundraising)
  //  · expansion (hiring surge from France Travail)
  const [fundItems, hireItems] = await Promise.all([
    fundingIntent(8).catch(() => [] as IntentCompany[]),
    hiringIntent(6).catch(() => [] as IntentCompany[]),
  ]);

  const items = [...tenderItems, ...fundItems, ...hireItems]
    .sort((a, b) => b.intentScore - a.intentScore)
    .slice(0, 30);

  if (!items.length) return INTENT_COMPANIES;
  return items;
}
