// "Soft-landing package" for the Companies module (M?): a one-stop bundled
// offer covering incorporation & tax, banking & accounting, office & location,
// hiring & labour law.
//
// ⚠️ Moat by design (信息屏蔽): only FRAMEWORK-level facts are public here.
// The operational know-how (vetted provider network, cost benchmarks, filled
// templates, negotiation playbooks) is listed by NAME only — the content
// itself never ships to the client bundle. Unlocking = talking to us (lead
// form), not reading further. Do not paste real playbook content into this
// file.

import type { Loc } from './payment-credit';
export type { Loc };

type L = Record<Loc, string>;

export interface LandingPillar {
  id: string;
  title: L;
  /** Public, framework-level teaser bullets. */
  teaser: L[];
  /** Names of gated deliverables — names only, content stays offline. */
  gated: L[];
}

export const LANDING_HERO: { title: L; intro: L; timeline: L; cta: L } = {
  title: {
    en: 'France Soft-Landing Package — one contract, everything done',
    fr: 'Pack d’implantation en France — un contrat, tout est géré',
    zh: '法国落地打包方案 —— 一份合同，一站办齐',
  },
  intro: {
    en: 'Incorporation, tax setup, bank account, office and first hires — delivered as one bundled project with a single point of contact, instead of you coordinating five French providers in French.',
    fr: 'Immatriculation, fiscalité, compte bancaire, bureaux et premiers recrutements — livrés comme un seul projet avec un interlocuteur unique.',
    zh: '注册公司、税务架构、银行开户、办公室、首批招聘 —— 打包成一个项目、一个对接人交付；不用你自己用法语协调五家法国服务商。',
  },
  timeline: {
    en: 'Typical timeline: 6–10 weeks from kickoff to an operating French entity',
    fr: 'Délai type : 6 à 10 semaines du lancement à une entité opérationnelle',
    zh: '典型周期：启动后 6–10 周拿到可运营的法国实体',
  },
  cta: {
    en: 'The detailed execution playbook, vetted provider network and cost benchmarks are reserved for engaged clients — leave your contact and we will walk you through the full plan.',
    fr: 'Le playbook détaillé, le réseau de prestataires et les référentiels de coûts sont réservés aux clients — laissez vos coordonnées pour un déroulé complet.',
    zh: '详细执行手册、经筛选的服务商网络与成本基准仅对签约客户开放 —— 留下联系方式，顾问将为你完整讲解方案。',
  },
};

export const LANDING_PILLARS: LandingPillar[] = [
  {
    id: 'incorporation',
    title: { en: '① Incorporation & tax', fr: '① Immatriculation & fiscalité', zh: '① 公司注册与税务' },
    teaser: [
      {
        en: 'Legal form choice (SAS / SARL / branch / liaison office) drives tax, social charges and investor flexibility — the single most consequential early decision.',
        fr: 'Le choix de la forme (SAS / SARL / succursale / bureau de liaison) détermine fiscalité, charges sociales et flexibilité.',
        zh: '法律形式选择（SAS / SARL / 分公司 / 联络处）决定税负、社保成本与股权灵活性 —— 落地初期影响最大的一个决定。',
      },
      {
        en: 'Registration itself is centralised on the Guichet Unique (INPI) since 2023; corporate income tax 25% (15% reduced rate on first €42.5k for SMEs), standard VAT 20%.',
        fr: 'Immatriculation centralisée au Guichet Unique (INPI) ; IS à 25 % (taux réduit 15 %), TVA 20 %.',
        zh: '注册统一走 Guichet Unique（INPI）线上入口；企业所得税 25%（中小企业首 4.25 万欧利润享 15% 优惠税率），标准增值税 20%。',
      },
      {
        en: 'Foreign shareholders: no residency requirement for an SAS president, but ultimate-beneficial-owner (RBE) declaration and possibly foreign-investment screening apply.',
        fr: 'Actionnaires étrangers : pas d’exigence de résidence pour le président de SAS ; déclaration RBE et éventuel contrôle IEF.',
        zh: '外国股东：SAS 总裁无居留要求；需申报最终受益人（RBE），敏感行业可能触发外资审查（IEF）。',
      },
    ],
    gated: [
      { en: 'SAS vs SARL vs branch — tax & social-charge simulation model for your numbers', fr: 'Simulateur SAS / SARL / succursale sur vos chiffres', zh: 'SAS vs SARL vs 分公司 —— 按你的数据测算税负与社保成本的模型' },
      { en: 'Bilingual (FR/CN) statutes & shareholder-agreement templates, battle-tested', fr: 'Statuts & pacte d’associés bilingues, éprouvés', zh: '中法双语公司章程 + 股东协议模板（实案验证）' },
      { en: 'VAT registration & intra-EU / import scheme setup checklist', fr: 'Checklist TVA & régimes intracommunautaires / import', zh: '增值税号申请与欧盟内/进口税务方案配置清单' },
    ],
  },
  {
    id: 'banking',
    title: { en: '② Banking & accounting', fr: '② Banque & comptabilité', zh: '② 银行开户与会计' },
    teaser: [
      {
        en: 'A French corporate bank account is required to deposit share capital before registration — and is the #1 bottleneck for foreign founders (KYC on non-resident shareholders).',
        fr: 'Le compte bancaire (dépôt du capital) est le goulot d’étranglement n°1 pour les fondateurs étrangers (KYC).',
        zh: '注册前必须先开法国对公账户存入注册资本 —— 这是外国创始人最大的卡点（非居民股东的 KYC 审查严格）。',
      },
      {
        en: 'French GAAP bookkeeping and an annual filing via an expert-comptable are mandatory; plan accounting from day one, not after the first tax notice.',
        fr: 'Comptabilité aux normes françaises et bilan annuel via un expert-comptable obligatoires.',
        zh: '必须按法国会计准则记账并由注册会计师（expert-comptable）年度申报；会计要从第一天规划，不要等收到税务通知。',
      },
    ],
    gated: [
      { en: 'Which banks actually open accounts for Chinese-owned newcos (updated list + file requirements)', fr: 'Banques ouvrant réellement des comptes aux newcos étrangères (liste à jour)', zh: '哪些银行真的给中资新公司开户（动态名单 + 材料口径）' },
      { en: 'KYC file pack that passes first review — structure & wording', fr: 'Dossier KYC qui passe au premier examen', zh: '一次过审的 KYC 材料包（结构与措辞）' },
      { en: 'Expert-comptable fee benchmark & bilingual firms shortlist', fr: 'Référentiel d’honoraires & cabinets bilingues', zh: '会计师收费基准 + 中法双语事务所短名单' },
    ],
  },
  {
    id: 'office',
    title: { en: '③ Office & location', fr: '③ Bureaux & implantation', zh: '③ 办公室与选址' },
    teaser: [
      {
        en: 'A registered address (domiciliation) is enough to incorporate — you can start with a domiciliation service or coworking, then upgrade to a commercial lease.',
        fr: 'Une domiciliation suffit pour immatriculer — commencer léger, puis bail commercial.',
        zh: '注册只需一个注册地址（domiciliation）—— 可先用地址托管/联合办公起步，业务稳定后再签正式租约。',
      },
      {
        en: 'The French 3-6-9 commercial lease strongly protects tenants but locks you in — never sign without understanding termination windows and charge clauses.',
        fr: 'Le bail 3-6-9 protège le locataire mais engage — attention aux fenêtres de sortie et aux charges.',
        zh: '法国商业租约"3-6-9"制度对租户保护强但绑定久 —— 不了解解约窗口与费用分摊条款前切勿签字。',
      },
      {
        en: 'Location can be worth money: regional agencies (Choose France / regional development agencies) offer incentives for job-creating implantations.',
        fr: 'L’implantation peut rapporter : aides des agences régionales pour les projets créateurs d’emplois.',
        zh: '选址本身能换来真金白银：各大区招商机构对创造就业的落地项目有补贴/优惠（Choose France 及大区发展署）。',
      },
    ],
    gated: [
      { en: 'Paris / Lyon / Marseille cost-per-desk & warehouse rent benchmarks', fr: 'Référentiels loyers bureaux/entrepôts Paris / Lyon / Marseille', zh: '巴黎/里昂/马赛办公位与仓储租金对照表' },
      { en: '3-6-9 lease red-flag clause checklist (negotiation notes)', fr: 'Checklist des clauses à risque du bail 3-6-9', zh: '3-6-9 租约风险条款清单（含谈判要点）' },
      { en: 'Regional incentive matchmaking — which région pays for your project', fr: 'Cartographie des aides régionales pour votre projet', zh: '大区补贴匹配 —— 哪个大区愿意为你的项目出钱' },
    ],
  },
  {
    id: 'hiring',
    title: { en: '④ Hiring & labour law', fr: '④ Recrutement & droit du travail', zh: '④ 招聘与劳动法' },
    teaser: [
      {
        en: 'Employer cost ≈ salary × 1.4–1.45 (social charges); budget total cost, not gross salary.',
        fr: 'Coût employeur ≈ salaire × 1,4–1,45 (charges) ; budgéter le coût total.',
        zh: '雇主总成本 ≈ 税前工资 × 1.4–1.45（社保雇主部分）；预算要按总成本算，不是按工资算。',
      },
      {
        en: 'CDI is the default contract; CDD (fixed-term) only for legally listed cases. The applicable collective agreement (convention collective) silently sets minimum pay grids and notice periods.',
        fr: 'Le CDI est la norme ; le CDD est encadré. La convention collective fixe grilles et préavis.',
        zh: '无固定期限合同（CDI）是默认形式，固定期限（CDD）只能用于法定情形；行业集体协议（convention collective）会"隐形"决定最低工资档与通知期。',
      },
      {
        en: 'Before having any employee: register as employer (URSSAF), pre-hire declaration (DPAE) for each hire, mandatory occupational-health enrolment and complementary insurance (mutuelle).',
        fr: 'Avant d’employer : immatriculation employeur (URSSAF), DPAE, médecine du travail, mutuelle.',
        zh: '雇人前置义务：URSSAF 雇主登记、每次入职前 DPAE 申报、职业医学检查注册、强制补充医疗保险（mutuelle）。',
      },
      {
        en: 'Alternative for testing the market: EOR / portage salarial lets you employ one salesperson in France without an entity.',
        fr: 'Pour tester : EOR / portage salarial permet d’employer sans entité.',
        zh: '试水阶段替代方案：EOR/薪资托管（portage salarial）可以在没有法国实体时先雇一名本地销售。',
      },
    ],
    gated: [
      { en: 'Bilingual CDI/CDD contract templates mapped to common conventions collectives', fr: 'Modèles CDI/CDD bilingues alignés sur les conventions courantes', zh: '中法双语 CDI/CDD 合同模板（对齐常见行业集体协议）' },
      { en: 'True-cost calculator: from gross salary to all-in employer cost with 2026 rates', fr: 'Calculateur coût total employeur (taux 2026)', zh: '用人真实成本测算表：税前工资 → 雇主全包成本（2026 费率）' },
      { en: 'Vetted bilingual recruiters & EOR providers with negotiated rates', fr: 'Recruteurs bilingues & EOR vérifiés, tarifs négociés', zh: '经筛选的中法双语猎头与 EOR 服务商（含已谈好的折扣价）' },
    ],
  },
];

export const LANDING_LABELS: { included: L; gated: L; gatedNote: L } = {
  included: { en: 'What you should know', fr: 'À savoir', zh: '公开要点' },
  gated: { en: 'Client-only deliverables', fr: 'Livrables réservés aux clients', zh: '签约客户专属交付' },
  gatedNote: {
    en: 'Names shown, content reserved — these deliverables are provided during the engagement.',
    fr: 'Intitulés visibles, contenu réservé — livré dans le cadre de la mission.',
    zh: '仅展示交付物名称，内容在服务过程中交付。',
  },
};
