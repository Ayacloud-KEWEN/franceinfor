import 'server-only';
import { prisma } from './prisma';
import { notifyAdmin } from './notify';
import type { EventType, Prisma } from '@prisma/client';

// Record an audit event (surfaced in the admin console) and, for the
// noteworthy ones, ping the admin. Best-effort: never throws so it can't
// break the user action that triggered it.
export async function recordEvent(
  type: EventType,
  data: { userId?: string | null; email?: string | null; meta?: Prisma.InputJsonValue } = {}
): Promise<void> {
  try {
    await prisma.event.create({
      data: {
        type,
        userId: data.userId ?? undefined,
        email: data.email ?? undefined,
        meta: data.meta,
      },
    });
  } catch (e) {
    console.error('[events] persist failed:', (e as Error).message);
  }

  const subject = SUBJECTS[type];
  if (subject) {
    const who = data.email ? ` — ${data.email}` : '';
    const detail = data.meta ? `\n${JSON.stringify(data.meta)}` : '';
    await notifyAdmin(`${subject}${who}`, `${type}${who}${detail}`);
  }
}

const SUBJECTS: Partial<Record<EventType, string>> = {
  USER_REGISTERED: '🆕 New registration',
  PLAN_UPGRADED: '⬆️ Plan upgraded',
  PLAN_DOWNGRADED: '⬇️ Plan downgraded',
  SUBSCRIPTION_CANCELED: '❌ Subscription canceled',
  LEAD_CREATED: '📩 New service inquiry',
};
