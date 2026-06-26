# 产品路标 ROADMAP

面向**出海客户的法国市场拓展工具**(商用)。按优先级组织。
状态：☐ 待做 · ◐ 进行中 · ☑ 已完成

> 已上线基础：企业/招标(BOAMP+TED)/市场(Eurostat)/新闻雷达/信用/品牌/机会发现/买家意向/事件/网络/Copilot/报告 + 公司&商标注册增值服务 + 三语 + 自动部署。

---

## 第一波 — 变现与留存地基

- ☑ **Stripe 真实订阅**(Professional €99 / Business €299）。**Live 已激活并验证**(本地 Test 模式 + 线上 Live 全链路跑通：结账→Webhook→升级 plan→退订回落 FREE)。验证用 100% 优惠码零成本下单。配置/排错见 `CONTINUE.md`。
- ☑ **增值服务留资闭环**：公司/商标 ServiceGuide 内嵌留资表单(姓名/邮箱/公司/需求)→ `Lead` 表 → `/admin` 线索列表(可改状态 NEW→CONTACTED→WON/LOST)。**管理员邮件通知目前是占位**(写服务器日志,见 `src/lib/notify.ts`，接 Resend/SMTP 一行接通)。
- ☑ **管理后台 `/[locale]/admin`**(仅 `role=ADMIN`)：用户列表(注册时间/套餐/订阅状态)、事件流(注册/升级/降级/退订/留资,`Event` 审计表)、留资列表 + KPI 卡。
- ☑ **关注列表 / 轻量 CRM**：`/watchlist` 按阶段看板(潜在→接触→商谈→赢单/丢单)，每项可改阶段、加备注、移除。收藏按钮已接入**企业(搜索+详情)、招标、机会发现**。`SavedItem` 已扩展 `note/stage/tags`。**待扩展**：买家意向(intent)收藏、标签编辑 UI、拖拽换列、看板内招标外链。
- ☐ **订阅提醒 + 每日邮件**：按关键词/行业/地区订阅新招标/融资/高意向/新闻 → 每日「法国机会雷达」邮件。SaaS 留存核心。
- ☐ **注册画像 → 个性化**：注册收集 产品/行业/地区/预算 → Dashboard、机会发现、Copilot 围绕画像出结果。
- ☐ 保存搜索 / 搜索历史。

## 第二波 — 数据深度与差异化(护城河)

- ☑ **🏆 补贴与扶持资金匹配**(差异化大招)：`/funding` 按 行业/阶段/需求/地区 匹配法国扶持项目并打分。内置真实国家级项目库(France 2030、Bpifrance 各产品、CIR/CII、JEI、ADEME、CCI les-aides 等)；配 `AIDES_API_TOKEN` 即叠加 **Aides-territoires** 实时数据。代码：`lib/data/subsidies.ts`、`lib/sources/aides.ts`、`/api/aides`。**待办**：申请 Aides-territoires token 启用实时源、补贴可收藏进 watchlist、评分权重微调(目前多项满分)。
- ☐ **招聘信号(真实)**：接 France Travail(原 Pôle emploi)招聘 API，把「大量招某岗位」变成真实扩张/买入信号。
- ☐ **Pappers 接入**(客户端已就绪，填 key 即用)：信用的付款风险/成长等占位维度变真实；企业档案补多年财务、股东、受益人。
- ☑ 融资/投资事件 → `/signals`「融资动向」：Google News(免密钥)抓融资新闻，解析 **公司/金额/轮次**，并用 **data.gouv 企业注册库(recherche-entreprises)校验富化** → 附真实 SIREN(深链企业页)+行业，过滤榜单/人名噪音；按规模+时效打分。**已并入 buyers intent 页统一打分**(BOAMP 采购方 + 刚融资公司混合排序)。代码 `lib/sources/funding-signals.ts`、`/api/signals`、`lib/sources/intent.ts`。
  > 注：data.gouv **无**结构化"融资轮次"数据集(Dealroom/Crunchbase 需付费)；改用官方企业注册库做结构化校验，既加 SIREN 又去噪。
- ☐ **报告接 RAG + 引用来源**：把真实数据喂给模型并标注来源，报告数字不再是模型编的(商用关键)。

## 第三波 — 出海专属价值

- ☑ **分行业落地合规清单** `/compliance`：按行业(食品/健康/建筑/金融/化妆品/软件/零售/能源/通用)给出 法律形式 · TVA/税务 · 雇佣法 · 行业监管认证(CE/HACCP/ACPR/Qualibat…) · GDPR；内容为**人工整理的真实法规事实(非 LLM 生成)** + 免责声明;底部接注册留资 CTA → 「咨询+落地」组合。代码 `lib/data/compliance.ts`、`components/compliance/`。**正文中英双语**(zh/en，fr 回退 en)；**一键导出 PDF**(浏览器打印→另存，隐藏侧栏/顶栏/CTA，带 FranceGo 品牌表头，支持中文)。**待办**：按公司画像自动选行业、fr 正文、服务端直接生成可下载 .pdf(需嵌 CJK 字体)。
- ☐ **政府招商激励**：Business France / French Tech Visa / Choose France / 各大区优惠 的内容化与匹配。
- ☐ **材料本地化**：一键把客户公司简介/产品页/邮件翻译并「法国化」(复用现有翻译能力)。
- ☐ GDPR 合规的决策者触达：公开商务联系方式 + 合规外联模板(勿抓个人邮箱，规避法律风险)。

## 贯穿 — 可信度与体验

- ☐ 真正的 PDF/DOCX/PPTX 导出(现为浏览器打印)。
- ☐ 数据时效戳 + 来源标注(已部分有)。
- ☐ **性能**：BOAMP 单次抓取过大(>2MB 不能缓存)→ 调小抓取量/分页/缓存，首页更快。
- ☐ 团队账号 / 多席位 / 白标(卖给咨询公司、商会、出海服务机构，客单价更高)。
- ☐ 移动端持续打磨(Dashboard 已优化，其它页面待过一遍)。
- ☐ 监控：GlitchTip(错误) + Umami(分析)。

---

## 合规待办(商用上线前必查)
- BODACC 个人数据：仅用于风险/合规，禁止用于对自然人的商业招揽。
- 新闻雷达：Google News RSS 非官方，商用建议换授权源(NewsAPI/GNews/GDELT/AFP)。
- 各开放数据署名(Licence Ouverte / Eurostat / TED 等)。
- GDPR：用户与企业/个人数据的存储、留存、删除流程。

详见 [DATA_SOURCES.md](DATA_SOURCES.md)。
