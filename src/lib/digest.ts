import 'server-only';
import { prisma } from './prisma';
import { notifyEmail } from './notify';
import { fetchFranceNews } from './sources/news';
import { searchTenders } from './sources/boamp';
import { fundingSignalsReal } from './sources/funding-signals';
import type { User } from '@prisma/client';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://infr.europeanaialliance.org';

function matchesKeywords(text: string, keywords: string[]): boolean {
  if (!keywords.length) return true;
  const hay = text.toLowerCase();
  return keywords.some((k) => hay.includes(k.toLowerCase()));
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// Build the digest email for one user. Returns null when there's nothing
// relevant to send.
export async function buildDigest(
  user: Pick<User, 'name' | 'email' | 'locale' | 'digestKeywords'>
): Promise<{ subject: string; body: string } | null> {
  const kw = user.digestKeywords;

  const [news, tendersRes, funding] = await Promise.all([
    fetchFranceNews().catch(() => []),
    searchTenders('', 30).catch(() => ({ results: [], total: 0 })),
    fundingSignalsReal('', 12, { enrich: false }).catch(() => []),
  ]);

  const newsHits = news.filter((n) => matchesKeywords(n.title, kw)).slice(0, 6);
  const tenderHits = tendersRes.results.filter((t) => matchesKeywords(`${t.title} ${t.buyer || ''}`, kw)).slice(0, 5);
  const fundingHits = funding.filter((f) => matchesKeywords(`${f.company || ''} ${f.title}`, kw)).slice(0, 5);

  if (!newsHits.length && !tenderHits.length && !fundingHits.length) return null;

  const greet = user.locale === 'fr' ? 'Bonjour' : user.locale === 'zh' ? '你好' : 'Hi';
  const title =
    user.locale === 'fr' ? 'Votre radar d’opportunités France'
    : user.locale === 'zh' ? '你的法国机会雷达'
    : 'Your France opportunity radar';
  const date = new Date().toLocaleDateString(user.locale === 'zh' ? 'zh-CN' : user.locale === 'fr' ? 'fr-FR' : 'en-GB');

  const lines: string[] = [`${greet}${user.name ? ' ' + user.name : ''},`, '', `${title} — ${date}`, ''];

  if (newsHits.length) {
    lines.push(`📰 News (${newsHits.length})`);
    for (const n of newsHits) lines.push(`• ${n.title}${n.source ? ` — ${n.source}` : ''}\n  ${n.url}`);
    lines.push('');
  }
  if (tenderHits.length) {
    lines.push(`📑 Public tenders (${tenderHits.length})`);
    for (const t of tenderHits)
      lines.push(`• ${t.title}${t.buyer ? ` (${t.buyer})` : ''}${t.deadline ? ` — deadline ${t.deadline}` : ''}${t.url ? `\n  ${t.url}` : ''}`);
    lines.push('');
  }
  if (fundingHits.length) {
    lines.push(`💰 Funding signals (${fundingHits.length})`);
    for (const f of fundingHits)
      lines.push(`• ${f.company || f.title}${f.amount ? ` — ${f.amount}` : ''}${f.round ? ` (${f.round})` : ''}\n  ${f.url}`);
    lines.push('');
  }

  lines.push('—', `Open FranceGo: ${APP_URL}/${user.locale}/dashboard`, `Manage this digest: ${APP_URL}/${user.locale}/settings`);

  const subject =
    user.locale === 'fr' ? `Radar France — ${date}`
    : user.locale === 'zh' ? `法国机会雷达 — ${date}`
    : `France radar — ${date}`;

  return { subject, body: lines.join('\n') };
}

// Send the digest to every opted-in user not already emailed today.
export async function sendDailyDigests(): Promise<{ sent: number; skipped: number; empty: number }> {
  const users = await prisma.user.findMany({
    where: { digestEnabled: true },
    select: { id: true, name: true, email: true, locale: true, digestKeywords: true, digestLastSentAt: true },
  });

  const today = startOfToday();
  let sent = 0, skipped = 0, empty = 0;

  for (const u of users) {
    if (u.digestLastSentAt && u.digestLastSentAt >= today) { skipped++; continue; }
    const digest = await buildDigest(u);
    if (!digest) { empty++; continue; }
    await notifyEmail(u.email, digest.subject, digest.body);
    await prisma.user.update({ where: { id: u.id }, data: { digestLastSentAt: new Date() } });
    sent++;
  }

  return { sent, skipped, empty };
}
