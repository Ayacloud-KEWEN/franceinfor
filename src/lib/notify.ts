import 'server-only';

// Admin notification channel.
//
// Email delivery is intentionally not wired yet: notifications are logged to
// the server console (and persisted as Event rows by the caller). To turn on
// real email later, implement `sendEmail` below (e.g. Resend or SMTP) and it
// will start delivering without touching call sites.

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'fdcaptain@gmail.com';

async function sendEmail(_to: string, _subject: string, _body: string): Promise<boolean> {
  // Not configured yet — return false so callers know it only logged.
  // Future: const r = new Resend(process.env.RESEND_API_KEY); await r.emails.send(...)
  return false;
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
