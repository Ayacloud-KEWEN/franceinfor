// Sector "landing & compliance" checklists for entering the French market.
//
// Content is curated from stable, public French regulatory facts (not LLM-
// generated — compliance must not hallucinate). Sector-agnostic basics (legal
// form, VAT/tax, employment, GDPR) are combined with a sector-specific
// regulation/certification overlay. Informational only — not legal advice.
//
// Content is provided per locale; `fr` falls back to `en`.

export type Loc = 'en' | 'fr' | 'zh';
type Localized = { en: string[]; zh: string[] };

export interface ResourceLink {
  label: string;
  url: string;
}

export interface ChecklistSection {
  id: 'legalForm' | 'tax' | 'employment' | 'sector' | 'gdpr';
  items: string[];
  links: ResourceLink[]; // official links for THIS section
}

export interface SectorCompliance {
  sector: string; // key
  sections: ChecklistSection[];
}

// Official websites attached to each base section.
const SECTION_LINKS: Record<'legalForm' | 'tax' | 'employment' | 'gdpr', ResourceLink[]> = {
  legalForm: [
    { label: 'Guichet unique (company registration)', url: 'https://formalites.entreprises.gouv.fr/' },
    { label: 'INPI', url: 'https://www.inpi.fr/' },
  ],
  tax: [{ label: 'impots.gouv.fr (tax / VAT)', url: 'https://www.impots.gouv.fr/' }],
  employment: [
    { label: 'URSSAF (social contributions)', url: 'https://www.urssaf.fr/' },
    { label: 'service-public.fr — entreprises', url: 'https://entreprendre.service-public.fr/' },
  ],
  gdpr: [{ label: 'CNIL (GDPR)', url: 'https://www.cnil.fr/' }],
};

// Generic consumer-protection link, prepended to the sector-regulation section.
const DGCCRF: ResourceLink = { label: 'DGCCRF (consumer protection)', url: 'https://www.economie.gouv.fr/dgccrf' };

// Sector-specific official websites.
const LINKS_OVERLAY: Record<string, ResourceLink[]> = {
  generic: [],
  food: [
    { label: 'Ministère de l’Agriculture (sécurité sanitaire)', url: 'https://agriculture.gouv.fr/' },
    { label: 'HACCP — service-public', url: 'https://entreprendre.service-public.fr/vosdroits/F32285' },
  ],
  health: [
    { label: 'ANSM', url: 'https://ansm.sante.fr/' },
    { label: 'HAS (Haute Autorité de Santé)', url: 'https://www.has-sante.fr/' },
  ],
  construction: [
    { label: 'Qualibat', url: 'https://www.qualibat.com/' },
    { label: 'France Rénov’ (RGE)', url: 'https://france-renov.gouv.fr/' },
  ],
  finance: [
    { label: 'ACPR (Banque de France)', url: 'https://acpr.banque-france.fr/' },
    { label: 'AMF', url: 'https://www.amf-france.org/' },
    { label: 'TRACFIN', url: 'https://www.economie.gouv.fr/tracfin' },
  ],
  cosmetics: [
    { label: 'EU CPNP (cosmetics notification)', url: 'https://ec.europa.eu/growth/sectors/cosmetics_en' },
    { label: 'ANSM — cosmétiques', url: 'https://ansm.sante.fr/' },
  ],
  tech: [
    { label: 'Accessibilité numérique (RGAA)', url: 'https://accessibilite.numerique.gouv.fr/' },
    { label: 'CNIL', url: 'https://www.cnil.fr/' },
  ],
  retail: [
    { label: 'Citeo (packaging EPR)', url: 'https://www.citeo.com/' },
    { label: 'Droit de rétractation — service-public', url: 'https://www.economie.gouv.fr/dgccrf' },
  ],
  energy: [
    { label: 'ADEME', url: 'https://www.ademe.fr/' },
    { label: 'ICPE — Géorisques', url: 'https://www.georisques.gouv.fr/' },
  ],
};

function pick(l: Localized, loc: Loc): string[] {
  return loc === 'zh' ? l.zh : l.en; // fr → en fallback
}

// Sector-agnostic basics, shared by every checklist.
const BASE: Record<'legalForm' | 'tax' | 'employment' | 'gdpr', Localized> = {
  legalForm: {
    en: [
      'SAS / SASU — the most common vehicle for foreign investors: flexible governance, no minimum capital, president can be a foreign national or company.',
      'SARL / EURL — lower-cost, more rigid; suited to small owner-run businesses.',
      'Branch (succursale) vs subsidiary (filiale): a subsidiary is a separate French legal entity (limited liability); a branch is an extension of the foreign parent.',
      'Micro-entreprise is not suitable for scaling or for most foreign-owned operations.',
      'Register via the Guichet unique (INPI) — obtains SIREN/SIRET and Kbis; a French registered office (or domiciliation) is required.',
    ],
    zh: [
      'SAS / SASU —— 外国投资者最常用的载体：治理灵活、无最低注册资本、总裁可为外籍个人或公司。',
      'SARL / EURL —— 成本更低但更僵化，适合小型自营企业。',
      '分公司(succursale) vs 子公司(filiale)：子公司是独立的法国法人(有限责任)；分公司是外国母公司的延伸。',
      '微型企业(micro-entreprise)不适合扩张，也不适合多数外资经营。',
      '通过一站式窗口(Guichet unique / INPI)注册 —— 取得 SIREN/SIRET 和 Kbis；需有法国注册地址(或挂靠 domiciliation)。',
    ],
  },
  tax: {
    en: [
      'VAT (TVA): standard rate 20%, reduced 10% / 5.5% / 2.1% for specific goods/services.',
      'An intra-EU VAT number is required for cross-border EU trade; reverse-charge applies on many B2B EU transactions.',
      'Corporate income tax (IS): 25% standard rate (reduced 15% on the first €42,500 of profit for eligible SMEs).',
      'Local business taxes: CFE and CVAE (CET) based on location and value added.',
      'Filing/accounting must follow the French PCG; appointing a French expert-comptable is strongly advised.',
    ],
    zh: [
      '增值税(TVA)：标准税率 20%，特定商品/服务适用 10% / 5.5% / 2.1% 优惠税率。',
      '跨境欧盟贸易需欧盟内 VAT 税号；多数欧盟 B2B 交易适用反向征收(reverse-charge)。',
      '企业所得税(IS)：标准 25%(符合条件的中小企业前 €42,500 利润适用 15%)。',
      '地方营业税：CFE 与 CVAE(合称 CET)，按地点与增加值计征。',
      '记账须遵循法国会计准则(PCG)；强烈建议聘请法国注册会计师(expert-comptable)。',
    ],
  },
  employment: {
    en: [
      'Contracts: CDI (permanent) is the default; CDD (fixed-term) is restricted to defined cases.',
      'Statutory working week is 35 hours; overtime and working-time rules apply. Minimum wage (SMIC) is mandatory.',
      'Employer social contributions (URSSAF) add roughly 25–42% on top of gross salary.',
      'A sector collective bargaining agreement (convention collective) usually applies and sets extra obligations.',
      'Pre-hire declaration (DPAE) to URSSAF before each hire; mandatory employer health cover (mutuelle) and occupational health.',
    ],
    zh: [
      '合同：CDI(无固定期限)为默认；CDD(固定期限)仅限特定情形。',
      '法定每周工时 35 小时；加班与工时规则适用。须支付法定最低工资(SMIC)。',
      '雇主社保分摊(URSSAF)约为税前工资的 25–42%。',
      '通常适用行业集体协议(convention collective)，会附加额外义务。',
      '每次雇佣前须向 URSSAF 做用工申报(DPAE)；须提供强制补充医疗(mutuelle)与职业健康。',
    ],
  },
  gdpr: {
    en: [
      'Maintain a record of processing activities (registre des traitements); CNIL is the supervisory authority.',
      'Appoint a DPO where required; run a DPIA for high-risk processing.',
      'Lawful basis + clear privacy notice; valid consent for marketing and non-essential cookies.',
      'Frame transfers of personal data outside the EU (SCCs / adequacy).',
      'Honour data-subject rights (access, deletion, portability) within statutory deadlines.',
    ],
    zh: [
      '维护数据处理活动记录(registre des traitements)；监管机构为 CNIL。',
      '必要时任命 DPO；高风险处理须做 DPIA(数据保护影响评估)。',
      '须有合法处理依据 + 清晰隐私声明；营销与非必要 Cookie 须取得有效同意。',
      '规范向欧盟境外的个人数据传输(SCC 标准条款 / 充分性认定)。',
      '在法定期限内响应数据主体权利(访问、删除、可携)。',
    ],
  },
};

// Sector-specific regulation / certification overlays.
const OVERLAYS: Record<string, Localized> = {
  generic: {
    en: [
      'Check whether your activity is regulated (licence, registration or professional qualification required).',
      'Confirm product/service-specific labelling, safety and consumer-protection rules (DGCCRF).',
    ],
    zh: [
      '确认你的经营活动是否受监管(是否需要牌照、登记或职业资格)。',
      '确认产品/服务特定的标签、安全与消费者保护规则(DGCCRF)。',
    ],
  },
  food: {
    en: [
      'Food hygiene: HACCP plan mandatory; declaration to the DDPP/préfecture; sanitary approval (agrément sanitaire) for animal-origin products.',
      'Labelling per EU Regulation 1169/2011 (INCO): allergens, origin, nutrition.',
      'DGCCRF oversight on fraud, claims and consumer protection.',
      'Cold-chain, traceability and recall procedures required.',
    ],
    zh: [
      '食品卫生：强制 HACCP 计划；向 DDPP/省政府申报；动物源产品需卫生许可(agrément sanitaire)。',
      '标签须符合欧盟 1169/2011(INCO)法规：过敏原、产地、营养信息。',
      'DGCCRF 负责欺诈、宣称与消费者保护监管。',
      '须有冷链、可追溯与召回程序。',
    ],
  },
  health: {
    en: [
      'Medical devices: CE marking under EU MDR 2017/745; clinical evaluation and technical file.',
      'ANSM is the competent authority; register operators and certain devices.',
      'Data: health data is sensitive under GDPR — hosting on a certified HDS provider (Hébergeur de Données de Santé).',
      'Reimbursement pathways (CEPS / HAS) for products seeking public coverage.',
    ],
    zh: [
      '医疗器械：依欧盟 MDR 2017/745 进行 CE 标志认证；需临床评估与技术文档。',
      '主管机构为 ANSM；须登记经营者及部分器械。',
      '数据：健康数据属 GDPR 敏感数据 —— 须托管于认证的健康数据托管商(HDS)。',
      '寻求公共报销的产品须走 CEPS / HAS 路径。',
    ],
  },
  construction: {
    en: [
      'Mandatory ten-year liability insurance (assurance décennale) and professional liability.',
      'Qualifications/labels: Qualibat; RGE label required to let clients access energy-renovation aids.',
      'Worksite worker card (carte BTP); compliance with thermal/environmental regulation (RE2020).',
      'Posted-worker (détachement) rules for EU subcontracted labour.',
    ],
    zh: [
      '强制十年责任险(assurance décennale)与职业责任险。',
      '资质/标识：Qualibat；承接节能改造须有 RGE 标识(客户方可申请节能补贴)。',
      '建筑工人卡(carte BTP)；须符合热工/环境法规(RE2020)。',
      '欧盟分包派遣劳工须遵守派遣(détachement)规则。',
    ],
  },
  finance: {
    en: [
      'Authorisation/registration with ACPR (banking, payments, insurance) and/or AMF (investment).',
      'Possible EU passporting of an existing licence into France.',
      'Strong AML/CFT (LCB-FT) program: KYC, monitoring, declarations to TRACFIN.',
      'Consumer-credit, payment-services (DSP2) and MiCA (crypto-assets) regimes as applicable.',
    ],
    zh: [
      '须向 ACPR(银行、支付、保险)和/或 AMF(投资)申请授权/登记。',
      '已有牌照可考虑欧盟护照(passporting)进入法国。',
      '须有健全的反洗钱/反恐融资(LCB-FT)体系：KYC、监控、向 TRACFIN 申报。',
      '视情况适用消费信贷、支付服务(DSP2)与加密资产(MiCA)制度。',
    ],
  },
  cosmetics: {
    en: [
      'EU Regulation 1223/2009: product information file (PIF) and safety assessment by a qualified assessor.',
      'Notify each product on the EU CPNP portal; designate a Responsible Person established in the EU.',
      'Good Manufacturing Practice (ISO 22716); strict labelling and claims rules.',
    ],
    zh: [
      '欧盟 1223/2009 法规：产品信息档案(PIF)与合格评估人的安全评估。',
      '在欧盟 CPNP 门户上对每个产品做通报；指定在欧盟设立的责任人(Responsible Person)。',
      '良好生产规范(ISO 22716)；严格的标签与宣称规则。',
    ],
  },
  tech: {
    en: [
      'Software/SaaS is generally unregulated, but GDPR and the EU AI Act may apply to your processing/products.',
      'Public-sector clients require RGAA accessibility and often SecNumCloud / hosting guarantees.',
      'E-commerce: legal notices (mentions légales), GTC/GTU and 14-day withdrawal right for consumers.',
    ],
    zh: [
      '软件/SaaS 一般不受专门监管，但 GDPR 与欧盟《AI 法案》可能适用于你的处理/产品。',
      '公共部门客户要求 RGAA 无障碍合规，通常还要 SecNumCloud / 托管保证。',
      '电商：法律声明(mentions légales)、通用条款，以及消费者 14 天撤回权。',
    ],
  },
  retail: {
    en: [
      'Consumer law: pre-contractual information, 14-day right of withdrawal (distance selling), guarantees.',
      'Mandatory legal notices (mentions légales) and clear pricing/labelling (DGCCRF).',
      'Packaging EPR (REP) eco-contribution (e.g. CITEO) and waste-sorting obligations.',
    ],
    zh: [
      '消费者法：合同前信息、14 天撤回权(远程销售)、保证。',
      '强制法律声明(mentions légales)与清晰的价格/标签(DGCCRF)。',
      '包装生产者责任延伸(REP)生态贡献(如 CITEO)与垃圾分类义务。',
    ],
  },
  energy: {
    en: [
      'Installations may be classified ICPE (environmental authorisation/registration/declaration).',
      'ADEME programmes and France 2030 fund energy/ecological-transition projects.',
      'Sector authorisations (electricity/gas supply, renewable PPAs) and grid-connection rules.',
    ],
    zh: [
      '设施可能被列为 ICPE(环境授权/登记/申报)。',
      'ADEME 计划与 France 2030 资助能源/生态转型项目。',
      '行业授权(电力/天然气供应、可再生能源 PPA)与并网规则。',
    ],
  },
};

export const COMPLIANCE_SECTORS = Object.keys(OVERLAYS);

export function getCompliance(sectorKey: string, loc: Loc = 'en'): SectorCompliance {
  const key = OVERLAYS[sectorKey] ? sectorKey : 'generic';
  return {
    sector: key,
    sections: [
      { id: 'legalForm', items: pick(BASE.legalForm, loc), links: SECTION_LINKS.legalForm },
      { id: 'tax', items: pick(BASE.tax, loc), links: SECTION_LINKS.tax },
      { id: 'employment', items: pick(BASE.employment, loc), links: SECTION_LINKS.employment },
      { id: 'sector', items: pick(OVERLAYS[key], loc), links: [DGCCRF, ...(LINKS_OVERLAY[key] ?? [])] },
      { id: 'gdpr', items: pick(BASE.gdpr, loc), links: SECTION_LINKS.gdpr },
    ],
  };
}
