// Real France market size & growth by sector from Eurostat (keyless).
// Dataset nama_10_a64: gross value added (B1G) at current prices (€M) by NACE.
import { INDUSTRIES, type Industry } from '../data/industries';

const BASE =
  'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nama_10_a64';

export interface SectorStat {
  valueBn: number; // latest gross value added, € billions
  year: string;
  growthPct: number; // YoY growth from the two latest non-null years
}

// Parse JSON-stat: build value(nace, time) accessor from flat indices.
function buildAccessor(d: any) {
  const ids: string[] = d.id;
  const size: number[] = d.size;
  const strides = new Array(size.length).fill(1);
  for (let i = size.length - 2; i >= 0; i--) strides[i] = strides[i + 1] * size[i + 1];
  const naceIdx: Record<string, number> = d.dimension.nace_r2.category.index;
  const timeIdx: Record<string, number> = d.dimension.time.category.index;
  const years = Object.keys(timeIdx).sort();
  const val: Record<string, number> = d.value;

  const get = (nace: string, year: string): number | null => {
    if (!(nace in naceIdx) || !(year in timeIdx)) return null;
    const coords: Record<string, number> = {};
    for (const k of ids) coords[k] = 0;
    coords['nace_r2'] = naceIdx[nace];
    coords['time'] = timeIdx[year];
    let flat = 0;
    ids.forEach((k, i) => (flat += coords[k] * strides[i]));
    const v = val[String(flat)];
    return typeof v === 'number' ? v : null;
  };
  return { get, years, naceCodes: Object.keys(naceIdx) };
}

export async function fetchMarketStats(naceCodes: string[]): Promise<Record<string, SectorStat>> {
  const params = new URLSearchParams({ freq: 'A', unit: 'CP_MEUR', na_item: 'B1G', geo: 'FR' });
  const qs = naceCodes.map((c) => `nace_r2=${encodeURIComponent(c)}`).join('&');
  const res = await fetch(`${BASE}?${params.toString()}&${qs}`, {
    headers: { accept: 'application/json' },
    next: { revalidate: 86400 }, // yearly data — cache a day
  });
  if (!res.ok) throw new Error(`eurostat ${res.status}`);
  const d = await res.json();
  const { get, years } = buildAccessor(d);

  const out: Record<string, SectorStat> = {};
  for (const nace of naceCodes) {
    // collect non-null (year,value) pairs, latest first
    const pairs = years
      .map((y) => [y, get(nace, y)] as const)
      .filter(([, v]) => v != null) as [string, number][];
    if (!pairs.length) continue;
    const [lastYear, lastVal] = pairs[pairs.length - 1];
    const prev = pairs[pairs.length - 2];
    const growthPct = prev ? ((lastVal - prev[1]) / prev[1]) * 100 : 0;
    out[nace] = {
      valueBn: Number((lastVal / 1000).toFixed(1)),
      year: lastYear,
      growthPct: Number(growthPct.toFixed(1)),
    };
  }
  return out;
}

// Full multi-year value-added series for one NACE sector (real, € billions).
export async function fetchSectorHistory(
  naceCode: string
): Promise<{ year: string; valueBn: number }[]> {
  const params = new URLSearchParams({ freq: 'A', unit: 'CP_MEUR', na_item: 'B1G', geo: 'FR' });
  const res = await fetch(`${BASE}?${params.toString()}&nace_r2=${encodeURIComponent(naceCode)}`, {
    headers: { accept: 'application/json' },
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`eurostat ${res.status}`);
  const d = await res.json();
  const { get, years } = buildAccessor(d);
  return years
    .map((y) => ({ year: y, v: get(naceCode, y) }))
    .filter((p) => p.v != null)
    .map((p) => ({ year: p.year, valueBn: Number((p.v! / 1000).toFixed(1)) }));
}

// Returns INDUSTRIES with real Eurostat size/growth merged in where available.
export async function getIndustriesWithRealStats(): Promise<Industry[]> {
  const { NACE_CODES } = await import('../data/industries');
  let stats: Record<string, SectorStat> = {};
  try {
    stats = await fetchMarketStats(NACE_CODES);
  } catch {
    return INDUSTRIES; // fallback to constants
  }
  return INDUSTRIES.map((ind) => {
    const s = stats[ind.naceCode];
    if (!s) return ind;
    return {
      ...ind,
      marketSizeBn: s.valueBn,
      cagr: s.growthPct > 0 ? s.growthPct : ind.cagr, // keep est. growth if real is flat/negative
      real: true,
    };
  });
}
