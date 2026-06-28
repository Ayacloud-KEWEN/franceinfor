import 'server-only';
import { createHash } from 'crypto';
import { prisma } from './prisma';
import {
  RAW,
  localize,
  listPlaybooks as codeList,
  getPlaybook as codeGet,
  type Loc,
  type Playbook,
  type RawPlaybook,
} from './data/playbooks';

const hash = (raw: RawPlaybook) => createHash('sha1').update(JSON.stringify(raw)).digest('hex');

// Bump a "1.0" style version string's minor component.
function bump(version: string): string {
  const m = version.match(/^(\d+)\.(\d+)$/);
  if (!m) return '1.1';
  return `${m[1]}.${Number(m[2]) + 1}`;
}

// Sync the git-defined playbooks into the DB, snapshotting a new version row
// whenever content changes. Idempotent. Returns what happened.
export async function syncPlaybooksFromCode(): Promise<{ created: number; updated: number; unchanged: number }> {
  let created = 0, updated = 0, unchanged = 0;
  for (const raw of RAW) {
    const contentHash = hash(raw);
    const existing = await prisma.playbook.findUnique({ where: { slug: raw.slug } });
    if (!existing) {
      const pb = await prisma.playbook.create({
        data: { slug: raw.slug, version: raw.version, contentHash, data: raw as object },
      });
      await prisma.playbookVersion.create({
        data: { playbookId: pb.id, version: raw.version, data: raw as object, note: 'initial' },
      });
      created++;
    } else if (existing.contentHash !== contentHash) {
      const nextVersion = raw.version !== existing.version ? raw.version : bump(existing.version);
      await prisma.playbook.update({
        where: { id: existing.id },
        data: { version: nextVersion, contentHash, data: raw as object },
      });
      await prisma.playbookVersion.create({
        data: { playbookId: existing.id, version: nextVersion, data: raw as object, note: 'content update' },
      });
      updated++;
    } else {
      unchanged++;
    }
  }
  return { created, updated, unchanged };
}

// DB-backed reads, falling back to the in-code data if the DB isn't synced yet.
// Public reads only ever return PUBLISHED playbooks; drafts stay admin-only.
export async function dbListPlaybooks(loc: Loc): Promise<Playbook[]> {
  try {
    const rows = await prisma.playbook.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { slug: 'asc' },
    });
    if (rows.length) return rows.map((r) => localize(r.data as unknown as RawPlaybook, loc));
  } catch {
    /* fall through */
  }
  return codeList(loc);
}

export async function dbGetPlaybook(
  slug: string,
  loc: Loc,
  opts: { includeDraft?: boolean } = {}
): Promise<Playbook | undefined> {
  try {
    const row = await prisma.playbook.findUnique({ where: { slug } });
    if (row && (opts.includeDraft || row.status === 'PUBLISHED')) {
      return localize(row.data as unknown as RawPlaybook, loc);
    }
    if (row) return undefined; // exists but is a draft and caller isn't admin
  } catch {
    /* fall through */
  }
  return codeGet(slug, loc);
}

// ---- Admin authoring (drafts → publish) ----

export interface AdminPlaybookRow {
  id: string;
  slug: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED';
  source: string;
  version: string;
  updatedAt: Date;
}

// List every playbook (drafts + published) for the admin console.
export async function adminListPlaybooks(loc: Loc = 'en'): Promise<AdminPlaybookRow[]> {
  const rows = await prisma.playbook.findMany({ orderBy: { updatedAt: 'desc' } });
  return rows.map((r) => {
    const raw = r.data as unknown as RawPlaybook;
    return {
      id: r.id,
      slug: r.slug,
      title: localize(raw, loc).title,
      status: r.status,
      source: r.source,
      version: r.version,
      updatedAt: r.updatedAt,
    };
  });
}

// Persist an AI/manually drafted RawPlaybook as a DRAFT. Never clobbers an
// existing PUBLISHED playbook: collisions get a unique slug suffix instead.
export async function saveDraft(raw: RawPlaybook, source = 'ai'): Promise<string> {
  const existing = await prisma.playbook.findUnique({ where: { slug: raw.slug } });

  // Reuse the row only if it's already a draft (overwriting a prior draft is fine).
  if (existing && existing.status === 'DRAFT') {
    await prisma.playbook.update({
      where: { id: existing.id },
      data: { status: 'DRAFT', source, contentHash: hash(raw), data: raw as object, version: raw.version },
    });
    return existing.id;
  }

  // Slug taken by a published playbook → give the draft a fresh unique slug.
  if (existing) {
    let n = 2;
    let candidate = `${raw.slug}-${n}`;
    while (await prisma.playbook.findUnique({ where: { slug: candidate } })) {
      n += 1;
      candidate = `${raw.slug}-${n}`;
    }
    raw = { ...raw, slug: candidate };
  }

  const pb = await prisma.playbook.create({
    data: { slug: raw.slug, version: raw.version, status: 'DRAFT', source, contentHash: hash(raw), data: raw as object },
  });
  return pb.id;
}

// Read one playbook's raw JSON for the admin editor.
export async function getRawPlaybook(id: string): Promise<RawPlaybook | null> {
  const row = await prisma.playbook.findUnique({ where: { id } });
  return row ? (row.data as unknown as RawPlaybook) : null;
}

// Update a draft's full JSON content (admin edits before publishing). Keeps the
// slug column in sync with the edited JSON, unless that slug is taken by another row.
export async function updateDraftData(id: string, raw: RawPlaybook): Promise<void> {
  const clash = raw.slug
    ? await prisma.playbook.findFirst({ where: { slug: raw.slug, NOT: { id } }, select: { id: true } })
    : null;
  await prisma.playbook.update({
    where: { id },
    data: {
      contentHash: hash(raw),
      data: raw as object,
      version: raw.version,
      ...(raw.slug && !clash ? { slug: raw.slug } : {}),
    },
  });
}

// Publish a draft: flip status and snapshot a version.
export async function publishPlaybook(id: string): Promise<void> {
  const row = await prisma.playbook.findUnique({ where: { id } });
  if (!row) return;
  const raw = row.data as unknown as RawPlaybook;
  await prisma.playbook.update({ where: { id }, data: { status: 'PUBLISHED' } });
  await prisma.playbookVersion.create({
    data: { playbookId: id, version: raw.version, data: raw as object, note: 'published' },
  });
}

export async function deletePlaybook(id: string): Promise<void> {
  await prisma.playbook.delete({ where: { id } });
}

export interface VersionMeta {
  version: string;
  note: string | null;
  createdAt: Date;
}

export async function getPlaybookVersions(slug: string): Promise<VersionMeta[]> {
  try {
    const pb = await prisma.playbook.findUnique({
      where: { slug },
      include: { versions: { orderBy: { createdAt: 'desc' }, select: { version: true, note: true, createdAt: true } } },
    });
    return pb?.versions ?? [];
  } catch {
    return [];
  }
}
