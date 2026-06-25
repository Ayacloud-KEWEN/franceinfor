import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import type { ItemType, Stage } from '@prisma/client';

const TYPES: ItemType[] = ['COMPANY', 'TENDER', 'OPPORTUNITY', 'CONTACT'];
const STAGES: Stage[] = ['LEAD', 'CONTACTED', 'NEGOTIATING', 'WON', 'LOST'];

// List the current user's saved items (newest first).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const items = await prisma.savedItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ items });
}

// Save (upsert) an item. Idempotent on (user, type, refId).
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const type = body?.type as ItemType;
  const refId = String(body?.refId || '').trim();
  const label = String(body?.label || '').trim();
  if (!TYPES.includes(type) || !refId || !label) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  const item = await prisma.savedItem.upsert({
    where: { userId_type_refId: { userId: user.id, type, refId } },
    create: { userId: user.id, type, refId, label, data: body?.data ?? {} },
    update: {}, // already saved — no-op
  });
  return NextResponse.json({ saved: true, item });
}

// Update CRM fields (stage / note / tags) on a saved item.
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const id = String(body?.id || '');
  if (!id) return NextResponse.json({ error: 'invalid_input' }, { status: 400 });

  const data: { stage?: Stage; note?: string | null; tags?: string[] } = {};
  if (body?.stage !== undefined) {
    if (!STAGES.includes(body.stage)) return NextResponse.json({ error: 'invalid_stage' }, { status: 400 });
    data.stage = body.stage;
  }
  if (body?.note !== undefined) data.note = String(body.note || '').trim() || null;
  if (body?.tags !== undefined && Array.isArray(body.tags)) {
    data.tags = body.tags.map((t: unknown) => String(t).trim()).filter(Boolean).slice(0, 20);
  }

  // Scope to the owner so users can't edit others' items.
  const res = await prisma.savedItem.updateMany({ where: { id, userId: user.id }, data });
  if (res.count === 0) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}

// Remove a saved item by id, or by (type, refId).
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const type = url.searchParams.get('type') as ItemType | null;
  const refId = url.searchParams.get('refId');

  if (id) {
    await prisma.savedItem.deleteMany({ where: { id, userId: user.id } });
  } else if (type && TYPES.includes(type) && refId) {
    await prisma.savedItem.deleteMany({ where: { userId: user.id, type, refId } });
  } else {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }
  return NextResponse.json({ removed: true });
}
