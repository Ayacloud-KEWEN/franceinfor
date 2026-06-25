import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { consumeSearch } from '@/lib/usage';
import { fundingSignalsReal, FUNDING_SIGNALS_MOCK } from '@/lib/sources/funding-signals';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const query = String(body?.query ?? '').slice(0, 80);

  const quota = await consumeSearch(user.id, user.plan, 'signals', query);
  if (!quota.ok)
    return NextResponse.json({ error: 'quota_exceeded', limit: quota.limit }, { status: 429 });

  try {
    const results = await fundingSignalsReal(query);
    if (!results.length) return NextResponse.json({ results: FUNDING_SIGNALS_MOCK, source: 'mock' });
    return NextResponse.json({ results, source: 'live' });
  } catch {
    return NextResponse.json({ results: FUNDING_SIGNALS_MOCK, source: 'mock' });
  }
}
