import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { consumeSearch } from '@/lib/usage';
import { searchBrands } from '@/lib/data/modules';
import { searchEuipoTrademarks } from '@/lib/sources/euipo';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const q = req.nextUrl.searchParams.get('q')?.trim() || '';
  if (!q) return NextResponse.json({ results: [] });

  const quota = await consumeSearch(user.id, user.plan, 'brands', q);
  if (!quota.ok)
    return NextResponse.json({ error: 'quota_exceeded', limit: quota.limit }, { status: 429 });

  // Real EUIPO data when configured; otherwise deterministic mock.
  try {
    const euipo = await searchEuipoTrademarks(q);
    if (euipo && euipo.length) {
      return NextResponse.json({ results: euipo, source: 'euipo' });
    }
  } catch {
    // fall through to mock on any EUIPO error
  }
  return NextResponse.json({ results: searchBrands(q), source: 'mock' });
}
