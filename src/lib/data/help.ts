// In-app Help & User Guide content, written for an end user — a company newly
// expanding into France. Localized (en/fr/zh). Each section = a module: what it
// is for, and how to use it step by step. Rendered by /help.

export type Loc = 'en' | 'fr' | 'zh';
type L = { en: string; fr: string; zh: string };
type LA = { en: string[]; fr: string[]; zh: string[] };

const s = (loc: Loc, v: L) => v[loc];
const a = (loc: Loc, v: LA) => v[loc];

export interface HelpSection {
  id: string;
  href?: string; // in-app link to the module
  title: string;
  intro: string;
  steps: string[];
}
export interface HelpGroup {
  group: string;
  sections: HelpSection[];
}

interface RawSection {
  id: string;
  href?: string;
  title: L;
  intro: L;
  steps: LA;
}
interface RawGroup {
  group: L;
  sections: RawSection[];
}

const GROUPS: RawGroup[] = [
  {
    group: { en: 'Getting started', fr: 'Pour commencer', zh: '快速开始' },
    sections: [
      {
        id: 'start',
        title: { en: 'First steps', fr: 'Premiers pas', zh: '第一步' },
        intro: {
          en: 'FranceGo turns live French data into the customers, tenders, funding and landing steps you need to enter France.',
          fr: 'FranceGo transforme les données françaises en direct en clients, appels d’offres, financements et étapes d’implantation dont vous avez besoin.',
          zh: 'FranceGo 把法国实时数据，转化为你进入法国所需的客户、招标、资金与落地步骤。',
        },
        steps: {
          en: [
            'Create an account with your email, then sign in. Forgot your password? Use “Forgot password” on the login page.',
            'Switch language any time (EN / FR / 中文) from the top-right; the whole app and French content translate automatically.',
            'Use the left sidebar to navigate, grouped into Overview · Intelligence · Opportunities · Engage.',
            'New here? Start with the Dashboard, then try Companies and Tenders; ask the Copilot anything.',
          ],
          fr: [
            'Créez un compte avec votre e-mail, puis connectez-vous. Mot de passe oublié ? Utilisez « Mot de passe oublié » sur la page de connexion.',
            'Changez de langue à tout moment (EN / FR / 中文) en haut à droite ; toute l’app et le contenu français sont traduits automatiquement.',
            'Naviguez via la barre latérale gauche : Vue d’ensemble · Intelligence · Opportunités · Engagement.',
            'Nouveau ? Commencez par le Tableau de bord, puis Entreprises et Appels d’offres ; posez n’importe quelle question au Copilote.',
          ],
          zh: [
            '用邮箱注册并登录。忘记密码？在登录页用「忘记密码」。',
            '右上角随时切换语言（EN / FR / 中文），整站与法语内容自动翻译。',
            '用左侧栏导航，分为 概览 · 情报 · 商机 · 触达。',
            '新用户建议先看 Dashboard，再试 企业 和 招标；有问题随时问 Copilot。',
          ],
        },
      },
      {
        id: 'dashboard',
        href: '/dashboard',
        title: { en: 'Dashboard', fr: 'Tableau de bord', zh: '仪表盘' },
        intro: {
          en: 'Your daily “opportunity radar” — what’s happening in the French market today.',
          fr: 'Votre « radar d’opportunités » quotidien — ce qui se passe aujourd’hui sur le marché français.',
          zh: '你的每日「机会雷达」——今天法国市场在发生什么。',
        },
        steps: {
          en: [
            'The top cards show a computed Opportunity score and Market activity (hover for how they’re calculated) and today’s new items.',
            'KPI cards with a green dot are real-time; the small text under each (e.g. next tender deadline) gives context.',
            'The feed lists live French business news classified as signals (investment, tender, partnership, expansion, risk).',
            'High-intent buyers are public bodies currently issuing tenders — the strongest buying signal.',
          ],
          fr: [
            'Les cartes du haut affichent un Score d’opportunité et une Activité du marché calculés (survolez pour le détail) et les nouveautés du jour.',
            'Les cartes KPI avec un point vert sont en temps réel ; le petit texte (ex. prochaine échéance) donne le contexte.',
            'Le flux liste l’actualité business française classée en signaux (investissement, appel d’offres, partenariat, expansion, risque).',
            'Les acheteurs à forte intention sont des organismes publics qui publient des appels d’offres — le signal d’achat le plus fort.',
          ],
          zh: [
            '顶部卡片显示计算得出的「机会评分」与「市场活跃度」（悬停看构成）以及今日新增。',
            '带绿点的 KPI 卡为实时数据；卡片下方小字（如最近招标截止）给出上下文。',
            '动态流列出实时法国商业新闻，并分类为信号（投资、招标、合作、扩张、风险）。',
            '「高意向买家」是正在发布招标的公共机构——最强的购买信号。',
          ],
        },
      },
      {
        id: 'plan',
        href: '/plan',
        title: { en: 'Entry Plan', fr: 'Plan d’entrée', zh: '落地路线' },
        intro: {
          en: 'Your whole market-entry journey as one guided plan, personalized to your profile — so you always know what to do next.',
          fr: 'Tout votre parcours d’implantation en un plan guidé, personnalisé selon votre profil — pour toujours savoir quoi faire ensuite.',
          zh: '把整个市场进入过程收成一条按你画像个性化的落地主线——让你随时知道下一步做什么。',
        },
        steps: {
          en: [
            'When you register, a short onboarding asks your product, industry, target region, stage, budget and goals — this personalizes the whole app. Edit it any time in Settings.',
            'The plan has 3 phases — Research → Establish → Grow — with 11 steps, each deep-linked to the module that does the work.',
            'Click a step’s circle to cycle its status: to-do → in-progress → done; the progress bar and the Dashboard card update instantly.',
            'Steps matching your goals are marked “Recommended”; the Dashboard shows your next steps first.',
          ],
          fr: [
            'À l’inscription, un court questionnaire demande produit, secteur, région cible, stade, budget et objectifs — cela personnalise toute l’app. Modifiable dans Paramètres.',
            'Le plan a 3 phases — Étudier → S’implanter → Développer — avec 11 étapes, chacune liée au module concerné.',
            'Cliquez sur le cercle d’une étape pour changer son statut : à faire → en cours → terminé ; la barre et la carte du Tableau de bord se mettent à jour.',
            'Les étapes correspondant à vos objectifs sont « Recommandées » ; le Tableau de bord affiche vos prochaines étapes en premier.',
          ],
          zh: [
            '注册后有一段简短引导，采集你的 产品/行业/目标地区/阶段/预算/目标——它会个性化整个应用；随时可在「设置」修改。',
            '路线分 3 个阶段——调研 → 立足 → 拿单——共 11 步，每步深链到对应模块。',
            '点步骤前的圆圈循环切换状态：待办 → 进行中 → 已完成；进度条与 Dashboard 卡片即时更新。',
            '匹配你目标的步骤标「推荐」；Dashboard 会优先显示你的下一步。',
          ],
        },
      },
    ],
  },
  {
    group: { en: 'Market intelligence', fr: 'Intelligence de marché', zh: '市场情报' },
    sections: [
      {
        id: 'companies',
        href: '/companies',
        title: { en: 'Companies', fr: 'Entreprises', zh: '企业情报' },
        intro: {
          en: 'Search 25M+ real French companies — potential customers, partners or competitors.',
          fr: 'Cherchez parmi 25M+ d’entreprises françaises réelles — clients, partenaires ou concurrents potentiels.',
          zh: '检索 2500 万+ 真实法国企业——潜在客户、合作伙伴或竞争对手。',
        },
        steps: {
          en: [
            'Type a company name, SIREN or SIRET in the search box.',
            'Expand a row to see VAT number, revenue, financial year and executives.',
            'Open the full profile for financials over time, shareholders, BODACC legal events, company news and an AI brief.',
            'On a profile, click Save to add the company to your Watchlist.',
            'Below the search: the Entry cost & ROI calculator estimates your first-year landing cost (incorporation, office, a hire, compliance) with break-even; and the Soft-landing package bundles incorporation, banking, office and hiring — leave your contact to get the full plan.',
          ],
          fr: [
            'Saisissez un nom d’entreprise, un SIREN ou un SIRET dans la recherche.',
            'Dépliez une ligne pour voir le numéro de TVA, le chiffre d’affaires, l’exercice et les dirigeants.',
            'Ouvrez la fiche complète : finances dans le temps, actionnaires, événements BODACC, actualités et synthèse IA.',
            'Sur une fiche, cliquez Enregistrer pour l’ajouter à votre Liste de suivi.',
            'Sous la recherche : le Calculateur coût & ROI estime votre coût de première année (création, bureaux, recrutement, conformité) avec seuil de rentabilité ; et le Pack d’implantation regroupe création, banque, bureaux et recrutement — laissez vos coordonnées pour le plan complet.',
          ],
          zh: [
            '在搜索框输入公司名、SIREN 或 SIRET。',
            '展开一行查看增值税号、营业额、财务年度与高管。',
            '打开完整档案：多年财务、股东、BODACC 法律事件、公司新闻与 AI 简报。',
            '在档案页点「收藏」加入关注列表。',
            '搜索框下方：「落地成本/ROI 测算器」估算你落地首年成本（注册、办公室、招聘、合规）并给出回本周期；「落地打包方案」把注册、开户、选址、招聘打包——留下联系方式即可获取完整方案。',
          ],
        },
      },
      {
        id: 'markets',
        href: '/markets',
        title: { en: 'Markets', fr: 'Marchés', zh: '市场' },
        intro: {
          en: 'Real French sector size and growth (Eurostat) to size your opportunity.',
          fr: 'Taille et croissance réelles des secteurs français (Eurostat) pour évaluer votre opportunité.',
          zh: '法国各行业真实规模与增长（Eurostat），用于评估你的机会。',
        },
        steps: {
          en: [
            'Browse the industry cards for value added and year-on-year growth.',
            'Open a sector for the multi-year trend, real companies in it, sector news and a one-click AI analysis.',
            'Or type any keyword (e.g. fintech) to get companies, live news and AI analysis for that niche.',
          ],
          fr: [
            'Parcourez les cartes sectorielles : valeur ajoutée et croissance annuelle.',
            'Ouvrez un secteur : tendance pluriannuelle, entreprises réelles, actualités et analyse IA en un clic.',
            'Ou tapez un mot-clé (ex. fintech) pour des entreprises, l’actualité et une analyse IA sur cette niche.',
          ],
          zh: [
            '浏览行业卡片，看增加值与同比增长。',
            '打开某行业：多年趋势、该行业真实企业、行业新闻与一键 AI 分析。',
            '或输入任意关键词（如 fintech），获取该细分的企业、实时新闻与 AI 分析。',
          ],
        },
      },
      {
        id: 'credit',
        href: '/credit',
        title: { en: 'Credit & risk', fr: 'Crédit & risque', zh: '信用与风险' },
        intro: {
          en: 'Check a French company’s reliability before signing — based on real financials and legal events.',
          fr: 'Vérifiez la fiabilité d’une entreprise française avant de signer — finances réelles et événements juridiques.',
          zh: '签约前核查法国企业的可靠性——基于真实财务与法律事件。',
        },
        steps: {
          en: [
            'Enter a company name to get a trust score and a breakdown.',
            'Financial health is driven by real data.gouv.fr accounts; legal risk by real BODACC events (insolvency, changes).',
            'Read the “what the score means” note to interpret each dimension.',
          ],
          fr: [
            'Saisissez un nom d’entreprise pour un score de confiance et son détail.',
            'La santé financière vient des comptes réels data.gouv.fr ; le risque juridique des événements BODACC réels.',
            'Lisez la note « signification du score » pour interpréter chaque dimension.',
          ],
          zh: [
            '输入公司名，获取信任总分与分项。',
            '财务健康来自 data.gouv.fr 真实账目；法律风险来自 BODACC 真实事件（破产、变更）。',
            '阅读「评分含义」说明来理解每个维度。',
          ],
        },
      },
      {
        id: 'news',
        href: '/news',
        title: { en: 'News radar', fr: 'Radar d’actualités', zh: '新闻雷达' },
        intro: {
          en: 'Live French business news turned into actionable signals.',
          fr: 'L’actualité business française en direct, transformée en signaux exploitables.',
          zh: '实时法国商业新闻，转化为可行动的信号。',
        },
        steps: {
          en: [
            'Each headline is classified (buying, tender, partnership, investment, expansion, risk) with an opportunity score.',
            'Titles auto-translate to your language; click through to the original article.',
            'Use “Load more” to expand.',
          ],
          fr: [
            'Chaque titre est classé (achat, appel d’offres, partenariat, investissement, expansion, risque) avec un score.',
            'Les titres se traduisent dans votre langue ; cliquez pour l’article original.',
            'Utilisez « Charger plus » pour en voir davantage.',
          ],
          zh: [
            '每条标题都被分类（买入、招标、合作、投资、扩张、风险）并打机会分。',
            '标题自动翻译为你的语言，可点进原文。',
            '用「加载更多」展开。',
          ],
        },
      },
    ],
  },
  {
    group: { en: 'Opportunities', fr: 'Opportunités', zh: '商机' },
    sections: [
      {
        id: 'tenders',
        href: '/opportunities',
        title: { en: 'Tenders', fr: 'Appels d’offres', zh: '招标' },
        intro: {
          en: 'Live French (BOAMP) and EU (TED) public tenders matched to you.',
          fr: 'Appels d’offres publics français (BOAMP) et européens (TED) en direct, adaptés à vous.',
          zh: '实时法国（BOAMP）与欧盟（TED）公开招标，按你匹配。',
        },
        steps: {
          en: [
            'Toggle the source (BOAMP / TED) at the top, then search by keyword.',
            'Each card shows the buyer, deadline, match score and win probability; open the original notice.',
            'Click Save to track a tender in your Watchlist.',
          ],
          fr: [
            'Choisissez la source (BOAMP / TED) en haut, puis cherchez par mot-clé.',
            'Chaque carte montre l’acheteur, l’échéance, le score de correspondance et la probabilité de gain ; ouvrez l’avis.',
            'Cliquez Enregistrer pour suivre un appel d’offres dans votre Liste de suivi.',
          ],
          zh: [
            '顶部切换来源（BOAMP / TED），按关键词搜索。',
            '每张卡显示采购方、截止日、匹配度与中标概率，可打开原公告。',
            '点「收藏」把招标加入关注列表跟进。',
          ],
        },
      },
      {
        id: 'discovery',
        href: '/discover',
        title: { en: 'Opportunity discovery', fr: 'Découverte d’opportunités', zh: '机会发现' },
        intro: {
          en: 'Describe your product to get target French companies across 8 categories.',
          fr: 'Décrivez votre produit pour obtenir des entreprises françaises cibles selon 8 catégories.',
          zh: '描述你的产品，获得 8 类目标法国企业。',
        },
        steps: {
          en: [
            'Enter your product, industry and target market, then run.',
            'Get real companies as customers, distributors, integrators, partners, investors, accelerators, associations and public buyers.',
            'Save promising ones to the Watchlist.',
          ],
          fr: [
            'Indiquez votre produit, secteur et marché cible, puis lancez.',
            'Obtenez des entreprises réelles : clients, distributeurs, intégrateurs, partenaires, investisseurs, accélérateurs, associations, acheteurs publics.',
            'Enregistrez les plus prometteuses dans la Liste de suivi.',
          ],
          zh: [
            '输入产品、行业与目标市场，运行。',
            '获得真实企业：客户、分销商、集成商、伙伴、投资者、加速器、协会、公共采购方。',
            '把有潜力的收藏进关注列表。',
          ],
        },
      },
      {
        id: 'intent',
        href: '/intent',
        title: { en: 'Buying intent', fr: 'Intention d’achat', zh: '买家意向' },
        intro: {
          en: 'Buyers actively purchasing now — public bodies with open tenders plus freshly-funded companies.',
          fr: 'Acheteurs qui achètent maintenant — organismes publics avec appels d’offres et entreprises fraîchement financées.',
          zh: '正在采购的买家——有公开招标的公共机构 + 刚融资的公司。',
        },
        steps: {
          en: [
            'Scan the ranked list by intent and urgency score.',
            'Each row suggests a next action; tender titles and labels translate to your language.',
          ],
          fr: [
            'Parcourez la liste classée par score d’intention et d’urgence.',
            'Chaque ligne propose une action ; titres et libellés sont traduits.',
          ],
          zh: [
            '按意向与紧迫度评分浏览排序列表。',
            '每行给出建议行动；招标标题与标签会翻译。',
          ],
        },
      },
      {
        id: 'signals',
        href: '/signals',
        title: { en: 'Funding & hiring signals', fr: 'Signaux de levées & recrutement', zh: '融资与招聘信号' },
        intro: {
          en: 'Companies that just raised money or are hiring hard — fresh budget and expansion both mean strong buying intent.',
          fr: 'Entreprises qui viennent de lever des fonds ou recrutent fortement — budget frais et expansion = forte intention d’achat.',
          zh: '刚完成融资、或正在大量招聘的公司——新预算与扩张都意味着强采购意向。',
        },
        steps: {
          en: [
            'Funding signals load automatically with company, amount, round and an intent score; filter by sector or company.',
            'Below them, Hiring signals (from France Travail) list companies posting many fresh roles — a real expansion signal (shown when the France Travail source is configured).',
            'Resolved companies link to their full profile; click Save to track them.',
          ],
          fr: [
            'Les signaux de levées se chargent automatiquement (entreprise, montant, tour, score) ; filtrez par secteur ou entreprise.',
            'En dessous, les signaux de recrutement (France Travail) listent les entreprises publiant de nombreux postes — un vrai signal d’expansion (affiché si la source France Travail est configurée).',
            'Les entreprises identifiées ouvrent leur fiche ; cliquez Enregistrer pour les suivre.',
          ],
          zh: [
            '融资信号自动加载（公司、金额、轮次、意向分）；可按行业或公司筛选。',
            '下方的「招聘信号」（来自 France Travail）列出正在大量发布岗位的公司——真实的扩张信号（配置了 France Travail 数据源后显示）。',
            '解析到的公司可点进档案，点「收藏」跟进。',
          ],
        },
      },
      {
        id: 'events',
        href: '/events',
        title: { en: 'Events', fr: 'Événements', zh: '事件' },
        intro: {
          en: 'French trade shows and conferences with match and expected-lead scores.',
          fr: 'Salons et conférences français avec scores de pertinence et de leads attendus.',
          zh: '法国展会与会议，含匹配度与预期线索评分。',
        },
        steps: {
          en: ['Browse events with live news context, scored for relevance and expected business value.'],
          fr: ['Parcourez les événements avec le contexte d’actualité, notés pour la pertinence et la valeur attendue.'],
          zh: ['浏览展会（叠加实时动态），按相关度与预期商业价值打分。'],
        },
      },
    ],
  },
  {
    group: { en: 'Landing in France', fr: 'S’implanter en France', zh: '在法国落地' },
    sections: [
      {
        id: 'funding',
        href: '/funding',
        title: { en: 'Funding & subsidies', fr: 'Financements & aides', zh: '补贴与扶持资金' },
        intro: {
          en: 'Match French grants, loans and tax credits to your situation.',
          fr: 'Associez subventions, prêts et crédits d’impôt français à votre situation.',
          zh: '把法国的补贴、贷款与税收抵免匹配到你的情况。',
        },
        steps: {
          en: [
            'Pick your sector, stage, need and region.',
            'Get scored matches (France 2030, Bpifrance, CIR/CII, ADEME, regional aids…), each with an official link.',
          ],
          fr: [
            'Choisissez votre secteur, stade, besoin et région.',
            'Obtenez des correspondances notées (France 2030, Bpifrance, CIR/CII, ADEME, aides régionales…) avec lien officiel.',
          ],
          zh: [
            '选择行业、阶段、需求与地区。',
            '获得打分匹配（France 2030、Bpifrance、CIR/CII、ADEME、区域补贴…），每条带官方链接。',
          ],
        },
      },
      {
        id: 'compliance',
        href: '/compliance',
        title: { en: 'Compliance checklist', fr: 'Conformité', zh: '落地合规清单' },
        intro: {
          en: 'A sector-by-sector checklist of what you must set up to operate in France.',
          fr: 'Une checklist par secteur de ce qu’il faut mettre en place pour opérer en France.',
          zh: '按行业列出在法国经营所需办妥的合规清单。',
        },
        steps: {
          en: [
            'Choose your sector at the top.',
            'Review five areas: legal form, VAT/tax, employment law, sector regulation/certification and GDPR — each with official links.',
            'Click “Export PDF” to save or share the checklist; use the form at the bottom to ask us to handle registration.',
          ],
          fr: [
            'Choisissez votre secteur en haut.',
            'Parcourez cinq volets : forme juridique, TVA/fiscalité, droit du travail, réglementation sectorielle et RGPD — avec liens officiels.',
            'Cliquez « Exporter en PDF » pour enregistrer/partager ; utilisez le formulaire en bas pour qu’on gère la création.',
          ],
          zh: [
            '顶部选择你的行业。',
            '查看五大栏：法律形式、TVA/税务、雇佣法、行业监管认证、GDPR——每栏带官方链接。',
            '点「导出 PDF」保存或分享；用底部表单请我们代办注册。',
          ],
        },
      },
      {
        id: 'playbooks',
        href: '/playbooks',
        title: { en: 'Playbooks', fr: 'Playbooks', zh: '操作手册' },
        intro: {
          en: 'Step-by-step, sourced workflows for big undertakings — e.g. building a data center in France.',
          fr: 'Procédures sourcées, étape par étape, pour de grands projets — ex. construire un data center en France.',
          zh: '针对大型落地的分步、带来源流程——例如在法国建数据中心。',
        },
        steps: {
          en: [
            'Ask in the search box (e.g. “how to set up a data center in France”) to jump to the matching playbook.',
            'Each step lists the authority, permit, documents, cost, timeline, risks and official links.',
            'See real-project experience (avg duration, success rate) when available; export the playbook to PDF.',
          ],
          fr: [
            'Posez votre question (ex. « comment créer un data center en France ») pour ouvrir le playbook correspondant.',
            'Chaque étape liste l’autorité, l’autorisation, les documents, le coût, le délai, les risques et les liens officiels.',
            'Consultez l’expérience réelle (durée moyenne, taux de réussite) si disponible ; exportez en PDF.',
          ],
          zh: [
            '在搜索框提问（如「如何在法国建数据中心」）跳到匹配的手册。',
            '每一步列出主管机构、许可、材料、成本、工期、风险与官方链接。',
            '有数据时显示真实项目经验（平均工期、成功率）；可导出 PDF。',
          ],
        },
      },
    ],
  },
  {
    group: { en: 'Work & engage', fr: 'Travailler & engager', zh: '工作与触达' },
    sections: [
      {
        id: 'watchlist',
        href: '/watchlist',
        title: { en: 'Watchlist (CRM)', fr: 'Liste de suivi (CRM)', zh: '关注列表（CRM）' },
        intro: {
          en: 'A lightweight CRM for everything you saved.',
          fr: 'Un CRM léger pour tout ce que vous avez enregistré.',
          zh: '把你收藏的一切，做成轻量 CRM。',
        },
        steps: {
          en: [
            'Anything you Save (companies, tenders, opportunities) appears here on a board.',
            'Drag through stages by changing each card’s stage: Lead → Contacted → Negotiating → Won / Lost.',
            'Add notes per card; remove when done.',
          ],
          fr: [
            'Tout ce que vous Enregistrez (entreprises, appels d’offres, opportunités) apparaît ici sur un tableau.',
            'Avancez les cartes par étape : Piste → Contacté → Négociation → Gagné / Perdu.',
            'Ajoutez des notes ; retirez une fois terminé.',
          ],
          zh: [
            '你收藏的一切（企业、招标、机会）都会出现在看板上。',
            '通过改每张卡的阶段推进：潜在 → 接触 → 商谈 → 赢单 / 丢单。',
            '可为每张卡加备注；完成后移除。',
          ],
        },
      },
      {
        id: 'copilot',
        href: '/copilot',
        title: { en: 'AI Copilot', fr: 'Copilote IA', zh: 'AI 助手' },
        intro: {
          en: 'Ask anything about entering France — answers are grounded in our curated knowledge with sources.',
          fr: 'Posez toute question sur l’implantation en France — réponses ancrées dans notre connaissance curatée, avec sources.',
          zh: '就进入法国任意提问——答案基于我们精选的知识并附来源。',
        },
        steps: {
          en: [
            'Type a question or pick a suggestion; answers come in your language.',
            'When the question matches our knowledge (e.g. a playbook), the reply cites official sources at the end.',
            'Or generate a full market-entry report from the agent panel.',
          ],
          fr: [
            'Tapez une question ou choisissez une suggestion ; réponses dans votre langue.',
            'Quand la question correspond à notre connaissance (ex. un playbook), la réponse cite les sources officielles.',
            'Ou générez un rapport d’implantation complet depuis le panneau d’agents.',
          ],
          zh: [
            '输入问题或选建议；答案用你的语言。',
            '当问题命中我们的知识（如某 playbook），回答末尾会附官方来源。',
            '也可在智能体面板生成完整的市场进入报告。',
          ],
        },
      },
      {
        id: 'reports',
        href: '/reports',
        title: { en: 'Reports', fr: 'Rapports', zh: '报告' },
        intro: {
          en: 'Generate consultant-grade reports grounded in real data, with sources.',
          fr: 'Générez des rapports de niveau conseil ancrés dans des données réelles, avec sources.',
          zh: '生成有据可查、附来源的咨询级报告。',
        },
        steps: {
          en: [
            'Pick a template (company, due diligence, market entry, sector…), enter a topic, and generate.',
            'Reports are grounded in real data pulled for your topic — market size (Eurostat), tender and company counts, recent news and the knowledge base — and end with a Sources list, so the figures are traceable, not invented.',
            'Export to PDF or markdown.',
          ],
          fr: [
            'Choisissez un modèle (entreprise, due diligence, implantation, secteur…), saisissez un sujet, générez.',
            'Les rapports s’appuient sur des données réelles récupérées pour votre sujet — taille de marché (Eurostat), nombres d’appels d’offres et d’entreprises, actualités et base de connaissances — et se terminent par une liste de Sources, pour des chiffres traçables et non inventés.',
            'Export PDF ou markdown.',
          ],
          zh: [
            '选模板（公司、尽调、市场进入、行业…），输入主题，生成。',
            '报告基于为你的主题抓取的真实数据——市场规模（Eurostat）、招标数与企业数、近期新闻与知识库——并在末尾附「来源」清单，数字可追溯、非模型编造。',
            '导出 PDF 或 markdown。',
          ],
        },
      },
    ],
  },
  {
    group: { en: 'Account', fr: 'Compte', zh: '账户' },
    sections: [
      {
        id: 'settings',
        href: '/settings',
        title: { en: 'Settings, digest & plan', fr: 'Paramètres, e-mail & abonnement', zh: '设置、邮件与套餐' },
        intro: {
          en: 'Manage your account, your daily email and your subscription.',
          fr: 'Gérez votre compte, votre e-mail quotidien et votre abonnement.',
          zh: '管理账户、每日邮件与订阅套餐。',
        },
        steps: {
          en: [
            'See your plan and today’s usage; each plan has a daily search limit.',
            'Turn on the Daily opportunity email and set keywords to get a “France radar” each morning.',
            'Upgrade via Stripe when online payment is enabled; manage or cancel from the billing portal.',
          ],
          fr: [
            'Consultez votre formule et l’usage du jour ; chaque formule a une limite quotidienne.',
            'Activez l’e-mail quotidien d’opportunités et définissez des mots-clés pour recevoir un « radar France ».',
            'Passez à une formule supérieure via Stripe ; gérez ou résiliez depuis le portail de facturation.',
          ],
          zh: [
            '查看你的套餐与今日用量；每个套餐有每日搜索上限。',
            '打开「每日机会邮件」并设置关键词，每天早上收到「法国雷达」。',
            '在线支付开通时可经 Stripe 升级；在计费门户管理或退订。',
          ],
        },
      },
    ],
  },
];

export function getHelp(loc: Loc = 'en'): HelpGroup[] {
  return GROUPS.map((g) => ({
    group: s(loc, g.group),
    sections: g.sections.map((sec) => ({
      id: sec.id,
      href: sec.href,
      title: s(loc, sec.title),
      intro: s(loc, sec.intro),
      steps: a(loc, sec.steps),
    })),
  }));
}
