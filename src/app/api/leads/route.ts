import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { recordEvent } from '@/lib/events';
import { notifyNewLead } from '@/lib/notify';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import type { LeadKind } from '@prisma/client';

const KINDS: LeadKind[] = ['COMPANY', 'BRAND', 'OTHER'];

// This endpoint is intentionally public (the value-added service form is shown
// to logged-out visitors too), so it carries its own anti-abuse defenses:
// a honeypot field plus per-IP / per-email rate limits.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = String(body?.name || '').trim();
  const email = String(body?.email || '').trim().toLowerCase();
  const company = String(body?.company || '').trim() || null;
  const message = String(body?.message || '').trim() || null;
  const locale = String(body?.locale || 'en');
  const kind: LeadKind = KINDS.includes(body?.kind) ? body.kind : 'OTHER';

  // Honeypot: real users never see/fill `website`. Bots that auto-fill all
  // fields do. Pretend success so they don't learn they were filtered.
  if (String(body?.website || '').trim()) {
    return NextResponse.json({ ok: true });
  }

  if (!name || !email || !/.+@.+\..+/.test(email)) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  // Rate limit: max 3 submissions / 10 min per IP, and 3 / hour per email.
  const ip = clientIp(req);
  const [ipOk, emailOk] = await Promise.all([
    rateLimit(`lead:ip:${ip}`, 3, 10 * 60_000),
    rateLimit(`lead:email:${email}`, 3, 60 * 60_000),
  ]);
  if (!ipOk || !emailOk) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  // Attach the submitter's account if they're logged in.
  const user = await getCurrentUser();

  const lead = await prisma.lead.create({
    data: { kind, name, email, company, message, locale, userId: user?.id, userEmail: user?.email },
  });

  // Audit trail (also pings admin generically for other event types).
  await recordEvent('LEAD_CREATED', {
    userId: user?.id,
    email,
    meta: { leadId: lead.id, kind, company },
  });

  // Rich, actionable lead notification (supersedes the generic ping).
  await notifyNewLead({
    id: lead.id,
    kind,
    name,
    email,
    company,
    message,
    locale,
    userEmail: user?.email,
  });

  return NextResponse.json({ ok: true });
}
