import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { translateBatch } from '@/lib/ai';

// Translates headline titles into the target locale. Not counted against the
// search quota (it's a UI convenience, not a data query).
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const titles: string[] = Array.isArray(body?.titles) ? body.titles.slice(0, 30) : [];
  const target = String(body?.target ?? '');
  if (!titles.length) return NextResponse.json({ translations: [] });

  const translations = await translateBatch(titles, target);
  return NextResponse.json({ translations });
}
