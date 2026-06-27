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
export interface RawTask {
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
export interface RawPlaybook {
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

const MUSIC_EXPORT: RawPlaybook = {
  slug: 'china-musical-instruments-to-france',
  title: {
    en: 'Selling China-made musical instruments in France',
    fr: 'Vendre en France des instruments de musique fabriqués en Chine',
    zh: '把中国生产的乐器卖到法国',
  },
  sector: 'import-export',
  summary: {
    en: 'End-to-end workflow to import musical instruments manufactured in China and sell them in France — from customs registration (EORI) and tariff classification, through EU product-safety compliance (CE/GPSR/EMC/RoHS), CITES permits for protected woods, French labelling, to logistics and distribution.',
    fr: 'Procédure complète pour importer des instruments de musique fabriqués en Chine et les vendre en France — de l’immatriculation douanière (EORI) et la classification tarifaire, à la conformité produit UE (CE/RGSP/CEM/RoHS), aux permis CITES pour les bois protégés, à l’étiquetage en français, jusqu’à la logistique et la distribution.',
    zh: '把中国生产的乐器进口并在法国销售的端到端流程——从海关注册（EORI）、税则归类，到欧盟产品安全合规（CE/GPSR/EMC/RoHS）、濒危木材 CITES 许可、法语标签，直到物流与分销。',
  },
  applicableTo: {
    en: ['Chinese manufacturers / exporters', 'Import & distribution companies', 'E-commerce sellers (B2C/B2B)'],
    fr: ['Fabricants / exportateurs chinois', 'Sociétés d’import & de distribution', 'Vendeurs e-commerce (B2C/B2B)'],
    zh: ['中国制造商 / 出口商', '进口与分销公司', '电商卖家（B2C/B2B）'],
  },
  prerequisites: {
    en: ['Product list with HS codes, materials (woods/metals) and whether electronic/wireless', 'Decide the import model: French entity, EU distributor, or marketplace fulfilment', 'Supplier technical documentation (test reports, conformity declarations)'],
    fr: ['Liste produits avec codes SH, matériaux (bois/métaux) et caractère électronique/sans-fil', 'Choisir le modèle d’import : entité française, distributeur UE, ou marketplace', 'Documentation technique fournisseur (rapports d’essai, déclarations de conformité)'],
    zh: ['产品清单，含 HS 编码、材质（木材/金属）、是否电子/无线', '确定进口模式：法国主体、欧盟经销商或平台代发', '供应商技术文件（测试报告、合规声明）'],
  },
  tasks: [
    {
      id: 'entity',
      name: { en: 'Set up an importing entity (or appoint an EU importer)', fr: 'Créer une entité importatrice (ou désigner un importateur UE)', zh: '设立进口主体（或指定欧盟进口商）' },
      description: {
        en: 'Under EU rules the “importer” placing the product on the market carries legal responsibility for compliance. Either incorporate a French entity (typically SAS/SASU) or contract an established EU importer/distributor who takes that role.',
        fr: 'Selon le droit UE, l’« importateur » qui met le produit sur le marché porte la responsabilité de la conformité. Créer une entité française (généralement SAS/SASU) ou contractualiser un importateur/distributeur UE établi qui assume ce rôle.',
        zh: '按欧盟规则，把产品投放市场的"进口商"承担合规法律责任。可设立法国主体（通常 SAS/SASU），或签约一家承担该角色的欧盟进口商/经销商。',
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
      id: 'eori',
      name: { en: 'Customs registration (EORI) & VAT', fr: 'Immatriculation douanière (EORI) & TVA', zh: '海关注册（EORI）与增值税' },
      description: {
        en: 'Any business importing goods into the EU needs an EORI number (issued in France by the Douanes). Register for French VAT; import VAT (20% standard rate) is generally accounted for via the reverse-charge on the VAT return (autoliquidation).',
        fr: 'Toute entreprise important des marchandises dans l’UE doit avoir un numéro EORI (délivré en France par la Douane). S’immatriculer à la TVA française ; la TVA à l’import (taux normal 20 %) est en principe autoliquidée sur la déclaration de TVA.',
        zh: '任何向欧盟进口货物的企业都需 EORI 号（法国由海关 Douanes 签发）。注册法国增值税；进口增值税（标准税率 20%）一般通过申报表反向征收（autoliquidation）处理。',
      },
      authority: 'Douane française (DGDDI) / DGFiP',
      documents: {
        en: ['SIREN/SIRET', 'EORI application', 'VAT registration'],
        fr: ['SIREN/SIRET', 'Demande EORI', 'Immatriculation TVA'],
        zh: ['SIREN/SIRET', 'EORI 申请', '增值税注册'],
      },
      cost: { en: 'Free (registration); broker fees optional', fr: 'Gratuit (immatriculation) ; frais de courtier optionnels', zh: '注册免费；报关行费用可选' },
      timeline: { en: 'Days–weeks', fr: 'Jours–semaines', zh: '数天至数周' },
      dependsOn: ['entity'],
      references: [{ label: 'EORI — Douane', url: 'https://www.douane.gouv.fr/demarche/obtenir-un-numero-eori' }],
    },
    {
      id: 'classification',
      name: { en: 'Tariff classification & duties', fr: 'Classification tarifaire & droits de douane', zh: '税则归类与关税' },
      description: {
        en: 'Classify each instrument under Chapter 92 of the customs tariff (musical instruments) and look up the duty rate and any measures in TARIC. Origin is China, so check anti-dumping/safeguard measures where applicable and prepare commercial invoice, packing list and origin documentation.',
        fr: 'Classer chaque instrument au chapitre 92 du tarif douanier (instruments de musique) et vérifier le taux de droit et les mesures dans TARIC. L’origine étant la Chine, contrôler d’éventuelles mesures antidumping/de sauvegarde et préparer facture commerciale, liste de colisage et documents d’origine.',
        zh: '将每件乐器按海关税则第 92 章（乐器）归类，在 TARIC 查询关税率及相关措施。原产地为中国，需核查是否适用反倾销/保障措施，并备齐商业发票、装箱单与原产地文件。',
      },
      authority: 'Douane / TARIC (Commission européenne)',
      documents: {
        en: ['HS/TARIC code per product', 'Commercial invoice & packing list', 'Origin documentation'],
        fr: ['Code SH/TARIC par produit', 'Facture commerciale & liste de colisage', 'Documents d’origine'],
        zh: ['每个产品的 HS/TARIC 编码', '商业发票与装箱单', '原产地文件'],
      },
      cost: { en: 'Duty rate varies by code (often low for Ch.92) + 20% import VAT', fr: 'Droit selon le code (souvent faible au ch.92) + 20 % de TVA à l’import', zh: '关税随编码而定（第 92 章通常较低）+ 20% 进口增值税' },
      timeline: { en: 'Per shipment', fr: 'Par expédition', zh: '每批次' },
      dependsOn: ['eori'],
      risks: {
        en: ['Misclassification → duty/penalty reassessment', 'Anti-dumping measures on specific goods'],
        fr: ['Erreur de classement → redressement droits/pénalités', 'Mesures antidumping sur certains produits'],
        zh: ['归类错误 → 补税/罚款', '特定商品的反倾销措施'],
      },
      references: [{ label: 'TARIC (Commission européenne)', url: 'https://ec.europa.eu/taxation_customs/dds2/taric/taric_consultation.jsp' }],
    },
    {
      id: 'cites',
      name: { en: 'CITES permits for protected woods/materials', fr: 'Permis CITES pour bois/matériaux protégés', zh: '濒危木材/材料 CITES 许可' },
      description: {
        en: 'Many instruments (guitars, violins, bows, pianos, woodwinds) contain CITES-listed species — rosewood (Dalbergia), some ebonies, ivory, tortoiseshell, certain bones. Import requires CITES import/export permits; the responsible authority in France is the DREAL (on behalf of the CITES management authority). This is the most common compliance trap for instruments.',
        fr: 'De nombreux instruments (guitares, violons, archets, pianos, bois) contiennent des espèces inscrites à la CITES — palissandre (Dalbergia), certains ébènes, ivoire, écaille, certains os. L’import nécessite des permis CITES import/export ; l’autorité compétente en France est la DREAL (pour l’organe de gestion CITES). C’est le piège de conformité le plus fréquent pour les instruments.',
        zh: '许多乐器（吉他、小提琴、琴弓、钢琴、木管）含 CITES 列名物种——红木（黄檀属 Dalbergia）、部分乌木、象牙、玳瑁、某些骨料。进口需 CITES 进出口许可；法国主管机构为 DREAL（代表 CITES 管理机构）。这是乐器最常见的合规陷阱。',
      },
      authority: 'DREAL / Autorité de gestion CITES (France)',
      permit: 'Permis CITES (import / (ré)export)',
      documents: {
        en: ['Species & material declaration per model', 'CITES export permit (China) + import permit (EU)', 'Pre-Convention / source proof if relevant'],
        fr: ['Déclaration espèces & matériaux par modèle', 'Permis d’export CITES (Chine) + permis d’import (UE)', 'Preuve pré-Convention / d’origine le cas échéant'],
        zh: ['每型号物种与材质申报', 'CITES 出口许可（中国）+ 进口许可（欧盟）', '相关时的"公约前"/来源证明'],
      },
      cost: { en: 'Permit fees + lead time per shipment', fr: 'Frais de permis + délai par expédition', zh: '每批次许可费用 + 办证周期' },
      timeline: { en: 'Weeks–months (plan ahead)', fr: 'Semaines–mois (anticiper)', zh: '数周至数月（需提前规划）' },
      dependsOn: ['classification'],
      risks: {
        en: ['Seizure at customs if no CITES permit', 'Rosewood components overlooked'],
        fr: ['Saisie en douane sans permis CITES', 'Composants en palissandre oubliés'],
        zh: ['无 CITES 许可被海关扣押', '红木部件被忽略'],
      },
      references: [{ label: 'CITES — Ministère de la Transition écologique', url: 'https://www.ecologie.gouv.fr/cites-application-france' }],
    },
    {
      id: 'product-safety',
      name: { en: 'Product safety & CE marking', fr: 'Sécurité produit & marquage CE', zh: '产品安全与 CE 标识' },
      description: {
        en: 'All consumer products must meet the EU General Product Safety Regulation (GPSR). Electronic/electric instruments (keyboards, amps, digital pianos) additionally need CE marking under EMC and Low Voltage directives, plus RoHS (hazardous substances) and WEEE registration; wireless devices (Bluetooth/RF) fall under the RED. Build a technical file and EU Declaration of Conformity.',
        fr: 'Tout produit de consommation doit respecter le Règlement UE sur la sécurité générale des produits (RGSP). Les instruments électroniques/électriques (claviers, amplis, pianos numériques) nécessitent en plus le marquage CE au titre des directives CEM et Basse Tension, RoHS (substances dangereuses) et l’enregistrement DEEE ; les appareils sans fil (Bluetooth/RF) relèvent de la directive RED. Constituer un dossier technique et une Déclaration UE de conformité.',
        zh: '所有消费品须符合欧盟《通用产品安全条例》（GPSR）。电子/电气乐器（电子琴、音箱、数码钢琴）还需依 EMC 与低电压指令加贴 CE 标识，并满足 RoHS（有害物质）与 WEEE 注册；无线设备（蓝牙/射频）适用 RED 指令。需建立技术文件与欧盟符合性声明（DoC）。',
      },
      authority: 'DGCCRF (surveillance du marché)',
      permit: 'Marquage CE (CEM / Basse Tension / RED selon le cas)',
      documents: {
        en: ['EU Declaration of Conformity', 'Technical file & test reports (EMC/LVD/RED)', 'RoHS compliance; WEEE producer registration'],
        fr: ['Déclaration UE de conformité', 'Dossier technique & rapports d’essai (CEM/BT/RED)', 'Conformité RoHS ; enregistrement producteur DEEE'],
        zh: ['欧盟符合性声明', '技术文件与测试报告（EMC/LVD/RED）', 'RoHS 合规；WEEE 生产者注册'],
      },
      cost: { en: 'Testing €k-scale per product family', fr: 'Essais : échelle de k€ par famille de produits', zh: '每类产品测试费用千欧元级' },
      timeline: { en: 'Weeks–months', fr: 'Semaines–mois', zh: '数周至数月' },
      dependsOn: ['classification'],
      risks: {
        en: ['No CE/DoC → market withdrawal & fines', 'Missing WEEE/RoHS registration for electronics'],
        fr: ['Absence de CE/DoC → retrait du marché & amendes', 'Enregistrement DEEE/RoHS manquant pour l’électronique'],
        zh: ['无 CE/DoC → 下架与罚款', '电子产品缺 WEEE/RoHS 注册'],
      },
      references: [
        { label: 'GPSR — sécurité des produits', url: 'https://www.economie.gouv.fr/dgccrf' },
        { label: 'Marquage CE — Your Europe', url: 'https://europa.eu/youreurope/business/product-requirements/labels-markings/ce-marking/index_fr.htm' },
      ],
    },
    {
      id: 'labelling',
      name: { en: 'Labelling & French consumer information', fr: 'Étiquetage & information du consommateur', zh: '标签与法语消费者信息' },
      description: {
        en: 'Provide French-language product information, instructions and safety warnings (Toubon law). Show the importer’s name and address, model, and required pictograms; for packaging, comply with EPR (extended producer responsibility) for packaging (e.g. join an eco-organism such as CITEO).',
        fr: 'Fournir l’information produit, les notices et avertissements de sécurité en français (loi Toubon). Indiquer le nom et l’adresse de l’importateur, le modèle et les pictogrammes requis ; pour les emballages, respecter la REP emballages (adhésion à un éco-organisme tel que CITEO).',
        zh: '提供法语的产品信息、说明书与安全警示（Toubon 法）。标注进口商名称地址、型号及所需图示；包装方面需履行包装 EPR（生产者延伸责任，如加入 CITEO 等环保机构）。',
      },
      authority: 'DGCCRF / éco-organisme (CITEO)',
      documents: {
        en: ['French manual & labels', 'Importer identification on product/packaging', 'EPR packaging registration'],
        fr: ['Notice & étiquettes en français', 'Identification importateur sur produit/emballage', 'Adhésion REP emballages'],
        zh: ['法语说明书与标签', '产品/包装上的进口商标识', '包装 EPR 注册'],
      },
      cost: { en: 'EPR eco-contribution by volume', fr: 'Éco-contribution REP selon volume', zh: 'EPR 环保贡献费按量计' },
      timeline: { en: 'Before first sale', fr: 'Avant la première vente', zh: '首次销售前' },
      dependsOn: ['product-safety'],
      references: [{ label: 'CITEO — REP emballages', url: 'https://www.citeo.com/' }],
    },
    {
      id: 'logistics',
      name: { en: 'Logistics, wood packaging & distribution', fr: 'Logistique, emballage bois & distribution', zh: '物流、木质包装与分销' },
      description: {
        en: 'Arrange freight, customs clearance and warehousing. Wood packaging from China must be ISPM15-treated and marked. Then set distribution channels — own e-commerce, marketplaces (note marketplace compliance duties), retail or B2B to French music stores.',
        fr: 'Organiser le fret, le dédouanement et l’entreposage. L’emballage bois en provenance de Chine doit être traité et marqué ISPM15. Définir ensuite les canaux de distribution — e-commerce propre, marketplaces (obligations de conformité), retail ou B2B vers les magasins de musique français.',
        zh: '安排运输、清关与仓储。来自中国的木质包装须经 ISPM15 处理并加施标记。再确定分销渠道——自营电商、平台（注意平台合规义务）、零售或对法国琴行的 B2B。',
      },
      authority: 'Transporteur / commissionnaire en douane',
      documents: {
        en: ['Transport & insurance contracts', 'ISPM15-marked wood packaging', 'Customs clearance (DAU/import declaration)'],
        fr: ['Contrats transport & assurance', 'Emballage bois marqué ISPM15', 'Dédouanement (DAU/déclaration d’import)'],
        zh: ['运输与保险合同', '带 ISPM15 标记的木质包装', '清关（DAU/进口申报）'],
      },
      cost: { en: 'Freight + clearance + storage', fr: 'Fret + dédouanement + stockage', zh: '运费 + 清关 + 仓储' },
      timeline: { en: 'Ongoing', fr: 'En continu', zh: '持续' },
      dependsOn: ['cites', 'product-safety', 'labelling'],
      risks: {
        en: ['Non-ISPM15 packaging refused at border', 'Marketplace compliance obligations'],
        fr: ['Emballage non ISPM15 refusé à la frontière', 'Obligations de conformité marketplace'],
        zh: ['非 ISPM15 包装在口岸被拒', '平台合规义务'],
      },
      references: [{ label: 'ISPM15 / NIMP15 — emballages bois', url: 'https://agriculture.gouv.fr/exporter-des-vegetaux-et-produits-vegetaux' }],
    },
  ],
  risks: {
    en: [
      'CITES protected woods (rosewood/ebony) are the most common seizure cause — audit the bill of materials early.',
      'Electronic instruments add a full CE/EMC/RED/RoHS/WEEE compliance layer.',
      'The importer (not the Chinese factory) is legally liable for EU conformity.',
    ],
    fr: [
      'Les bois protégés CITES (palissandre/ébène) sont la première cause de saisie — auditer la nomenclature tôt.',
      'Les instruments électroniques ajoutent toute une couche de conformité CE/CEM/RED/RoHS/DEEE.',
      'L’importateur (et non l’usine chinoise) est juridiquement responsable de la conformité UE.',
    ],
    zh: [
      'CITES 濒危木材（红木/乌木）是最常见的扣押原因——应尽早审查物料清单。',
      '电子乐器会叠加整套 CE/EMC/RED/RoHS/WEEE 合规要求。',
      '欧盟合规的法律责任在进口商（而非中国工厂）。',
    ],
  },
  estCost: {
    en: 'Mainly compliance (testing, CITES, EPR) + freight/duties/20% import VAT; modest vs. infrastructure projects.',
    fr: 'Principalement conformité (essais, CITES, REP) + fret/droits/TVA import 20 % ; modéré face aux projets d’infrastructure.',
    zh: '主要是合规成本（测试、CITES、EPR）+ 运费/关税/20% 进口增值税；相比基建项目较低。',
  },
  estTimeline: {
    en: '2–6 months to first compliant shipment (CITES & CE testing are the long poles).',
    fr: '2–6 mois jusqu’à la première expédition conforme (CITES & essais CE sont le chemin critique).',
    zh: '到首批合规出货约 2–6 个月（CITES 与 CE 测试为关键路径）。',
  },
  references: [
    { label: 'Guichet unique (INPI)', url: 'https://formalites.entreprises.gouv.fr/' },
    { label: 'EORI — Douane', url: 'https://www.douane.gouv.fr/demarche/obtenir-un-numero-eori' },
    { label: 'TARIC (Commission européenne)', url: 'https://ec.europa.eu/taxation_customs/dds2/taric/taric_consultation.jsp' },
    { label: 'CITES — France', url: 'https://www.ecologie.gouv.fr/cites-application-france' },
    { label: 'DGCCRF', url: 'https://www.economie.gouv.fr/dgccrf' },
  ],
  version: '1.0',
  updated: '2026-06-27',
  keywords: ['musical instruments', 'instruments de musique', '乐器', 'guitar', 'guitare', '吉他', 'piano', '钢琴', 'violin', 'violon', 'import', 'importer', '进口', 'export', '出口', 'china', 'chine', '中国', 'CE marking', 'marquage CE', 'CITES', 'rosewood', 'palissandre', '红木', 'EORI', 'douane', '海关', 'customs'],
};

const CAVIAR_EXPORT: RawPlaybook = {
  slug: 'china-caviar-to-france',
  title: {
    en: 'Selling China-produced caviar in France',
    fr: 'Vendre en France du caviar produit en Chine',
    zh: '把中国生产的鱼子酱卖到法国',
  },
  sector: 'food-import',
  summary: {
    en: 'End-to-end workflow to import sturgeon caviar produced in China and sell it in France — from customs registration (EORI) and CITES sturgeon permits/labelling, through EU veterinary import controls for products of animal origin (approved establishment, health certificate, Border Control Post via TRACES), tariff classification, French food-safety & INCO labelling, to the cold chain and distribution.',
    fr: 'Procédure complète pour importer du caviar d’esturgeon produit en Chine et le vendre en France — de l’immatriculation douanière (EORI) et des permis/étiquetage CITES esturgeon, aux contrôles vétérinaires UE à l’import des produits d’origine animale (établissement agréé, certificat sanitaire, poste de contrôle frontalier via TRACES), à la classification tarifaire, à la sécurité sanitaire & l’étiquetage INCO, jusqu’à la chaîne du froid et la distribution.',
    zh: '把中国生产的鲟鱼鱼子酱进口并在法国销售的端到端流程——从海关注册（EORI）、CITES 鲟鱼许可与标识，到欧盟动物源性食品兽医进口管控（注册场所、卫生证书、经 TRACES 走边境检查站），再到税则归类、法国食品安全与 INCO 标签，直到冷链与分销。',
  },
  applicableTo: {
    en: ['Chinese caviar farms / exporters', 'Food import & distribution companies', 'HoReCa & gourmet retail suppliers'],
    fr: ['Fermes / exportateurs de caviar chinois', 'Sociétés d’import & distribution alimentaire', 'Fournisseurs CHR & épicerie fine'],
    zh: ['中国鱼子酱养殖场 / 出口商', '食品进口与分销公司', '餐饮（HoReCa）与高端零售供应商'],
  },
  prerequisites: {
    en: ['Sturgeon species & farm details (CITES source code, aquaculture)', 'Supplier must be an EU-approved establishment listed for China', 'Decide the import model: French entity or established EU importer'],
    fr: ['Espèce d’esturgeon & informations sur la ferme (code source CITES, aquaculture)', 'Le fournisseur doit être un établissement agréé UE listé pour la Chine', 'Choisir le modèle d’import : entité française ou importateur UE établi'],
    zh: ['鲟鱼物种与养殖场信息（CITES 来源代码、养殖）', '供应商须为欧盟批准、且对华列名的注册场所', '确定进口模式：法国主体或既有欧盟进口商'],
  },
  tasks: [
    {
      id: 'entity',
      name: { en: 'Set up an importing entity (or appoint an EU importer)', fr: 'Créer une entité importatrice (ou désigner un importateur UE)', zh: '设立进口主体（或指定欧盟进口商）' },
      description: {
        en: 'The “importer” placing food on the EU market is legally responsible for its safety and compliance (Reg. 178/2002). Either incorporate a French entity (typically SAS/SASU) or contract an established EU food importer who takes that role.',
        fr: 'L’« importateur » qui met la denrée sur le marché UE est juridiquement responsable de sa sécurité et conformité (Règl. 178/2002). Créer une entité française (généralement SAS/SASU) ou contractualiser un importateur alimentaire UE établi qui assume ce rôle.',
        zh: '把食品投放欧盟市场的"进口商"对其安全与合规负法律责任（第 178/2002 号条例）。可设立法国主体（通常 SAS/SASU），或签约一家承担该角色的既有欧盟食品进口商。',
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
      id: 'eori',
      name: { en: 'Customs registration (EORI) & VAT', fr: 'Immatriculation douanière (EORI) & TVA', zh: '海关注册（EORI）与增值税' },
      description: {
        en: 'Any business importing goods into the EU needs an EORI number (issued in France by the Douanes). Register for French VAT; caviar is generally subject to the reduced food VAT rate, with import VAT accounted via reverse-charge (autoliquidation) on the VAT return.',
        fr: 'Toute entreprise important des marchandises dans l’UE doit avoir un numéro EORI (délivré en France par la Douane). S’immatriculer à la TVA française ; le caviar relève en principe du taux réduit de TVA alimentaire, la TVA à l’import étant autoliquidée sur la déclaration.',
        zh: '任何向欧盟进口货物的企业都需 EORI 号（法国由海关 Douanes 签发）。注册法国增值税；鱼子酱一般适用食品类降低税率，进口增值税通过申报表反向征收（autoliquidation）处理。',
      },
      authority: 'Douane française (DGDDI) / DGFiP',
      documents: {
        en: ['SIREN/SIRET', 'EORI application', 'VAT registration'],
        fr: ['SIREN/SIRET', 'Demande EORI', 'Immatriculation TVA'],
        zh: ['SIREN/SIRET', 'EORI 申请', '增值税注册'],
      },
      cost: { en: 'Free (registration); broker fees optional', fr: 'Gratuit (immatriculation) ; frais de courtier optionnels', zh: '注册免费；报关行费用可选' },
      timeline: { en: 'Days–weeks', fr: 'Jours–semaines', zh: '数天至数周' },
      dependsOn: ['entity'],
      references: [{ label: 'EORI — Douane', url: 'https://www.douane.gouv.fr/demarche/obtenir-un-numero-eori' }],
    },
    {
      id: 'cites',
      name: { en: 'CITES sturgeon permits & caviar labelling', fr: 'Permis CITES esturgeon & étiquetage du caviar', zh: 'CITES 鲟鱼许可与鱼子酱标识' },
      description: {
        en: 'All sturgeon species are CITES-listed, so caviar trade requires CITES import permits (EU) matched to the export permit (China). Caviar must carry the mandatory CITES universal labelling on every primary container (source, country, year, processing/repackaging code). This is non-negotiable and checked at import.',
        fr: 'Toutes les espèces d’esturgeon sont inscrites à la CITES ; le commerce de caviar nécessite donc des permis d’import CITES (UE) en regard du permis d’export (Chine). Le caviar doit porter l’étiquetage universel CITES obligatoire sur chaque contenant primaire (source, pays, année, code de transformation/réemballage). Non négociable et contrôlé à l’import.',
        zh: '所有鲟鱼物种均列入 CITES，因此鱼子酱贸易需 CITES 进口许可（欧盟）并与出口许可（中国）匹配。每个原始容器必须加施强制性 CITES 通用标识（来源、国别、年份、加工/再包装代码）。此项不可商量，进口时必查。',
      },
      authority: 'Autorité de gestion CITES (France) / DREAL',
      permit: 'Permis CITES (import) + étiquetage universel du caviar',
      documents: {
        en: ['CITES export permit (China) + import permit (EU)', 'CITES universal caviar labels on each tin', 'Sturgeon species & source-code declaration'],
        fr: ['Permis d’export CITES (Chine) + permis d’import (UE)', 'Étiquettes CITES universelles sur chaque boîte', 'Déclaration espèce d’esturgeon & code source'],
        zh: ['CITES 出口许可（中国）+ 进口许可（欧盟）', '每听上的 CITES 通用鱼子酱标识', '鲟鱼物种与来源代码申报'],
      },
      cost: { en: 'Permit fees + lead time per shipment', fr: 'Frais de permis + délai par expédition', zh: '每批次许可费用 + 办证周期' },
      timeline: { en: 'Weeks–months (plan ahead)', fr: 'Semaines–mois (anticiper)', zh: '数周至数月（需提前规划）' },
      dependsOn: ['eori'],
      risks: {
        en: ['Seizure at customs without CITES permit', 'Missing/incorrect universal label code'],
        fr: ['Saisie en douane sans permis CITES', 'Code d’étiquetage universel manquant/erroné'],
        zh: ['无 CITES 许可被海关扣押', '通用标识代码缺失/错误'],
      },
      references: [{ label: 'CITES — Ministère de la Transition écologique', url: 'https://www.ecologie.gouv.fr/cites-application-france' }],
    },
    {
      id: 'veterinary',
      name: { en: 'Veterinary import control (product of animal origin)', fr: 'Contrôle vétérinaire à l’import (produit d’origine animale)', zh: '兽医进口管控（动物源性产品）' },
      description: {
        en: 'Caviar is a fishery product of animal origin: China must be an authorised third country, the producing farm must be an EU-approved establishment, every consignment needs the official EU health certificate, must be pre-notified in TRACES (CHED-P) and physically enter the EU through a designated Border Control Post (poste de contrôle frontalier) for documentary/identity/physical checks before customs release.',
        fr: 'Le caviar est un produit de la pêche d’origine animale : la Chine doit être un pays tiers autorisé, la ferme productrice un établissement agréé UE, chaque envoi requiert le certificat sanitaire officiel UE, doit être pré-notifié dans TRACES (DSCE-P/CHED-P) et entrer dans l’UE via un poste de contrôle frontalier désigné pour contrôles documentaire/identité/physique avant dédouanement.',
        zh: '鱼子酱属动物源性渔业产品：中国须为获准第三国、生产养殖场须为欧盟批准注册场所，每批货需附欧盟官方卫生证书，须在 TRACES 预先申报（CHED-P），并经指定边境检查站（poste de contrôle frontalier）入欧、完成文件/同一性/实物查验后方可清关。',
      },
      authority: 'DGAL / DD(ec)PP — poste de contrôle frontalier (PCF)',
      permit: 'Certificat sanitaire UE + CHED-P (TRACES NT)',
      documents: {
        en: ['EU export health certificate (China official vet)', 'CHED-P pre-notification in TRACES NT', 'EU-approval number of the producing establishment'],
        fr: ['Certificat sanitaire d’export UE (vétérinaire officiel chinois)', 'Pré-notification CHED-P dans TRACES NT', 'Numéro d’agrément UE de l’établissement producteur'],
        zh: ['欧盟出口卫生证书（中国官方兽医签发）', 'TRACES NT 中的 CHED-P 预申报', '生产场所的欧盟批准编号'],
      },
      cost: { en: 'Border control inspection fees per consignment', fr: 'Redevances d’inspection au PCF par envoi', zh: '每批次边境检查站查验费' },
      timeline: { en: 'Per shipment; clearance hours–days', fr: 'Par envoi ; dédouanement heures–jours', zh: '每批次；清关数小时至数天' },
      dependsOn: ['eori'],
      risks: {
        en: ['Farm not on the EU-approved list → import refused', 'Wrong entry point (must be a designated BCP)', 'Certificate errors → rejection/destruction'],
        fr: ['Ferme absente de la liste agréée UE → import refusé', 'Mauvais point d’entrée (PCF désigné obligatoire)', 'Erreurs de certificat → refus/destruction'],
        zh: ['养殖场不在欧盟批准名单 → 拒绝进口', '入境口岸错误（须为指定 PCF）', '证书有误 → 退运/销毁'],
      },
      references: [
        { label: 'Import animaux & produits animaux — Ministère de l’Agriculture', url: 'https://agriculture.gouv.fr/limportation-danimaux-vivants-et-de-produits-animaux-et-dorigine-animale' },
        { label: 'TRACES NT (Commission européenne)', url: 'https://webgate.ec.europa.eu/tracesnt/' },
      ],
    },
    {
      id: 'classification',
      name: { en: 'Tariff classification & duties', fr: 'Classification tarifaire & droits de douane', zh: '税则归类与关税' },
      description: {
        en: 'Classify caviar under heading 1604 — 1604.31 (caviar) or 1604.32 (caviar substitutes) — and look up the duty rate and measures in TARIC. Prepare commercial invoice, packing list and origin documentation; verify any quota or specific measures for the origin.',
        fr: 'Classer le caviar à la position 1604 — 1604.31 (caviar) ou 1604.32 (succédanés de caviar) — et vérifier le taux de droit et les mesures dans TARIC. Préparer facture commerciale, liste de colisage et documents d’origine ; contrôler quotas/mesures spécifiques selon l’origine.',
        zh: '将鱼子酱按品目 1604 归类——1604.31（鱼子酱）或 1604.32（鱼子酱替代品）——在 TARIC 查询关税率与相关措施。备齐商业发票、装箱单与原产地文件；核查原产地是否有配额或特定措施。',
      },
      authority: 'Douane / TARIC (Commission européenne)',
      documents: {
        en: ['HS/TARIC code (1604.31 / 1604.32)', 'Commercial invoice & packing list', 'Origin documentation'],
        fr: ['Code SH/TARIC (1604.31 / 1604.32)', 'Facture commerciale & liste de colisage', 'Documents d’origine'],
        zh: ['HS/TARIC 编码（1604.31 / 1604.32）', '商业发票与装箱单', '原产地文件'],
      },
      cost: { en: 'Duty rate per TARIC + reduced food VAT', fr: 'Droit selon TARIC + TVA alimentaire réduite', zh: '关税按 TARIC + 食品类降低增值税' },
      timeline: { en: 'Per shipment', fr: 'Par expédition', zh: '每批次' },
      dependsOn: ['veterinary'],
      risks: {
        en: ['Misclassification → duty/penalty reassessment', 'Caviar vs. substitute mislabel'],
        fr: ['Erreur de classement → redressement droits/pénalités', 'Confusion caviar / succédané'],
        zh: ['归类错误 → 补税/罚款', '鱼子酱与替代品标注混淆'],
      },
      references: [{ label: 'TARIC (Commission européenne)', url: 'https://ec.europa.eu/taxation_customs/dds2/taric/taric_consultation.jsp' }],
    },
    {
      id: 'food-safety-labelling',
      name: { en: 'Food safety & French/EU labelling (INCO)', fr: 'Sécurité sanitaire & étiquetage FR/UE (INCO)', zh: '食品安全与法/欧标签（INCO）' },
      description: {
        en: 'Comply with EU food hygiene rules and ensure consumer information per Reg. (EU) 1169/2011 (INCO): French-language labelling with product name, species, net weight, ingredients/additives, allergens, date of minimum durability, storage conditions, batch and the importer’s name & address. The importer should declare the activity to the DDPP and keep traceability records.',
        fr: 'Respecter les règles d’hygiène UE et l’information du consommateur selon le Règl. (UE) 1169/2011 (INCO) : étiquetage en français avec dénomination, espèce, poids net, ingrédients/additifs, allergènes, DDM, conditions de conservation, lot et nom & adresse de l’importateur. L’importateur déclare l’activité à la DDPP et tient la traçabilité.',
        zh: '遵守欧盟食品卫生规则，并按第 (EU) 1169/2011 号条例（INCO）保障消费者信息：法语标签须含名称、物种、净含量、配料/添加剂、过敏原、最佳食用日期（DDM）、储存条件、批号及进口商名称地址。进口商应向 DDPP 申报经营活动并保存可追溯记录。',
      },
      authority: 'DGAL / DGCCRF — déclaration DDPP',
      documents: {
        en: ['French INCO-compliant label', 'Activity declaration to the DDPP', 'Traceability & cold-chain records'],
        fr: ['Étiquette conforme INCO en français', 'Déclaration d’activité à la DDPP', 'Traçabilité & enregistrements chaîne du froid'],
        zh: ['符合 INCO 的法语标签', '向 DDPP 的经营活动申报', '可追溯与冷链记录'],
      },
      cost: { en: 'Label design + compliance', fr: 'Conception étiquette + conformité', zh: '标签设计 + 合规' },
      timeline: { en: 'Before first sale', fr: 'Avant la première vente', zh: '首次销售前' },
      dependsOn: ['veterinary', 'classification'],
      risks: {
        en: ['Non-French / non-INCO labelling → withdrawal & fines', 'Allergen / additive declaration errors'],
        fr: ['Étiquetage non français / non INCO → retrait & amendes', 'Erreurs déclaration allergènes / additifs'],
        zh: ['非法语/非 INCO 标签 → 下架与罚款', '过敏原/添加剂申报错误'],
      },
      references: [
        { label: 'Étiquetage des denrées (INCO) — DGCCRF', url: 'https://www.economie.gouv.fr/dgccrf' },
        { label: 'Règlement INCO 1169/2011', url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32011R1169' },
      ],
    },
    {
      id: 'logistics',
      name: { en: 'Cold chain, storage & distribution', fr: 'Chaîne du froid, stockage & distribution', zh: '冷链、仓储与分销' },
      description: {
        en: 'Caviar is highly perishable: maintain an unbroken refrigerated chain (typically around -2 to +4 °C) from the BCP through storage to delivery. Arrange refrigerated freight, compliant cold storage, then set channels — gourmet retail, HoReCa, own e-commerce or B2B distributors.',
        fr: 'Le caviar est très périssable : maintenir une chaîne du froid ininterrompue (généralement entre -2 et +4 °C) du PCF au stockage jusqu’à la livraison. Organiser le fret réfrigéré, l’entreposage froid conforme, puis définir les canaux — épicerie fine, CHR, e-commerce propre ou distributeurs B2B.',
        zh: '鱼子酱极易腐：从边境检查站经仓储到交付，须保持不间断冷链（通常约 -2 至 +4 °C）。安排冷藏运输、合规冷库，再确定渠道——高端零售、餐饮、自营电商或 B2B 分销商。',
      },
      authority: 'Transporteur / commissionnaire en douane',
      documents: {
        en: ['Refrigerated transport & insurance contracts', 'Cold-storage temperature logs', 'Customs clearance after BCP release'],
        fr: ['Contrats transport réfrigéré & assurance', 'Relevés de température du stockage froid', 'Dédouanement après mainlevée PCF'],
        zh: ['冷藏运输与保险合同', '冷库温度记录', '边境检查站放行后清关'],
      },
      cost: { en: 'Refrigerated freight + cold storage + clearance', fr: 'Fret réfrigéré + stockage froid + dédouanement', zh: '冷藏运费 + 冷库 + 清关' },
      timeline: { en: 'Ongoing', fr: 'En continu', zh: '持续' },
      dependsOn: ['cites', 'veterinary', 'food-safety-labelling'],
      risks: {
        en: ['Cold-chain break → spoilage & loss', 'Short shelf life vs. customs delays'],
        fr: ['Rupture de chaîne du froid → altération & perte', 'DLC courte vs. délais douaniers'],
        zh: ['冷链断裂 → 变质与损失', '保质期短 vs. 海关延误'],
      },
      references: [{ label: 'Import produits animaux — Ministère de l’Agriculture', url: 'https://agriculture.gouv.fr/limportation-danimaux-vivants-et-de-produits-animaux-et-dorigine-animale' }],
    },
  ],
  risks: {
    en: [
      'Two parallel gates: CITES sturgeon permits AND veterinary import via an approved establishment + Border Control Post — both are mandatory.',
      'The producing farm must be on the EU-approved establishment list for China, or the import is refused.',
      'Cold-chain and short shelf life make customs/veterinary delays a direct commercial risk.',
    ],
    fr: [
      'Deux barrières parallèles : permis CITES esturgeon ET import vétérinaire via établissement agréé + poste de contrôle frontalier — les deux sont obligatoires.',
      'La ferme productrice doit figurer sur la liste UE des établissements agréés pour la Chine, sinon l’import est refusé.',
      'Chaîne du froid et DLC courte rendent les délais douaniers/vétérinaires directement risqués commercialement.',
    ],
    zh: [
      '两道并行关卡：CITES 鲟鱼许可 与 经注册场所 + 边境检查站的兽医进口——两者均为强制。',
      '生产养殖场须在欧盟对华批准注册场所名单内，否则拒绝进口。',
      '冷链与短保质期使海关/兽医延误成为直接的商业风险。',
    ],
  },
  estCost: {
    en: 'Mainly compliance (CITES, veterinary certification, labelling) + refrigerated freight/duties/reduced food VAT.',
    fr: 'Principalement conformité (CITES, certification vétérinaire, étiquetage) + fret réfrigéré/droits/TVA alimentaire réduite.',
    zh: '主要是合规成本（CITES、兽医认证、标签）+ 冷藏运费/关税/食品类降低增值税。',
  },
  estTimeline: {
    en: '2–5 months to first compliant shipment (establishment approval, CITES & veterinary set-up are the long poles).',
    fr: '2–5 mois jusqu’à la première expédition conforme (agrément établissement, CITES & circuit vétérinaire sont le chemin critique).',
    zh: '到首批合规出货约 2–5 个月（场所批准、CITES 与兽医通道为关键路径）。',
  },
  references: [
    { label: 'Guichet unique (INPI)', url: 'https://formalites.entreprises.gouv.fr/' },
    { label: 'EORI — Douane', url: 'https://www.douane.gouv.fr/demarche/obtenir-un-numero-eori' },
    { label: 'CITES — France', url: 'https://www.ecologie.gouv.fr/cites-application-france' },
    { label: 'Import produits d’origine animale — Agriculture', url: 'https://agriculture.gouv.fr/limportation-danimaux-vivants-et-de-produits-animaux-et-dorigine-animale' },
    { label: 'TARIC (Commission européenne)', url: 'https://ec.europa.eu/taxation_customs/dds2/taric/taric_consultation.jsp' },
    { label: 'DGCCRF — étiquetage', url: 'https://www.economie.gouv.fr/dgccrf' },
  ],
  version: '1.0',
  updated: '2026-06-27',
  keywords: ['caviar', '鱼子酱', '鲟鱼', 'sturgeon', 'esturgeon', 'roe', 'œufs de poisson', 'food import', 'import alimentaire', '食品进口', 'CITES', 'veterinary', 'vétérinaire', '兽医', 'health certificate', 'certificat sanitaire', '卫生证书', 'cold chain', 'chaîne du froid', '冷链', 'china', 'chine', '中国', 'EORI', 'douane', '海关', 'TRACES'],
};

export const RAW: RawPlaybook[] = [DATA_CENTER, MUSIC_EXPORT, CAVIAR_EXPORT];

export function localize(p: RawPlaybook, loc: Loc): Playbook {
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
