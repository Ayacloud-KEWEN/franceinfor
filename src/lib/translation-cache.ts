import 'server-only';
import { createHash } from 'crypto';
import { prisma } from './prisma';
import { translateBatch } from './ai';

const keyFor = (target: string, source: string) =>
  createHash('sha1').update(`${target}${source}`).digest('hex');

// Translate with a persistent DB cache. Only uncached strings are sent to the
// LLM; results are stored and reused forever (source headlines are immutable),
// so the same titles are never re-translated across users or page loads.
export async function translateBatchCached(texts: string[], target: string): Promise<string[]> {
  if (!texts.length) return [];
  if (target === 'fr') return texts; // source is already French

  const keys = texts.map((t) => keyFor(target, t));

  const cached = new Map<string, string>();
  try {
    const rows = await prisma.translation.findMany({ where: { id: { in: keys } } });
    for (const r of rows) cached.set(r.id, r.text);
  } catch {
    /* cache read failed — fall through to translating */
  }

  // Unique misses only (a batch can repeat a title).
  const missTexts: string[] = [];
  const seen = new Set<string>();
  texts.forEach((t, i) => {
    const k = keys[i];
    if (!cached.has(k) && !seen.has(k)) {
      seen.add(k);
      missTexts.push(t);
    }
  });

  if (missTexts.length) {
    const translated = await translateBatch(missTexts, target);
    const toStore: { id: string; target: string; text: string }[] = [];
    missTexts.forEach((src, j) => {
      const text = translated[j] ?? src;
      const k = keyFor(target, src);
      cached.set(k, text);
      // Don't cache failures/no-ops (identity) so they can be retried later
      // once the LLM is reachable/configured.
      if (text !== src) toStore.push({ id: k, target, text });
    });
    if (toStore.length) {
      try {
        await prisma.translation.createMany({ data: toStore, skipDuplicates: true });
      } catch {
        /* best-effort cache write */
      }
    }
  }

  return texts.map((t, i) => cached.get(keys[i]) ?? t);
}
