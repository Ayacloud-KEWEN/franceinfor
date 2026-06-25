// Dashboard headline metrics — all derived from the live data the page already
// fetches (France news classification, BOAMP tenders, buying intent). No random
// placeholders: every number here is a documented function of real signals.
import type { LiveNewsItem, SignalType } from './sources/news';
import type { TenderResult } from './sources/boamp';
import type { IntentCompany } from './data/modules';

export interface DashboardInputs {
  news: LiveNewsItem[];
  tenders: { results: TenderResult[]; total: number };
  intent: IntentCompany[];
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const pct = (x: number) => Math.round(clamp01(x) * 100);

// Count news items by their classified signal type.
export function signalCounts(news: LiveNewsItem[]): Record<SignalType, number> {
  const c: Record<SignalType, number> = {
    Buying: 0, Tender: 0, Partnership: 0, Investment: 0, Expansion: 0, Risk: 0,
  };
  for (const n of news) c[n.signalType]++;
  return c;
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/**
 * Opportunity score (0–100): how good *today* looks for finding business.
 * Weighted blend of four real, normalised components:
 *   30% opportunity volume (news + open tenders, saturating around 60)
 *   25% active buyers      (live BOAMP buyers + funded firms, ~25)
 *   20% funding momentum   (investment-classified news, ~8)
 *   25% feed quality       (avg per-headline opportunity score)
 */
export function opportunityScore({ news, tenders, intent }: DashboardInputs): number {
  const counts = signalCounts(news);
  const volume = clamp01((news.length + tenders.results.length) / 60);
  const buyers = clamp01(intent.length / 25);
  const funding = clamp01(counts.Investment / 8);
  const quality = (news.length ? mean(news.map((n) => n.opportunityScore)) : 60) / 100;
  return pct(0.3 * volume + 0.25 * buyers + 0.2 * funding + 0.25 * quality);
}

/**
 * Market activity (0–100): how busy the French market is right now.
 * Weighted blend of: open tenders returned (35%), fresh news volume (25%),
 * active buyers (20%), funding momentum (20%).
 */
export function marketActivity({ news, tenders, intent }: DashboardInputs): number {
  const counts = signalCounts(news);
  const tenderSig = clamp01(tenders.results.length / 40);
  const newsVol = clamp01(news.length / 24);
  const intentVol = clamp01(intent.length / 25);
  const fundingVol = clamp01(counts.Investment / 8);
  return pct(0.35 * tenderSig + 0.25 * newsVol + 0.2 * intentVol + 0.2 * fundingVol);
}

// Nearest upcoming tender deadline (days), for an urgency hint. Null if none.
export function soonestTenderDeadline(tenders: TenderResult[]): number | null {
  let soonest: number | null = null;
  for (const t of tenders) {
    if (!t.deadline) continue;
    const d = Math.round((new Date(t.deadline).getTime() - Date.now()) / 86_400_000);
    if (Number.isNaN(d) || d < 0) continue;
    soonest = soonest == null ? d : Math.min(soonest, d);
  }
  return soonest;
}
