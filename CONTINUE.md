# 接续开发指南（CONTINUE）

新开会话后，先读这份文件即可快速接手继续开发。

## 这是什么
**FranceGo**（原 France Business Development OS）—— 面向出海客户的法国市场拓展 SaaS（商用）。
线上：**https://francego.fr** · 仓库：`Ayacloud-KEWEN/franceinfor`（main 分支自动部署）。
> 品牌名 = **FranceGo**（在 `messages/*.json` 的 `brand` 命名空间 + 各 logo）。**基础设施标识不要改**：pm2 进程 `france-os`、仓库 `franceinfor`、目录 `htdocs/infr.europeanaialliance.org`、数据库名都保持原样。
> **域名迁移已完成并线上验证**：主域 `francego.fr`（Cloudflare），旧域 `infr.europeanaialliance.org` 由中间件 301 跳转；SEO canonical/hreflang/og、SSL、三语、各端点线上均确认。发信域 `send.francego.fr` 已在 Resend 验证。Resend key 由用户更换过（本地 `.env.local` 旧 key 已失效，仅影响本地）。
> 资源在 `public/`：`logo.png`（侧栏/登录/favicon 来源）、`login.png`（登录页左侧视觉图）、`favicon.ico`/`icon-*`/`apple-touch-icon.png`（`layout.tsx` 的 `metadata.icons`）。

## 先读这几份文档
- [README.md](README.md) — 概览 / 技术栈 / 本地运行 / AI 切换
- [USER_GUIDE.md](USER_GUIDE.md) — 各模块功能与用法
- [ROADMAP.md](ROADMAP.md) — **接下来做什么**（按优先级）
- [DEPLOYMENT.md](DEPLOYMENT.md) — 部署 + 自动部署 + 踩坑
- [DATA_SOURCES.md](DATA_SOURCES.md) — 数据源 / 许可证 / 商用限制

> 还有持久化「记忆」会在每个会话自动加载（项目决策、踩坑等），无需手动找。

## 技术栈
Next.js 15(App Router, React 19) · TS · Tailwind · next-intl(en/fr/zh) · Prisma + PostgreSQL(本地端口 5436) · Cookie 会话认证 · 可配置 LLM(Ollama/DeepSeek/OpenAI/Qwen/Claude) · Stripe 订阅。

## 本地运行
```bash
# 一键（推荐）：Windows 双击 start.bat；或：
npm run db:up && npm run dev   # http://localhost:3000
```
- 本地 dev 用 `next dev --turbopack`（OneDrive 目录必须用 turbopack，否则 webpack 会 EINVAL）。
- 改 `prisma/schema.prisma` 后：停 dev → `npx prisma generate && npx prisma db push`（dev 在跑会锁引擎报 EPERM）。
- 改 `src/messages/*.json` 后重启 dev（next-intl 缓存动态 import 的 JSON）。

## 目录速览
```
src/app/[locale]/(auth|app)/   登录 / 各模块页面
src/app/api/                   各模块 + stripe(checkout/portal/webhook) 接口
src/components/                ui/ shell/ dashboard/ services/ settings/ 各模块组件
src/lib/                       auth, prisma, usage(配额), plans, ai(LLM层), stripe, sources/(真实数据源), data/(mock)
src/messages/                  en/fr/zh
prisma/                        schema + seed
```

## 自动部署
`git push origin main` → GitHub Actions(`.github/workflows/deploy.yml`，原生 ssh) → 服务器 `git pull && npm ci && prisma db push && npm run build && pm2 reload`。
- 服务器：root，目录 `/home/france-infor/htdocs/infr.europeanaialliance.org`，PM2 进程 `france-os`，端口 **3011**。
- 改完代码本地 `git push` 即可；想手动：仓库 Actions → Run workflow。

## ✅ 已上线：Stripe 真实订阅（Live 已激活并验证）
全链路跑通：结账→支付→Webhook 入账→升级 `User.plan`→退订回落 FREE。本地 Test 模式 + 线上 Live 均已验证。**未配密钥时优雅降级**（设置页显示「未开通在线支付」）。
- 计费逻辑：Webhook 按 priceId 映射 `Plan` 更新 `User.plan`（`src/lib/stripe.ts`、`src/app/api/stripe/webhook/route.ts`）。配额见 `src/lib/plans.ts`。
- 服务器 `.env` 需要 4 个变量（**运行时读取，改完 `pm2 restart` 即可，无需 build**）：
  ```env
  STRIPE_SECRET_KEY="sk_live_..."      # 必须 sk_live_ 开头（不是 mk_/pk_）
  STRIPE_WEBHOOK_SECRET="whsec_..."     # Live destination 的签名密钥
  STRIPE_PRICE_PROFESSIONAL="price_..." # Live 模式重建的（Test 的在 Live 无效）
  STRIPE_PRICE_BUSINESS="price_..."
  ```
  另需 `NEXT_PUBLIC_APP_URL="https://francego.fr"`（**构建时注入**，改了要重新 build）。

### 本地 Test 模式怎么跑（复现验证）
- `.env.local`（git 忽略）填 `sk_test_` + 两个 test `price_` + `whsec_`。
- Stripe CLI（`~/stripe-cli/stripe.exe`）转发 Webhook 到本地：
  `stripe.exe listen --api-key sk_test_... --forward-to localhost:3000/api/stripe/webhook`（`--print-secret` 拿 whsec，免浏览器配对）。
- 测试卡 `4242 4242 4242 4242`，任意未来日期 + 任意 CVC。
- 退订验证：`curl -X DELETE https://api.stripe.com/v1/subscriptions/<sub_id> -u sk_test_...:` → 应触发 `customer.subscription.deleted` → plan 回 FREE。

### 踩坑记录（重要）
- **`current_period_end` 字段位置**：账户 API 版本 ≥ basil(2025-03) 后该字段从订阅顶层移到 `items`。Webhook 用 `periodEnd()` 兜底读两处；且 SDK v17(acacia) 类型里 `SubscriptionItem` 没有该字段，访问需 `as unknown` cast，否则 `next build` 类型检查会挂。
- **密钥前缀**：Live secret key 必须 `sk_live_` 开头。曾误填 `mk_` 开头的值 → `StripeAuthenticationError 401` → 结账 500。
- **零成本验证**：Stripe 建 100% off 优惠码（coupon + promotion code），结账页输入 → €0 下单走完真实 Live 链路。注意：€0 不产生 Payment/Transaction 记录（正常），看 Subscriptions + Webhook 200 即算成功。
- **改 `STRIPE_*` 后服务器起不来 `Could not find a production build`**：通常是某次自动部署的 `next build` 失败（如类型错误）导致 `.next` 缺失，与 `.env` 无关。手动 `git pull && npm run build && pm2 restart france-os` 修复，并看 `npm run build` 自身输出而非 `pm2 logs` 的循环报错。

## 🛠️ 管理后台 + 留资闭环（本次新增）
- **后台** `/[locale]/admin`（仅 `User.role=ADMIN`，非管理员 `notFound`）：KPI（用户/付费/各套餐/新线索）+ 留资表（可改状态）+ 用户表 + 事件流。守卫 `src/lib/admin.ts#getAdminUser`；侧栏对 ADMIN 显示入口。
- **留资**：`components/services/lead-form.tsx`（内嵌进 ServiceGuide）→ `POST /api/leads` → `Lead` 表（带登录用户快照）→ `recordEvent('LEAD_CREATED')`。
- **事件审计**：`src/lib/events.ts#recordEvent` 写 `Event` 表 + 通知管理员；埋点在注册(`actions/auth.ts`)、Stripe webhook(升级/降级/退订)、留资。
- **邮件通知**：`src/lib/notify.ts#notifyAdmin` 目前**只写服务器日志**（`[notify:admin] ...`）。接真邮件：实现 `sendEmail()`（Resend/SMTP）即可，调用点不用改。收件人 `ADMIN_EMAIL`（默认 fdcaptain@gmail.com）。
- **上线后必做**：把你的生产账号设 ADMIN —— 服务器执行
  `docker exec ... psql ...` 或直接 `UPDATE "User" SET role='ADMIN' WHERE email='你的邮箱';`，否则看不到 `/admin` 入口。新表 `Lead`/`Event` 由自动部署的 `prisma db push` 自动建（纯新增，无数据丢失）。

## ⭐ 关注列表 / 轻量 CRM（本次新增）
- **页面** `/[locale]/watchlist`：按 `Stage` 看板（潜在 LEAD→接触 CONTACTED→商谈 NEGOTIATING→赢单 WON→丢单 LOST）。每张卡可改阶段(select)、加备注(textarea，blur 保存)、移除。客户端组件 `components/saved/watchlist-board.tsx`。
- **收藏机制**：通用 `components/saved/save-button.tsx`（传 `type/refId/label/data`）→ `/api/saved`（GET 列表 / POST 收藏 / PATCH 改 stage·note·tags / DELETE）。同页多个按钮经 `use-saved-keys.ts`（react-query `['saved-keys']`）共享已收藏状态。
- **已接入**：企业(搜索 Detail 面板 + 详情页头部)、招标(`tender-search.tsx`，TENDER)、机会发现(`discover.tsx`，OPPORTUNITY，icon 按钮)。**再加联系人/买家意向**：在对应卡片放 `<SaveButton type=... />` 即可；`watchlist-board.tsx#hrefFor` 里补该类型的深链。
- **Schema**：`SavedItem` 加 `note/stage(Stage 枚举)/tags(String[])/updatedAt`；索引 `@@index([userId, stage])`。新列纯增，自动部署 `prisma db push` 会自动建。
- 全链路本地验证：收藏→列表→改阶段+备注→看板渲染→删除。

## 🔒 安全加固（本次）
- **付款**：审过无可攻击面 —— Webhook 验签、价格取服务器 env、`client_reference_id` 服务端写入、接口均鉴权。
- **LLM 接口**：全部 `getCurrentUser` + `consumeSearch` 配额；`/api/news/translate` 之前漏计 → 现加**独立日配额**(`consumeTranslate`，FREE 30/PRO 300/BIZ 2000) + **突发限流**(15 次/分/用户)，超限优雅降级(返回原文)。
- **留资 `/api/leads`**（公开）：加**蜜罐字段** `website`(填了即静默丢弃) + **限流**(IP 3 次/10 分、邮箱 3 次/时)。限流器 `src/lib/rate-limit.ts`（内存滑窗，单 pm2 进程够用）。
- **仍建议**（未做）：登录失败限流；整站挂 **Cloudflare**(免费版含 rate limit + bot + DDoS，比写代码更划算)；`consumeSearch` 竞态(非原子，影响极小)。

## 🏆 补贴/扶持资金匹配（差异化大招，本次新增）
- **页面** `/[locale]/funding`（导航在 opportunities 组）：输入 行业/阶段/需求/地区 → 匹配法国扶持项目并按分排序。组件 `components/funding/funding-matcher.tsx`。
- **数据**：`lib/data/subsidies.ts` 内置真实国家级项目库（France 2030、Bpifrance Bourse French Tech/Prêt Innovation/Garantie/Assurance Prospection、CIR、CII、JEI、ADEME、France Num、alternance、CCI les-aides、区域补贴）+ `matchSubsidies()` 确定性打分。
- **真实源切换**：`lib/sources/aides.ts` —— 配 `AIDES_API_TOKEN`（Aides-territoires，免费申请）即叠加实时地方补贴；未配/出错回退内置库。`/api/aides` 鉴权 + 配额（module='aides'）。
- **待办**：申请 token 启用实时；补贴卡加 SaveButton（type 需扩展或复用 OPPORTUNITY）；评分权重微调（现多项满分 100）。

## 📈 融资动向（本次新增）
- **页面** `/[locale]/signals`（导航 opportunities 组）：列出刚融资的法国公司作为强购买信号，进页自动加载。组件 `components/signals/funding-signals.tsx`。
- **数据**：`lib/sources/funding-signals.ts` 复用 `fetchFranceNews`（Google News，免密钥）按融资关键词抓取，正则解析 **公司名/金额/轮次**，按规模+时效打意向分。出错/空 → `FUNDING_SIGNALS_MOCK`。`/api/signals` 鉴权 + 配额（module='signals'）。
- **结构化校验/富化**：解析出的公司名打 **recherche-entreprises（data.gouv 官方注册库）** 做词边界匹配 → 命中则附真实 **SIREN**(深链 `/companies/[siren]`)+规范名+行业；过滤榜单(`LISTICLE` 正则)、人名(无 SIREN 降级)。注册库调用有 60s 缓存、限并发 4。
  > data.gouv **无**结构化"融资轮次"数据集(实测 0 结果；Dealroom/Crunchbase 付费)，故用注册库校验代替。
- **已并入 intent**：`lib/sources/intent.ts#buyingIntentReal` 把 `fundingIntent(8)` 的融资公司与 BOAMP 采购方**合并、按 intentScore 统一排序**。
- 真实验证：榜单过滤 3/16、SIREN 解析 6/13、人名(Yann LeCun)正确无 SIREN；每条可收藏（OPPORTUNITY，refId=`funding:<id>`）。

## 📋 分行业落地合规清单（本次新增）
- **页面** `/[locale]/compliance`（导航 engage 组）：选行业 → 5 栏清单(法律形式 / TVA·税务 / 雇佣法 / 行业监管认证 / GDPR)。组件 `components/compliance/compliance-checklist.tsx`（纯客户端，import 静态数据，无 API）。
- **数据** `lib/data/compliance.ts`：通用基础(BASE) + 9 个行业监管叠加层(OVERLAYS：food/health/construction/finance/cosmetics/tech/retail/energy/generic)。`getCompliance(sector)` 合成。**内容是人工整理的真实法规事实，非 LLM 生成**（合规不能幻觉），带免责声明。
- **咨询+落地组合**：底部嵌 `LeadForm(kind=COMPANY)` → 留资进 `Lead` 表/后台，承接公司注册增值服务。
- **正文中英双语**：`compliance.ts` 内容按 `{en, zh}` 存，`getCompliance(sector, locale)` 选语言（fr 回退 en）。
- **一键导出 PDF**：组件里「导出 PDF」按钮调 `window.print()`；打印时用 Tailwind `print:` 变体隐藏侧栏(`(app)/layout` aside `print:!hidden`)、顶栏(`topbar` header `print:hidden`)、控件与 CTA，显示 `hidden print:block` 的 FranceGo 品牌表头(行业+日期)，卡片 `print:break-inside-avoid`。浏览器打印引擎完美渲染中文 → 另存为 PDF 即可发客户。
- 验证：curl /zh/compliance 200，中文正文/导出按钮/打印表头均命中（预览浏览器本次崩溃，未截图）。
- **待办**：按公司画像自动选行业、fr 正文、服务端直接生成可下载 .pdf（需嵌 CJK 字体）。

## 🔑 找回密码（本次新增）
- **流程**：登录页「忘记密码?」→ `/forgot-password`(输邮箱)→ 邮件发重置链接 → `/reset-password?token=…`(设新密码)→ 跳回登录(`?reset=done` 横幅)。
- **服务端**：`actions/auth.ts` 的 `requestPasswordResetAction`(总是报成功、不泄露邮箱是否存在、按邮箱限流 3次/时)、`resetPasswordAction`(校验令牌+两次密码一致+≥6位)。令牌助手在 `lib/auth.ts`：`createPasswordResetToken`/`consumePasswordResetToken`(单次性、1h 过期、sha256 存储)/`setPassword`(改密 + 清空该用户所有 session 和令牌)。
- **Schema**：新增 `PasswordResetToken` 表(id=sha256(token))，纯增量，自动部署 `prisma db push` 自动建。
- **邮件**：重置链接经 `notify.ts#notifyEmail` 发给用户——**接通 Resend/SMTP 前先打服务器日志**(`[notify:email] …`)，接通后立即真发。**这是唯一待办**。
- 验证：令牌生命周期(有效/单次/过期/改密)用 prisma 直测全 OK；各页 200、三语、登录页链接均在。

## 🚀 营销落地页（本次新增）
- **公开根路由** `/[locale]`（原来 redirect 到 dashboard，现改为营销页；不依赖 DB、可静态缓存）。三语 hero/亮点(6)/价格(Free·Pro·Business·Enterprise)/FAQ/CTA/footer，全部 CTA 指向 `/register`、`/login`。
- **SEO/AIO**：`generateMetadata` 输出 per-locale title/description + **hreflang(en/fr/zh) + canonical + OpenGraph/Twitter**；页内 **JSON-LD**(`SoftwareApplication` 含价格 Offer + `FAQPage`) 利于搜索与 AI 答案引擎。文案在 `messages/*.json` 的 `landing` 命名空间。
- **GA4**：`components/landing/analytics.tsx` —— **仅在用户同意 Cookie 后**才注入 gtag（GDPR 友好）。measurement id 用 `NEXT_PUBLIC_GA_ID`（**构建时注入**，服务器改了要重新 build，非仅 restart）。
- **Cookie 合规**：`components/landing/cookie-consent.tsx` 横幅，选择存 localStorage `fg_consent`，accept 才广播 `fg-consent` 事件让 GA 加载。
- 验证：/en /fr /zh 均 200，hreflang/canonical/OG/JSON-LD/三语正文/Cookie 横幅均确认；预览截图外观专业。
- **上线注意**：要开 GA 就把 `NEXT_PUBLIC_GA_ID` 填进服务器 `.env` 并**重新 build**（不是只 restart）。

## 🗞️ 新闻周期 + 翻译缓存（本次新增，省 token）
- **新闻拉取周期**：`news.ts` 的 `revalidate` 由 15 分钟改为**默认 12 小时**（`NEWS_REVALIDATE` 读 `NEWS_REVALIDATE_SECONDS`，设 `86400` = 每天一次）。
- **翻译 DB 缓存**：`lib/translation-cache.ts#translateBatchCached` —— 标题先查 `Translation` 表（id=sha1(target+source)），**只把未缓存的发给 LLM**，结果存库永久复用（新闻标题不变）。`/api/news/translate` 已切到这个函数（覆盖 dashboard/news/intent 四处调用）。失败/无变化（identity）不缓存以便后续重试。
- **配额说明**：每日翻译配额仍按"调用次数"计（缓存命中不耗 token，仅限免费用户每天触发次数）。
- Schema 新增 `Translation` 表（纯增量，自动部署 `prisma db push` 自动建）。验证：键计算/命中/未命中/去重幂等均 OK。

## 📬 每日机会邮件 + 订阅提醒（本次新增）
- **订阅设置**：设置页新增「每日机会邮件」面板（`components/settings/digest-panel.tsx` + `actions/digest.ts`）：开关 + 关键词（逗号分隔，留空=全行业重点）。存 `User.digestEnabled/digestKeywords/digestLastSentAt`。
- **摘要内容**：`lib/digest.ts#buildDigest` 聚合当天 新闻 + BOAMP 招标 + 融资信号（按关键词过滤），组成「法国机会雷达」邮件（三语问候/标题/页脚链接）。`sendDailyDigests` 遍历已订阅用户，**当天已发则跳过**（`digestLastSentAt`），经 `notify.ts#notifyEmail`（Resend）发送。
- **触发**：`GET /api/cron/digest?key=<CRON_SECRET>`（或 Bearer），需配 `CRON_SECRET`。由**外部调度**每天调一次（服务器 crontab 或 GitHub Actions）。
- 验证：无 key→401、触发→sent:1（正文含真实新闻+招标+链接）、重复触发→skipped:1（当天不重发）。
- **上线要做**：① 服务器 `.env` 设 `CRON_SECRET="<随机串>"` + `pm2 restart`；② 加每日定时：
  `crontab -e` → `0 7 * * * curl -s "https://francego.fr/api/cron/digest?key=<CRON_SECRET>" >/dev/null`（每天 07:00）。依赖邮件已接通（[[email-and-resend]]）。

## 当前状态小结（截至本次会话）
- 15 个模块均已上线，多数接真实数据（企业/招标 BOAMP+TED/市场 Eurostat/新闻 Google News/信用财务+法律 BODACC/机会发现/买家意向/网络/事件）。
- 翻译：新闻/Dashboard/意向标题按界面语言用 LLM 翻译（JSON 数组解析，已修复对 DeepSeek 的兼容）。
- 增值服务：企业/品牌页有「在法国注册公司/商标」指引 + 合作伙伴 CTA（`NEXT_PUBLIC_PARTNER_*` 可配）。
- 信用页有「评分含义与标准」说明。
- Dashboard 移动端已优化。
- 演示账号已删；登录页无 demo 信息。

## 下一步建议（来自 ROADMAP 第一波；Stripe 已上线）
增值服务**留资闭环**（最快变现点）→ **关注列表/轻量 CRM** → **订阅提醒+每日邮件**。
差异化大招：**补贴/扶持资金匹配**（les-aides.fr / Bpifrance / France 2030）。
