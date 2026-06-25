import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe, planForPrice } from '@/lib/stripe';
import type Stripe from 'stripe';

// Period end moved from Subscription top-level to subscription items in the
// 2025-03-31 (basil) API version. Read it defensively from either location.
function periodEnd(sub: Stripe.Subscription): Date | undefined {
  // The field is absent from the v17 (acacia) SDK types but present at runtime
  // on the account's newer API version, so read both spots through a cast.
  const item = sub.items?.data?.[0] as unknown as { current_period_end?: number } | undefined;
  const ts =
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    item?.current_period_end;
  return ts ? new Date(ts * 1000) : undefined;
}

// Stripe sends raw JSON; we must verify the signature against the raw body.
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
  if (!stripe || !secret)
    return NextResponse.json({ error: 'billing_unconfigured' }, { status: 503 });

  const sig = req.headers.get('stripe-signature') || '';
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    return NextResponse.json({ error: `invalid_signature: ${(e as Error).message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session;
        const userId = s.client_reference_id;
        const subId = typeof s.subscription === 'string' ? s.subscription : s.subscription?.id;
        const customerId = typeof s.customer === 'string' ? s.customer : s.customer?.id;
        if (userId && subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          const priceId = sub.items.data[0]?.price?.id;
          const plan = planForPrice(priceId) ?? 'FREE';
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan,
              stripeCustomerId: customerId ?? undefined,
              stripeSubscriptionId: subId,
              subscriptionStatus: sub.status,
              currentPeriodEnd: periodEnd(sub),
            },
          });
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
        const deleted = event.type === 'customer.subscription.deleted';
        const priceId = sub.items.data[0]?.price?.id;
        const plan = deleted ? 'FREE' : planForPrice(priceId) ?? 'FREE';
        const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan,
              subscriptionStatus: deleted ? 'canceled' : sub.status,
              currentPeriodEnd: periodEnd(sub),
            },
          });
        }
        break;
      }
    }
  } catch (e) {
    return NextResponse.json({ error: `handler_error: ${(e as Error).message}` }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
