// Curated knowledge for the Brands module (M7):
//  A) French / EU trademark law and the registration process (INPI, EUIPO,
//     Madrid system) — stable public regulatory facts, not LLM output.
//  B) Real court / EUIPO cases (positive & negative outcomes, infringement,
//     brand protection) with official links.
// Informational only — not legal advice.

import type { Loc, KnowledgeSection, KnowledgeLink } from './payment-credit';
export type { Loc };

type L = Record<Loc, string>;

export const BRAND_LAW_SECTION: KnowledgeSection = {
  id: 'brandLaw',
  title: {
    en: 'French / EU trademark law & registration',
    fr: 'Droit des marques France / UE & enregistrement',
    zh: '法国/欧盟商标法规与注册流程',
  },
  intro: {
    en: 'Legal framework and step-by-step filing routes for protecting a brand in France: INPI (national), EUIPO (EU-wide) and the Madrid system. Informational only — not legal advice.',
    fr: 'Cadre juridique et parcours de dépôt pour protéger une marque en France : INPI (national), EUIPO (UE) et système de Madrid. Informatif — ne constitue pas un conseil juridique.',
    zh: '在法国保护品牌的法律框架与三条注册路径：INPI（法国国内）、EUIPO（欧盟）、马德里体系（国际）。仅供参考，不构成法律意见。',
  },
  blocks: [
    {
      id: 'framework',
      title: { en: 'Legal framework', fr: 'Cadre juridique', zh: '法律框架' },
      items: [
        {
          en: 'France: Code de la propriété intellectuelle (Art. L711 et seq.) — first-to-file system; a registered mark lasts 10 years, renewable indefinitely.',
          fr: 'France : Code de la propriété intellectuelle (art. L711 s.) — système du premier déposant ; marque valable 10 ans, renouvelable indéfiniment.',
          zh: '法国：《知识产权法典》（L711 条及以下）—— 采用"先申请制"（first-to-file）；注册商标有效期 10 年，可无限次续展。',
        },
        {
          en: 'EU: Regulation (EU) 2017/1001 — one EUTM registration covers all 27 member states. Since the 2019 "Paquet Marques" reform, INPI itself handles oppositions and nullity/revocation actions (cheaper and faster than court).',
          fr: 'UE : règlement (UE) 2017/1001 — une marque de l’UE couvre les 27 États membres. Depuis le « Paquet Marques » (2019), l’INPI traite lui-même oppositions et actions en nullité/déchéance.',
          zh: '欧盟：条例 (EU) 2017/1001 —— 一件欧盟商标（EUTM）覆盖全部 27 国。2019 年"商标包裹"改革后，异议与无效/撤销程序可直接在 INPI 进行（比法院便宜、快捷）。',
        },
        {
          en: 'Use it or lose it: a mark unused for 5 consecutive years can be revoked for non-use; bad-faith filings (e.g. squatting a foreign brand) can be invalidated at any time.',
          fr: 'Obligation d’usage : une marque non exploitée pendant 5 ans peut être déchue ; les dépôts de mauvaise foi peuvent être annulés à tout moment.',
          zh: '"不使用即失权"：连续 5 年未真实使用可被申请撤销；恶意抢注（如抢注他人海外品牌）可随时被宣告无效。',
        },
        {
          en: 'Enforcement tools: infringement action (up to 3 years imprisonment / €300k criminal fines for counterfeiting), and EU customs border seizure via an Application for Action (Reg. 608/2013) — file once with French customs to have counterfeits stopped at the border.',
          fr: 'Moyens d’action : action en contrefaçon (jusqu’à 3 ans d’emprisonnement / 300 k€ d’amende), et retenue en douane via une demande d’intervention (règl. 608/2013).',
          zh: '维权工具：侵权/假冒诉讼（刑事假冒最高 3 年监禁、30 万欧罚金）；依欧盟条例 608/2013 向海关提交"知识产权保护备案"（demande d’intervention），海关可直接在边境扣押假货。',
        },
      ],
      links: [
        { label: 'INPI — la marque', url: 'https://www.inpi.fr/proteger-vos-creations/proteger-votre-marque' },
        { label: 'EUTM Regulation 2017/1001', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32017R1001' },
        { label: 'Douane — protection de la propriété intellectuelle', url: 'https://www.douane.gouv.fr/dossier/la-protection-de-la-propriete-intellectuelle' },
      ],
    },
    {
      id: 'process',
      title: { en: 'Registration: step by step', fr: 'Enregistrement : étape par étape', zh: '注册流程分步指南' },
      items: [
        {
          en: '① Clearance search: check identical/similar prior marks in INPI’s database and EUIPO TMview (free) before filing — most refusals and oppositions are avoidable at this stage.',
          fr: '① Recherche d’antériorités : vérifier les marques identiques/similaires dans la base INPI et TMview (gratuit) avant tout dépôt.',
          zh: '① 在先权利检索：申请前先在 INPI 数据库和 EUIPO TMview（免费）检索相同/近似商标 —— 大多数驳回和异议都可以在这一步避免（本模块搜索即接入这些数据库）。',
        },
        {
          en: '② File online: INPI e-filing €190 for one class + €40 per extra class; EUIPO EUTM €850 for one class, +€50 for the 2nd, +€150 per further class. Choose Nice classes carefully — you cannot broaden them later.',
          fr: '② Dépôt en ligne : INPI 190 € (une classe) + 40 €/classe supplémentaire ; EUIPO 850 € (une classe), +50 € (2e), +150 € au-delà. Bien choisir les classes de Nice — impossible d’élargir ensuite.',
          zh: '② 在线申请：INPI 电子申请一个类别 190 欧、每加一类 +40 欧；EUIPO 欧盟商标一类 850 欧、第二类 +50 欧、第三类起每类 +150 欧。尼斯分类要选准 —— 注册后不能扩大保护范围。',
        },
        {
          en: '③ Examination & publication: INPI examines absolute grounds (distinctiveness, deceptiveness) and publishes the application in the BOPI within ~6 weeks.',
          fr: '③ Examen & publication : l’INPI examine les motifs absolus puis publie la demande au BOPI (~6 semaines).',
          zh: '③ 审查与公告：INPI 审查绝对理由（显著性、欺骗性等）并在约 6 周内于官方公报（BOPI）公告。',
        },
        {
          en: '④ Opposition window: third parties have 2 months from publication to oppose. If none (or resolved), registration issues in ~4 months. EUTM: 3-month opposition window.',
          fr: '④ Opposition : les tiers ont 2 mois à compter de la publication. Sans opposition, enregistrement en ~4 mois. Marque UE : 3 mois.',
          zh: '④ 异议期：公告后第三方有 2 个月异议期（欧盟商标为 3 个月）；无异议或异议解决后约 4 个月拿到注册证。',
        },
        {
          en: '⑤ International route: Chinese companies can extend a CN base registration to France/EU via the Madrid system (WIPO, through CNIPA) — often cheaper for multi-country coverage.',
          fr: '⑤ Voie internationale : extension via le système de Madrid (OMPI) — souvent plus économique pour une couverture multi-pays.',
          zh: '⑤ 国际路径：中国企业可以国内注册为基础，通过马德里体系（经国家知识产权局 CNIPA 向 WIPO 申请）指定法国或欧盟，多国布局时通常更省费用。',
        },
        {
          en: '⑥ After registration: keep proof of genuine use, watch new filings (surveillance), renew every 10 years, and record the mark with customs for border protection.',
          fr: '⑥ Après enregistrement : conserver les preuves d’usage, surveiller les nouveaux dépôts, renouveler tous les 10 ans, inscrire la marque en douane.',
          zh: '⑥ 注册后：保留真实使用证据、做商标监测（发现近似新申请及时异议）、每 10 年续展、并向海关备案获得边境保护。',
        },
      ],
      links: [
        { label: 'INPI — déposer une marque (procédure)', url: 'https://www.inpi.fr/proteger-vos-creations/proteger-votre-marque/les-etapes-cles-du-depot-de-marque' },
        { label: 'EUIPO — apply for a trade mark', url: 'https://www.euipo.europa.eu/en/trade-marks/before-applying/apply-now' },
        { label: 'TMview（免费检索 free search）', url: 'https://www.tmdn.org/tmview/' },
        { label: 'WIPO Madrid System', url: 'https://www.wipo.int/madrid/en/' },
      ],
    },
  ],
};

export interface BrandCase {
  id: string;
  tone: 'positive' | 'negative';
  name: string; // case name, not localized
  summary: L;
  lesson: L;
  link: KnowledgeLink;
}

export const BRAND_CASES_TITLE: L = {
  en: 'Case studies: infringement & brand protection',
  fr: 'Jurisprudence : contrefaçon & protection des marques',
  zh: '案例参考：侵权与品牌保护',
};

export const BRAND_CASES_INTRO: L = {
  en: 'Real EU / French decisions — what worked (🟢) and what failed (🔴), with official case links.',
  fr: 'Décisions réelles UE / France — succès (🟢) et échecs (🔴), avec liens officiels.',
  zh: '真实的欧盟/法国判例 —— 正面案例（🟢 保护成功）与负面案例（🔴 教训），附官方判决链接。',
};

export const BRAND_CASES: BrandCase[] = [
  {
    id: 'louboutin',
    tone: 'positive',
    name: 'Louboutin v Van Haren (CJEU C-163/16, 2018)',
    summary: {
      en: 'The CJEU upheld Louboutin’s red-sole mark: a colour applied to a specific position on a product can be a valid trademark, and the Dutch retailer’s red-soled shoes infringed it.',
      fr: 'La CJUE a validé la marque « semelle rouge » de Louboutin : une couleur appliquée à un emplacement précis peut constituer une marque valable.',
      zh: '欧盟法院支持 Louboutin 的"红底鞋"商标：施加于产品特定位置的颜色可以构成有效商标，荷兰零售商销售红底高跟鞋构成侵权。',
    },
    lesson: {
      en: 'Non-traditional marks (colour, position, shape) are protectable in the EU if distinctive — invest in registering your brand’s signature elements.',
      fr: 'Les marques non traditionnelles (couleur, position) sont protégeables si distinctives.',
      zh: '启示：颜色、位置等非传统商标在欧盟同样可获保护 —— 品牌的标志性元素值得注册。',
    },
    link: { label: 'CJEU C-163/16', url: 'https://curia.europa.eu/juris/liste.jsf?num=C-163/16' },
  },
  {
    id: 'lacoste',
    tone: 'positive',
    name: 'Lacoste v “KAJMAN” (EU General Court T-364/13, 2015)',
    summary: {
      en: 'Lacoste successfully opposed a Polish “KAJMAN” crocodile logo: the EU court found a likelihood of confusion with Lacoste’s crocodile for leather goods and clothing.',
      fr: 'Lacoste a fait échec au logo crocodile « KAJMAN » : risque de confusion reconnu pour la maroquinerie et les vêtements.',
      zh: 'Lacoste 成功异议波兰品牌"KAJMAN"的鳄鱼图形商标：法院认定其在皮具、服装类别上与 Lacoste 鳄鱼标志存在混淆可能。',
    },
    lesson: {
      en: 'A strong, well-known figurative mark blocks even stylistically different lookalikes — trademark watching + timely opposition works.',
      fr: 'Une marque figurative renommée bloque même des imitations stylisées — surveillance + opposition rapide.',
      zh: '启示：知名图形商标可以拦下风格不同的"擦边"标志 —— 商标监测 + 及时异议是最划算的保护手段。',
    },
    link: { label: 'EGC T-364/13', url: 'https://curia.europa.eu/juris/liste.jsf?num=T-364/13' },
  },
  {
    id: 'mipad',
    tone: 'negative',
    name: 'Xiaomi “MI PAD” v Apple (EU General Court T-893/16, 2017)',
    summary: {
      en: 'Xiaomi’s EU application for “MI PAD” was rejected after Apple’s opposition: the court held MI PAD confusingly similar to IPAD for tablets — a major Chinese brand blocked at the EU door.',
      fr: 'La demande « MI PAD » de Xiaomi a été rejetée sur opposition d’Apple : similarité avec IPAD jugée source de confusion.',
      zh: '小米的"MI PAD"欧盟商标申请因苹果异议被驳回：法院认定 MI PAD 与 IPAD 在平板电脑上构成混淆性近似 —— 中国头部品牌也会在欧盟门口被拦下。',
    },
    lesson: {
      en: 'Do a serious clearance search against existing EU marks before launching — a name that works in China may be unregistrable in the EU.',
      fr: 'Faire une vraie recherche d’antériorités avant le lancement — un nom viable en Chine peut être indisponible dans l’UE.',
      zh: '教训：进入欧盟前必须做认真的在先商标检索 —— 在中国畅通的名称在欧盟可能根本无法注册。',
    },
    link: { label: 'EGC T-893/16', url: 'https://curia.europa.eu/juris/liste.jsf?num=T-893/16' },
  },
  {
    id: 'monopoly',
    tone: 'negative',
    name: 'Hasbro “MONOPOLY” bad-faith refiling (EU General Court T-663/19, 2021)',
    summary: {
      en: 'Hasbro’s EUTM for MONOPOLY was partially invalidated: re-filing the same mark to dodge the “proof of use” requirement was held to be bad faith.',
      fr: 'La marque MONOPOLY a été partiellement annulée : redéposer la même marque pour contourner l’obligation de preuve d’usage constitue un dépôt de mauvaise foi.',
      zh: 'Hasbro 的"MONOPOLY"欧盟商标被部分宣告无效：为规避"使用证据"要求而重复申请同一商标被认定为恶意注册。',
    },
    lesson: {
      en: 'EU law punishes gaming the system: file for goods you genuinely intend to sell, and keep real evidence of use — defensive/repeat filings can backfire.',
      fr: 'Déposer pour des produits réellement exploités et conserver des preuves d’usage — les dépôts défensifs répétés peuvent se retourner contre vous.',
      zh: '教训：欧盟严惩"钻制度空子"——只为真实经营的商品申请、保留使用证据；防御性/重复注册可能反噬。',
    },
    link: { label: 'EGC T-663/19', url: 'https://curia.europa.eu/juris/liste.jsf?num=T-663/19' },
  },
  {
    id: 'champagne',
    tone: 'positive',
    name: 'Champagne GI — “Champagner Sorbet” (CJEU C-393/16, 2017)',
    summary: {
      en: 'The Comité Champagne enforced the protected name “Champagne” against a German supermarket sorbet: products may only evoke a protected geographical indication if they genuinely draw their essential characteristic from it.',
      fr: 'Le Comité Champagne a fait respecter l’appellation « Champagne » : un produit ne peut évoquer une AOP que s’il en tire réellement sa caractéristique essentielle.',
      zh: '香槟行业委员会成功维权"Champagne"受保护名称：产品只有在其本质特征确实来自该原产地时才能使用/联想受保护地理标志（GI）。',
    },
    lesson: {
      en: 'France aggressively protects GIs (Champagne, Cognac, Roquefort…). Never use French place names or GI terms on products entering France without entitlement.',
      fr: 'La France protège fermement ses indications géographiques — ne jamais utiliser de noms protégés sans droit.',
      zh: '启示/警示：法国对地理标志（香槟、干邑、洛克福等）保护极严 —— 输法产品切勿擅用法国地名或 GI 词汇（含拼音、变体）。',
    },
    link: { label: 'CJEU C-393/16', url: 'https://curia.europa.eu/juris/liste.jsf?num=C-393/16' },
  },
  {
    id: 'squatting',
    tone: 'negative',
    name: 'Trademark squatting — “NEYMAR” bad-faith filing (EU General Court T-795/17, 2019)',
    summary: {
      en: 'A third party registered “NEYMAR” as an EUTM before the footballer; the EU court invalidated it for bad faith — squatting a name whose reputation the filer knew and intended to exploit.',
      fr: 'Un tiers avait déposé « NEYMAR » comme marque de l’UE ; annulée pour mauvaise foi — dépôt visant à exploiter la notoriété d’autrui.',
      zh: '第三方抢注球星"NEYMAR"为欧盟商标，欧盟法院以恶意注册为由宣告无效 —— 明知他人声誉并意图利用的抢注在欧盟站不住脚。',
    },
    lesson: {
      en: 'If your brand gets squatted in the EU, bad-faith invalidation is a real remedy — but proving reputation takes evidence, and prevention (register early, before exhibiting or selling) is far cheaper.',
      fr: 'L’annulation pour mauvaise foi existe, mais prévenir (déposer tôt) coûte bien moins cher que guérir.',
      zh: '双面教训：品牌在欧盟被抢注可以用"恶意注册无效"救济（需举证知名度）；但最便宜的办法永远是参展/销售之前先注册。',
    },
    link: { label: 'EGC T-795/17', url: 'https://curia.europa.eu/juris/liste.jsf?num=T-795/17' },
  },
];
