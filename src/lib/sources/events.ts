// Event Intelligence (M10): a curated list of real recurring French trade
// shows (lib/data/trade-shows.ts), each enriched with live Google News buzz
// (recent headline + mention count). No fabricated match/leads/value metrics —
// ranking is by the next upcoming edition, with a live-buzz nudge.
import { TRADE_SHOWS, type TradeShow } from '../data/trade-shows';
import { fetchFranceNews } from './news';

export interface EnrichedEvent extends TradeShow {
  nextDate: string; // ISO yyyy-mm of the next recurring edition
  buzz: number; // recent news mentions
  latestHeadline: string | null;
  headlineUrl: string | null;
  live: boolean;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Next occurrence (year-month) for a show that recurs in `month`. Biennial
// shows are approximated to the next year the month falls in the future.
function nextEdition(month: number): { iso: string; sortKey: number } {
  const now = new Date();
  const y = now.getFullYear();
  const thisYear = new Date(y, month - 1, 1);
  const target = thisYear >= new Date(y, now.getMonth(), 1) ? thisYear : new Date(y + 1, month - 1, 1);
  const iso = `${target.getFullYear()}-${String(month).padStart(2, '0')}`;
  return { iso, sortKey: target.getTime() };
}

function baseEnrich(e: TradeShow) {
  const { iso, sortKey } = nextEdition(e.month);
  return { ...e, nextDate: iso, sortKey, buzz: 0, latestHeadline: null, headlineUrl: null, live: false };
}

// Fetch live news buzz only for the `withBuzz` soonest events to avoid
// throttling Google News with too many simultaneous requests.
export async function getEventsWithBuzz(withBuzz = 6): Promise<EnrichedEvent[]> {
  const ranked = TRADE_SHOWS.map(baseEnrich).sort((a, b) => a.sortKey - b.sortKey);

  const enriched = await Promise.all(
    ranked.map(async (e, idx) => {
      if (idx >= withBuzz) {
        const { sortKey, ...rest } = e;
        return rest as EnrichedEvent;
      }
      try {
        await sleep(idx * 400); // stagger to avoid RSS throttling
        const news = await fetchFranceNews(`${e.name} ${e.city}`);
        const top = news[0];
        const { sortKey, ...rest } = e;
        return {
          ...rest,
          buzz: news.length,
          latestHeadline: top?.title ?? null,
          headlineUrl: top?.url ?? null,
          live: news.length > 0,
        } satisfies EnrichedEvent;
      } catch {
        const { sortKey, ...rest } = e;
        return rest as EnrichedEvent;
      }
    })
  );
  return enriched;
}

// Non-live fallback (no news enrichment), still real data.
export function getEventsFallback(): EnrichedEvent[] {
  return TRADE_SHOWS.map(baseEnrich)
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ sortKey, ...rest }) => rest as EnrichedEvent);
}
