import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { recordEvent } from '@/lib/events';
import type { LeadKind } from '@prisma/client';

const KINDS: LeadKind[] = ['COMPANY', 'BRAND', 'OTHER'];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = String(body?.name || '').trim();
  const email = String(body?.email || '').trim().toLowerCase();
  const company = String(body?.company || '').trim() || null;
  const message = String(body?.message || '').trim() || null;
  const locale = String(body?.locale || 'en');
  const kind: LeadKind = KINDS.includes(body?.kind) ? body.kind : 'OTHER';

  if (!name || !email || !/.+@.+\..+/.test(email)) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  // Attach the submitter's account if they're logged in.
  const user = await getCurrentUser();

  const lead = await prisma.lead.create({
    data: { kind, name, email, company, message, locale, userId: user?.id, userEmail: user?.email },
  });

  await recordEvent('LEAD_CREATED', {
    userId: user?.id,
    email,
    meta: { leadId: lead.id, kind, company },
  });

  return NextResponse.json({ ok: true });
}
