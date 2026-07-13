import 'server-only';
// Grounded report generation: gather REAL France data for the topic (market
// size, live tenders, registered companies, recent news) + the curated
// Knowledge Base, feed it to the model, and force it to use only those figures
// — then append the real sources. This is what makes report numbers defensible
// instead of hallucinated.
import { complete, generateReport } from './ai';
import { retrieveContext, type RetrievedSource } from './rag';
import { INDUSTRIES } from './data/industries';
import { getIndustriesWithRealStats } from './sources/market-stats';
import { searchTenders } from './sources/boamp';
import { searchCompanies } from './sources/recherche-entreprises';
import { fetchFranceNews } from './sources/news';
import type { Loc } from './data/playbooks';

function dedupeSources(sources: RetrievedSource[]): RetrievedSource[] {
  const seen = new Set<string>();
  const out: RetrievedSource[] = [];
  for (const s of sources) {
    if (s.url && !seen.has(s.url)) { seen.add(s.url); out.push(s); }
  }
  return out;
}

function matchIndustry(topic: string) {
  const ql = topic.toLowerCase();
  return INDUSTRIES.find((i) => {
    const name = i.name.toLowerCase();
    const fr = i.frTerm.toLowerCase();
    return (
      name.includes(ql) ||
      ql.includes(name) ||
      fr.split(/\s+/).some((w) => w.length >= 4 && ql.includes(w))
    );
  });
}

const REPORT_RAG_SYSTEM = (dataPack: string) =>
  `You are FranceGo's France market-entry analyst. Write the report using ONLY the real data provided below. ` +
  `Do NOT invent figures: every number (market size, growth, tender counts, company counts) must come from this data. ` +
  `If a figure isn't provided, write "not available" rather than guessing. Be concise, structured and practical.\n\n` +
  `[Real France data]\n${dataPack}`;

// Build the real-data pack + source list for a topic.
export async function buildReportData(
  topic: string,
  loc: Loc
): Promise<{ dataPack: string; sources: RetrievedSource[] }> {
  const q = topic.trim();
  const lines: string[] = [];
  const sources: RetrievedSource[] = [];

  // Real market size/growth (Eurostat) when the topic maps to a known sector.
  const ind = matchIndustry(q);
  if (ind) {
    try {
      const all = await getIndustriesWithRealStats();
      const real = all.find((x) => x.slug === ind.slug) ?? ind;
      lines.push(
        `Market (Eurostat, France): ${real.name} — gross value added €${real.marketSizeBn}B, ` +
          `YoY growth ${real.cagr}%${real.real ? ' (real)' : ' (estimated)'}.`
      );
      sources.push({ label: 'Eurostat — national accounts (nama_10_a64)', url: 'https://ec.europa.eu/eurostat/web/national-accounts' });
    } catch {
      /* optional */
    }
  }

  const [tenders, companies, news, kb] = await Promise.all([
    searchTenders(q, 30).catch(() => ({ results: [], total: 0 })),
    searchCompanies(q, 1).catch(() => ({ results: [], total: 0 })),
    fetchFranceNews(q).catch(() => []),
    retrieveContext(q, loc).catch(() => ({ grounded: false, context: '', sources: [] as RetrievedSource[] })),
  ]);

  lines.push(
    `Public tenders matching "${q}": ${tenders.total.toLocaleString()} open on BOAMP.` +
      (tenders.results.length ? ` Examples: ${tenders.results.slice(0, 3).map((t) => t.title).join('; ')}.` : '')
  );
  if (tenders.total > 0) sources.push({ label: 'BOAMP — public procurement (DILA)', url: 'https://www.boamp.fr/' });

  lines.push(
    `Registered companies matching "${q}": ~${companies.total.toLocaleString()} (official registry).` +
      (companies.results.length ? ` Leading: ${companies.results.slice(0, 5).map((c) => c.name).join(', ')}.` : '')
  );
  if (companies.total > 0) sources.push({ label: 'Annuaire des Entreprises (data.gouv.fr)', url: 'https://annuaire-entreprises.data.gouv.fr/' });

  if (news.length) {
    lines.push(`Recent French news: ${news.slice(0, 5).map((n) => `${n.title} (${n.source})`).join(' | ')}.`);
    news.slice(0, 3).forEach((n) => n.url && sources.push({ label: n.source || n.title, url: n.url }));
  }

  if (kb.grounded && kb.context) {
    lines.push(`\nCurated knowledge base:\n${kb.context}`);
    sources.push(...kb.sources);
  }

  return { dataPack: lines.join('\n'), sources: dedupeSources(sources) };
}

// Generate a report grounded in real data with a Sources section. Falls back to
// the generic (ungrounded) generator when there's no topic to ground on.
export async function generateGroundedReport(
  templateName: string,
  topic: string,
  loc: Loc
): Promise<string> {
  if (!topic.trim()) return generateReport(templateName, topic, loc);

  const { dataPack, sources } = await buildReportData(topic, loc);

  const userPrompt =
    `Produce a "${templateName}" about "${topic}" for entering the French market. ` +
    `Use markdown with these sections: Executive Summary, Key Data (a markdown table), ` +
    `AI Analysis, Risks, Recommendations. Use ONLY the figures from the provided real data; ` +
    `where a figure is missing, write "not available".`;

  let md: string;
  try {
    md = await complete([{ role: 'user', content: userPrompt }], REPORT_RAG_SYSTEM(dataPack), loc);
  } catch {
    return generateReport(templateName, topic, loc);
  }

  if (sources.length) {
    const label = loc === 'fr' ? 'Sources' : loc === 'zh' ? '来源' : 'Sources';
    md += `\n\n## ${label}\n` + sources.slice(0, 10).map((s) => `- [${s.label}](${s.url})`).join('\n');
  }
  return md;
}
