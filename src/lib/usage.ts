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
