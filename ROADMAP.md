# 产品路标 ROADMAP

面向**出海客户的法国市场拓展工具**(商用)。按优先级组织。
状态：☐ 待做 · ◐ 进行中 · ☑ 已完成

> 已上线基础：企业/招标(BOAMP+TED)/市场(Eurostat)/新闻雷达/信用/品牌/机会发现/买家意向/事件/网络/Copilot/报告 + 公司&商标注册增值服务 + 三语(含**管理后台全三语**) + Stripe 订阅 + Knowledge OS L1–L4 + AI 起草 playbook + 每日多语邮件。
> 部署：**手动 `npm run deploy`**（Actions 已移除）。安全：2026-07 挖矿木马入侵已加固，详见 `DEPLOYMENT.md` §13。

---

## 第一波 — 变现与留存地基

- ☑ **Stripe 真实订阅**(Professional €99 / Business €299）。**Live 已激活并验证**(本地 Test 模式 + 线上 Live 全链路跑通：结账→Webhook→升级 plan→退订回落 FREE)。验证用 100% 优惠码零成本下单。配置/排错见 `CONTINUE.md`。
- ☑ **增值服务留资闭环**：公司/商标 ServiceGuide 内嵌留资表单(姓名/邮箱/公司/需求)→ `Lead` 表 → `/admin` 线索列表(可改状态 NEW→CONTACTED→WON/LOST)。**管理员邮件通知目前是占位**(写服务器日志,见 `src/lib/notify.ts`，接 Resend/SMTP 一行接通)。
- ☑ **管理后台 `/[locale]/admin`**(仅 `role=ADMIN`)：用户列表(注册时间/套餐/订阅状态)、事件流(注册/升级/降级/退订/留资,`Event` 审计表)、留资列表 + KPI 卡。
- ☑ **关注列表 / 轻量 CRM**：`/watchlist` 按阶段看板(潜在→接触→商谈→赢单/丢单)，每项可改阶段、加备注、移除。收藏按钮已接入**企业(搜索+详情)、招标、机会发现**。`SavedItem` 已扩展 `note/stage/tags`。**待扩展**：买家意向(intent)收藏、标签编辑 UI、拖拽换列、看板内招标外链。
- ☑ **订阅提醒 + 每日邮件**：设置页开关 + 关键词 → `scripts/daily-cron.sh` 每日触发 `/api/cron/digest` → 「法国机会雷达」邮件。**按用户界面语言发送**（标题+章节本地化、新闻/招标标题翻译）、HTML 精美版式（`lib/digest.ts`、`lib/notify.ts` 接 Resend）。需 `RESEND_API_KEY` + 已验证发信域 + `CRON_SECRET` + crontab。
- ☑ **注册画像 → 个性化**：注册后跳 `/onboarding` 采集 产品/行业/地区/阶段/预算/目标 → 存 `User.profile`（JSON）+ `onboardedAt`；可在设置页编辑、Dashboard 顶部提示补全。个性化已落地：Dashboard hero 显示画像行、机会发现(`/discover`)表单预填、落地路线按目标高亮"推荐"步骤、**Copilot 注入画像**（`profilePromptContext` 前置到聊天+报告系统提示，答案贴合产品/行业/地区/阶段/目标，已用真实 LLM 对比验证）。代码 `lib/profile.ts`、`app/actions/profile.ts`、`app/api/copilot/`、`components/onboarding/`。个性化预填已覆盖 discover / markets / funding 表单。
- ☑ **🧭 市场进入项目主线 `/plan`**（补最大产品空白）：把 20 个模块串成一条带进度的落地主线（调研→立足→拿单，11 步、每步深链对应模块），逐步 todo/doing/done 状态存 `User.entryProgress`（JSON），按画像目标高亮推荐步骤。Dashboard 有"接下来做什么"卡片（总进度+下一步）。代码 `lib/data/entry-plan.ts`、`app/[locale]/(app)/plan/`、`components/plan/`、`api/plan`。**待扩展**：按 stage 自动预勾选已完成阶段、步骤完成度接入运营统计。
- ☐ 保存搜索 / 搜索历史。

## 第二波 — 数据深度与差异化(护城河)

- ☑ **🏆 补贴与扶持资金匹配**(差异化大招)：`/funding` 按 行业/阶段/需求/地区 匹配法国扶持项目并打分。内置真实国家级项目库(France 2030、Bpifrance 各产品、CIR/CII、JEI、ADEME、CCI les-aides 等)；配 `AIDES_API_TOKEN` 即叠加 **Aides-territoires** 实时数据。代码：`lib/data/subsidies.ts`、`lib/sources/aides.ts`、`/api/aides`。**待办**：申请 Aides-territoires token 启用实时源、补贴可收藏进 watchlist、评分权重微调(目前多项满分)。
- ☑ **招聘信号(真实)**：接 France Travail(原 Pôle emploi)「Offres d'emploi v2」API（OAuth，参照 EUIPO 模式），按雇主聚合近期职位数=扩张/买入信号，`/signals` 新增「招聘信号」区，并混入买家意向(`intent.ts` 三信号融合：招标+融资+招聘)。代码 `lib/sources/hiring-signals.ts`、`api/signals/hiring`、`components/signals/hiring-signals.tsx`。聚合逻辑已单测；**需服务器填 `FRANCE_TRAVAIL_CLIENT_ID/SECRET`（francetravail.io）激活**，未配则该区隐藏、intent 优雅跳过。
- ◐ **Pappers 接入**：客户端已**接进信用路由**（`getPappersFinancials`）——政府库无财务时用 Pappers 补，让财务健康分对更多小公司变真，来源动态标注（data.gouv.fr / Pappers）。**填真 key 即生效**（`.env` 现为空占位，`pappersConfigured()` 为空则优雅跳过）。**待办**：企业档案补 EBITDA/股东/受益人。
- ☑ **数据诚实化（去伪造分数）**：① 删死代码 `contacts.ts`（假决策人）+ `org-tree.tsx`；② 招标去掉无真值的"中标概率"、`matchScore` 改为**真实关键词相关度**（`keywordRelevance`，无关键词不显示）；③ 网络模块去掉对真实高管的伪造 influence/buyingIntent/relationship 三分，只留真实姓名/职务 + 说明；④ 信用的付款风险/供应商可靠性/成长的解释文案由"假装真实推导"改为如实"估算"。均经 API 实测。
  > 说明：`opportunityScore` 是全站通用的启发式优先级分（企业/市场/新闻/发现 8+ 处），作为"线索评分"性质保留，未动。
- ☑ 融资/投资事件 → `/signals`「融资动向」：Google News(免密钥)抓融资新闻，解析 **公司/金额/轮次**，并用 **data.gouv 企业注册库(recherche-entreprises)校验富化** → 附真实 SIREN(深链企业页)+行业，过滤榜单/人名噪音；按规模+时效打分。**已并入 buyers intent 页统一打分**(BOAMP 采购方 + 刚融资公司混合排序)。代码 `lib/sources/funding-signals.ts`、`/api/signals`、`lib/sources/intent.ts`。
  > 注：data.gouv **无**结构化"融资轮次"数据集(Dealroom/Crunchbase 需付费)；改用官方企业注册库做结构化校验，既加 SIREN 又去噪。
- ☑ **报告接 RAG + 引用来源**：报告生成前先抓真实数据——市场规模(Eurostat)+ 在营招标数/样本(BOAMP)+ 注册企业数/龙头(data.gouv)+ 近期新闻 + 知识库(retrieveContext)，组成 data pack 喂给模型并**强制只用提供的数字**（缺失写"not available"），末尾附真实来源链接。代码 `lib/report-rag.ts`、`api/reports/generate`。已用真实 API + Ollama 验证：报告含真实 €144.7B 市场规模、96 家企业数、`## Sources` 真实链接。
- ◐ **🧠 Knowledge OS**（长期战略资产，见 `KNOWLEDGE_OS.md`）：四层(原始数据→知识图谱→Playbook→项目经验)+ Copilot 改 RAG。**已落地 L3 Playbook 库** `/playbooks`（内置"在法国建数据中心"完整 playbook，可搜索匹配/PDF/留资）。待建：L1 抓取+对象存储、L2 pgvector 知识图谱、L4 项目经验统计。架构已为**无缝迁移 VPS/扩容**设计（无状态应用 + Postgres 单一事实源 + 限流换 Redis + 对象存储 + 容器化）。
  **已落地**：L1 抓取入库(`RawDocument`+`/api/cron/ingest`)、L3 库+版本+三语(playbook：「在法国建数据中心」+「把中国生产的乐器卖到法国」)、L4 项目经验+Experience Intelligence、Copilot RAG(L3/L4 grounding+来源)、Redis 限流、Dockerfile+compose。
- ☑ **🧠 L2 知识图谱 + pgvector**：完整管线已落地并端到端验证——① 抓取(L1 `RawDocument`)→ ② **chunk+embed 存 pgvector**(`DocChunk vector(1536)` + HNSW 余弦索引，`lib/knowledge.ts`)→ ③ **LLM 抽取实体/关系**为候选(`KnowledgeNode`/`KnowledgeEdge`，带 confidence/来源/状态，`lib/knowledge-graph.ts`)→ ④ 后台 `/admin/knowledge` 人工审核 approve/reject + **一键"运行抽取"按钮**(`runPipelineAction`)→ ⑤ **RAG 检索整个知识图谱**(`graphContext` 把已批准节点+1 跳关系注入 Copilot/报告上下文，`rag.ts`——本次补的关键一环)。三个 cron 端点 `/api/cron/{ingest,index,extract}`。**embedding 用户已定 OpenAI**：`embed()` 默认 `text-embedding-3-small`(1536-d)，**服务器填 `OPENAI_API_KEY` 即生效**（现为空则走 dev 兜底、质量略低；图谱检索为文本匹配不受影响）。验证：真实法语文本抽出 7 节点/2 关系，批准后 `graphContext`/`retrieveContext` 正确召回并注入。

## 第三波 — 出海专属价值

- ☑ **分行业落地合规清单** `/compliance`：按行业(食品/健康/建筑/金融/化妆品/软件/零售/能源/通用)给出 法律形式 · TVA/税务 · 雇佣法 · 行业监管认证(CE/HACCP/ACPR/Qualibat…) · GDPR；内容为**人工整理的真实法规事实(非 LLM 生成)** + 免责声明;底部接注册留资 CTA → 「咨询+落地」组合。代码 `lib/data/compliance.ts`、`components/compliance/`。**正文中英双语**(zh/en，fr 回退 en)；**一键导出 PDF**(浏览器打印→另存，隐藏侧栏/顶栏/CTA，带 FranceGo 品牌表头，支持中文)。**待办**：按公司画像自动选行业、fr 正文、服务端直接生成可下载 .pdf(需嵌 CJK 字体)。
- ☐ **政府招商激励**：Business France / French Tech Visa / Choose France / 各大区优惠 的内容化与匹配。
- ☑ **💰 市场进入成本 / ROI 测算器**（强留资磁石）：企业页落地包**上方**，输入 法律形式/地区/办公室/雇员数/薪资/营收/毛利 → 明细化估算落地首年总成本（注册+商标+办公室+雇主总成本 salary×1.42+会计+保险+合规）+ 回本周期 + ROI，纯函数实时重算。数据为人工策展 2026 法国基准，复用落地包"雇主成本×1.42"与信用模块账期（附"预留流动资金→查看账期"链接）；地区按画像预填。形成"算成本→发现麻烦→落地包一站办齐→留资"漏斗。代码 `lib/data/cost-model.ts`、`components/modules/entry-cost-calculator.tsx`。
- ☐ **材料本地化**：一键把客户公司简介/产品页/邮件翻译并「法国化」(复用现有翻译能力)。
- ☐ GDPR 合规的决策者触达：公开商务联系方式 + 合规外联模板(勿抓个人邮箱，规避法律风险)。

## 贯穿 — 可信度与体验

- ☐ 真正的 PDF/DOCX/PPTX 导出(现为浏览器打印)。
- ☐ 数据时效戳 + 来源标注(已部分有)。
- ☑ **性能**：BOAMP 单次抓取过大(>2MB 不能缓存)→ 给 Opendatasoft 请求加 `select` 只取用到的 9 个字段，payload **2.7MB → ~20KB(约 137×)**，恢复可缓存，首页/招标页/买家意向不再每次重抓。代码 `lib/sources/boamp.ts`。
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
