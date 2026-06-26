import 'server-only';

// Admin notification channel.
//
// Email delivery is intentionally not wired yet: notifications are logged to
// the server console (and persisted as Event rows by the caller). To turn on
// real email later, implement `sendEmail` below (e.g. Resend or SMTP) and it
// will start delivering without touching call sites.

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'fdcaptain@gmail.com';

// Sends via Resend when RESEND_API_KEY is set; otherwise returns false so
// callers fall back to logging. From address must be on a Resend-verified
// domain in production (onboarding@resend.dev works for testing).
async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const from = process.env.RESEND_FROM || 'FranceGo <onboarding@resend.dev>';
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to, subject, text: body }),
    });
    if (!res.ok) {
      console.error('[resend]', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (e) {
    console.error('[resend] failed:', (e as Error).message);
    return false;
  }
}

// Notify the site operator. Never throws — notification failure must not break
// the user-facing action that triggered it.
export async function notifyAdmin(subject: string, body: string): Promise<void> {
  try {
    const sent = await sendEmail(ADMIN_EMAIL, subject, body);
    if (!sent) {
      console.log(`[notify:admin] ${subject}\n${body}`);
    }
  } catch (e) {
    console.error('[notify:admin] failed:', (e as Error).message);
  }
}

// Email a specific user (e.g. password-reset link). Until sendEmail is wired,
// the message is logged server-side. Returns whether it was actually emailed.
export async function notifyEmail(to: string, subject: string, body: string): Promise<boolean> {
  try {
    const sent = await sendEmail(to, subject, body);
    if (!sent) console.log(`[notify:email] to=${to} ${subject}\n${body}`);
    return sent;
  } catch (e) {
    console.error('[notify:email] failed:', (e as Error).message);
    return false;
  }
}
