import 'server-only';

// Lightweight in-memory sliding-window rate limiter. Adequate for a single
// pm2 process; resets on restart and is not shared across instances (fine for
// this app's scale — put Cloudflare/Redis in front if you ever scale out).
const buckets = new Map<string, number[]>();
let lastSweep = Date.now();

// Returns true if the action is allowed (and records it), false if over limit.
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();

  // Occasional cleanup so the map can't grow unbounded.
  if (now - lastSweep > 60_000) {
    for (const [k, arr] of buckets) {
      const kept = arr.filter((t) => now - t < windowMs);
      if (kept.length === 0) buckets.delete(k);
      else buckets.set(k, kept);
    }
    lastSweep = now;
  }

  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}

// Best-effort client IP from common proxy headers (CloudPanel/nginx sets these).
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}
