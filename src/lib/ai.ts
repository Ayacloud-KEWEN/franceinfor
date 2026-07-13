// Configurable LLM layer.
//
// Default provider: local Ollama. Also supports DeepSeek / OpenAI / Qwen (通义千问)
// / Claude — selected via AI_PROVIDER and configured with per-provider API keys.
//
// Ollama / DeepSeek / OpenAI / Qwen all speak the OpenAI Chat Completions format,
// so they share one code path; Claude uses the Anthropic Messages API.
//
// Any error (provider unreachable, missing key, etc.) falls back to deterministic
// mock output, so the app always works out of the box.
import { seededScore } from './utils';

export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type ProviderId = 'ollama' | 'deepseek' | 'openai' | 'qwen' | 'claude' | 'mock';

interface ProviderConfig {
  id: ProviderId;
  label: string;
  kind: 'openai' | 'anthropic';
  baseUrl: string;
  model: string;
  apiKey: string;
  /** local providers (Ollama) need no key */
  needsKey: boolean;
}

export const SYSTEM_PROMPT =
  'You are a senior France market-entry consultant (McKinsey-grade). Be concise, structured, data-driven. Reply in the language of the user.';

// Strong, explicit output-language directive. The model otherwise defaults to
// English because prompts and source data are often in English. Appended to the
// system prompt whenever the caller knows the user's UI locale.
const OUTPUT_LANG: Record<string, string> = {
  en: 'English',
  zh: 'Simplified Chinese (简体中文)',
  fr: 'French (français)',
};

export function langDirective(locale?: string): string {
  const lang = locale ? OUTPUT_LANG[locale] : undefined;
  if (!lang) return '';
  return (
    `\n\nIMPORTANT: Write your ENTIRE response in ${lang}, regardless of the language ` +
    `of the input data, context, or instructions. Translate any source material as needed. ` +
    `Do not reply in any other language. Keep proper nouns (company, brand, organisation, ` +
    `person names and official French permit/authority names) in their original script.`
  );
}

function buildConfig(): ProviderConfig {
  const provider = (process.env.AI_PROVIDER || 'ollama').toLowerCase() as ProviderId;

  switch (provider) {
    case 'deepseek':
      return {
        id: 'deepseek',
        label: 'DeepSeek',
        kind: 'openai',
        baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        apiKey: process.env.DEEPSEEK_API_KEY || '',
        needsKey: true,
      };
    case 'openai':
      return {
        id: 'openai',
        label: 'OpenAI',
        kind: 'openai',
        baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        apiKey: process.env.OPENAI_API_KEY || '',
        needsKey: true,
      };
    case 'qwen':
      return {
        id: 'qwen',
        label: '通义千问 (Qwen)',
        kind: 'openai',
        baseUrl:
          process.env.QWEN_BASE_URL ||
          'https://dashscope.aliyuncs.com/compatible-mode/v1',
        model: process.env.QWEN_MODEL || 'qwen-plus',
        apiKey: process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY || '',
        needsKey: true,
      };
    case 'claude':
      return {
        id: 'claude',
        label: 'Claude',
        kind: 'anthropic',
        baseUrl: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
        model: process.env.CLAUDE_MODEL || 'claude-opus-4-8',
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        needsKey: true,
      };
    case 'ollama':
    default:
      return {
        id: 'ollama',
        label: 'Ollama (local)',
        kind: 'openai',
        baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
        model: process.env.OLLAMA_MODEL || 'llama3.1',
        apiKey: 'ollama', // placeholder; Ollama ignores it
        needsKey: false,
      };
  }
}

const FORCE_MOCK = process.env.AI_MOCK === 'true';

export interface ProviderStatus {
  provider: ProviderId;
  label: string;
  model: string;
  mock: boolean;
  configured: boolean;
}

export function providerStatus(): ProviderStatus {
  const cfg = buildConfig();
  const configured = !cfg.needsKey || Boolean(cfg.apiKey);
  return {
    provider: FORCE_MOCK ? 'mock' : cfg.id,
    label: FORCE_MOCK ? 'Mock' : cfg.label,
    model: cfg.model,
    mock: FORCE_MOCK,
    configured,
  };
}

async function callOpenAICompatible(
  cfg: ProviderConfig,
  messages: AiMessage[],
  system: string
): Promise<string> {
  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages: [{ role: 'system', content: system }, ...messages],
      max_tokens: 2000,
      temperature: 0.3,
      stream: false,
    }),
  });
  if (!res.ok) throw new Error(`${cfg.id} ${res.status}: ${await res.text().catch(() => '')}`);
  const json = await res.json();
  const text = json?.choices?.[0]?.message?.content;
  if (!text) throw new Error(`${cfg.id} empty response`);
  return text;
}

async function callAnthropic(
  cfg: ProviderConfig,
  messages: AiMessage[],
  system: string
): Promise<string> {
  const res = await fetch(`${cfg.baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': cfg.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: cfg.model,
      max_tokens: 2000,
      system,
      messages,
    }),
  });
  if (!res.ok) throw new Error(`claude ${res.status}: ${await res.text().catch(() => '')}`);
  const json = await res.json();
  const text = json?.content?.[0]?.text;
  if (!text) throw new Error('claude empty response');
  return text;
}

export async function complete(
  messages: AiMessage[],
  system: string = SYSTEM_PROMPT,
  locale?: string
): Promise<string> {
  const last = messages[messages.length - 1]?.content ?? '';
  if (FORCE_MOCK) return mockConsultantReply(last);

  const cfg = buildConfig();
  if (cfg.needsKey && !cfg.apiKey) {
    // configured provider missing its key -> mock
    return mockConsultantReply(last);
  }

  const sys = system + langDirective(locale);
  try {
    return cfg.kind === 'anthropic'
      ? await callAnthropic(cfg, messages, sys)
      : await callOpenAICompatible(cfg, messages, sys);
  } catch (e) {
    console.warn(`[ai] ${cfg.id} failed, falling back to mock:`, (e as Error).message);
    return mockConsultantReply(last);
  }
}

export async function generateReport(
  templateName: string,
  topic: string,
  locale?: string
): Promise<string> {
  if (FORCE_MOCK) return mockReport(templateName, topic);

  const cfg = buildConfig();
  if (cfg.needsKey && !cfg.apiKey) return mockReport(templateName, topic);

  try {
    return await complete(
      [
        {
          role: 'user',
          content: `Produce a "${templateName}" about "${topic}" for entering the French market. Use markdown with sections: Executive Summary, Key Data (markdown table), AI Analysis, Risks, Recommendations, Sources.`,
        },
      ],
      SYSTEM_PROMPT,
      locale
    );
  } catch {
    return mockReport(templateName, topic);
  }
}

const LANG_LABEL: Record<string, string> = {
  en: 'English',
  zh: 'Simplified Chinese',
  fr: 'French',
};

const TRANSLATE_SYSTEM =
  'You are a precise translation engine. You output only what is asked — no preamble, no explanations, no markdown fences unless requested.';

// Pull a JSON string array out of a model response (tolerates code fences / stray text).
function extractStringArray(out: string, n: number): string[] | null {
  let s = out.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const start = s.indexOf('[');
  const end = s.lastIndexOf(']');
  if (start !== -1 && end > start) s = s.slice(start, end + 1);
  try {
    const arr = JSON.parse(s);
    if (Array.isArray(arr) && arr.length === n) {
      return arr.map((x) => (typeof x === 'string' ? x : String(x ?? '')));
    }
  } catch {
    /* not JSON */
  }
  return null;
}

// Fallback: parse numbered lines (tolerates half/full-width separators).
function parseNumberedLines(out: string, n: number): string[] | null {
  const map: Record<number, string> = {};
  for (const raw of out.split('\n')) {
    const line = raw.trim().replace(/^\*+\s*/, '').replace(/\*+$/, '');
    const m = line.match(/^(\d+)\s*[.)、．。:：・\-]\s*(.+)$/);
    if (m) map[Number(m[1])] = m[2].trim();
  }
  if (Object.keys(map).length >= n) return Array.from({ length: n }, (_, i) => map[i + 1] ?? '');
  return null;
}

/**
 * Translate a batch of short texts into the target locale using the configured
 * model. Returns the originals unchanged on mock mode, missing config, or error.
 */
export async function translateBatch(
  texts: string[],
  targetLocale: string
): Promise<string[]> {
  if (!texts.length) return [];
  const lang = LANG_LABEL[targetLocale];
  if (!lang || targetLocale === 'fr') return texts; // source is French
  if (FORCE_MOCK) return texts;

  const cfg = buildConfig();
  if (cfg.needsKey && !cfg.apiKey) return texts;

  const prompt =
    `Translate each string of this JSON array into ${lang}.\n` +
    `Return ONLY a JSON array of exactly ${texts.length} strings, in the same order — no markdown, no comments.\n` +
    `Keep company names, brand names, product names, organisation names and person names EXACTLY as written ` +
    `(original Latin script — e.g. "Mistral AI", "Schneider Electric", "Doctolib"). Keep tickers/acronyms/figures unchanged.\n\n` +
    JSON.stringify(texts);

  try {
    const out = await complete([{ role: 'user', content: prompt }], TRANSLATE_SYSTEM);
    const arr = extractStringArray(out, texts.length) ?? parseNumberedLines(out, texts.length);
    if (!arr) return texts;
    return texts.map((t, i) => (arr[i] && arr[i].trim() ? arr[i] : t));
  } catch {
    return texts;
  }
}

/* ----------------------------------- Mock fallbacks ----------------------------------- */

function mockReport(templateName: string, topic: string): string {
  const score = seededScore(templateName + topic);
  return [
    `# ${templateName}`,
    `### Subject: ${topic || 'France market'}`,
    `_Generated by FranceGo · ${new Date().toLocaleDateString()} · demo / mock mode_`,
    ``,
    `## Executive Summary`,
    `${topic || 'The subject'} presents a **${score > 70 ? 'strong' : 'moderate'}** opportunity in the French market, with an overall opportunity score of **${score}/100**. This report consolidates market intelligence, competitive positioning and a recommended action plan.`,
    ``,
    `## Key Data`,
    `| Indicator | Value |`,
    `| --- | --- |`,
    `| Opportunity Score | ${score}/100 |`,
    `| Market Entry Difficulty | ${seededScore(topic + 'd', 30, 80)}/100 |`,
    `| Estimated TAM (France) | €${seededScore(topic + 'tam', 2, 60)}B |`,
    `| Recommended Beachhead | Île-de-France (Paris) |`,
    ``,
    `## AI Analysis`,
    `- Demand drivers are favourable; public funding and digital-transformation budgets are expanding.`,
    `- Competitive intensity is manageable for a differentiated entrant.`,
    `- 3 public tenders and 12 high-intent buyers currently match this profile.`,
    ``,
    `## Risks`,
    `1. Regulatory/compliance onboarding (VAT, SIREN, sector rules).`,
    `2. Localisation and French-language go-to-market.`,
    `3. Channel/partner dependency in year one.`,
    ``,
    `## Recommendations`,
    `1. Establish a French entity (SAS) and validate tax registration.`,
    `2. Shortlist 5 distributors + 3 system integrators.`,
    `3. Respond to the top-ranked BOAMP tender (closing soon).`,
    `4. Build a 90-day outreach plan targeting the decision makers identified.`,
    ``,
    `## Sources`,
    `- recherche-entreprises.api.gouv.fr (company registry)`,
    `- BOAMP / TED (public procurement)`,
    `- FranceGo internal scoring`,
    ``,
    `_Configure a real model (Ollama / DeepSeek / OpenAI / Qwen / Claude) via AI_PROVIDER._`,
  ].join('\n');
}

function mockConsultantReply(prompt: string): string {
  const score = seededScore(prompt);
  return [
    `**France Market Entry — AI Analysis** _(demo / mock mode)_`,
    ``,
    `Based on your request: _"${prompt.slice(0, 140)}"_`,
    ``,
    `**Opportunity Score:** ${score}/100`,
    ``,
    `**Key findings**`,
    `- The French market shows a ${score > 70 ? 'strong' : 'moderate'} fit for your offering.`,
    `- Recommended first beachhead regions: Île-de-France (Paris) and Auvergne-Rhône-Alpes (Lyon).`,
    `- 3 public tenders and 12 high-intent buyers match your profile this week.`,
    ``,
    `**Recommended 90-day actions**`,
    `1. Register a French entity (SAS) and validate VAT/SIREN.`,
    `2. Shortlist 5 distributors + 3 system integrators from the Network module.`,
    `3. Respond to the top-ranked BOAMP/TED tender (closing soon).`,
    ``,
    `_Configure a real model (Ollama / DeepSeek / OpenAI / Qwen / Claude) via AI_PROVIDER._`,
  ].join('\n');
}

// ---- Embeddings (Knowledge OS L2) ----
// OpenAI text-embedding-3-small (1536-d) when OPENAI_API_KEY is set; otherwise a
// deterministic dev fallback so the pipeline runs locally without a key.
export const EMBED_DIM = 1536;
const EMBED_MODEL = process.env.EMBED_MODEL || 'text-embedding-3-small';

function devEmbed(text: string): number[] {
  const v = new Array(EMBED_DIM).fill(0);
  for (const tok of text.toLowerCase().split(/[^a-z0-9À-ſ]+/)) {
    if (!tok) continue;
    let h = 0;
    for (let i = 0; i < tok.length; i++) h = (h * 31 + tok.charCodeAt(i)) >>> 0;
    v[h % EMBED_DIM] += 1;
  }
  const norm = Math.sqrt(v.reduce((a, b) => a + b * b, 0)) || 1;
  return v.map((x) => x / norm);
}

export async function embed(texts: string[]): Promise<number[][]> {
  if (!texts.length) return [];
  const key = process.env.OPENAI_API_KEY;
  const provider = (process.env.EMBED_PROVIDER || 'openai').toLowerCase();
  if (provider === 'openai' && key) {
    try {
      const base = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
      const res = await fetch(`${base}/embeddings`, {
        method: 'POST',
        headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
        body: JSON.stringify({ model: EMBED_MODEL, input: texts }),
      });
      if (res.ok) {
        const json = await res.json();
        return (json.data as { embedding: number[] }[]).map((d) => d.embedding);
      }
      console.warn('[embed] openai', res.status, await res.text().catch(() => ''));
    } catch (e) {
      console.warn('[embed] failed, using dev fallback:', (e as Error).message);
    }
  }
  return texts.map(devEmbed);
}

export function embeddingsConfigured(): boolean {
  return (process.env.EMBED_PROVIDER || 'openai').toLowerCase() === 'openai' && Boolean(process.env.OPENAI_API_KEY);
}
