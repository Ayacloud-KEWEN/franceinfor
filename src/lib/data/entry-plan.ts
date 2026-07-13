// The market-entry "spine": an ordered, phased plan that threads the app's
// modules into a single guided journey (research → establish → grow). Each
// step deep-links to the module that does the work. Per-user completion is
// stored in User.entryProgress ({ stepId: 'todo'|'doing'|'done' }).
//
// This is the connective tissue the app was missing: a "where do I start /
// what's next" plan, personalized by the onboarding profile.
import type { Loc } from '../data/payment-credit';
import type { EntryProfile, EntryProgress, Goal } from '../profile';

type L = Record<Loc, string>;

export interface PlanStep {
  id: string;
  title: L;
  desc: L;
  href: string; // in-app deep link (without locale prefix)
  goals?: Goal[]; // profile goals this step serves (for personalization)
}

export interface PlanPhase {
  id: string;
  title: L;
  subtitle: L;
  steps: PlanStep[];
}

export const ENTRY_PLAN: PlanPhase[] = [
  {
    id: 'research',
    title: { en: '1 · Research the market', fr: '1 · Étudier le marché', zh: '一 · 市场调研' },
    subtitle: {
      en: 'Size the opportunity and map who matters before you commit.',
      fr: 'Évaluer l’opportunité et cartographier les acteurs avant de vous engager.',
      zh: '在投入之前,先评估机会规模、摸清关键玩家。',
    },
    steps: [
      {
        id: 'market-size',
        title: { en: 'Size your sector', fr: 'Dimensionner votre secteur', zh: '评估行业规模' },
        desc: { en: 'Check real French market size, growth and outlook for your industry.', fr: 'Taille, croissance et perspectives réelles de votre secteur en France.', zh: '查看你所在行业在法国的真实市场规模、增速与前景。' },
        href: '/markets',
      },
      {
        id: 'ecosystem',
        title: { en: 'Map the ecosystem', fr: 'Cartographier l’écosystème', zh: '梳理行业生态' },
        desc: { en: 'Discover real customers, distributors, integrators and partners.', fr: 'Découvrir clients, distributeurs, intégrateurs et partenaires réels.', zh: '发现真实的客户、分销商、集成商与合作伙伴。' },
        href: '/discover',
        goals: ['customers', 'distributors'],
      },
      {
        id: 'competitors',
        title: { en: 'Study companies', fr: 'Étudier les entreprises', zh: '研究目标企业' },
        desc: { en: 'Look up real French companies: financials, executives, status.', fr: 'Consulter des entreprises françaises : finances, dirigeants, statut.', zh: '查询真实法国企业:财务、高管、状态。' },
        href: '/companies',
        goals: ['customers'],
      },
      {
        id: 'compliance',
        title: { en: 'Check compliance', fr: 'Vérifier la conformité', zh: '核对合规要求' },
        desc: { en: 'Sector rules, certifications, VAT, employment and GDPR basics.', fr: 'Règles sectorielles, certifications, TVA, emploi et RGPD.', zh: '行业规则、认证、增值税、雇佣与 GDPR 要点。' },
        href: '/compliance',
      },
    ],
  },
  {
    id: 'establish',
    title: { en: '2 · Establish your presence', fr: '2 · S’implanter', zh: '二 · 落地立足' },
    subtitle: {
      en: 'Incorporate, bank, office and hire — the soft-landing essentials.',
      fr: 'Créer la société, ouvrir un compte, s’installer et recruter.',
      zh: '注册公司、开户、选址、招聘 —— 软着陆的核心动作。',
    },
    steps: [
      {
        id: 'incorporate',
        title: { en: 'Incorporate & set up', fr: 'Créer la société', zh: '注册与架构搭建' },
        desc: { en: 'Legal form, tax, banking, office and hiring — the landing package.', fr: 'Forme juridique, fiscalité, banque, bureaux, recrutement — le pack d’implantation.', zh: '法律形式、税务、开户、办公室、招聘 —— 落地打包方案。' },
        href: '/companies',
        goals: ['incorporate', 'hiring'],
      },
      {
        id: 'brand',
        title: { en: 'Protect your brand', fr: 'Protéger votre marque', zh: '注册保护品牌' },
        desc: { en: 'Search prior marks and register at INPI / EUIPO.', fr: 'Rechercher les antériorités et déposer à l’INPI / EUIPO.', zh: '检索在先商标并在 INPI / EUIPO 注册。' },
        href: '/brands',
        goals: ['brand'],
      },
      {
        id: 'credit-terms',
        title: { en: 'Set payment & credit terms', fr: 'Définir paiement & crédit', zh: '设定账期与信用' },
        desc: { en: 'Learn statutory payment terms and how to insure receivables.', fr: 'Délais de paiement légaux et assurance des créances.', zh: '了解法定付款账期与应收账款投保。' },
        href: '/credit',
      },
    ],
  },
  {
    id: 'grow',
    title: { en: '3 · Win business & grow', fr: '3 · Développer', zh: '三 · 拿单增长' },
    subtitle: {
      en: 'Turn presence into revenue: tenders, funding, buyers and events.',
      fr: 'Transformer la présence en chiffre d’affaires : marchés, aides, acheteurs, salons.',
      zh: '把"存在"变成"收入":招标、补贴、买家、展会。',
    },
    steps: [
      {
        id: 'tenders',
        title: { en: 'Track public tenders', fr: 'Suivre les marchés publics', zh: '跟踪公共招标' },
        desc: { en: 'Search live BOAMP / TED / PLACE procurement opportunities.', fr: 'Rechercher les marchés BOAMP / TED / PLACE en direct.', zh: '实时检索 BOAMP / TED / PLACE 采购机会。' },
        href: '/opportunities',
        goals: ['tenders'],
      },
      {
        id: 'funding',
        title: { en: 'Match subsidies & funding', fr: 'Trouver aides & financements', zh: '匹配补贴与扶持资金' },
        desc: { en: 'Match French grants and support schemes to your project.', fr: 'Faire correspondre aides et dispositifs à votre projet.', zh: '为你的项目匹配法国补贴与扶持项目。' },
        href: '/funding',
        goals: ['funding'],
      },
      {
        id: 'buyers',
        title: { en: 'Engage high-intent buyers', fr: 'Cibler les acheteurs actifs', zh: '触达高意向买家' },
        desc: { en: 'Act on companies showing live buying / expansion signals.', fr: 'Agir sur les entreprises à signaux d’achat / d’expansion.', zh: '针对正在释放采购/扩张信号的企业出击。' },
        href: '/intent',
        goals: ['customers'],
      },
      {
        id: 'events',
        title: { en: 'Plan trade shows', fr: 'Planifier les salons', zh: '规划参展' },
        desc: { en: 'Pick the right French trade shows and conferences to attend.', fr: 'Choisir les bons salons et conférences français.', zh: '挑选值得参加的法国展会与会议。' },
        href: '/events',
        goals: ['customers', 'distributors'],
      },
    ],
  },
];

export const ALL_STEPS: PlanStep[] = ENTRY_PLAN.flatMap((p) => p.steps);

export function planProgress(progress: EntryProgress): { done: number; total: number; pct: number } {
  const total = ALL_STEPS.length;
  const done = ALL_STEPS.filter((s) => progress[s.id] === 'done').length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

// The next few actionable steps (not done), profile-goals first when available.
export function nextSteps(progress: EntryProgress, profile: EntryProfile | null, n = 3): PlanStep[] {
  const goals = new Set(profile?.goals ?? []);
  const pending = ALL_STEPS.filter((s) => progress[s.id] !== 'done');
  const scored = pending
    .map((s, i) => ({
      s,
      order: i,
      // in-progress first, then goal-matching, then plan order
      rank:
        (progress[s.id] === 'doing' ? -100 : 0) +
        (s.goals?.some((g) => goals.has(g)) ? -10 : 0),
    }))
    .sort((a, b) => a.rank - b.rank || a.order - b.order);
  return scored.slice(0, n).map((x) => x.s);
}
