import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin';
import { checkUrls } from '@/lib/link-check';

// Admin-only: live reachability check for reference URLs in a playbook draft.
export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = await req.json().catch(() => null);
  const urls = Array.isArray(body?.urls) ? body.urls.map(String) : [];
  const results = await checkUrls(urls);
  return NextResponse.json({ results });
}
