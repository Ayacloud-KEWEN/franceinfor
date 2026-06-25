// Client for BOAMP (French public-procurement bulletin) open data, keyless.
// Opendatasoft Explore API v2.1.
import { seededScore } from '../utils';

const BASE =
  process.env.BOAMP_API ||
  'https://boamp-datadila.opendatasoft.com/api/explore/v2.1';
const DATASET = 'boamp';

export interface TenderResult {
  id: string;
  title: string;
  buyer: string | null;
  description: string | null;
  deadline: string | null;
  publishedAt: string | null;
  region: string | null;
  url: string | null;
  matchScore: number;
  winningProbability: number;
}

export async function searchTenders(
  query: string,
  limit = 20
): Promise<{ results: TenderResult[]; total: number }> {
  const params = new URLSearchParams({
    limit: String(limit),
    order_by: 'dateparution desc',
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
    return {
      id,
      title: r.objet ?? r.titulaire ?? 'Tender',
      buyer: r.nomacheteur ?? r.organisme ?? null,
      description: typeof r.objet === 'string' ? r.objet : null,
      deadline: r.datelimitereponse ?? null,
      publishedAt: r.dateparution ?? null,
      region: r.code_departement?.[0] ?? r.region ?? null,
      url: r.idweb
        ? `https://www.boamp.fr/pages/avis/?q=idweb:"${r.idweb}"`
        : null,
      matchScore: seededScore(id + 'match'),
      winningProbability: seededScore(id + 'win', 20, 85),
    } satisfies TenderResult;
  });

  return { results, total: json.total_count ?? results.length };
}
