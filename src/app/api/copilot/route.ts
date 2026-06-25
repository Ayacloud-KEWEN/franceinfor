import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { consumeSearch } from '@/lib/usage';
import { complete, type AiMessage } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const messages: AiMessage[] = body?.messages ?? [];
  if (!messages.length)
    return NextResponse.json({ error: 'no_messages' }, { status: 400 });

  const quota = await consumeSearch(
    user.id,
    user.plan,
    'copilot',
    messages[messages.length - 1]?.content?.slice(0, 200) || ''
  );
  if (!quota.ok)
    return NextResponse.json(
      { error: 'quota_exceeded', limit: quota.limit },
      { status: 429 }
    );

  const reply = await complete(messages);
  return NextResponse.json({ reply });
}
