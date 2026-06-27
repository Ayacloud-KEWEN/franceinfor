import 'server-only';
import { createHash } from 'crypto';
import { prisma } from './prisma';
import type { RawDocument } from '@prisma/client';

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export interface IngestInput {
  source: string;
  url: string;
  lang?: string;
  docType?: string;
  content: string;
  meta?: Record<string, unknown>;
}

export type IngestAction = 'created' | 'versioned' | 'unchanged';

// Ingest a raw document with dedupe + versioning. Never overwrites: identical
// content is a no-op; changed content supersedes the previous version.
export async function ingestDocument(input: IngestInput): Promise<{ action: IngestAction; doc: RawDocument }> {
  const checksum = sha256(input.content);

  const same = await prisma.rawDocument.findUnique({
    where: { url_checksum: { url: input.url, checksum } },
  });
  if (same) return { action: 'unchanged', doc: same };

  const latest = await prisma.rawDocument.findFirst({
    where: { url: input.url },
    orderBy: { version: 'desc' },
  });
  const version = latest ? latest.version + 1 : 1;
  if (latest) {
    await prisma.rawDocument.updateMany({ where: { url: input.url, status: 'ACTIVE' }, data: { status: 'SUPERSEDED' } });
  }

  const doc = await prisma.rawDocument.create({
    data: {
      source: input.source,
      url: input.url,
      lang: input.lang,
      docType: input.docType,
      checksum,
      version,
      content: input.content,
      meta: input.meta as object | undefined,
    },
  });
  return { action: latest ? 'versioned' : 'created', doc };
}

// Fetch a URL and ingest its text body. Best-effort; returns null on fetch error.
export async function ingestUrl(
  url: string,
  source: string,
  docType = 'page',
  lang?: string
): Promise<{ action: IngestAction } | null> {
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'FranceGo-KnowledgeOS/1.0' }, next: { revalidate: 0 } });
    if (!res.ok) return null;
    const content = await res.text();
    const { action } = await ingestDocument({ source, url, lang, docType, content, meta: { status: res.status } });
    return { action };
  } catch {
    return null;
  }
}

export async function rawDocStats(): Promise<{ total: number; active: number; sources: number }> {
  const [total, active, bySource] = await Promise.all([
    prisma.rawDocument.count(),
    prisma.rawDocument.count({ where: { status: 'ACTIVE' } }),
    prisma.rawDocument.groupBy({ by: ['source'] }),
  ]);
  return { total, active, sources: bySource.length };
}
