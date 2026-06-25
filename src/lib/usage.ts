import 'server-only';
import { prisma } from './prisma';
import { PLAN_LIMITS } from './plans';
import type { Plan } from '@prisma/client';

export async function searchesUsedToday(userId: string): Promise<number> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return prisma.searchLog.count({
    where: { userId, createdAt: { gte: start } },
  });
}

// Translation is a UI convenience but still hits the LLM, so it gets its own
// (smaller, plan-based) daily budget — much tighter for free accounts to stop
// a free user from scripting it to burn LLM spend.
export const TRANSLATE_DAILY: Record<Plan, number> = {
  FREE: 30,
  PROFESSIONAL: 300,
  BUSINESS: 2000,
  ENTERPRISE: Number.MAX_SAFE_INTEGER,
};

/** Per-day translate budget. Counts module='translate' rows separately so it
 *  doesn't eat into the main search quota. */
export async function consumeTranslate(
  userId: string,
  plan: Plan
): Promise<{ ok: true } | { ok: false; limit: number }> {
  const limit = TRANSLATE_DAILY[plan];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const used = await prisma.searchLog.count({
    where: { userId, module: 'translate', createdAt: { gte: start } },
  });
  if (used >= limit) return { ok: false, limit };
  await prisma.searchLog.create({ data: { userId, module: 'translate', query: '' } });
  return { ok: true };
}

/** Returns { ok } or { ok:false, limit } when quota exceeded. Logs on success. */
export async function consumeSearch(
  userId: string,
  plan: Plan,
  module: string,
  query: string
): Promise<{ ok: true } | { ok: false; limit: number }> {
  const limit = PLAN_LIMITS[plan].searchesPerDay;
  const used = await searchesUsedToday(userId);
  if (used >= limit) return { ok: false, limit };
  await prisma.searchLog.create({ data: { userId, module, query } });
  return { ok: true };
}
