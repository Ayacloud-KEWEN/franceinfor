// PLACE (marches-publics.gouv.fr) — French state procurement platform (ATEXO MPE).
// No public JSON API; the entreprise search results are server-rendered, so we
// parse the HTML of the public quick-search page (robots.txt allows everything).
// Keyword search: GET /espace-entreprise/search?keyWord=... (redirects to the
// PRADO results page). Empty query: the "all open consultations" listing.
import { keywordRelevance } from '../utils';
import type { TenderResult } from './boamp';

const BASE = process.env.PLACE_URL || 'https://www.marches-publics.gouv.fr';

const FR_MONTHS: Record<string, string> = {
  janvier: '01', février: '02', fevrier: '02', mars: '03', avril: '04',
  mai: '05', juin: '06', juillet: '07', août: '08', aout: '08',
  septembre: '09', octobre: '10', novembre: '11', décembre: '12', decembre: '12',
};

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function match1(chunk: string, re: RegExp): string | null {
  const m = chunk.match(re);
  return m ? decodeEntities(m[1]) : null;
}

export async function searchPlaceTenders(
  query: string,
  _limit = 20
): Promise<{ results: TenderResult[]; total: number }> {
  const q = query.trim();
  const url = q
    ? `${BASE}/espace-entreprise/search?keyWord=${encodeURIComponent(q)}`
    : `${BASE}/?page=Entreprise.EntrepriseAdvancedSearch&AllCons`;

  const res = await fetch(url, {
    headers: {
      accept: 'text/html',
      'user-agent': 'FranceGo/1.0 (+https://francego.fr)',
    },
    redirect: 'follow',
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`place ${res.status}`);
  const html = await res.text();

  const total = Number(
    html.match(/id="[^"]*nombreElement">\s*(\d+)\s*</)?.[1] ?? 0
  );

  // Each result card starts with class="item_consultation ..."
  const chunks = html.split(/class="item_consultation/).slice(1);

  const results: TenderResult[] = [];
  for (const chunk of chunks) {
    const id = match1(chunk, /refCons"[^>]*value="(\d+)"/);
    if (!id) continue;

    // panelBlocIntitule holds "REFERENCE | INTITULE"; the title sits in a tooltip span.
    const intitule = chunk.match(
      /panelBlocIntitule[\s\S]*?data-toggle="tooltip"\s+title="([^"]*)"/
    );
    const objet = chunk.match(
      /panelBlocObjet[\s\S]*?truncate-700"\s*title="([^"]*)"/
    );
    const organisme = chunk.match(
      /panelBlocDenomination[\s\S]*?truncate-700"\s*title="([^"]*)"/
    );
    const lieu = chunk.match(
      /panelBlocLieuxExec[\s\S]*?fa-map-marker[^>]*><\/i>\s*<span>\s*([^<]+?)\s*<\/span>/
    );

    // Calendar block = closing date (date limite de remise des plis).
    const day = match1(chunk, /class="day">\s*<span>\s*(\d{1,2})\s*<\/span>/);
    const month = match1(chunk, /class="month">\s*<span>\s*([A-Za-zÀ-ÿ.]+)\s*<\/span>/);
    const year = match1(chunk, /class="year">\s*<span>\s*(\d{4})\s*<\/span>/);
    const mm = month ? FR_MONTHS[month.toLowerCase().replace('.', '')] : null;
    const deadline =
      day && mm && year ? `${year}-${mm}-${day.padStart(2, '0')}` : null;

    const title = intitule ? decodeEntities(intitule[1]) : null;
    const description = objet ? decodeEntities(objet[1]) : null;
    const buyer = organisme ? decodeEntities(organisme[1]) : null;
    const finalTitle = title || description || `Consultation ${id}`;

    results.push({
      id,
      title: finalTitle,
      buyer,
      description,
      deadline,
      publishedAt: null,
      region: lieu ? decodeEntities(lieu[1]) : null,
      url: `${BASE}/entreprise/consultation/${id}`,
      matchScore: keywordRelevance(query, `${finalTitle} ${buyer ?? ''} ${description ?? ''}`),
    });
  }

  return { results, total: total || results.length };
}
