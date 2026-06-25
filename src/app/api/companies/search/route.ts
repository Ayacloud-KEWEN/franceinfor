import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { consumeSearch } from '@/lib/usage';
import { searchCompanies } from '@/lib/sources/recherche-entreprises';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const q = req.nextUrl.searchParams.get('q')?.trim() || '';
  const page = Number(req.nextUrl.searchParams.get('page') || '1');
  if (!q) return NextResponse.json({ results: [], total: 0 });

  const quota = await consumeSearch(user.id, user.plan, 'companies', q);
  if (!quota.ok) {
    return NextResponse.json(
      { error: 'quota_exceeded', limit: quota.limit },
      { status: 429 }
    );
  }

  try {
    const data = await searchCompanies(q, page);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: 'source_error', message: String(e) },
      { status: 502 }
    );
  }
}
