import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

// Stripe Billing Portal — lets the customer manage / cancel their subscription.
export async function POST(_req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!stripe) return NextResponse.json({ error: 'billing_unconfigured' }, { status: 503 });
  if (!user.stripeCustomerId)
    return NextResponse.json({ error: 'no_customer' }, { status: 400 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl}/${user.locale}/settings`,
  });

  return NextResponse.json({ url: session.url });
}
