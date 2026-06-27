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
export async function dbListPlaybooks(loc: Loc): Promise<Playbook[]> {
  try {
    const rows = await prisma.playbook.findMany({ orderBy: { slug: 'asc' } });
    if (rows.length) return rows.map((r) => localize(r.data as unknown as RawPlaybook, loc));
  } catch {
    /* fall through */
  }
  return codeList(loc);
}

export async function dbGetPlaybook(slug: string, loc: Loc): Promise<Playbook | undefined> {
  try {
    const row = await prisma.playbook.findUnique({ where: { slug } });
    if (row) return localize(row.data as unknown as RawPlaybook, loc);
  } catch {
    /* fall through */
  }
  return codeGet(slug, loc);
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
