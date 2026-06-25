// Event Intelligence (M10): the events are real recurring French trade shows;
// enrich each with live Google News buzz (recent headline + mention count).
import { EVENTS, type BizEvent } from '../data/modules';
import { fetchFranceNews } from './news';

export interface EnrichedEvent extends BizEvent {
  buzz: number; // recent news mentions
  latestHeadline: string | null;
  headlineUrl: string | null;
  live: boolean;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Fetch live news buzz only for the top `withBuzz` events (by base match score)
// to avoid throttling Google News with too many simultaneous requests.
export async function getEventsWithBuzz(withBuzz = 6): Promise<EnrichedEvent[]> {
  const ranked = [...EVENTS].sort((a, b) => b.matchScore - a.matchScore);

  const enriched = await Promise.all(
    ranked.map(async (e, idx) => {
      if (idx >= withBuzz) {
        return { ...e, buzz: 0, latestHeadline: null, headlineUrl: null, live: false };
      }
      try {
        await sleep(idx * 400); // stagger to avoid RSS throttling
        const news = await fetchFranceNews(`${e.name} ${e.city}`);
        const top = news[0];
        const buzz = news.length;
        const matchScore = Math.min(99, e.matchScore + Math.min(8, buzz));
        return {
          ...e,
          matchScore,
          buzz,
          latestHeadline: top?.title ?? null,
          headlineUrl: top?.url ?? null,
          live: buzz > 0,
        } satisfies EnrichedEvent;
      } catch {
        return { ...e, buzz: 0, latestHeadline: null, headlineUrl: null, live: false };
      }
    })
  );
  return enriched.sort((a, b) => b.matchScore - a.matchScore);
}
