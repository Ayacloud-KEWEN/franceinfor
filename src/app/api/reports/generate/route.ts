import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { consumeSearch } from '@/lib/usage';
import { generateReport } from '@/lib/ai';
import { getTemplate } from '@/lib/data/reports';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const tpl = getTemplate(body?.template ?? '');
  const topic = String(body?.topic ?? '').slice(0, 200);
  if (!tpl) return NextResponse.json({ error: 'bad_template' }, { status: 400 });

  const quota = await consumeSearch(user.id, user.plan, 'reports', `${tpl.slug}:${topic}`);
  if (!quota.ok)
    return NextResponse.json({ error: 'quota_exceeded', limit: quota.limit }, { status: 429 });

  const locale = typeof body?.locale === 'string' ? body.locale : user.locale;
  const markdown = await generateReport(tpl.name, topic, locale);
  return NextResponse.json({ markdown });
}
