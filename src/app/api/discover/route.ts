import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { consumeSearch } from '@/lib/usage';
import { discoverReal } from '@/lib/sources/discovery';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const input = {
    product: String(body?.product ?? '').slice(0, 120),
    industry: String(body?.industry ?? '').slice(0, 120),
    target: String(body?.target ?? '').slice(0, 120),
  };

  const quota = await consumeSearch(user.id, user.plan, 'discover', JSON.stringify(input));
  if (!quota.ok)
    return NextResponse.json({ error: 'quota_exceeded', limit: quota.limit }, { status: 429 });

  try {
    return NextResponse.json({ results: await discoverReal(input), source: 'live' });
  } catch (e) {
    return NextResponse.json({ error: 'source_error', message: String(e) }, { status: 502 });
  }
}
