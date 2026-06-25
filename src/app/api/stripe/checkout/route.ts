import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe, priceForPlan } from '@/lib/stripe';
import type { Plan } from '@prisma/client';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!stripe) return NextResponse.json({ error: 'billing_unconfigured' }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const plan = body?.plan as Plan;
  const price = priceForPlan(plan);
  if (!price) return NextResponse.json({ error: 'invalid_plan' }, { status: 400 });

  // Ensure a Stripe customer exists for this user.
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${appUrl}/${user.locale}/settings?billing=success`,
    cancel_url: `${appUrl}/${user.locale}/settings?billing=cancel`,
  });

  return NextResponse.json({ url: session.url });
}
