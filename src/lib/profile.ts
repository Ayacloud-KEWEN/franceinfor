// User onboarding profile (product / industry / region / stage / budget /
// goals) + market-entry plan progress. Read/parsed from the User JSON columns.
import type { User } from '@prisma/client';
import type { Loc } from './data/payment-credit';

export type { Loc };

export type EntryStage = 'exploring' | 'planning' | 'incorporating' | 'operating' | 'scaling';
export type Budget = 'lt50k' | '50to200k' | '200kto1m' | 'gt1m';
export type Goal = 'customers' | 'distributors' | 'incorporate' | 'tenders' | 'funding' | 'brand' | 'hiring';

export interface EntryProfile {
  product?: string;
  industry?: string;
  region?: string;
  stage?: EntryStage;
  budget?: Budget;
  goals?: Goal[];
}

export type StepStatus = 'todo' | 'doing' | 'done';
export type EntryProgress = Record<string, StepStatus>;

export function parseProfile(user: Pick<User, 'profile'> | null | undefined): EntryProfile | null {
  const p = user?.profile;
  if (!p || typeof p !== 'object' || Array.isArray(p)) return null;
  return p as EntryProfile;
}

export function parseProgress(user: Pick<User, 'entryProgress'> | null | undefined): EntryProgress {
  const p = user?.entryProgress;
  if (!p || typeof p !== 'object' || Array.isArray(p)) return {};
  return p as EntryProgress;
}

// Localized option labels for the onboarding / profile form.
export const STAGE_LABELS: Record<EntryStage, Record<Loc, string>> = {
  exploring: { en: 'Exploring the market', fr: 'Exploration du marché', zh: '正在调研市场' },
  planning: { en: 'Planning entry', fr: 'Planification', zh: '规划落地中' },
  incorporating: { en: 'Setting up (incorporating)', fr: 'En cours d’implantation', zh: '正在注册落地' },
  operating: { en: 'Already operating', fr: 'Déjà opérationnel', zh: '已在运营' },
  scaling: { en: 'Scaling up', fr: 'En croissance', zh: '扩张阶段' },
};

export const BUDGET_LABELS: Record<Budget, Record<Loc, string>> = {
  lt50k: { en: '< €50k', fr: '< 50k€', zh: '< 5 万欧' },
  '50to200k': { en: '€50k – €200k', fr: '50k – 200k€', zh: '5 万 – 20 万欧' },
  '200kto1m': { en: '€200k – €1M', fr: '200k – 1M€', zh: '20 万 – 100 万欧' },
  gt1m: { en: '> €1M', fr: '> 1M€', zh: '> 100 万欧' },
};

export const GOAL_LABELS: Record<Goal, Record<Loc, string>> = {
  customers: { en: 'Find customers', fr: 'Trouver des clients', zh: '寻找客户' },
  distributors: { en: 'Find distributors / partners', fr: 'Distributeurs / partenaires', zh: '寻找分销/伙伴' },
  incorporate: { en: 'Incorporate & set up', fr: 'Créer la société', zh: '注册落地公司' },
  tenders: { en: 'Win public tenders', fr: 'Remporter des marchés publics', zh: '中标公共采购' },
  funding: { en: 'Get subsidies / funding', fr: 'Obtenir des aides / financements', zh: '获取补贴/融资' },
  brand: { en: 'Protect my brand', fr: 'Protéger ma marque', zh: '保护品牌商标' },
  hiring: { en: 'Hire a local team', fr: 'Recruter une équipe', zh: '招聘本地团队' },
};

export function toLoc(locale: string): Loc {
  return locale === 'fr' ? 'fr' : locale === 'zh' ? 'zh' : 'en';
}

// Build an English system-prompt preamble from the user's profile, so the
// copilot tailors answers to their product / sector / stage / goals. Returns
// null when there's nothing useful to personalize on. (English on purpose —
// the output language is enforced separately by the LLM layer.)
export function profilePromptContext(p: EntryProfile | null): string | null {
  if (!p) return null;
  const parts: string[] = [];
  if (p.product) parts.push(`Product/service: ${p.product}`);
  if (p.industry) parts.push(`Industry: ${p.industry}`);
  if (p.region) parts.push(`Target region in France: ${p.region}`);
  if (p.stage) parts.push(`Entry stage: ${STAGE_LABELS[p.stage].en}`);
  if (p.budget) parts.push(`Budget for entry: ${BUDGET_LABELS[p.budget].en}`);
  if (p.goals?.length) parts.push(`Goals: ${p.goals.map((g) => GOAL_LABELS[g].en).join(', ')}`);
  if (!parts.length) return null;
  return (
    `[User profile] The user is a foreign company expanding into France. ` +
    parts.join('. ') +
    `. Tailor every answer to this profile: reference their sector and entry stage, ` +
    `use concrete examples relevant to their product, and prioritize their stated goals. ` +
    `Do not restate the profile back to the user.`
  );
}
