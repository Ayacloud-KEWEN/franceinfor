# 接续开发指南（CONTINUE）

新开会话后，先读这份文件即可快速接手继续开发。

## 这是什么
**France Business Development OS** —— 面向出海客户的法国市场拓展 SaaS（商用）。
线上：**https://infr.europeanaialliance.org** · 仓库：`Ayacloud-KEWEN/franceinfor`（main 分支自动部署）。

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

## 🔧 待激活：Stripe 真实订阅（代码已就绪，需配置才生效）
代码框架已完成（结账/门户/Webhook + 设置页升级按钮）。**未配密钥时优雅降级**（设置页显示「未开通在线支付」）。激活步骤：
1. Stripe 后台建 2 个**循环价格**：Professional €99/月、Business €299/月，记下 `price_xxx`。
2. Stripe 后台建 **Webhook**：`https://infr.europeanaialliance.org/api/stripe/webhook`，勾选事件
   `checkout.session.completed`、`customer.subscription.updated`、`customer.subscription.deleted`，记下签名密钥。
3. 服务器 `.env` 填：
   ```env
   STRIPE_SECRET_KEY="sk_live_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   STRIPE_PRICE_PROFESSIONAL="price_..."
   STRIPE_PRICE_BUSINESS="price_..."
   ```
4. `pm2 restart france-os`（Stripe 变量是运行时读取，非 `NEXT_PUBLIC_`，**重启即可，无需重新构建**）。
5. 设置页应出现「升级」按钮；走一遍 test 模式结账验证。
- 计费逻辑：Webhook 根据 priceId 映射到 `Plan` 并更新 `User.plan`（见 `src/lib/stripe.ts`、`src/app/api/stripe/webhook/route.ts`）。配额按 `src/lib/plans.ts`。

## 当前状态小结（截至本次会话）
- 15 个模块均已上线，多数接真实数据（企业/招标 BOAMP+TED/市场 Eurostat/新闻 Google News/信用财务+法律 BODACC/机会发现/买家意向/网络/事件）。
- 翻译：新闻/Dashboard/意向标题按界面语言用 LLM 翻译（JSON 数组解析，已修复对 DeepSeek 的兼容）。
- 增值服务：企业/品牌页有「在法国注册公司/商标」指引 + 合作伙伴 CTA（`NEXT_PUBLIC_PARTNER_*` 可配）。
- 信用页有「评分含义与标准」说明。
- Dashboard 移动端已优化。
- 演示账号已删；登录页无 demo 信息。

## 下一步建议（来自 ROADMAP 第一波）
增值服务**留资闭环** → **关注列表/轻量 CRM** → **订阅提醒+每日邮件** → 激活 Stripe。
差异化大招：**补贴/扶持资金匹配**（les-aides.fr / Bpifrance / France 2030）。
