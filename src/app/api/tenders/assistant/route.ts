import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { consumeSearch } from '@/lib/usage';
import { complete } from '@/lib/ai';
import { parseProfile, profilePromptContext } from '@/lib/profile';

const SYSTEM =
  `You are a French public-procurement bid consultant helping a foreign company decide on and respond to a tender. ` +
  `Base your analysis ONLY on the tender details and the company profile provided — do NOT invent award criteria, ` +
  `budgets or requirements that aren't given; where information is missing, tell the user to verify it on the official ` +
  `notice. Be concrete and practical. Reply in the user's language.\n\n` +
  `Structure the answer in markdown with these sections:\n` +
  `## Go / No-Go — a clear recommendation with 2-3 reasons based on fit with the company profile\n` +
  `## Fit analysis — how the company's product/sector matches this buyer and tender\n` +
  `## Eligibility & documents checklist — typical French public-procurement requirements to prepare (e.g. DUME/ESPD, ` +
  `financial capacity, references, certificates), flagged as "to confirm on the notice"\n` +
  `## Response outline — the sections a compelling bid should contain\n` +
  `## Draft cover letter — a short, ready-to-adapt letter of intent to the buyer\n` +
  `## Deadline & next steps — what to do now given the deadline`;

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const tn = body?.tender ?? {};
  const title = String(tn.title ?? '').slice(0, 300);
  if (!title) return NextResponse.json({ error: 'no_tender' }, { status: 400 });

  const quota = await consumeSearch(user.id, user.plan, 'tender-assistant', title);
  if (!quota.ok) return NextResponse.json({ error: 'quota_exceeded', limit: quota.limit }, { status: 429 });

  const locale = typeof body?.locale === 'string' ? body.locale : user.locale;
  const profileCtx = profilePromptContext(parseProfile(user));

  const tenderBlock = [
    `Tender title: ${title}`,
    tn.buyer ? `Buyer: ${tn.buyer}` : '',
    tn.deadline ? `Deadline: ${tn.deadline}` : '',
    tn.region ? `Region/dept: ${tn.region}` : '',
    tn.source ? `Source: ${String(tn.source).toUpperCase()}` : '',
    tn.url ? `Official notice: ${tn.url}` : '',
  ].filter(Boolean).join('\n');

  const userPrompt =
    (profileCtx ? profileCtx + '\n\n' : '') +
    `Analyze this French public tender for the company and produce the response assistant document.\n\n[Tender]\n${tenderBlock}`;

  try {
    const markdown = await complete([{ role: 'user', content: userPrompt }], SYSTEM, locale);
    return NextResponse.json({ markdown });
  } catch (e) {
    return NextResponse.json({ error: 'source_error', message: String(e) }, { status: 502 });
  }
}
