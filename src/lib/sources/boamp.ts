// Client for BOAMP (French public-procurement bulletin) open data, keyless.
// Opendatasoft Explore API v2.1.
import { keywordRelevance } from '../utils';

const BASE =
  process.env.BOAMP_API ||
  'https://boamp-datadila.opendatasoft.com/api/explore/v2.1';
const DATASET = 'boamp';

// Only the fields we actually map. The full BOAMP record carries large nested
// blobs (criteres, donnees, annonces_anterieures…); selecting just these cuts
// the payload ~100× (2.7MB → ~20KB for 100 records), keeping it under Next's
// 2MB fetch-cache limit so results cache instead of re-fetching every time.
const SELECT = 'idweb,id,gestion,objet,titulaire,nomacheteur,datelimitereponse,dateparution,code_departement';

export interface TenderResult {
  id: string;
  title: string;
  buyer: string | null;
  description: string | null;
  deadline: string | null;
  publishedAt: string | null;
  region: string | null;
  url: string | null;
  matchScore: number; // real keyword relevance vs the query (0 when browsing)
}

export async function searchTenders(
  query: string,
  limit = 20
): Promise<{ results: TenderResult[]; total: number }> {
  const params = new URLSearchParams({
    limit: String(limit),
    order_by: 'dateparution desc',
    select: SELECT,
  });
  if (query.trim()) {
    // full-text search over the dataset
    params.set('where', `search(objet,"${query.replace(/"/g, '')}")`);
  }
  const url = `${BASE}/catalog/datasets/${DATASET}/records?${params.toString()}`;

  const res = await fetch(url, {
    headers: { accept: 'application/json' },
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(`boamp ${res.status}`);
  }
  const json = await res.json();
  const records: any[] = json.results ?? [];

  const results = records.map((r) => {
    const id = String(r.idweb ?? r.id ?? r.gestion ?? Math.random());
    const title = r.objet ?? r.titulaire ?? 'Tender';
    const buyer = r.nomacheteur ?? r.organisme ?? null;
    return {
      id,
      title,
      buyer,
      description: typeof r.objet === 'string' ? r.objet : null,
      deadline: r.datelimitereponse ?? null,
      publishedAt: r.dateparution ?? null,
      region: r.code_departement?.[0] ?? r.region ?? null,
      url: r.idweb
        ? `https://www.boamp.fr/pages/avis/?q=idweb:"${r.idweb}"`
        : null,
      matchScore: keywordRelevance(query, `${title} ${buyer ?? ''}`),
    } satisfies TenderResult;
  });

  return { results, total: json.total_count ?? results.length };
}
