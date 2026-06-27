import { NextRequest, NextResponse } from 'next/server';
import { extractPending } from '@/lib/knowledge-graph';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// L2 knowledge-graph extraction: LLM extracts candidate entities/relationships
// from ACTIVE raw documents (CANDIDATE status, source-referenced, never
// invented). Run after /api/cron/index. Needs a configured LLM provider.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET || '';
  const provided =
    req.nextUrl.searchParams.get('key') ||
    (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const result = await extractPending();
  return NextResponse.json({ ok: true, ...result });
}
