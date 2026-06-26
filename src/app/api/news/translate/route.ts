import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { consumeTranslate } from '@/lib/usage';
import { rateLimit } from '@/lib/rate-limit';
import { translateBatchCached } from '@/lib/translation-cache';

// Translates headline titles into the target locale. Has its own (plan-based)
// daily budget plus a short-window burst limit, since each call hits the LLM.
// When limited we degrade gracefully by returning the original titles so the
// UI just shows the source language instead of erroring.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const titles: string[] = Array.isArray(body?.titles) ? body.titles.slice(0, 30) : [];
  const target = String(body?.target ?? '');
  if (!titles.length) return NextResponse.json({ translations: [] });

  // Burst limit: max 15 translate calls per minute per user.
  if (!rateLimit(`translate:${user.id}`, 15, 60_000)) {
    return NextResponse.json({ translations: titles, limited: 'rate' });
  }

  // Daily budget (tight for free accounts).
  const quota = await consumeTranslate(user.id, user.plan);
  if (!quota.ok) {
    return NextResponse.json({ translations: titles, limited: 'quota', limit: quota.limit });
  }

  const translations = await translateBatchCached(titles, target);
  return NextResponse.json({ translations });
}
