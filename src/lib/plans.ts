import type { Plan } from '@prisma/client';

export const PLAN_LIMITS: Record<Plan, { searchesPerDay: number; label: string; price: string }> = {
  FREE: { searchesPerDay: 10, label: 'Free', price: '0' },
  PROFESSIONAL: { searchesPerDay: 200, label: 'Professional', price: '99' },
  BUSINESS: { searchesPerDay: 1000, label: 'Business', price: '299' },
  ENTERPRISE: { searchesPerDay: Number.MAX_SAFE_INTEGER, label: 'Enterprise', price: 'Custom' },
};
