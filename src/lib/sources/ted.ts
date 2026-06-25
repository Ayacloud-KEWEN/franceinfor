// TED (Tenders Electronic Daily) EU procurement — keyless public Search API v3.
// https://api.ted.europa.eu/v3/notices/search
import { seededScore } from '../utils';
import type { TenderResult } from './boamp';

const BASE = process.env.TED_API || 'https://api.ted.europa.eu/v3';

// TED multilingual fields: values are sometimes a string, sometimes an array.
function coerce(v: any): string | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : String(v);
}
function pickLang(obj: any): string | null {
  if (!obj) return null;
  if (typeof obj === 'string') return obj;
  const chosen = obj.fra ?? obj.eng ?? obj.fre ?? Object.values(obj)?.[0];
  return coerce(chosen);
}

export async function searchTedTenders(
  query: string,
  limit = 20
): Promise<{ results: TenderResult[]; total: number }> {
  const ft = query.trim() ? `(FT~"${query.replace(/"/g, '')}") AND ` : '';
  const expert = `${ft}(buyer-country=FRA) SORT BY publication-date DESC`;

  const res = await fetch(`${BASE}/notices/search`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      query: expert,
      limit,
      fields: [
        'publication-number',
        'notice-title',
        'buyer-name',
        'publication-date',
        'deadline-receipt-tender-date-lot',
      ],
    }),
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`ted ${res.status}`);
  const json = await res.json();
  const notices: any[] = json.notices ?? [];

  const results: TenderResult[] = notices.map((n) => {
    const id = String(n['publication-number'] ?? Math.random());
    const deadlineRaw = Array.isArray(n['deadline-receipt-tender-date-lot'])
      ? n['deadline-receipt-tender-date-lot'][0]
      : n['deadline-receipt-tender-date-lot'];
    return {
      id,
      title: pickLang(n['notice-title']) ?? `Notice ${id}`,
      buyer: pickLang(n['buyer-name']),
      description: null,
      deadline: deadlineRaw ? String(deadlineRaw).slice(0, 10) : null,
      publishedAt: n['publication-date'] ? String(n['publication-date']).slice(0, 10) : null,
      region: 'EU / France',
      url: `https://ted.europa.eu/en/notice/-/detail/${id}`,
      matchScore: seededScore(id + 'match'),
      winningProbability: seededScore(id + 'win', 20, 85),
    };
  });

  return { results, total: json.totalNoticeCount ?? results.length };
}
