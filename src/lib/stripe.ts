import 'server-only';
import Stripe from 'stripe';
import type { Plan } from '@prisma/client';

const key = process.env.STRIPE_SECRET_KEY || '';

// Null when not configured — callers degrade gracefully so the app keeps
// running without Stripe keys (e.g. before billing is set up in production).
export const stripe: Stripe | null = key ? new Stripe(key) : null;

export function stripeConfigured(): boolean {
  return Boolean(stripe);
}

// Map our paid plans to Stripe Price IDs (set in env from the Stripe dashboard).
export const PLAN_PRICE: Partial<Record<Plan, string | undefined>> = {
  PROFESSIONAL: process.env.STRIPE_PRICE_PROFESSIONAL,
  BUSINESS: process.env.STRIPE_PRICE_BUSINESS,
};

export function priceForPlan(plan: Plan): string | undefined {
  return PLAN_PRICE[plan];
}

export function planForPrice(priceId: string | undefined): Plan | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_PROFESSIONAL) return 'PROFESSIONAL';
  if (priceId === process.env.STRIPE_PRICE_BUSINESS) return 'BUSINESS';
  return null;
}

// Plans that can be purchased via checkout (in display order).
export const PURCHASABLE_PLANS: Plan[] = ['PROFESSIONAL', 'BUSINESS'];
