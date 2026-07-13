import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number | null | undefined) {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US').format(n);
}

// Real keyword-relevance: share of the query's words (len ≥ 3) that appear in
// the given text, scaled to 0–100. Returns 0 for an empty query. Used to rank
// search results by actual term overlap instead of a fabricated score.
export function keywordRelevance(query: string, text: string): number {
  const terms = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length >= 3);
  if (!terms.length) return 0;
  const hay = text.toLowerCase();
  const hits = terms.filter((w) => hay.includes(w)).length;
  return Math.round((hits / terms.length) * 100);
}

// Deterministic pseudo-score from a string seed (used for demo scoring)
export function seededScore(seed: string, min = 40, max = 98) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  const range = max - min;
  return min + (Math.abs(h) % (range + 1));
}
