import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { consumeSearch } from '@/lib/usage';
import { matchFunding } from '@/lib/sources/aides';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const profile = {
    sector: String(body?.sector ?? '').slice(0, 80),
    stage: String(body?.stage ?? '').slice(0, 40),
    region: String(body?.region ?? '').slice(0, 80),
    need: String(body?.need ?? '').slice(0, 40),
  };

  const quota = await consumeSearch(user.id, user.plan, 'aides', JSON.stringify(profile));
  if (!quota.ok)
    return NextResponse.json({ error: 'quota_exceeded', limit: quota.limit }, { status: 429 });

  const { results, source } = await matchFunding(profile);
  return NextResponse.json({ results, source });
}
