import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin';
import { syncPlaybooksFromCode } from '@/lib/playbooks-db';

// Sync the git-defined playbooks into the DB (snapshots a new version on
// content change). Admin-only. Safe to call repeatedly.
export async function POST() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const result = await syncPlaybooksFromCode();
  return NextResponse.json({ ok: true, ...result });
}
