import 'server-only';
import { prisma } from './prisma';
import { complete } from './ai';
import { chunkText } from './knowledge';
import type { KnowledgeStatus } from '@prisma/client';

const NODE_TYPES = ['Authority', 'Permit', 'Regulation', 'Document', 'Region', 'Industry', 'Funding', 'Company'];
const RELATIONS = ['requires', 'issued_by', 'managed_by', 'depends_on', 'applicable_to', 'related_to', 'supports'];

const EXTRACT_SYSTEM = `You extract a knowledge graph STRICTLY from the provided French market text. Output ONLY JSON, no prose:
{"nodes":[{"type":"<one of ${NODE_TYPES.join('|')}>","name":"<short canonical name>","confidence":0-1}],
 "edges":[{"from":"<node name>","to":"<node name>","relation":"<one of ${RELATIONS.join('|')}>","confidence":0-1}]}
Rules: use ONLY facts present in the text — never invent. Keep names short and canonical. If nothing concrete, return {"nodes":[],"edges":[]}.`;

interface ExtractedNode { type: string; name: string; confidence?: number }
interface ExtractedEdge { from: string; to: string; relation: string; confidence?: number }

function parseJson(out: string): { nodes: ExtractedNode[]; edges: ExtractedEdge[] } {
  let s = out.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start !== -1 && end > start) s = s.slice(start, end + 1);
  try {
    const j = JSON.parse(s);
    return { nodes: Array.isArray(j.nodes) ? j.nodes : [], edges: Array.isArray(j.edges) ? j.edges : [] };
  } catch {
    return { nodes: [], edges: [] };
  }
}

// Extract candidate nodes/edges from one document. Upserts as CANDIDATE with a
// source reference; never overwrites approved/rejected status. Idempotent.
export async function extractFromDocument(doc: { url: string; content: string | null }): Promise<{ nodes: number; edges: number }> {
  if (!doc.content) return { nodes: 0, edges: 0 };
  const text = chunkText(doc.content).slice(0, 6).join('\n\n').slice(0, 8000);
  if (!text) return { nodes: 0, edges: 0 };

  const reply = await complete([{ role: 'user', content: text }], EXTRACT_SYSTEM);
  const { nodes, edges } = parseJson(reply);

  const nameToId = new Map<string, string>();
  let nodeCount = 0;
  for (const n of nodes) {
    if (!n?.name || !NODE_TYPES.includes(n.type)) continue;
    const name = String(n.name).trim().slice(0, 120);
    if (!name) continue;
    const row = await prisma.knowledgeNode.upsert({
      where: { type_name: { type: n.type, name } },
      create: { type: n.type, name, confidence: Number(n.confidence) || 0.5, sourceRef: doc.url, status: 'CANDIDATE' },
      update: { sourceRef: doc.url }, // keep status; refresh source
    });
    nameToId.set(name.toLowerCase(), row.id);
    nodeCount++;
  }

  let edgeCount = 0;
  for (const e of edges) {
    if (!e?.from || !e?.to || !RELATIONS.includes(e.relation)) continue;
    const fromId = nameToId.get(String(e.from).trim().toLowerCase());
    const toId = nameToId.get(String(e.to).trim().toLowerCase());
    if (!fromId || !toId || fromId === toId) continue;
    await prisma.knowledgeEdge.upsert({
      where: { fromId_toId_relation: { fromId, toId, relation: e.relation } },
      create: { fromId, toId, relation: e.relation, confidence: Number(e.confidence) || 0.5, sourceRef: doc.url, status: 'CANDIDATE' },
      update: { sourceRef: doc.url },
    });
    edgeCount++;
  }
  return { nodes: nodeCount, edges: edgeCount };
}

// Extract over recent ACTIVE documents. Idempotent (upsert).
export async function extractPending(limit = 10): Promise<{ docs: number; nodes: number; edges: number }> {
  const docs = await prisma.rawDocument.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { fetchedAt: 'desc' },
    take: limit,
  });
  let nodes = 0, edges = 0, n = 0;
  for (const d of docs) {
    const r = await extractFromDocument({ url: d.url, content: d.content });
    if (r.nodes || r.edges) n++;
    nodes += r.nodes;
    edges += r.edges;
  }
  return { docs: n, nodes, edges };
}

// ---- Retrieval (used by RAG) ----
export interface GraphContext {
  lines: string[];
  sources: { label: string; url: string }[];
  hits: number;
}

// Retrieve APPROVED graph facts relevant to a query: nodes whose canonical name
// matches a query term, plus their 1-hop approved relations. This is what lets
// the Copilot/reports reason over the structured knowledge graph — not just the
// semantic chunks. Only approved facts are surfaced (curation gate).
export async function graphContext(query: string, maxNodes = 6): Promise<GraphContext> {
  const terms = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length >= 4);
  if (!terms.length) return { lines: [], sources: [], hits: 0 };

  const nodes = await prisma.knowledgeNode.findMany({
    where: {
      status: 'APPROVED',
      OR: terms.map((t) => ({ name: { contains: t, mode: 'insensitive' as const } })),
    },
    orderBy: { confidence: 'desc' },
    take: maxNodes,
  });
  if (!nodes.length) return { lines: [], sources: [], hits: 0 };

  const ids = nodes.map((n) => n.id);
  const edges = await prisma.knowledgeEdge.findMany({
    where: {
      status: 'APPROVED',
      OR: [{ fromId: { in: ids } }, { toId: { in: ids } }],
    },
    include: { from: true, to: true },
    orderBy: { confidence: 'desc' },
    take: 30,
  });

  const lines: string[] = ['Knowledge graph — approved facts:'];
  for (const n of nodes) lines.push(`- ${n.type}: ${n.name}`);
  for (const e of edges) lines.push(`- ${e.from.name} —(${e.relation})→ ${e.to.name}`);

  const sources: { label: string; url: string }[] = [];
  const seen = new Set<string>();
  for (const n of nodes) {
    if (n.sourceRef && n.sourceRef.startsWith('http') && !seen.has(n.sourceRef)) {
      seen.add(n.sourceRef);
      sources.push({ label: n.name, url: n.sourceRef });
    }
  }

  return { lines, sources, hits: nodes.length };
}

// ---- Review + stats ----
export async function setNodeStatus(id: string, status: KnowledgeStatus) {
  await prisma.knowledgeNode.update({ where: { id }, data: { status } });
}
export async function setEdgeStatus(id: string, status: KnowledgeStatus) {
  await prisma.knowledgeEdge.update({ where: { id }, data: { status } });
}

export async function graphStats() {
  const [nodes, edges, candNodes, candEdges, apprNodes] = await Promise.all([
    prisma.knowledgeNode.count(),
    prisma.knowledgeEdge.count(),
    prisma.knowledgeNode.count({ where: { status: 'CANDIDATE' } }),
    prisma.knowledgeEdge.count({ where: { status: 'CANDIDATE' } }),
    prisma.knowledgeNode.count({ where: { status: 'APPROVED' } }),
  ]);
  return { nodes, edges, candNodes, candEdges, apprNodes };
}
