// Market-entry cost & ROI model for the Companies module.
//
// Transparent, itemized first-year cost of landing in France (incorporation +
// office + accounting + employees + compliance), from curated real French
// benchmarks (2026) — not LLM output. The employer-cost multiplier and the
// working-capital note reuse the same facts as the landing package (hiring
// pillar) and the credit module (statutory payment terms). Pure & client-safe.
import type { Loc } from './payment-credit';
export type { Loc };

type L = Record<Loc, string>;

export type LegalForm = 'sas' | 'sarl' | 'branch';
export type OfficeType = 'domiciliation' | 'coworking' | 'lease';
export type Region = 'paris' | 'other';

export interface CostInput {
  legalForm: LegalForm;
  region: Region;
  office: OfficeType;
  employees: number; // headcount (local hires)
  grossSalary: number; // average annual gross salary per employee, €
  includeTrademark: boolean;
  complianceBuffer: number; // sector compliance/certification budget, €/yr
  // ROI
  revenue: number; // expected first-year revenue, €
  marginPct: number; // gross margin %, 0-100
}

export const DEFAULT_INPUT: CostInput = {
  legalForm: 'sas',
  region: 'paris',
  office: 'coworking',
  employees: 1,
  grossSalary: 42000,
  includeTrademark: true,
  complianceBuffer: 1500,
  revenue: 150000,
  marginPct: 40,
};

// Employer social charges on top of gross salary in France (~42%). Same basis
// as the landing package hiring pillar ("employer cost ≈ salary × 1.42").
export const EMPLOYER_CHARGE_RATE = 0.42;

// One-time incorporation & legal setup cost by legal form (with professional
// assistance; DIY via the Guichet unique is cheaper).
const INCORP_COST: Record<LegalForm, number> = { sas: 1500, sarl: 1300, branch: 800 };

// Annual office cost by type and region (€/yr).
const OFFICE_COST: Record<OfficeType, Record<Region, number>> = {
  domiciliation: { paris: 720, other: 480 },
  coworking: { paris: 4200, other: 2400 },
  lease: { paris: 12000, other: 7200 },
};

const TRADEMARK_INPI = 190; // 1 class, INPI e-filing
const ACCOUNTING_YR = 2400; // expert-comptable for a small entity
const INSURANCE_YR = 1200; // RC Pro + basics

export interface LineItem {
  key: string;
  label: L;
  amount: number;
  note?: L;
}

export interface CostEstimate {
  setup: LineItem[];
  annual: LineItem[];
  setupTotal: number;
  annualTotal: number;
  year1Total: number;
  roi: {
    revenue: number;
    marginPct: number;
    contribution: number;
    year1Net: number;
    breakevenMonths: number | null; // null when never breaks even in horizon
    roiPct: number;
  };
}

const money = (n: number) => Math.round(n);

export function estimateCost(input: CostInput): CostEstimate {
  const setup: LineItem[] = [
    {
      key: 'incorporation',
      label: { en: 'Incorporation & statutes', fr: 'Immatriculation & statuts', zh: '注册与公司章程' },
      amount: INCORP_COST[input.legalForm],
      note: { en: 'with professional assistance', fr: 'avec accompagnement', zh: '含专业代办' },
    },
  ];
  if (input.includeTrademark) {
    setup.push({
      key: 'trademark',
      label: { en: 'Trademark registration (INPI, 1 class)', fr: 'Dépôt de marque (INPI, 1 classe)', zh: '商标注册(INPI,1 类)' },
      amount: TRADEMARK_INPI,
    });
  }

  const employerCostPer = input.grossSalary * (1 + EMPLOYER_CHARGE_RATE);
  const payroll = money(employerCostPer * Math.max(0, input.employees));

  const annual: LineItem[] = [
    {
      key: 'office',
      label: { en: 'Office', fr: 'Bureaux', zh: '办公室' },
      amount: OFFICE_COST[input.office][input.region],
      note:
        input.office === 'domiciliation'
          ? { en: 'registered address', fr: 'domiciliation', zh: '注册地址托管' }
          : input.office === 'coworking'
            ? { en: 'coworking desk', fr: 'poste en coworking', zh: '联合办公工位' }
            : { en: 'small commercial lease', fr: 'petit bail commercial', zh: '小型商业租约' },
    },
    {
      key: 'payroll',
      label: { en: 'Team (employer cost)', fr: 'Équipe (coût employeur)', zh: '团队(雇主总成本)' },
      amount: payroll,
      note: {
        en: `${input.employees} × €${money(input.grossSalary).toLocaleString()} gross × 1.42`,
        fr: `${input.employees} × ${money(input.grossSalary).toLocaleString()} € brut × 1,42`,
        zh: `${input.employees} 人 × ${money(input.grossSalary).toLocaleString()}€ 税前 × 1.42`,
      },
    },
    {
      key: 'accounting',
      label: { en: 'Accounting (expert-comptable)', fr: 'Comptabilité (expert-comptable)', zh: '会计(注册会计师)' },
      amount: ACCOUNTING_YR,
    },
    {
      key: 'insurance',
      label: { en: 'Insurance (RC Pro, basics)', fr: 'Assurances (RC Pro, base)', zh: '保险(职业责任险等)' },
      amount: INSURANCE_YR,
    },
    {
      key: 'compliance',
      label: { en: 'Compliance & certifications', fr: 'Conformité & certifications', zh: '合规与认证' },
      amount: money(Math.max(0, input.complianceBuffer)),
      note: { en: 'sector-dependent budget', fr: 'budget selon le secteur', zh: '按行业预留' },
    },
  ];

  const setupTotal = money(setup.reduce((s, x) => s + x.amount, 0));
  const annualTotal = money(annual.reduce((s, x) => s + x.amount, 0));
  const year1Total = setupTotal + annualTotal;

  const contribution = money((input.revenue * Math.min(100, Math.max(0, input.marginPct))) / 100);
  const year1Net = contribution - year1Total;
  const monthly = contribution / 12;
  const breakevenMonths = monthly > 0 ? Math.ceil(year1Total / monthly) : null;
  const roiPct = year1Total > 0 ? Math.round((year1Net / year1Total) * 100) : 0;

  return {
    setup,
    annual,
    setupTotal,
    annualTotal,
    year1Total,
    roi: { revenue: input.revenue, marginPct: input.marginPct, contribution, year1Net, breakevenMonths, roiPct },
  };
}
