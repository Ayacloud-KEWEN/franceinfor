import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { consumeSearch } from '@/lib/usage';
import { complete } from '@/lib/ai';
import { parseProfile, profilePromptContext } from '@/lib/profile';

const SYSTEM =
  `You draft a GDPR-compliant B2B outreach for a foreign company approaching a French business. ` +
  `Rules you MUST follow: address the COMPANY via its public/professional channels only (generic contact form, ` +
  `published business address, LinkedIn company page) — never invent or target a named individual's personal email; ` +
  `keep it short, specific and value-first; write the email in FRENCH (professional register) regardless of the UI ` +
  `language; base the pitch ONLY on the provided company and profile data, never invent facts. ` +
  `Reply using markdown with these sections (section headings in the user's language, the email body in French):\n` +
  `## Why this company — 2-3 concrete reasons this is a relevant prospect (from the provided data)\n` +
  `## Outreach email (French) — subject line + a short professional email, with a clear soft call to action\n` +
  `## How to send it compliantly — which public channel to use, and a one-line GDPR note (B2B legitimate interest, ` +
  `offer an easy opt-out, no personal-data scraping)`;

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const co = body?.company ?? {};
  const name = String(co.name ?? '').slice(0, 200);
  if (!name) return NextResponse.json({ error: 'no_company' }, { status: 400 });

  const quota = await consumeSearch(user.id, user.plan, 'outreach', name);
  if (!quota.ok) return NextResponse.json({ error: 'quota_exceeded', limit: quota.limit }, { status: 429 });

  const locale = typeof body?.locale === 'string' ? body.locale : user.locale;
  const profileCtx = profilePromptContext(parseProfile(user));

  const companyBlock = [
    `Company: ${name}`,
    co.siren ? `SIREN: ${co.siren}` : '',
    co.industry ? `Activity: ${co.industry}` : '',
    co.city ? `Location: ${co.city}` : '',
    body?.context ? `Context/signal: ${String(body.context).slice(0, 200)}` : '',
  ].filter(Boolean).join('\n');

  const userPrompt =
    (profileCtx ? profileCtx + '\n\n' : '') +
    `Draft a compliant outreach to this French company on behalf of the user's business.\n\n[Target company]\n${companyBlock}`;

  try {
    const markdown = await complete([{ role: 'user', content: userPrompt }], SYSTEM, locale);
    return NextResponse.json({ markdown });
  } catch (e) {
    return NextResponse.json({ error: 'source_error', message: String(e) }, { status: 502 });
  }
}
