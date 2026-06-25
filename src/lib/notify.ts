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
