import 'server-only';
import { randomUUID } from 'crypto';
import { prisma } from './prisma';
import { embed } from './ai';

// ---- Chunking ----
function stripHtml(s: string): string {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function chunkText(text: string, size = 1000, overlap = 150): string[] {
  const clean = stripHtml(text);
  if (clean.length <= size) return clean ? [clean] : [];
  const chunks: string[] = [];
  for (let i = 0; i < clean.length; i += size - overlap) {
    chunks.push(clean.slice(i, i + size));
    if (i + size >= clean.length) break;
  }
  return chunks;
}

const vec = (arr: number[]) => `[${arr.join(',')}]`;

// Chunk + embed + store a raw document's text. Re-indexing replaces prior chunks
// for that doc (idempotent). Returns the number of chunks stored.
export async function indexDocument(doc: {
  id: string;
  source: string;
  url: string;
  content: string | null;
}): Promise<number> {
  if (!doc.content) return 0;
  const chunks = chunkText(doc.content).slice(0, 80); // cap per doc
  if (!chunks.length) return 0;

  const embeddings = await embed(chunks);

  await prisma.docChunk.deleteMany({ where: { rawDocId: doc.id } });
  for (let i = 0; i < chunks.length; i++) {
    const e = embeddings[i];
    if (!e) continue;
    await prisma.$executeRaw`
      INSERT INTO "DocChunk" (id, "rawDocId", source, url, ord, text, embedding, "createdAt")
      VALUES (${randomUUID()}, ${doc.id}, ${doc.source}, ${doc.url}, ${i}, ${chunks[i]}, ${vec(e)}::vector, now())
    `;
  }
  return chunks.length;
}

export interface SemanticHit {
  text: string;
  url: string | null;
  source: string | null;
  score: number;
}

// Cosine-similarity search over indexed chunks.
export async function semanticSearch(query: string, k = 5): Promise<SemanticHit[]> {
  if (!query.trim()) return [];
  const [qe] = await embed([query]);
  if (!qe) return [];
  const rows = await prisma.$queryRaw<SemanticHit[]>`
    SELECT text, url, source, 1 - (embedding <=> ${vec(qe)}::vector) AS score
    FROM "DocChunk"
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${vec(qe)}::vector
    LIMIT ${k}
  `;
  return rows;
}

export async function indexStats(): Promise<{ chunks: number; docsIndexed: number }> {
  const chunks = await prisma.docChunk.count();
  const docsIndexed = (await prisma.docChunk.findMany({ distinct: ['rawDocId'], select: { rawDocId: true } })).length;
  return { chunks, docsIndexed };
}

// Ensure the HNSW cosine index exists (idempotent; can't be expressed in Prisma).
async function ensureVectorIndex(): Promise<void> {
  try {
    await prisma.$executeRawUnsafe(
      'CREATE INDEX IF NOT EXISTS docchunk_embedding_idx ON "DocChunk" USING hnsw (embedding vector_cosine_ops)'
    );
  } catch {
    /* index optional — search still works without it (slower) */
  }
}

// Index all ACTIVE raw documents that don't yet have chunks. Idempotent.
export async function indexPending(limit = 20): Promise<{ indexed: number; chunks: number }> {
  await ensureVectorIndex();
  const docs = await prisma.rawDocument.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { fetchedAt: 'desc' },
    take: limit,
  });
  let indexed = 0, chunks = 0;
  for (const d of docs) {
    const existing = await prisma.docChunk.count({ where: { rawDocId: d.id } });
    if (existing > 0) continue;
    const n = await indexDocument({ id: d.id, source: d.source, url: d.url, content: d.content });
    if (n > 0) { indexed++; chunks += n; }
  }
  return { indexed, chunks };
}
