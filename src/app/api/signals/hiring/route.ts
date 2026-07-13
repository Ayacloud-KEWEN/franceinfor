import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { consumeSearch } from '@/lib/usage';
import { fetchHiringSignals, hiringSignalsConfigured } from '@/lib/sources/hiring-signals';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const query = String(body?.query ?? '').slice(0, 80);

  if (!hiringSignalsConfigured()) {
    return NextResponse.json({ results: [], configured: false });
  }

  const quota = await consumeSearch(user.id, user.plan, 'signals-hiring', query);
  if (!quota.ok)
    return NextResponse.json({ error: 'quota_exceeded', limit: quota.limit }, { status: 429 });

  try {
    const results = await fetchHiringSignals(query);
    return NextResponse.json({ results, configured: true, source: 'live' });
  } catch (e) {
    return NextResponse.json({ error: 'source_error', message: String(e) }, { status: 502 });
  }
}
