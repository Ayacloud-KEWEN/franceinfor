import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { consumeSearch } from '@/lib/usage';
import { searchTenders } from '@/lib/sources/boamp';
import { searchTedTenders } from '@/lib/sources/ted';
import { searchPlaceTenders } from '@/lib/sources/place';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const q = req.nextUrl.searchParams.get('q')?.trim() || '';
  const raw = req.nextUrl.searchParams.get('source');
  const source = raw === 'ted' || raw === 'place' ? raw : 'boamp';
  const limit = Math.min(100, Math.max(10, Number(req.nextUrl.searchParams.get('limit')) || 20));

  const quota = await consumeSearch(user.id, user.plan, `tenders:${source}`, q || '*');
  if (!quota.ok) {
    return NextResponse.json({ error: 'quota_exceeded', limit: quota.limit }, { status: 429 });
  }

  try {
    const data =
      source === 'ted'
        ? await searchTedTenders(q, limit)
        : source === 'place'
          ? await searchPlaceTenders(q, limit)
          : await searchTenders(q, limit);
    return NextResponse.json({ ...data, source });
  } catch (e) {
    return NextResponse.json({ error: 'source_error', message: String(e) }, { status: 502 });
  }
}
