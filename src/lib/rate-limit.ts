import 'server-only';
import Redis from 'ioredis';

// Rate limiter. Uses Redis when REDIS_URL is set (correct across multiple app
// instances), otherwise falls back to an in-memory sliding window (fine for a
// single process). Async because Redis is async.

// ---- Redis (shared, multi-instance) ----
let redis: Redis | null = null;
let redisDown = false;
function getRedis(): Redis | null {
  if (redisDown) return null;
  if (redis) return redis;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    redis = new Redis(url, { maxRetriesPerRequest: 1, lazyConnect: false, enableOfflineQueue: false });
    redis.on('error', () => { redisDown = true; }); // degrade silently to in-memory
    return redis;
  } catch {
    redisDown = true;
    return null;
  }
}

// ---- In-memory fallback (single process) ----
const buckets = new Map<string, number[]>();
let lastSweep = Date.now();
function memoryAllow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
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

// Returns true if the action is allowed (and records it), false if over limit.
// Fixed-window counter in Redis (atomic INCR + EXPIRE); fails open on errors.
export async function rateLimit(key: string, max: number, windowMs: number): Promise<boolean> {
  const r = getRedis();
  if (!r) return memoryAllow(key, max, windowMs);

  const windowSec = Math.ceil(windowMs / 1000);
  const bucket = Math.floor(Date.now() / windowMs);
  const redisKey = `rl:${key}:${bucket}`;
  try {
    const count = await r.incr(redisKey);
    if (count === 1) await r.expire(redisKey, windowSec);
    return count <= max;
  } catch {
    return memoryAllow(key, max, windowMs); // Redis hiccup → don't block users
  }
}

// Best-effort client IP from common proxy headers (CloudPanel/nginx sets these).
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}
