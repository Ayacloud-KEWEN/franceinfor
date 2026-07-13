// Mock data + deterministic generators for the remaining modules
// (M2 Discovery, M4 Brand, M9 Buying Intent, M10 Events, M12 Credit).
import { seededScore } from '../utils';

/* ---------------------------------- M9: Buying Intent ---------------------------------- */
export interface IntentCompany {
  id: string;
  name: string;
  industry: string;
  signals: string[];
  intentScore: number;
  urgencyScore: number;
  salesScore: number;
  action: string;
}

const INTENT_RAW = [
  { id: 'i1', name: 'Capgemini', industry: 'IT Services', signals: ['Hiring +40 AI roles', 'New RFP published'] },
  { id: 'i2', name: 'Orange Business', industry: 'Telecom', signals: ['€120M cybersecurity budget', 'Cloud migration'] },
  { id: 'i3', name: 'Thales', industry: 'Defense', signals: ['Robotics partner search', 'R&D expansion'] },
  { id: 'i4', name: 'L’Oréal', industry: 'Luxury', signals: ['Digital transformation', 'Hiring data scientists'] },
  { id: 'i5', name: 'Schneider Electric', industry: 'Energy', signals: ['Smart-factory program', 'Funding round'] },
  { id: 'i6', name: 'Doctolib', industry: 'Health-tech', signals: ['Lyon expansion', '200 new roles'] },
];

export const INTENT_COMPANIES: IntentCompany[] = INTENT_RAW.map((c) => ({
  ...c,
  intentScore: seededScore(c.id + 'int', 55, 96),
  urgencyScore: seededScore(c.id + 'urg', 40, 95),
  salesScore: seededScore(c.id + 'sal', 45, 95),
  action: 'Engage procurement + book discovery call',
}));

/* ---------------------------------- M15: News Radar ---------------------------------- */
export interface NewsItem {
  id: string;
  source: string;
  title: string;
  summary: string;
  signalType: 'Buying' | 'Tender' | 'Partnership' | 'Investment' | 'Expansion' | 'Risk';
  opportunityScore: number;
  date: string;
}

export const NEWS: NewsItem[] = [
  { id: 'n1', source: 'Les Echos', title: 'Mistral AI lève 450M€ pour son expansion', summary: 'La licorne française accélère sur l’IA d’entreprise — forte demande d’intégrateurs.', signalType: 'Investment', date: '2026-06-23' },
  { id: 'n2', source: 'La Tribune', title: 'La Région Île-de-France lance un appel d’offres EdTech', summary: 'Plateforme de formation IA pour lycées professionnels — budget pluriannuel.', signalType: 'Tender', date: '2026-06-22' },
  { id: 'n3', source: 'BFM Business', title: 'Schneider Electric cherche des partenaires robotique', summary: 'Programme smart-factory — opportunité pour intégrateurs et VAR.', signalType: 'Partnership', date: '2026-06-21' },
  { id: 'n4', source: 'Challenges', title: 'Doctolib ouvre un hub à Lyon', summary: '200 recrutements en health-tech — signal d’expansion régionale.', signalType: 'Expansion', date: '2026-06-20' },
  { id: 'n5', source: 'Capital', title: 'Hausse des budgets cybersécurité dans le CAC 40', summary: 'Forte intention d’achat sur les solutions de sécurité.', signalType: 'Buying', date: '2026-06-19' },
  { id: 'n6', source: 'Reuters', title: 'Nouvelle réglementation IA en France', summary: 'Conformité renforcée — risque de mise en conformité pour les entrants.', signalType: 'Risk', date: '2026-06-18' },
].map((n) => ({ ...n, opportunityScore: seededScore(n.id + 'opp', 45, 96) })) as NewsItem[];

/* ---------------------------------- M4: Brand Intelligence ---------------------------------- */
export interface BrandResult {
  id: string;
  mark: string;
  owner: string;
  classes: string;
  office: 'INPI' | 'EUIPO' | 'WIPO';
  riskScore: number;
  similarityScore: number;
  availabilityScore: number;
  recommendation: string;
}

const OFFICES: BrandResult['office'][] = ['INPI', 'EUIPO', 'WIPO'];

export function searchBrands(q: string): BrandResult[] {
  const base = q.trim() || 'Brand';
  return Array.from({ length: 5 }, (_, i) => {
    const id = `${base}-${i}`;
    const avail = seededScore(id + 'av', 10, 95);
    return {
      id,
      mark: i === 0 ? base : `${base}${['X', ' Pro', ' Lab', ' France', ' Tech'][i]}`,
      owner: ['—', 'SAS Innovatech', 'Groupe Devreux', 'EURL Martin', 'SA Lumière'][i],
      classes: ['9, 42', '35, 41', '9', '42', '9, 35, 42'][i],
      office: OFFICES[i % 3],
      riskScore: seededScore(id + 'rk', 15, 90),
      similarityScore: seededScore(id + 'sim', 20, 95),
      availabilityScore: avail,
      recommendation: avail > 65 ? 'Available — proceed to register' : avail > 40 ? 'Caution — refine the mark' : 'High conflict — choose another mark',
    };
  });
}

/* ---------------------------------- M12: Credit Intelligence ---------------------------------- */
export interface CreditScore {
  label: string;
  score: number;
  explanation: string;
}

export interface LegalInput {
  available: boolean;
  collectiveProcedures: number;
  total: number;
  score: number; // precomputed legal-risk score (higher = safer)
}

export function creditProfile(
  name: string,
  real?: { revenue: number | null; netResult: number | null; year: string | null },
  legal?: LegalInput
): { company: string; scores: CreditScore[]; trust: number; realData: boolean; realLegal: boolean } {
  const n = name.trim() || 'Company';
  const mk = (label: string, key: string, expl: string): CreditScore => ({
    label,
    score: seededScore(n + key, 35, 95),
    explanation: expl,
  });

  // Real financial-health score derived from registry data when available.
  let financialHealth: CreditScore;
  const hasReal = Boolean(real && real.revenue != null);
  if (hasReal && real) {
    const margin = real.revenue ? (real.netResult ?? 0) / real.revenue : 0;
    const scaleSize = Math.min(40, Math.log10(Math.max(real.revenue!, 1)) * 5); // size factor
    const score = Math.max(35, Math.min(98, Math.round(50 + margin * 200 + scaleSize)));
    financialHealth = {
      label: 'Financial Health',
      score,
      explanation: `Based on real ${real.year} revenue €${(real.revenue! / 1e6).toFixed(1)}M and net margin ${(margin * 100).toFixed(1)}% (data.gouv.fr).`,
    };
  } else {
    financialHealth = mk('Financial Health', 'fh', 'Estimated — no public financials found.');
  }

  // Real legal-risk score from BODACC when available.
  const hasLegal = Boolean(legal?.available);
  const legalRisk: CreditScore = hasLegal
    ? {
        label: 'Legal Risk',
        score: legal!.score,
        explanation:
          legal!.collectiveProcedures > 0
            ? `${legal!.collectiveProcedures} insolvency/recovery procedure(s) found in ${legal!.total} BODACC notices (live BODACC).`
            : `No insolvency procedures in ${legal!.total} BODACC notices (live BODACC).`,
      }
    : mk('Legal Risk', 'lr', 'Estimated — BODACC lookup unavailable.');

  const scores = [
    financialHealth,
    mk('Payment Risk', 'pr', 'Derived from payment incidents and DSO patterns.'),
    mk('Supplier Reliability', 'sr', 'On-time delivery and contract continuity history.'),
    legalRisk,
    mk('Growth', 'gr', 'Headcount, revenue and market-share momentum.'),
  ];
  const trust = Math.round(scores.reduce((s, x) => s + x.score, 0) / scores.length);
  return { company: n, scores, trust, realData: hasReal, realLegal: hasLegal };
}

/* ---------------------------------- M13/14: Agent orchestration ---------------------------------- */
export const COPILOT_AGENTS = [
  'Market Agent',
  'Company Agent',
  'Brand Agent',
  'Tender Agent',
  'Customer Agent',
  'Partner Agent',
  'Contact Agent',
  'Credit Agent',
];
