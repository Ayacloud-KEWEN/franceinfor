import { NextRequest, NextResponse } from 'next/server';
import { indexPending } from '@/lib/knowledge';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

// L2 indexing: chunk + embed ACTIVE raw documents into the vector store.
// Run after /api/cron/ingest, on the same CRON_SECRET.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET || '';
  const provided =
    req.nextUrl.searchParams.get('key') ||
    (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const result = await indexPending();
  return NextResponse.json({ ok: true, ...result });
}
