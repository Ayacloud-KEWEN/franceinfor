import 'server-only';
import { prisma } from './prisma';
import { notifyEmail } from './notify';
import { translateBatch } from './ai';
import { fetchFranceNews } from './sources/news';
import { searchTenders } from './sources/boamp';
import { fundingSignalsReal } from './sources/funding-signals';
import type { User } from '@prisma/client';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://francego.fr';

type Loc = 'en' | 'fr' | 'zh';

// Localized labels for the digest (subject + all section headings & chrome).
const L: Record<Loc, {
  greet: string; title: string; news: string; tenders: string; funding: string;
  deadline: string; by: string; openBtn: string; manage: string; footer: string;
  subject: (d: string) => string;
}> = {
  en: {
    greet: 'Hi', title: 'Your France opportunity radar',
    news: 'News', tenders: 'Public tenders', funding: 'Funding signals',
    deadline: 'Deadline', by: 'Buyer', openBtn: 'Open dashboard', manage: 'Manage this digest',
    footer: 'You receive this because the daily digest is enabled in your FranceGo settings.',
    subject: (d) => `France opportunity radar — ${d}`,
  },
  fr: {
    greet: 'Bonjour', title: 'Votre radar d’opportunités France',
    news: 'Actualités', tenders: 'Appels d’offres publics', funding: 'Signaux de financement',
    deadline: 'Échéance', by: 'Acheteur', openBtn: 'Ouvrir le tableau de bord', manage: 'Gérer cet e-mail',
    footer: 'Vous recevez cet e-mail car le résumé quotidien est activé dans vos paramètres FranceGo.',
    subject: (d) => `Radar d’opportunités France — ${d}`,
  },
  zh: {
    greet: '你好', title: '你的法国机会雷达',
    news: '新闻', tenders: '公共招标', funding: '融资信号',
    deadline: '截止', by: '采购方', openBtn: '打开仪表盘', manage: '管理此邮件',
    footer: '你收到此邮件，是因为在 FranceGo 设置中开启了每日机会摘要。',
    subject: (d) => `法国机会雷达 — ${d}`,
  },
};

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

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

interface Item { title: string; meta?: string; url?: string }

// Assemble the HTML email. Table-based + inline styles for email-client safety.
function renderHtml(
  loc: Loc, name: string | null, date: string,
  sections: { icon: string; label: string; items: Item[] }[]
): string {
  const t = L[loc];
  const brand = '#4f46e5';
  const ink = '#0f172a';
  const muted = '#64748b';
  const line = '#e2e8f0';

  const sectionHtml = sections.map((s) => `
    <tr><td style="padding:22px 28px 6px;">
      <div style="font-size:13px;font-weight:700;letter-spacing:.02em;text-transform:uppercase;color:${brand};">
        ${s.icon}&nbsp;${esc(s.label)} <span style="color:${muted};font-weight:600;">(${s.items.length})</span>
      </div>
    </td></tr>
    ${s.items.map((it) => `
    <tr><td style="padding:8px 28px;">
      <div style="border:1px solid ${line};border-radius:10px;padding:12px 14px;">
        <div style="font-size:15px;line-height:1.4;font-weight:600;color:${ink};">
          ${it.url ? `<a href="${esc(it.url)}" style="color:${ink};text-decoration:none;">${esc(it.title)}</a>` : esc(it.title)}
        </div>
        ${it.meta ? `<div style="margin-top:4px;font-size:13px;color:${muted};">${esc(it.meta)}</div>` : ''}
      </div>
    </td></tr>`).join('')}
  `).join('');

  return `<!doctype html><html><body style="margin:0;padding:0;background:#f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${line};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <!-- header -->
        <tr><td style="background:${brand};padding:24px 28px;">
          <div style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-.01em;">FranceGo</div>
          <div style="margin-top:2px;font-size:13px;color:#c7d2fe;">${esc(t.title)}</div>
        </td></tr>
        <!-- greeting -->
        <tr><td style="padding:22px 28px 0;">
          <div style="font-size:16px;color:${ink};font-weight:600;">${esc(t.greet)}${name ? ' ' + esc(name) : ''} 👋</div>
          <div style="margin-top:2px;font-size:13px;color:${muted};">${esc(date)}</div>
        </td></tr>
        ${sectionHtml}
        <!-- cta -->
        <tr><td style="padding:24px 28px 8px;">
          <a href="${APP_URL}/${loc}/dashboard" style="display:inline-block;background:${brand};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 20px;border-radius:10px;">${esc(t.openBtn)} →</a>
        </td></tr>
        <!-- footer -->
        <tr><td style="padding:16px 28px 28px;border-top:1px solid ${line};margin-top:12px;">
          <div style="font-size:12px;color:${muted};line-height:1.5;">
            ${esc(t.footer)}<br/>
            <a href="${APP_URL}/${loc}/settings" style="color:${brand};text-decoration:none;">${esc(t.manage)}</a>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

// Build the digest for one user (localized subject + translated content + HTML).
// Returns null when there's nothing relevant to send.
export async function buildDigest(
  user: Pick<User, 'name' | 'email' | 'locale' | 'digestKeywords'>
): Promise<{ subject: string; body: string; html: string } | null> {
  const loc: Loc = (['en', 'fr', 'zh'].includes(user.locale) ? user.locale : 'en') as Loc;
  const t = L[loc];
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

  // Translate the French dynamic content into the user's language (no-op for fr
  // or when no model is configured). Names/figures are preserved by translateBatch.
  const [newsTitles, tenderTitles] = await Promise.all([
    translateBatch(newsHits.map((n) => n.title), loc),
    translateBatch(tenderHits.map((t) => t.title), loc),
  ]);

  const date = new Date().toLocaleDateString(loc === 'zh' ? 'zh-CN' : loc === 'fr' ? 'fr-FR' : 'en-GB');

  const sections: { icon: string; label: string; items: Item[] }[] = [];
  if (newsHits.length) {
    sections.push({
      icon: '📰', label: t.news,
      items: newsHits.map((n, i) => ({ title: newsTitles[i] || n.title, meta: n.source || undefined, url: n.url })),
    });
  }
  if (tenderHits.length) {
    sections.push({
      icon: '📑', label: t.tenders,
      items: tenderHits.map((tn, i) => ({
        title: tenderTitles[i] || tn.title,
        meta: [tn.buyer && `${t.by}: ${tn.buyer}`, tn.deadline && `${t.deadline}: ${tn.deadline}`].filter(Boolean).join(' · ') || undefined,
        url: tn.url || undefined,
      })),
    });
  }
  if (fundingHits.length) {
    sections.push({
      icon: '💰', label: t.funding,
      items: fundingHits.map((f) => ({
        title: f.company || f.title,
        meta: [f.amount, f.round].filter(Boolean).join(' · ') || undefined,
        url: f.url || undefined,
      })),
    });
  }

  // Plain-text fallback.
  const lines: string[] = [`${t.greet}${user.name ? ' ' + user.name : ''},`, '', `${t.title} — ${date}`, ''];
  for (const s of sections) {
    lines.push(`${s.icon} ${s.label} (${s.items.length})`);
    for (const it of s.items) lines.push(`• ${it.title}${it.meta ? ` — ${it.meta}` : ''}${it.url ? `\n  ${it.url}` : ''}`);
    lines.push('');
  }
  lines.push('—', `${t.openBtn}: ${APP_URL}/${loc}/dashboard`, `${t.manage}: ${APP_URL}/${loc}/settings`);

  return {
    subject: t.subject(date),
    body: lines.join('\n'),
    html: renderHtml(loc, user.name, date, sections),
  };
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
    await notifyEmail(u.email, digest.subject, digest.body, digest.html);
    await prisma.user.update({ where: { id: u.id }, data: { digestLastSentAt: new Date() } });
    sent++;
  }

  return { sent, skipped, empty };
}
