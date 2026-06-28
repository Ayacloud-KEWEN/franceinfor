import 'server-only';
import { complete } from './ai';
import { retrieveContext } from './rag';
import type { Loc, RawPlaybook } from './data/playbooks';

// AI-drafts a RawPlaybook for a given topic, grounded in the FranceGo Knowledge
// Base (RAG) so authorities/links are anchored to curated sources rather than
// invented. The result is always a DRAFT for human review — never auto-published.

const DRAFT_SYSTEM =
  'You are a France market-entry knowledge engineer. You output ONLY valid minified JSON for a single playbook object — no markdown, no code fences, no commentary. ' +
  'Every prose field is an object {"en","fr","zh"} with accurate translations. Keep official French/EU authority names and permit names in their original language. ' +
  'Use ONLY real French/EU authorities and official URLs (gouv.fr, europa.eu, service-public.fr, douane.gouv.fr, etc.). If unsure of an exact URL, use the authority\'s known official homepage rather than inventing a path.';

// Compact schema description shown to the model (mirrors RawPlaybook).
const SCHEMA = `Shape (LS = {"en":string,"fr":string,"zh":string}; LSA = {"en":string[],"fr":string[],"zh":string[]}):
{
 "slug": "kebab-case-unique-id",
 "title": LS, "sector": "string", "summary": LS,
 "applicableTo": LSA, "prerequisites": LSA,
 "tasks": [ { "id":"lowercase-id", "name":LS, "description":LS,
   "authority"?:string, "permit"?:string, "documents"?:LSA, "cost"?:LS, "timeline"?:LS,
   "dependsOn"?:string[] (other task ids), "risks"?:LSA,
   "references"?:[{"label":string,"url":string}] } ],
 "risks": LSA, "estCost": LS, "estTimeline": LS,
 "references": [{"label":string,"url":string}],
 "version":"1.0", "updated":"YYYY-MM-DD",
 "keywords": string[] (mix of en/fr/zh terms for search matching)
}`;

function extractJsonObject(out: string): unknown | null {
  let s = out.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(s.slice(start, end + 1));
  } catch {
    return null;
  }
}

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) ||
  `playbook-${Date.now()}`;

// Minimal structural validation; throws a readable error if the model misbehaved.
function coerce(obj: Record<string, unknown>, topic: string): RawPlaybook {
  const isLS = (v: unknown): v is { en: string; fr: string; zh: string } =>
    !!v && typeof v === 'object' && 'en' in v && 'fr' in v && 'zh' in v;
  if (!isLS(obj.title) || !isLS(obj.summary) || !Array.isArray(obj.tasks) || !obj.tasks.length) {
    throw new Error('AI draft missing required fields (title/summary/tasks).');
  }
  const today = new Date().toISOString().slice(0, 10);
  return {
    ...(obj as unknown as RawPlaybook),
    slug: typeof obj.slug === 'string' && obj.slug ? slugify(obj.slug) : slugify(topic),
    version: '1.0',
    updated: today,
  };
}

export async function generatePlaybookDraft(topic: string, loc: Loc = 'en'): Promise<RawPlaybook> {
  const grounding = await retrieveContext(topic, loc);
  const context = grounding.grounded
    ? `\n\n[Knowledge Base — prefer these authorities/sources]\n${grounding.context}`
    : '';
  const sourceHints = grounding.sources.length
    ? `\n\nKnown good sources you may cite: ${grounding.sources.map((s) => `${s.label} ${s.url}`).join(' | ')}`
    : '';

  const prompt =
    `Produce a complete, realistic France market-entry playbook for: "${topic}".\n` +
    `Base it on real French/EU procedures, authorities and official links. 5–8 tasks with dependencies.\n\n` +
    SCHEMA +
    context +
    sourceHints +
    `\n\nReturn ONLY the JSON object.`;

  const out = await complete([{ role: 'user', content: prompt }], DRAFT_SYSTEM, loc);
  const parsed = extractJsonObject(out);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI did not return valid JSON. Try again or refine the topic.');
  }
  return coerce(parsed as Record<string, unknown>, topic);
}
