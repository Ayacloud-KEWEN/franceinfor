import { NextRequest, NextResponse } from 'next/server';
import { ingestUrl } from '@/lib/raw-ingest';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// L1 raw-data crawl. Triggered daily by an external scheduler (same CRON_SECRET
// pattern as the digest). Fetches a configured set of official sources and
// stores each raw document, versioned and deduped. Extend SOURCES over time.
// Curated set of real French/EU official sources. Fetch is best-effort — any
// URL that fails is skipped (counted as `failed`), so the list can grow freely.
const SOURCES: { url: string; source: string; docType: string }[] = [
  // service-public / entreprendre — content-rich SSR pages
  { url: 'https://entreprendre.service-public.fr/vosdroits/F22276', source: 'service-public', docType: 'regulation' }, // permis de construire
  { url: 'https://entreprendre.service-public.fr/vosdroits/F33414', source: 'service-public', docType: 'regulation' }, // ICPE
  { url: 'https://entreprendre.service-public.fr/vosdroits/F23844', source: 'service-public', docType: 'regulation' }, // TVA — régimes d'imposition
  { url: 'https://entreprendre.service-public.fr/vosdroits/F36674', source: 'service-public', docType: 'regulation' }, // création d'entreprise — démarches
  // Official authorities referenced by the playbooks
  { url: 'https://www.douane.gouv.fr/demarche/obtenir-un-numero-eori', source: 'douane', docType: 'procedure' },
  { url: 'https://formalites.entreprises.gouv.fr/', source: 'inpi-guichet-unique', docType: 'procedure' },
  { url: 'https://www.economie.gouv.fr/dgccrf', source: 'dgccrf', docType: 'authority' },
  { url: 'https://www.cnil.fr/', source: 'cnil', docType: 'authority' },
];

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET || '';
  const provided =
    req.nextUrl.searchParams.get('key') ||
    (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const results: Record<string, number> = { created: 0, versioned: 0, unchanged: 0, failed: 0 };
  for (const s of SOURCES) {
    const r = await ingestUrl(s.url, s.source, s.docType, 'fr');
    if (!r) results.failed++;
    else results[r.action]++;
  }
  return NextResponse.json({ ok: true, ...results });
}
