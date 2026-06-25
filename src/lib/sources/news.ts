// France business news via Google News RSS — keyless.
// Classifies each headline into a business signal type and an opportunity score.
import { seededScore } from '../utils';

export type SignalType =
  | 'Buying'
  | 'Tender'
  | 'Partnership'
  | 'Investment'
  | 'Expansion'
  | 'Risk';

export interface LiveNewsItem {
  id: string;
  source: string;
  title: string;
  url: string;
  signalType: SignalType;
  opportunityScore: number;
  date: string | null;
}

const RULES: { type: SignalType; kw: RegExp }[] = [
  { type: 'Investment', kw: /acquisition|fusion|rachat|lev[ée]e de fonds|l[èe]ve|investit|financement|valorisation|IPO|introduction en bourse|série [a-d]/i },
  { type: 'Tender', kw: /appel d'?offres|march[ée] public|attribu[ée]|adjudication/i },
  { type: 'Partnership', kw: /partenariat|partenaire|alliance|collabor|accord strat[ée]gique|coentreprise|joint[- ]venture/i },
  { type: 'Risk', kw: /faillite|redressement|liquidation|enqu[êe]te|amende|sanction|fraude|plan social|licencie|gr[èe]ve|cyberattaque|piratage/i },
  { type: 'Expansion', kw: /ouvre|ouverture|implante|implantation|expansion|nouvelle usine|recrute|embauche|recrutement|cr[ée]ations? d'?emplois/i },
];

function classify(title: string): SignalType {
  for (const r of RULES) if (r.kw.test(title)) return r.type;
  return 'Buying';
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .trim();
}

function tag(block: string, name: string): string | null {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  if (!m) return null;
  return decodeEntities(m[1].replace(/<!\[CDATA\[|\]\]>/g, ''));
}

const DEFAULT_QUERY =
  'entreprise OR acquisition OR "levée de fonds" OR partenariat OR "appel d\'offres" France';

export async function fetchFranceNews(query?: string, limit = 24): Promise<LiveNewsItem[]> {
  const q = (query && query.trim()) || DEFAULT_QUERY;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=fr&gl=FR&ceid=FR:fr`;

  const res = await fetch(url, {
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; france-os/1.0)' },
    next: { revalidate: 900 },
  });
  if (!res.ok) throw new Error(`google-news ${res.status}`);
  const xml = await res.text();

  const items = xml.split('<item>').slice(1).map((s) => s.split('</item>')[0]);
  return items.slice(0, limit).map((block, i) => {
    const rawTitle = tag(block, 'title') ?? 'Untitled';
    const source = tag(block, 'source') ?? 'Google News';
    // Google News titles end with " - Source"; trim that.
    const title = rawTitle.replace(new RegExp(`\\s*-\\s*${source}\\s*$`), '').trim();
    const link = tag(block, 'link') ?? '#';
    const pub = tag(block, 'pubDate');
    const id = `${i}-${title.slice(0, 24)}`;
    return {
      id,
      source,
      title,
      url: link,
      signalType: classify(title),
      opportunityScore: seededScore(id + 'opp', 45, 96),
      date: pub ? new Date(pub).toISOString().slice(0, 10) : null,
    };
  });
}
