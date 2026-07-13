import 'server-only';

// Admin notification channel.
//
// Email delivery goes through Resend when RESEND_API_KEY is set; otherwise
// notifications fall back to the server console (and are always persisted as
// Event rows by the caller). No call site needs to change to toggle email.

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'fdcaptain@gmail.com';

// Sends via Resend when RESEND_API_KEY is set; otherwise returns false so
// callers fall back to logging. From address must be on a Resend-verified
// domain in production (onboarding@resend.dev works for testing).
async function sendEmail(to: string, subject: string, body: string, html?: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const from = process.env.RESEND_FROM || 'FranceGo <onboarding@resend.dev>';
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to, subject, text: body, ...(html ? { html } : {}) }),
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

// A captured service inquiry (lead). Kept in sync with the Lead model fields
// the operator needs to act on the inquiry.
export interface LeadNotice {
  id: string;
  kind: string;
  name: string;
  email: string;
  company?: string | null;
  message?: string | null; // may carry an offer tag like "[LANDING PACK] ..."
  locale?: string | null;
  userEmail?: string | null; // logged-in account that submitted, if any
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
}

// Notify the operator of a new lead with an actionable, well-formatted email
// (plus a plain-text fallback) and a deep link into the admin console. Falls
// back to console logging when email isn't configured. Never throws.
export async function notifyNewLead(lead: LeadNotice): Promise<void> {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://francego.fr').replace(/\/$/, '');
  const adminUrl = `${appUrl}/en/admin`;
  const who = lead.company ? `${lead.name} · ${lead.company}` : lead.name;
  const subject = `📩 New ${lead.kind} inquiry — ${who}`;

  const rows: [string, string][] = [
    ['Name', lead.name],
    ['Email', lead.email],
    ['Company', lead.company || '—'],
    ['Interest', lead.kind],
    ['Message', lead.message || '—'],
    ['Language', lead.locale || '—'],
    ['Account', lead.userEmail || '(not logged in)'],
  ];

  const text =
    rows.map(([k, v]) => `${k}: ${v}`).join('\n') + `\n\nManage: ${adminUrl}`;

  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px">
    <h2 style="margin:0 0 4px">📩 New ${esc(lead.kind)} inquiry</h2>
    <p style="margin:0 0 16px;color:#555">${esc(who)} just requested to be contacted.</p>
    <table style="border-collapse:collapse;width:100%;font-size:14px">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 10px;background:#f6f7f9;font-weight:600;white-space:nowrap;vertical-align:top">${esc(
              k
            )}</td><td style="padding:6px 10px;border-bottom:1px solid #eee">${
              k === 'Email'
                ? `<a href="mailto:${esc(v)}">${esc(v)}</a>`
                : esc(v)
            }</td></tr>`
        )
        .join('')}
    </table>
    <p style="margin:20px 0 0">
      <a href="${adminUrl}" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:9px 16px;border-radius:8px;font-weight:600">Open admin console →</a>
    </p>
  </div>`;

  try {
    const sent = await sendEmail(ADMIN_EMAIL, subject, text, html);
    if (!sent) console.log(`[notify:lead] ${subject}\n${text}`);
  } catch (e) {
    console.error('[notify:lead] failed:', (e as Error).message);
  }
}

// Email a specific user (e.g. password-reset link). Until sendEmail is wired,
// the message is logged server-side. Returns whether it was actually emailed.
export async function notifyEmail(to: string, subject: string, body: string, html?: string): Promise<boolean> {
  try {
    const sent = await sendEmail(to, subject, body, html);
    if (!sent) console.log(`[notify:email] to=${to} ${subject}\n${body}`);
    return sent;
  } catch (e) {
    console.error('[notify:email] failed:', (e as Error).message);
    return false;
  }
}
