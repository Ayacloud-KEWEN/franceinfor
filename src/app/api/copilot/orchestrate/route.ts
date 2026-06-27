import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { consumeSearch } from '@/lib/usage';
import { generateReport } from '@/lib/ai';
import { COPILOT_AGENTS } from '@/lib/data/modules';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const topic = String(body?.topic ?? '').slice(0, 200) || 'France market entry';

  const quota = await consumeSearch(user.id, user.plan, 'copilot-orchestrate', topic);
  if (!quota.ok)
    return NextResponse.json({ error: 'quota_exceeded', limit: quota.limit }, { status: 429 });

  // Each agent runs (mock); a real build would fan out to the per-module engines.
  const locale = typeof body?.locale === 'string' ? body.locale : user.locale;
  const markdown = await generateReport('France Market Entry Report', topic, locale);
  return NextResponse.json({ agents: COPILOT_AGENTS, markdown });
}
