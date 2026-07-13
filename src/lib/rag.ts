import 'server-only';
import { matchPlaybook, type Loc } from './data/playbooks';
import { experienceStats } from './projects';
import { semanticSearch } from './knowledge';
import { graphContext } from './knowledge-graph';

export interface RetrievedSource {
  label: string;
  url: string;
}

export interface Retrieval {
  grounded: boolean;
  context: string; // injected into the system prompt
  sources: RetrievedSource[];
}

// Retrieve grounding knowledge for a question from the FranceGo Knowledge OS
// (L3 playbooks + L4 real-project experience). Keeps the Copilot answering from
// curated, sourced knowledge rather than the bare language model.
export async function retrieveContext(query: string, loc: Loc = 'en'): Promise<Retrieval> {
  const lines: string[] = [];
  const sources: RetrievedSource[] = [];
  const seen = new Set<string>();
  const addSource = (s: RetrievedSource) => {
    if (s.url && !seen.has(s.url)) { seen.add(s.url); sources.push(s); }
  };

  const match = matchPlaybook(query, loc);

  // L2 — knowledge graph: approved entities + relations relevant to the query.
  try {
    const g = await graphContext(query);
    if (g.hits) {
      lines.push(...g.lines, '');
      for (const s of g.sources) addSource(s);
    }
  } catch {
    /* graph optional */
  }

  // L2 — semantic vector retrieval over indexed official documents.
  try {
    const hits = (await semanticSearch(query, 4)).filter((h) => h.score > 0.2);
    if (hits.length) {
      lines.push('Relevant official sources (semantic search):');
      for (const h of hits) {
        lines.push(`- ${h.text.slice(0, 400)}${h.url ? ` [${h.url}]` : ''}`);
        if (h.url) addSource({ label: h.source || h.url, url: h.url });
      }
      lines.push('');
    }
  } catch {
    /* vector store optional */
  }

  if (!match) {
    if (!lines.length) return { grounded: false, context: '', sources: [] };
    return { grounded: true, context: lines.join('\n'), sources };
  }

  const p = match.playbook;
  lines.push(`Playbook: ${p.title}`);
  lines.push(p.summary);
  lines.push('Steps:');
  for (let i = 0; i < p.tasks.length; i++) {
    const t = p.tasks[i];
    const meta = [
      t.authority && `authority: ${t.authority}`,
      t.permit && `permit: ${t.permit}`,
      t.timeline && `timeline: ${t.timeline}`,
      t.cost && `cost: ${t.cost}`,
    ].filter(Boolean).join('; ');
    lines.push(`${i + 1}. ${t.name}${meta ? ` (${meta})` : ''} — ${t.description}`);
  }
  if (p.risks.length) lines.push(`Key risks: ${p.risks.join(' | ')}`);

  // L4 — real project experience for this playbook, when available.
  try {
    const stats = await experienceStats(p.slug);
    if (stats.total > 0) {
      const bits = [
        `${stats.total} real project(s)`,
        stats.avgDays != null && `avg duration ${stats.avgDays} days`,
        stats.successRate != null && `success rate ${stats.successRate}%`,
        stats.avgCostEur != null && `avg cost €${stats.avgCostEur.toLocaleString()}`,
      ].filter(Boolean);
      lines.push(`Real-project experience: ${bits.join(', ')}.`);
      if (stats.commonProblems.length)
        lines.push(`Common problems: ${stats.commonProblems.map((c) => `${c.problem} (${c.count})`).join('; ')}.`);
    }
  } catch {
    /* stats optional */
  }

  // Sources: each task's references + playbook-level references (deduped with
  // the semantic-search sources already collected above).
  for (const ref of [...p.tasks.flatMap((t) => t.references ?? []), ...p.references]) {
    addSource(ref);
  }

  return { grounded: true, context: lines.join('\n'), sources };
}

export const RAG_SYSTEM = (context: string) =>
  `You are FranceGo's France market-entry consulting copilot. Answer the user's question PRIMARILY from the FranceGo Knowledge Base below (curated, sourced French market knowledge). Reference the relevant authorities and steps. If the answer is not covered by the knowledge base, say so briefly, then give general guidance clearly marked as outside the knowledge base. Reply in the user's language. Be concise, structured, and practical.\n\n[FranceGo Knowledge Base]\n${context}`;
