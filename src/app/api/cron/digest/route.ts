import { NextRequest, NextResponse } from 'next/server';
import { sendDailyDigests } from '@/lib/digest';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Triggered once a day by an external scheduler (server crontab or GitHub
// Actions). Protected by CRON_SECRET — pass it as ?key= or a Bearer header.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET || '';
  const provided =
    req.nextUrl.searchParams.get('key') ||
    (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const result = await sendDailyDigests();
  return NextResponse.json({ ok: true, ...result });
}
