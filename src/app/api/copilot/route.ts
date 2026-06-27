import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { consumeSearch } from '@/lib/usage';
import { complete, type AiMessage } from '@/lib/ai';
import { retrieveContext, RAG_SYSTEM } from '@/lib/rag';
import type { Loc } from '@/lib/data/playbooks';

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

  // RAG: retrieve grounding knowledge (L3 playbooks + L4 experience) before
  // answering, so the copilot cites curated French knowledge, not just the LLM.
  const locale = (typeof body?.locale === 'string' ? body.locale : user.locale) as Loc;
  const lastQuestion = messages[messages.length - 1]?.content || '';
  const retrieval = await retrieveContext(lastQuestion, locale);

  let reply = retrieval.grounded
    ? await complete(messages, RAG_SYSTEM(retrieval.context), locale)
    : await complete(messages, undefined, locale);

  // Append the official sources used to ground the answer.
  if (retrieval.grounded && retrieval.sources.length) {
    const label = locale === 'fr' ? 'Sources' : locale === 'zh' ? '来源' : 'Sources';
    reply += `\n\n— ${label}:\n` + retrieval.sources.slice(0, 6).map((src) => `• ${src.label}: ${src.url}`).join('\n');
  }

  return NextResponse.json({ reply, grounded: retrieval.grounded });
}
