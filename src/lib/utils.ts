import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number | null | undefined) {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US').format(n);
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
