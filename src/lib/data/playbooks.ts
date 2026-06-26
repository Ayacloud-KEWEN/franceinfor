// Business Playbook Library (Knowledge OS — Layer 3).
//
// A Playbook is a structured, modular workflow (not a document): an ordered set
// of tasks, each referencing the authority, permits, documents, cost, timeline,
// dependencies, risks and official references. Content is curated from real,
// public French facts (not LLM-generated). Prose is localized (en/fr/zh);
// proper nouns (authorities, official site names, French legal permit names)
// are kept as-is. Versioned in git — the knowledge asset travels with the repo.

export type Loc = 'en' | 'fr' | 'zh';
type LS = { en: string; fr: string; zh: string };
type LSA = { en: string[]; fr: string[]; zh: string[] };

const s = (loc: Loc, v: LS) => v[loc];
const a = (loc: Loc, v: LSA) => v[loc];

export interface PlaybookRef {
  label: string;
  url: string;
}

// ---- Resolved (locale-applied) shapes consumed by the UI ----
export interface PlaybookTask {
  id: string;
  name: string;
  description: string;
  authority?: string;
  permit?: string;
  documents?: string[];
  cost?: string;
  timeline?: string;
  dependsOn?: string[];
  risks?: string[];
  references?: PlaybookRef[];
}
export interface Playbook {
  slug: string;
  title: string;
  sector: string;
  summary: string;
  applicableTo: string[];
  prerequisites: string[];
  tasks: PlaybookTask[];
  risks: string[];
  estCost: string;
  estTimeline: string;
  references: PlaybookRef[];
  version: string;
  updated: string;
  keywords: string[];
}

// ---- Raw (localized) shapes ----
interface RawTask {
  id: string;
  name: LS;
  description: LS;
  authority?: string;
  permit?: string;
  documents?: LSA;
  cost?: LS;
  timeline?: LS;
  dependsOn?: string[];
  risks?: LSA;
  references?: PlaybookRef[];
}
interface RawPlaybook {
  slug: string;
  title: LS;
  sector: string;
  summary: LS;
  applicableTo: LSA;
  prerequisites: LSA;
  tasks: RawTask[];
  risks: LSA;
  estCost: LS;
  estTimeline: LS;
  references: PlaybookRef[];
  version: string;
  updated: string;
  keywords: string[];
}

const DATA_CENTER: RawPlaybook = {
  slug: 'france-data-center',
  title: {
    en: 'Setting up a data center in France',
    fr: 'Créer un data center en France',
    zh: '在法国建设数据中心',
  },
  sector: 'infrastructure',
  summary: {
    en: 'End-to-end workflow to build and operate a data center in France — from incorporation and site selection through grid connection, environmental authorisation, connectivity, GDPR/sovereignty and operational certification.',
    fr: 'Procédure complète pour construire et exploiter un data center en France — de la création et du choix du site au raccordement électrique, à l’autorisation environnementale, à la connectivité, au RGPD/souveraineté et à la certification d’exploitation.',
    zh: '在法国建设并运营数据中心的端到端流程——从公司注册、选址，到电网接入、环境许可、网络连接、GDPR/数据主权与运营认证。',
  },
  applicableTo: {
    en: ['Cloud / hosting providers', 'Hyperscalers & colocation', 'Industrial / IT operators'],
    fr: ['Fournisseurs cloud / hébergeurs', 'Hyperscalers & colocation', 'Opérateurs industriels / IT'],
    zh: ['云服务 / 主机托管商', '超大规模 & 机房托管', '工业 / IT 运营商'],
  },
  prerequisites: {
    en: ['Target capacity (IT load in MW) and growth plan', 'Budget and financing secured (capex is power- and land-driven)', 'Region shortlist (power availability, fiber, land, local incentives)'],
    fr: ['Capacité cible (charge IT en MW) et plan de croissance', 'Budget et financement sécurisés (capex porté par l’énergie et le foncier)', 'Présélection de régions (puissance disponible, fibre, foncier, incitations locales)'],
    zh: ['目标容量（IT 负载 MW）与增长计划', '已落实预算与融资（资本开支主要由电力与土地决定）', '候选地区清单（电力可用性、光纤、土地、地方扶持）'],
  },
  tasks: [
    {
      id: 'incorporation',
      name: { en: 'Company registration', fr: 'Création de la société', zh: '公司注册' },
      description: {
        en: 'Incorporate a French operating entity (typically SAS/SASU) to hold the project, sign contracts and employ staff.',
        fr: 'Créer une société d’exploitation française (généralement SAS/SASU) pour porter le projet, signer les contrats et employer le personnel.',
        zh: '设立法国运营主体（通常为 SAS/SASU）以承载项目、签署合同并雇佣员工。',
      },
      authority: 'INPI — Guichet unique',
      documents: {
        en: ['Statutes (articles)', 'Proof of registered office', 'Beneficial-owner declaration'],
        fr: ['Statuts', 'Justificatif de siège social', 'Déclaration des bénéficiaires effectifs'],
        zh: ['公司章程', '注册地址证明', '受益所有人申报'],
      },
      cost: { en: '~€200–2,000 (legal + publication)', fr: '~200–2 000 € (juridique + publication)', zh: '约 €200–2,000（法务 + 公告）' },
      timeline: { en: '1–3 weeks', fr: '1–3 semaines', zh: '1–3 周' },
      references: [{ label: 'Guichet unique (INPI)', url: 'https://formalites.entreprises.gouv.fr/' }],
    },
    {
      id: 'site',
      name: { en: 'Site & land selection', fr: 'Choix du site et du foncier', zh: '选址与用地' },
      description: {
        en: 'Secure industrial land with access to high-capacity power and diverse fiber. Verify the local urbanism plan (PLU) zoning allows the use and check flood/industrial risk.',
        fr: 'Sécuriser un foncier industriel avec accès à une forte puissance électrique et à une fibre diversifiée. Vérifier que le zonage du PLU autorise l’usage et contrôler les risques inondation/industriels.',
        zh: '锁定可接入大容量电力与多路光纤的工业用地。核实当地城市规划（PLU）分区允许该用途，并排查洪水/工业风险。',
      },
      authority: 'Commune / Mairie (PLU)',
      documents: {
        en: ['PLU zoning extract', 'Land title / option', 'Géorisques site report'],
        fr: ['Extrait de zonage PLU', 'Titre foncier / promesse', 'Rapport Géorisques du site'],
        zh: ['PLU 分区摘录', '土地权属 / 购地选择权', 'Géorisques 场地风险报告'],
      },
      cost: { en: 'Highly variable (land + studies)', fr: 'Très variable (foncier + études)', zh: '差异很大（土地 + 研究）' },
      timeline: { en: '1–6 months', fr: '1–6 mois', zh: '1–6 个月' },
      dependsOn: ['incorporation'],
      risks: {
        en: ['Zoning not compatible', 'Insufficient nearby grid capacity', 'Flood/Seveso constraints'],
        fr: ['Zonage incompatible', 'Capacité réseau insuffisante à proximité', 'Contraintes inondation/Seveso'],
        zh: ['分区不兼容', '附近电网容量不足', '洪水/Seveso 限制'],
      },
      references: [
        { label: 'Géorisques', url: 'https://www.georisques.gouv.fr/' },
        { label: 'Service-public — urbanisme', url: 'https://entreprendre.service-public.fr/' },
      ],
    },
    {
      id: 'power',
      name: { en: 'Electricity grid connection', fr: 'Raccordement au réseau électrique', zh: '电网接入' },
      description: {
        en: 'Request a connection sized to IT + cooling load. Loads up to ~12 MVA connect via Enedis (distribution); large loads connect to the RTE transmission grid. Grid studies and capacity reservation are the long-pole of the whole project.',
        fr: 'Demander un raccordement dimensionné à la charge IT + refroidissement. Jusqu’à ~12 MVA via Enedis (distribution) ; les fortes charges se raccordent au réseau de transport RTE. Les études réseau et la réservation de capacité sont le chemin critique du projet.',
        zh: '申请与 IT + 制冷负载匹配的接入。约 12 MVA 以下经 Enedis（配电）接入；大负载接入 RTE 输电网。电网研究与容量预留是整个项目的关键路径（工期最长）。',
      },
      authority: 'Enedis (distribution) / RTE (transmission)',
      cost: { en: '€M-scale; depends on capacity & distance to substation', fr: 'Échelle de M€ ; selon la capacité et la distance au poste', zh: '百万欧元级；取决于容量与到变电站的距离' },
      timeline: { en: '12–36 months for large connections', fr: '12–36 mois pour les gros raccordements', zh: '大型接入 12–36 个月' },
      dependsOn: ['site'],
      risks: {
        en: ['Grid capacity unavailable in the area', 'Long lead time', 'Reinforcement costs'],
        fr: ['Capacité réseau indisponible dans la zone', 'Délai long', 'Coûts de renforcement'],
        zh: ['该区域电网容量不可用', '交付周期长', '电网增强成本'],
      },
      references: [
        { label: 'Enedis — raccordement', url: 'https://www.enedis.fr/raccordement' },
        { label: 'RTE France', url: 'https://www.rte-france.com/' },
      ],
    },
    {
      id: 'environmental',
      name: { en: 'Environmental authorisation (ICPE)', fr: 'Autorisation environnementale (ICPE)', zh: '环境许可（ICPE）' },
      description: {
        en: 'Data centers are usually classified ICPE (cooling equipment, refrigerant gases, and standby fuel/generators above thresholds), requiring declaration, registration or full environmental authorisation — possibly with an impact assessment.',
        fr: 'Les data centers sont généralement classés ICPE (équipements de refroidissement, gaz frigorigènes, carburant/groupes de secours au-delà des seuils), nécessitant déclaration, enregistrement ou autorisation environnementale — éventuellement avec étude d’impact.',
        zh: '数据中心通常被列为 ICPE（制冷设备、制冷剂气体、超阈值的备用燃料/发电机），需做申报、登记或完整环境许可——可能附环境影响评估。',
      },
      authority: 'DREAL / Préfecture',
      permit: 'ICPE (déclaration / enregistrement / autorisation environnementale)',
      documents: {
        en: ['ICPE classification note', 'Impact / hazard study (if authorisation)', 'Public consultation file (if required)'],
        fr: ['Note de classement ICPE', 'Étude d’impact / de dangers (si autorisation)', 'Dossier d’enquête publique (si requis)'],
        zh: ['ICPE 分类说明', '影响/危害研究（若需许可）', '公众咨询文件（若要求）'],
      },
      cost: { en: 'Studies €tens–hundreds k', fr: 'Études : dizaines–centaines de k€', zh: '研究费用数万至数十万欧元' },
      timeline: { en: '3–18 months depending on regime', fr: '3–18 mois selon le régime', zh: '视监管类别 3–18 个月' },
      dependsOn: ['site'],
      risks: {
        en: ['Authorisation regime triggers impact study + public enquiry', 'Refrigerant / generator thresholds'],
        fr: ['Le régime d’autorisation déclenche étude d’impact + enquête publique', 'Seuils gaz frigorigènes / groupes électrogènes'],
        zh: ['许可类别会触发影响评估 + 公众调查', '制冷剂/发电机阈值'],
      },
      references: [
        { label: 'ICPE — Géorisques', url: 'https://www.georisques.gouv.fr/' },
        { label: 'Service-public — ICPE', url: 'https://entreprendre.service-public.fr/vosdroits/F33414' },
      ],
    },
    {
      id: 'permit',
      name: { en: 'Construction permit', fr: 'Permis de construire', zh: '建筑许可' },
      description: {
        en: 'Obtain the building permit for the shell, electrical rooms and generator yard. Large projects may need additional approvals (highway access, ERP rules where applicable).',
        fr: 'Obtenir le permis de construire pour le bâtiment, les locaux électriques et la zone des groupes. Les grands projets peuvent nécessiter des autorisations supplémentaires (accès voirie, règles ERP le cas échéant).',
        zh: '为建筑外壳、电气机房与发电机场地办理建筑许可。大型项目可能需额外审批（道路接入、适用时的 ERP 规则）。',
      },
      authority: 'Mairie (commune)',
      permit: 'Permis de construire',
      documents: {
        en: ['Architectural file', 'Site & access plans', 'Thermal / environmental compliance (RE2020 where applicable)'],
        fr: ['Dossier architectural', 'Plans de masse & d’accès', 'Conformité thermique / environnementale (RE2020 le cas échéant)'],
        zh: ['建筑设计文件', '总平面与出入口图', '热工/环境合规（适用时 RE2020）'],
      },
      cost: { en: 'Design & filing fees', fr: 'Frais de conception & dépôt', zh: '设计与申报费用' },
      timeline: { en: '2–6 months instruction', fr: '2–6 mois d’instruction', zh: '审批 2–6 个月' },
      dependsOn: ['site', 'environmental'],
      references: [{ label: 'Permis de construire — service-public', url: 'https://entreprendre.service-public.fr/vosdroits/F22276' }],
    },
    {
      id: 'fiber',
      name: { en: 'Fiber connectivity', fr: 'Connectivité fibre', zh: '光纤连接' },
      description: {
        en: 'Contract diverse dark-fiber/transit from multiple carriers with redundant physical paths to carrier hotels / IXPs (e.g. France-IX). Connectivity diversity is a design requirement, not an afterthought.',
        fr: 'Contractualiser fibre noire/transit diversifiés auprès de plusieurs opérateurs, avec chemins physiques redondants vers les carrier hotels / IXP (ex. France-IX). La diversité de connectivité est une exigence de conception.',
        zh: '从多家运营商签约多路暗光纤/中转，建立到运营商汇聚点/互联交换中心（如 France-IX）的冗余物理路径。连接多样性是设计要求，而非事后补救。',
      },
      cost: { en: 'Recurring; build-out if greenfield', fr: 'Récurrent ; génie civil si greenfield', zh: '经常性费用；新建场地需土建' },
      timeline: { en: '1–9 months (longer if civil works)', fr: '1–9 mois (plus si génie civil)', zh: '1–9 个月（含土建则更久）' },
      dependsOn: ['site'],
      risks: {
        en: ['Single physical path = SPOF', 'Long civil works for last-mile'],
        fr: ['Chemin physique unique = SPOF', 'Génie civil long pour le dernier kilomètre'],
        zh: ['单一物理路径 = 单点故障', '最后一公里土建周期长'],
      },
      references: [{ label: 'France-IX', url: 'https://www.franceix.net/' }],
    },
    {
      id: 'gdpr',
      name: { en: 'GDPR, data sovereignty & security', fr: 'RGPD, souveraineté des données & sécurité', zh: 'GDPR、数据主权与安全' },
      description: {
        en: 'Frame data residency and processing under GDPR (CNIL). For sensitive workloads, target SecNumCloud (ANSSI) and, for health data, HDS hosting certification. Define physical and logical security.',
        fr: 'Encadrer la résidence et le traitement des données sous le RGPD (CNIL). Pour les charges sensibles, viser SecNumCloud (ANSSI) et, pour les données de santé, la certification HDS. Définir la sécurité physique et logique.',
        zh: '在 GDPR（CNIL）框架下界定数据驻留与处理。敏感负载目标对标 SecNumCloud（ANSSI），健康数据需 HDS 托管认证。定义物理与逻辑安全。',
      },
      authority: 'CNIL / ANSSI',
      documents: {
        en: ['Record of processing', 'Security policy', 'Certifications roadmap'],
        fr: ['Registre des traitements', 'Politique de sécurité', 'Feuille de route des certifications'],
        zh: ['数据处理记录', '安全策略', '认证路线图'],
      },
      timeline: { en: 'Parallel; certification 6–18 months', fr: 'En parallèle ; certification 6–18 mois', zh: '并行推进；认证 6–18 个月' },
      references: [
        { label: 'CNIL', url: 'https://www.cnil.fr/' },
        { label: 'SecNumCloud (ANSSI)', url: 'https://cyber.gouv.fr/secnumcloud' },
      ],
    },
    {
      id: 'operations',
      name: { en: 'Operational readiness & certification', fr: 'Mise en exploitation & certification', zh: '运营就绪与认证' },
      description: {
        en: 'Stand up operations: staffing, maintenance contracts, insurance, and target certifications — ISO 27001 (security), ISO 50001 / EU Code of Conduct for Data Centres (energy), and Uptime Institute Tier where required by clients.',
        fr: 'Lancer l’exploitation : personnel, contrats de maintenance, assurances, et certifications visées — ISO 27001 (sécurité), ISO 50001 / Code de conduite européen des data centers (énergie), et Tier Uptime Institute si exigé par les clients.',
        zh: '建立运营：人员、维护合同、保险，以及目标认证——ISO 27001（安全）、ISO 50001 / 欧盟数据中心行为准则（能效）、以及客户要求时的 Uptime Institute Tier。',
      },
      cost: { en: 'Opex + certification fees', fr: 'Opex + frais de certification', zh: '运营开支 + 认证费用' },
      timeline: { en: 'Before go-live', fr: 'Avant mise en service', zh: '上线前' },
      dependsOn: ['power', 'permit', 'fiber', 'gdpr'],
      references: [{ label: 'EU Code of Conduct for Data Centres', url: 'https://joint-research-centre.ec.europa.eu/energy-efficiency/energy-efficiency-products-and-labelling/code-conduct-ict/code-conduct-data-centres-energy-efficiency_en' }],
    },
  ],
  risks: {
    en: [
      'Grid connection lead time and capacity is the dominant schedule & cost risk — engage Enedis/RTE first.',
      'ICPE authorisation regime can add an impact study + public enquiry.',
      'Power price and PUE drive operating economics.',
    ],
    fr: [
      'Le délai et la capacité de raccordement réseau sont le principal risque de calendrier et de coût — solliciter Enedis/RTE en premier.',
      'Le régime d’autorisation ICPE peut ajouter une étude d’impact + enquête publique.',
      'Le prix de l’électricité et le PUE déterminent l’économie d’exploitation.',
    ],
    zh: [
      '电网接入的工期与容量是最主要的进度与成本风险——应最先对接 Enedis/RTE。',
      'ICPE 许可类别可能增加影响评估 + 公众调查。',
      '电价与 PUE 决定运营经济性。',
    ],
  },
  estCost: {
    en: 'Capex dominated by power & building; €M-scale per MW of IT load.',
    fr: 'Capex dominé par l’énergie & le bâtiment ; échelle de M€ par MW de charge IT.',
    zh: '资本开支主要由电力与建筑决定；每 MW IT 负载约百万欧元级。',
  },
  estTimeline: {
    en: '18–48 months greenfield (grid connection is the long pole).',
    fr: '18–48 mois en greenfield (le raccordement réseau est le chemin critique).',
    zh: '新建场地 18–48 个月（电网接入为关键路径）。',
  },
  references: [
    { label: 'Guichet unique (INPI)', url: 'https://formalites.entreprises.gouv.fr/' },
    { label: 'Enedis — raccordement', url: 'https://www.enedis.fr/raccordement' },
    { label: 'ICPE — service-public', url: 'https://entreprendre.service-public.fr/vosdroits/F33414' },
    { label: 'CNIL', url: 'https://www.cnil.fr/' },
  ],
  version: '1.0',
  updated: '2026-06-26',
  keywords: ['data center', 'datacenter', 'data centre', 'centre de données', 'datacentre', 'hosting', 'cloud', 'serveurs', 'colocation', 'infrastructure', '数据中心', '机房', '托管'],
};

const RAW: RawPlaybook[] = [DATA_CENTER];

function localize(p: RawPlaybook, loc: Loc): Playbook {
  return {
    slug: p.slug,
    title: s(loc, p.title),
    sector: p.sector,
    summary: s(loc, p.summary),
    applicableTo: a(loc, p.applicableTo),
    prerequisites: a(loc, p.prerequisites),
    tasks: p.tasks.map((t) => ({
      id: t.id,
      name: s(loc, t.name),
      description: s(loc, t.description),
      authority: t.authority,
      permit: t.permit,
      documents: t.documents ? a(loc, t.documents) : undefined,
      cost: t.cost ? s(loc, t.cost) : undefined,
      timeline: t.timeline ? s(loc, t.timeline) : undefined,
      dependsOn: t.dependsOn,
      risks: t.risks ? a(loc, t.risks) : undefined,
      references: t.references,
    })),
    risks: a(loc, p.risks),
    estCost: s(loc, p.estCost),
    estTimeline: s(loc, p.estTimeline),
    references: p.references,
    version: p.version,
    updated: p.updated,
    keywords: p.keywords,
  };
}

export function listPlaybooks(loc: Loc = 'en'): Playbook[] {
  return RAW.map((p) => localize(p, loc));
}

export function getPlaybook(slug: string, loc: Loc = 'en'): Playbook | undefined {
  const raw = RAW.find((p) => p.slug === slug);
  return raw ? localize(raw, loc) : undefined;
}

export function playbookSlugs(): string[] {
  return RAW.map((p) => p.slug);
}

// Match a question to the best playbook by keyword/title overlap.
export function matchPlaybook(query: string, loc: Loc = 'en'): { playbook: Playbook; score: number } | null {
  const q = query.toLowerCase();
  let best: { playbook: Playbook; score: number } | null = null;
  for (const raw of RAW) {
    let score = 0;
    for (const kw of raw.keywords) if (q.includes(kw.toLowerCase())) score += 3;
    for (const w of raw.title.en.toLowerCase().split(/\W+/)) if (w.length > 3 && q.includes(w)) score += 1;
    if (score > 0 && (!best || score > best.score)) best = { playbook: localize(raw, loc), score };
  }
  return best;
}
