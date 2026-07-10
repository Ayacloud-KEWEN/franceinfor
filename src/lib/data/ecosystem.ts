// Industry ecosystem maps for the Markets module (M1).
//
// Fixes the "keyword-only" problem: a query like "wifi" used to return
// companies whose NAME starts with WIFI. Here each sector maps user keywords
// (en/fr/zh synonyms) to the NAF activity codes of its real value chain —
// makers, distributors/wholesalers, operators/channels, service providers —
// which are then queried live against the government registry
// (searchCompaniesByNaf). All NAF codes below are validated against the API.

import type { Loc } from './payment-credit';
export type { Loc };

type L = Record<Loc, string>;

export interface EcosystemRole {
  id: string;
  label: L;
  naf: string[]; // validated NAF rev.2 codes (5 chars)
}

export interface IndustryEcosystem {
  slug: string; // matches INDUSTRIES slug when the sector exists there
  title: L;
  keywords: string[]; // lowercase synonyms (en/fr/zh) that map a query here
  roles: EcosystemRole[];
}

const ROLE = {
  makers: { en: 'Manufacturers', fr: 'Fabricants', zh: '制造商' },
  distributors: { en: 'Distributors / wholesalers', fr: 'Distributeurs / grossistes', zh: '分销商 / 批发商' },
  operators: { en: 'Operators', fr: 'Opérateurs', zh: '运营商' },
  services: { en: 'Integrators & service providers', fr: 'Intégrateurs & prestataires', zh: '集成商 / 服务商' },
  retail: { en: 'Retail channels', fr: 'Canaux de détail', zh: '零售渠道' },
  consulting: { en: 'Consulting & engineering', fr: 'Conseil & ingénierie', zh: '咨询 / 工程' },
} satisfies Record<string, L>;

export const ECOSYSTEMS: IndustryEcosystem[] = [
  {
    slug: 'telecom',
    title: { en: 'Telecom & networking', fr: 'Télécoms & réseaux', zh: '电信与网络设备' },
    keywords: ['wifi', 'wi-fi', 'telecom', 'télécom', 'telecommunications', '5g', 'réseau', 'network', 'router', 'routeur', 'fibre', 'fiber', 'broadband', '电信', '通信', '网络', '路由器', '宽带'],
    roles: [
      { id: 'makers', label: ROLE.makers, naf: ['26.30Z'] },
      { id: 'distributors', label: ROLE.distributors, naf: ['46.52Z'] },
      { id: 'operators', label: ROLE.operators, naf: ['61.10Z', '61.20Z', '61.90Z'] },
      { id: 'services', label: ROLE.services, naf: ['43.21A', '62.09Z'] },
    ],
  },
  {
    slug: 'ai',
    title: { en: 'Artificial intelligence & software', fr: 'IA & logiciel', zh: '人工智能与软件' },
    keywords: ['ai', 'ia', 'artificial intelligence', 'intelligence artificielle', 'machine learning', 'logiciel', 'software', 'saas', '人工智能', '大模型', '软件'],
    roles: [
      { id: 'dev', label: { en: 'Software developers', fr: 'Éditeurs / développeurs', zh: '软件开发商' }, naf: ['62.01Z'] },
      { id: 'publishers', label: { en: 'Software publishers', fr: 'Éditeurs de logiciels', zh: '软件发行商' }, naf: ['58.29C'] },
      { id: 'consulting', label: ROLE.consulting, naf: ['62.02A'] },
      { id: 'data', label: { en: 'Data & hosting', fr: 'Données & hébergement', zh: '数据与托管' }, naf: ['63.11Z'] },
    ],
  },
  {
    slug: 'cybersecurity',
    title: { en: 'Cybersecurity', fr: 'Cybersécurité', zh: '网络安全' },
    keywords: ['cybersecurity', 'cybersécurité', 'cyber', 'sécurité informatique', 'infosec', '网络安全', '信息安全'],
    roles: [
      { id: 'dev', label: { en: 'Security software', fr: 'Logiciels de sécurité', zh: '安全软件商' }, naf: ['62.01Z', '58.29C'] },
      { id: 'consulting', label: ROLE.consulting, naf: ['62.02A'] },
      { id: 'services', label: { en: 'Security services (SOC…)', fr: 'Services de sécurité', zh: '安全服务商' }, naf: ['80.20Z'] },
      { id: 'data', label: { en: 'Hosting & infrastructure', fr: 'Hébergement & infra', zh: '托管与基础设施' }, naf: ['63.11Z'] },
    ],
  },
  {
    slug: 'robotics',
    title: { en: 'Robotics & industrial equipment', fr: 'Robotique & équipements industriels', zh: '机器人与工业装备' },
    keywords: ['robot', 'robots', 'robotics', 'robotique', 'automation', 'automatisation', '机器人', '自动化'],
    roles: [
      { id: 'makers', label: ROLE.makers, naf: ['28.99B', '27.90Z'] },
      { id: 'distributors', label: ROLE.distributors, naf: ['46.69B'] },
      { id: 'engineering', label: ROLE.consulting, naf: ['71.12B'] },
      { id: 'maintenance', label: { en: 'Installation & maintenance', fr: 'Installation & maintenance', zh: '安装与维保' }, naf: ['33.14Z'] },
    ],
  },
  {
    slug: 'healthcare',
    title: { en: 'Healthcare & medical devices', fr: 'Santé & dispositifs médicaux', zh: '医疗健康与器械' },
    keywords: ['health', 'healthcare', 'santé', 'medical', 'médical', 'pharma', 'pharmacie', '医疗', '医药', '器械'],
    roles: [
      { id: 'makers', label: { en: 'Device & pharma manufacturers', fr: 'Fabricants (DM & pharma)', zh: '器械/制药制造商' }, naf: ['26.60Z', '21.20Z', '32.50A'] },
      { id: 'distributors', label: { en: 'Pharma & medical wholesalers', fr: 'Grossistes pharma & médical', zh: '医药/器械分销商' }, naf: ['46.46Z'] },
      { id: 'providers', label: { en: 'Hospitals & care providers', fr: 'Hôpitaux & établissements', zh: '医院与医疗机构' }, naf: ['86.10Z'] },
    ],
  },
  {
    slug: 'education',
    title: { en: 'Education & training', fr: 'Éducation & formation', zh: '教育与培训' },
    keywords: ['education', 'éducation', 'edtech', 'formation', 'training', '教育', '培训'],
    roles: [
      { id: 'training', label: { en: 'Training providers', fr: 'Organismes de formation', zh: '培训机构' }, naf: ['85.59A', '85.59B'] },
      { id: 'edtech', label: { en: 'EdTech developers', fr: 'Éditeurs EdTech', zh: '教育科技开发商' }, naf: ['62.01Z', '58.29C'] },
    ],
  },
  {
    slug: 'luxury',
    title: { en: 'Luxury & fashion', fr: 'Luxe & mode', zh: '奢侈品与时尚' },
    keywords: ['luxury', 'luxe', 'fashion', 'mode', 'maroquinerie', 'jewelry', 'bijouterie', '奢侈品', '时尚', '珠宝', '皮具'],
    roles: [
      { id: 'makers', label: ROLE.makers, naf: ['15.12Z', '32.12Z'] },
      { id: 'distributors', label: ROLE.distributors, naf: ['46.42Z'] },
      { id: 'retail', label: ROLE.retail, naf: ['47.71Z', '47.77Z'] },
    ],
  },
  {
    slug: 'retail',
    title: { en: 'Retail & e-commerce', fr: 'Commerce & e-commerce', zh: '零售与电商' },
    keywords: ['retail', 'ecommerce', 'e-commerce', 'commerce', 'marketplace', '零售', '电商', '跨境电商'],
    roles: [
      { id: 'online', label: { en: 'E-commerce sellers', fr: 'Vendeurs en ligne', zh: '电商卖家' }, naf: ['47.91A', '47.91B'] },
      { id: 'wholesale', label: { en: 'Non-specialised wholesale', fr: 'Commerce de gros non spécialisé', zh: '综合批发商' }, naf: ['46.90Z'] },
      { id: 'intermediaries', label: { en: 'B2B trade intermediaries', fr: 'Intermédiaires du commerce', zh: 'B2B 贸易中介' }, naf: ['46.19B'] },
      { id: 'retail', label: ROLE.retail, naf: ['47.71Z'] },
    ],
  },
  {
    slug: 'food',
    title: { en: 'Food & beverage', fr: 'Agroalimentaire', zh: '食品与餐饮' },
    keywords: ['food', 'agroalimentaire', 'alimentaire', 'beverage', 'restaurant', 'restauration', '食品', '餐饮', '进口食品'],
    roles: [
      { id: 'distributors', label: { en: 'Food wholesalers / importers', fr: 'Grossistes / importateurs alimentaires', zh: '食品批发/进口商' }, naf: ['46.38B', '46.39B'] },
      { id: 'channel', label: { en: 'Restaurants (HoReCa channel)', fr: 'Restauration (canal CHR)', zh: '餐饮渠道（HoReCa）' }, naf: ['56.10A'] },
      { id: 'drinks', label: { en: 'Drinks wholesalers', fr: 'Grossistes en boissons', zh: '酒水饮料批发商' }, naf: ['46.34Z'] },
    ],
  },
  {
    slug: 'energy',
    title: { en: 'Energy', fr: 'Énergie', zh: '能源' },
    keywords: ['energy', 'énergie', 'solar', 'solaire', 'photovoltaïque', 'renewable', 'éolien', '能源', '光伏', '风电', '储能'],
    roles: [
      { id: 'producers', label: { en: 'Power producers', fr: 'Producteurs d’électricité', zh: '发电企业' }, naf: ['35.11Z'] },
      { id: 'grid', label: { en: 'Grid & distribution', fr: 'Réseaux & distribution', zh: '电网与配电' }, naf: ['35.13Z'] },
      { id: 'installers', label: { en: 'Installers (HVAC / solar)', fr: 'Installateurs', zh: '安装服务商' }, naf: ['43.22B'] },
      { id: 'engineering', label: ROLE.consulting, naf: ['71.12B'] },
    ],
  },
  {
    slug: 'transportation',
    title: { en: 'Transport & logistics', fr: 'Transport & logistique', zh: '运输与物流' },
    keywords: ['transport', 'logistics', 'logistique', 'freight', 'fret', 'shipping', '物流', '运输', '货代'],
    roles: [
      { id: 'carriers', label: { en: 'Road freight carriers', fr: 'Transporteurs routiers', zh: '公路货运商' }, naf: ['49.41A'] },
      { id: 'forwarders', label: { en: 'Freight forwarders', fr: 'Commissionnaires / affréteurs', zh: '货运代理' }, naf: ['52.29A', '52.29B'] },
      { id: 'warehousing', label: { en: 'Warehousing', fr: 'Entreposage', zh: '仓储服务商' }, naf: ['52.10B'] },
    ],
  },
  {
    slug: 'manufacturing',
    title: { en: 'Industrial manufacturing', fr: 'Industrie manufacturière', zh: '工业制造' },
    keywords: ['manufacturing', 'industrie', 'industrial', 'machinery', 'machine', '制造', '工业', '机械'],
    roles: [
      { id: 'makers', label: { en: 'Machinery manufacturers', fr: 'Fabricants de machines', zh: '机械制造商' }, naf: ['28.99B'] },
      { id: 'distributors', label: { en: 'Industrial supplies wholesale', fr: 'Fournitures industrielles', zh: '工业品分销商' }, naf: ['46.69B'] },
      { id: 'engineering', label: ROLE.consulting, naf: ['71.12B'] },
      { id: 'maintenance', label: { en: 'Industrial maintenance', fr: 'Maintenance industrielle', zh: '工业维保' }, naf: ['33.14Z'] },
    ],
  },
];

export const ECOSYSTEM_LABELS = {
  panelTitle: {
    en: 'Industry ecosystem — the real players',
    fr: 'Écosystème du secteur — les vrais acteurs',
    zh: '行业生态图谱 —— 真正的玩家',
  } as L,
  panelIntro: {
    en: 'Live from the official registry, by declared business activity (NAF code) — not by company name. Largest players first.',
    fr: 'Données du registre officiel, par activité déclarée (code NAF) — pas par nom. Les plus gros acteurs d’abord.',
    zh: '基于官方企业注册库、按申报的主营行业（NAF 代码）实时检索 —— 而非按公司名称匹配。按企业规模排序。',
  } as L,
  companiesTotal: { en: 'registered', fr: 'immatriculées', zh: '家注册企业' } as L,
  nameMatches: {
    en: 'Companies matching by name (reference only)',
    fr: 'Entreprises correspondant par nom (indicatif)',
    zh: '按名称匹配的企业（仅供参考）',
  } as L,
};

// Map a free-text query to an ecosystem via keyword synonyms.
export function matchEcosystem(q: string): IndustryEcosystem | undefined {
  const ql = q.toLowerCase().trim();
  if (!ql) return undefined;
  return ECOSYSTEMS.find(
    (e) =>
      e.slug === ql ||
      e.keywords.some((k) => ql === k || ql.includes(k) || (k.length >= 4 && k.includes(ql) && ql.length >= 4))
  );
}

export function getEcosystem(slug: string): IndustryEcosystem | undefined {
  return ECOSYSTEMS.find((e) => e.slug === slug);
}
