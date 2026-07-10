// Curated knowledge for the Credit module (M12):
//  A) European / French statutory payment terms (advance payment, balance,
//     late-payment penalties) — stable public regulatory facts, not LLM output.
//  B) Credit assessment & export credit insurance agencies (Sinosure process,
//     European insurers, rating/information providers).
// Informational only — not legal advice.

export type Loc = 'en' | 'fr' | 'zh';
type L = Record<Loc, string>;

export interface KnowledgeLink {
  label: string;
  url: string;
}

export interface KnowledgeBlock {
  id: string;
  title: L;
  items: L[];
  links?: KnowledgeLink[];
}

export interface KnowledgeSection {
  id: string;
  title: L;
  intro: L;
  blocks: KnowledgeBlock[];
}

export const PAYMENT_TERMS_SECTION: KnowledgeSection = {
  id: 'paymentTerms',
  title: {
    en: 'European payment terms & regulations',
    fr: 'Délais de paiement européens & réglementation',
    zh: '欧洲付款账期与相关法规',
  },
  intro: {
    en: 'Statutory rules on B2B payment terms in France / the EU: legal deadlines, advance-payment practice and late-payment liability. Informational only — not legal advice.',
    fr: 'Règles légales des délais de paiement B2B en France / UE : plafonds légaux, pratique des acomptes et responsabilité en cas de retard. Informatif — ne constitue pas un conseil juridique.',
    zh: '法国/欧盟 B2B 付款账期的法定规则：法定期限上限、预付款惯例、逾期违约责任。仅供参考，不构成法律意见。',
  },
  blocks: [
    {
      id: 'statutory',
      title: { en: 'Statutory payment deadlines', fr: 'Délais légaux de paiement', zh: '法定账期上限' },
      items: [
        {
          en: 'EU baseline (Directive 2011/7/EU): B2B default 30 days; contract may extend to 60 days, beyond that only if not "grossly unfair" to the creditor.',
          fr: 'Base UE (directive 2011/7/UE) : 30 jours par défaut en B2B ; extension contractuelle possible à 60 jours, au-delà seulement si non « manifestement abusive ».',
          zh: '欧盟基线（指令 2011/7/EU）：B2B 默认 30 天；合同可延至 60 天，超过 60 天须证明对债权人非"显失公平"。',
        },
        {
          en: 'France (Code de commerce L441-10): no agreed term → 30 days after receipt; agreed term capped at 60 days from invoice date, or 45 days end-of-month if stipulated in the contract; periodic (summary) invoices capped at 45 days.',
          fr: 'France (C. com. L441-10) : sans accord → 30 jours après réception ; plafond conventionnel de 60 jours date de facture, ou 45 jours fin de mois si prévu au contrat ; factures périodiques plafonnées à 45 jours.',
          zh: '法国（商法典 L441-10）：未约定 → 收货/服务完成后 30 天；约定账期上限为发票日起 60 天，或合同明确约定的"月末后 45 天"（45 jours fin de mois）；定期汇总发票上限 45 天。',
        },
        {
          en: 'Sector exceptions: perishable food ~30 days, road transport 30 days; certain export trades (outside the EU) may agree up to 90 days.',
          fr: 'Exceptions sectorielles : denrées périssables ~30 jours, transport routier 30 jours ; certains achats pour export hors UE jusqu’à 90 jours.',
          zh: '行业例外：生鲜食品约 30 天、公路运输 30 天；面向欧盟外出口的特定采购可约定至 90 天。',
        },
      ],
      links: [
        { label: 'service-public.fr — Délais de paiement', url: 'https://entreprendre.service-public.fr/vosdroits/F23211' },
        { label: 'EU Late Payment Directive 2011/7/EU', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32011L0007' },
      ],
    },
    {
      id: 'advance',
      title: { en: 'Advance payment & balance practice', fr: 'Acompte & solde — pratique', zh: '预付款与尾款惯例' },
      items: [
        {
          en: 'Deposit ("acompte") of ~30% on order is common in French B2B (machinery, projects, custom goods); the balance ("solde") is due on delivery/acceptance within the statutory term. An acompte is a firm commitment for both parties — unlike "arrhes", it cannot be forfeited to cancel.',
          fr: 'Un acompte d’environ 30 % à la commande est courant en B2B (machines, projets, sur-mesure) ; le solde est dû à la livraison/réception dans le délai légal. L’acompte engage fermement les deux parties — contrairement aux arrhes.',
          zh: '法国 B2B 常见下单预付约 30%（设备、项目、定制品），尾款（solde）在交付/验收后按法定账期支付。注意 acompte（预付款）对双方均有约束力，不同于 arrhes（定金，可弃定解约）。',
        },
        {
          en: 'Cross-border trade with new buyers: prefer T/T 30/70, documentary collection or letter of credit before extending open-account terms; extend open account only after credit checks / insurance cover.',
          fr: 'Commerce international avec nouveaux acheteurs : privilégier T/T 30/70, remise documentaire ou crédit documentaire avant d’accorder un paiement à crédit (open account), et seulement après vérification / assurance-crédit.',
          zh: '与新买家的跨境贸易：优先 T/T 30/70、跟单托收（D/P）或信用证（L/C），账期赊销（O/A）应在完成资信调查/投保信用险后再放开。',
        },
        {
          en: 'Public procurement (Code de la commande publique): the French State pays a minimum advance (generally 20% for SMEs on state contracts) and must pay within 30 days (60 for some public entities).',
          fr: 'Marchés publics (Code de la commande publique) : avance minimale (généralement 20 % pour les PME sur les marchés de l’État) et paiement sous 30 jours (60 pour certains établissements).',
          zh: '公共采购（公共采购法典）：法国国家采购向中小企业支付最低预付款（国家合同一般为 20%），付款期限 30 天（部分公共机构 60 天）。',
        },
      ],
    },
    {
      id: 'penalties',
      title: { en: 'Late payment: interest & liability', fr: 'Retard de paiement : intérêts & sanctions', zh: '逾期付款：利息与违约责任' },
      items: [
        {
          en: 'Late-payment interest runs automatically from the day after the due date, no reminder needed. Contract rate ≥ 3× the French legal interest rate; default rate = ECB refinancing rate + 10 points.',
          fr: 'Les pénalités de retard courent de plein droit dès le lendemain de l’échéance, sans relance. Taux contractuel ≥ 3× le taux d’intérêt légal ; à défaut, taux BCE + 10 points.',
          zh: '逾期利息自到期次日自动起算，无需催告。合同约定利率不得低于法国法定利率的 3 倍；未约定时适用欧洲央行再融资利率 + 10 个百分点。',
        },
        {
          en: 'Fixed recovery indemnity: €40 per late invoice (plus additional documented recovery costs).',
          fr: 'Indemnité forfaitaire de recouvrement : 40 € par facture en retard (plus frais réels justifiés).',
          zh: '固定催收赔偿金：每张逾期发票 40 欧元（实际催收成本更高时可凭证据另行追加）。',
        },
        {
          en: 'Administrative fines: exceeding the legal caps exposes the buyer to DGCCRF fines up to €2M (legal persons), with "name & shame" publication of sanctions.',
          fr: 'Sanctions administratives : le dépassement des plafonds expose à une amende DGCCRF jusqu’à 2 M€ (personnes morales), avec publication de la sanction (« name & shame »).',
          zh: '行政处罚：超过法定账期上限，买方可被 DGCCRF 处以最高 200 万欧元罚款（法人），且处罚决定会被公示（点名曝光）。',
        },
        {
          en: 'Dispute channels: Médiateur des entreprises (free mediation), injonction de payer (fast-track payment order), or commercial court.',
          fr: 'Voies de recours : Médiateur des entreprises (médiation gratuite), injonction de payer, ou tribunal de commerce.',
          zh: '争议渠道：企业调解员（Médiateur des entreprises，免费调解）、支付令程序（injonction de payer，快速）或商事法院诉讼。',
        },
      ],
      links: [
        { label: 'DGCCRF — délais de paiement', url: 'https://www.economie.gouv.fr/dgccrf/delais-de-paiement' },
        { label: 'Médiateur des entreprises', url: 'https://www.economie.gouv.fr/mediateur-des-entreprises' },
      ],
    },
  ],
};

export const CREDIT_AGENCIES_SECTION: KnowledgeSection = {
  id: 'creditAgencies',
  title: {
    en: 'Credit assessment & export credit insurance',
    fr: 'Évaluation crédit & assurance-crédit export',
    zh: '信用评估机构与出口信用保险',
  },
  intro: {
    en: 'Where to check a French buyer’s creditworthiness and how to insure receivables — including the Sinosure short-term export credit insurance process for Chinese exporters.',
    fr: 'Où vérifier la solvabilité d’un acheteur français et comment assurer ses créances — dont le processus Sinosure pour les exportateurs chinois.',
    zh: '如何核查法国买家资信、如何为应收账款投保 —— 含中国出口企业最常用的中信保（Sinosure）短期出口信用保险流程。',
  },
  blocks: [
    {
      id: 'sinosure',
      title: { en: 'Sinosure (China Export & Credit Insurance) — process', fr: 'Sinosure — processus', zh: '中信保（Sinosure）短期出口信用险流程' },
      items: [
        {
          en: '1. Apply for cover: submit company info and sign a short-term export credit insurance policy (annual, comprehensive cover is standard).',
          fr: '1. Souscription : dossier entreprise + police d’assurance-crédit export court terme (police annuelle globale en général).',
          zh: '1. 投保：提交企业资料，签订短期出口信用保险（统保）年度保单；小微企业可走"小微统保易"简化通道。',
        },
        {
          en: '2. Buyer credit limit: request a credit assessment of the French buyer (Sinosure buyer database / on-site investigation) and obtain an approved credit limit per buyer.',
          fr: '2. Limite de crédit acheteur : demander l’évaluation de l’acheteur français et obtenir une limite de crédit approuvée par acheteur.',
          zh: '2. 申请买方信用限额：对法国买家做资信评估（可购买中信保资信报告），中信保按买家核定信用限额，限额内的赊销受保障。',
        },
        {
          en: '3. Declare shipments & pay premium: declare each month’s shipments (invoice value, terms) and pay premium accordingly.',
          fr: '3. Déclaration des expéditions & prime : déclarer chaque mois les expéditions (valeur, conditions) et régler la prime.',
          zh: '3. 出运申报与缴费：按月申报出运（金额、支付条件等）并缴纳保费；未申报的出运不在保障范围内。',
        },
        {
          en: '4. Report overdue / possible loss: report non-payment within the policy deadline (typically within 30 days of becoming aware of a possible loss).',
          fr: '4. Déclaration d’impayé : signaler le retard/la perte possible dans le délai de la police (généralement 30 jours).',
          zh: '4. 可能损失通报：买家拖欠或出险后，按保单时限（通常自知悉起 30 天内）向中信保报损，并停止继续放账。',
        },
        {
          en: '5. Claim & indemnity: file the claim after the waiting period; indemnity is typically up to ~90% of the insured loss for commercial risk.',
          fr: '5. Indemnisation : dépôt de la demande après le délai d’attente ; indemnité jusqu’à ~90 % de la perte assurée (risque commercial).',
          zh: '5. 索赔与赔付：等待期届满后提交索赔材料（合同、发票、提单、催收记录等），商业风险赔付比例一般最高约 90%。',
        },
        {
          en: '6. Recovery: after indemnification Sinosure pursues recovery from the buyer (subrogation); exporter cooperates with documents.',
          fr: '6. Recouvrement : après indemnisation, Sinosure exerce le recours contre l’acheteur (subrogation).',
          zh: '6. 追偿：赔付后中信保取得代位追偿权，向买家追讨；出口商需配合提供单据。保单项下应收账款还可用于银行保单融资。',
        },
      ],
      links: [{ label: 'Sinosure 中国出口信用保险公司', url: 'https://www.sinosure.com.cn/' }],
    },
    {
      id: 'insurers',
      title: { en: 'European credit insurers', fr: 'Assureurs-crédit européens', zh: '欧洲信用保险机构' },
      items: [
        {
          en: 'Coface (France), Allianz Trade (ex-Euler Hermes, France/Germany) and Atradius (Netherlands) are the three global credit insurers — they cover receivables, monitor buyers and publish country/sector risk ratings.',
          fr: 'Coface, Allianz Trade (ex-Euler Hermes) et Atradius sont les trois grands assureurs-crédit mondiaux : couverture des créances, surveillance des acheteurs, notations pays/secteurs.',
          zh: 'Coface（法国）、Allianz Trade（原 Euler Hermes）、Atradius（荷兰）是全球三大信用保险公司：承保应收账款、持续监控买家、发布国别/行业风险评级，也单独出售企业资信报告。',
        },
        {
          en: 'Public export support: Bpifrance Assurance Export administers French state export guarantees (the mirror of Sinosure on the French side).',
          fr: 'Soutien public : Bpifrance Assurance Export gère les garanties publiques à l’export.',
          zh: '官方出口支持：法方对应机构是 Bpifrance Assurance Export（法国国家出口担保）。',
        },
      ],
      links: [
        { label: 'Coface', url: 'https://www.coface.fr/' },
        { label: 'Allianz Trade', url: 'https://www.allianz-trade.fr/' },
        { label: 'Atradius', url: 'https://atradius.fr/' },
        { label: 'Bpifrance Assurance Export', url: 'https://www.bpifrance.fr/nos-solutions/assurance-export' },
      ],
    },
    {
      id: 'ratings',
      title: { en: 'Company information & rating providers', fr: 'Information & notation d’entreprises', zh: '企业信息与评级机构' },
      items: [
        {
          en: 'Banque de France FIBEN "cotation" — the reference credit rating of French companies used by banks (access via your French bank or the company itself).',
          fr: 'Cotation FIBEN de la Banque de France — référence utilisée par les banques (accès via votre banque ou l’entreprise elle-même).',
          zh: 'Banque de France 的 FIBEN "cotation" 评级 —— 法国银行体系使用的权威企业信用评级（通过法国银行或企业本身获取）。',
        },
        {
          en: 'Commercial providers: Altares (Dun & Bradstreet France), Ellisphere, Creditsafe — scored credit reports and monitoring; official filings free on the Annuaire des Entreprises / Infogreffe / BODACC (already integrated in this module’s score).',
          fr: 'Fournisseurs commerciaux : Altares (D&B), Ellisphere, Creditsafe — rapports notés et surveillance ; données officielles gratuites via l’Annuaire des Entreprises / Infogreffe / BODACC (déjà intégrées au score de ce module).',
          zh: '商业机构：Altares（邓白氏法国）、Ellisphere、Creditsafe —— 提供评分报告与监控；官方免费数据可查 Annuaire des Entreprises / Infogreffe / BODACC（本模块评分已接入这些官方数据）。',
        },
        {
          en: 'Recommended workflow for a new French buyer: ① check official registry & legal events (this module) → ② buy a rated report or Sinosure buyer report → ③ set the credit limit & payment terms in the contract → ④ insure the receivable.',
          fr: 'Parcours recommandé pour un nouvel acheteur : ① registre officiel & événements légaux (ce module) → ② rapport noté ou rapport acheteur Sinosure → ③ limite de crédit & conditions dans le contrat → ④ assurance de la créance.',
          zh: '新法国买家推荐流程：① 用本模块查官方注册信息与法律事件 → ② 购买评级报告或中信保买家资信报告 → ③ 在合同中设定信用限额与账期条款 → ④ 为应收账款投保。',
        },
      ],
      links: [
        { label: 'Banque de France — cotation FIBEN', url: 'https://entreprises.banque-france.fr/cotation' },
        { label: 'Altares (D&B)', url: 'https://www.altares.com/' },
        { label: 'Ellisphere', url: 'https://www.ellisphere.com/' },
        { label: 'Creditsafe', url: 'https://www.creditsafe.com/fr/' },
      ],
    },
  ],
};
