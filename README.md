# FranceGo（原 France Business Development OS）

面向出海客户的 **AI 驱动法国市场拓展 SaaS**（商用）。把法国实时数据——企业、招标、融资、补贴、合规——转化为商机、信号与落地方案。
**线上：https://infr.europeanaialliance.org** · 品牌名 = **FranceGo**（基础设施标识 pm2 `france-os`/仓库 `franceinfor` 保持不变）。

📚 **文档导航**
- [USER_GUIDE.md](USER_GUIDE.md) — 详细功能与使用手册（各模块怎么用）
- [DEPLOYMENT.md](DEPLOYMENT.md) — CloudPanel/VPS 部署 + 自动部署 + 踩坑记录
- [DATA_SOURCES.md](DATA_SOURCES.md) — 数据接口清单、免费/密钥、许可证与商用限制

## 技术栈

- **Next.js 15**（App Router，React 19）· TypeScript · Tailwind + shadcn 风格 UI
- **next-intl** — 英语 / 法语 / 中文
- **Prisma** + **PostgreSQL**（端口 **5436**）· **Redis**（通过 Docker Compose）
- Cookie 会话认证（Lucia 风格）· bcrypt
- TanStack Query/Table · Zustand · Recharts · Framer Motion · next-themes（暗黑模式）

## 已实现功能

| 模块 | 状态 |
|------|------|
| 认证（注册 / 登录 / 退出，会话，配额） | ✅ |
| 三语界面（en/fr/zh）+ 语言切换 | ✅ |
| 仪表盘 — 机会雷达、KPI、动态流、高意向买家 | ✅ |
| **市场情报（模块 1）** — 行业评分、5 年预测图表 | ✅ |
| **企业情报（模块 3）** — 实时 `recherche-entreprises.api.gouv.fr` | ✅ 实时数据 |
| **招标情报（模块 5）** — 实时 BOAMP 公开数据 | ✅ 实时数据 |
| **机会发现引擎（模块 2）** — 输入产品/行业/目标，输出 8 类排序商机 | ✅ |
| **品牌情报（模块 4）** — 商标检索，风险/相似度/可注册性评分 | ✅ |
| **关系与联系人情报（模块 8/11）** — 决策者、企业网络树 | ✅ |
| **买家意向情报（模块 9）** — 采购信号 + 意向/紧迫度/销售评分 | ✅ |
| **事件情报（模块 10）** — 展会/会议匹配评分、预期线索 | ✅ |
| **信用情报（模块 12）** — 6 维评分 + 解释 + 信任分 | ✅ |
| **市场进入 Copilot（模块 13/14）** — 8 智能体编排生成市场进入报告 | ✅ |
| **新闻雷达（模块 15）** — 商业新闻转化为可行动信号 | ✅ |
| **报告中心** — 8 种模板，AI 生成，打印 PDF / 导出 .md | ✅ |
| Copilot 智能助手（可配置 LLM） | ✅ |
| 暗黑/明亮模式、移动端优先布局 | ✅ |
| **营销落地页** — 公开根路由 `/[locale]`，三语，SEO/AIO(hreflang+JSON-LD)、GA4(同意后加载)、Cookie 合规 | ✅ |
| **补贴/扶持资金匹配** — `/funding`，按行业/阶段/需求匹配 France 2030/Bpifrance/CIR 等 | ✅ |
| **融资动向** — `/signals`，Google News 解析+注册库校验出刚融资公司（强购买信号），并入买家意向 | ✅ |
| **落地合规清单** — `/compliance`，按行业法律形式/税务/雇佣/认证/GDPR + 官方链接，中英双语，一键导出 PDF | ✅ |
| **关注列表 / 轻量 CRM** — `/watchlist`，收藏企业/招标/机会，看板按阶段(潜在→赢单)管理 | ✅ |
| **管理后台** — `/[locale]/admin`(ADMIN)，用户/事件流/留资 + GA 入口 | ✅ |
| **留资闭环** — 增值服务内嵌留资表单 → `Lead` 表 + 后台 + 邮件通知（蜜罐+限流防刷） | ✅ |
| **每日机会邮件** — 订阅关键词 → 每日「法国机会雷达」邮件（cron 触发） | ✅ |
| **Stripe 真实订阅** — Professional €99 / Business €299，结账/门户/Webhook，**Live 已激活** | ✅ |
| **找回密码** — 自助重置（令牌单次/1h 过期）+ 邮件 | ✅ |
| **事务邮件（Resend）** — 发信域名 `send.ayacloud.fr` 已验证 | ✅ |

> 15 个核心模块 + 变现/留存/合规/营销全链路已上线。后续可选：注册画像个性化、团队账号/白标、招聘信号(France Travail)、报告 RAG+引用。详见 [ROADMAP.md](ROADMAP.md)。

## 本地运行

前置条件：Node 20+、Docker Desktop（需先启动）。

### 一键启动（推荐）

脚本会自动完成：环境检查 → 启动数据库 → 安装依赖（首次）→ Prisma 建表/种子 → 启动开发服务器。可重复运行（幂等）。

- **Windows**：双击 `start.bat`，或在 PowerShell 执行 `./start.ps1`
- **macOS / Linux / Git Bash**：`./start.sh`

停止：Windows 用 `./stop.ps1`；其它平台 `docker compose down`。

### 手动方式

```bash
npm install
npm run setup        # = docker compose up + prisma generate + db push + seed
npm run dev          # http://localhost:3000
```

演示账号登录：**demo@france-os.com** / **demo1234**

## 数据源接入状态

> 完整的接口清单、免费/密钥、速率限制、许可证与**商用限制**见 [DATA_SOURCES.md](DATA_SOURCES.md)。


| 数据源 | 模块 | 状态 |
|--------|------|------|
| recherche-entreprises（data.gouv.fr） | 企业(M3) / 信用(M12) | ✅ **免密钥实时** — 真实身份、营业额、净利润、高管、增值税号 |
| BOAMP | 招标(M5) | ✅ **免密钥实时** — 法国公共招标 |
| TED（欧盟招标 v3） | 招标(M5) | ✅ **免密钥实时** — 欧盟范围招标，招标页可切换 BOAMP/TED |
| BODACC（法定公告） | 信用(M12) | ✅ **免密钥实时** — 法律事件/破产程序，驱动「法律风险」评分 |
| Google News RSS | 新闻雷达(M15) | ✅ **免密钥实时** — 法国商业新闻，按信号分类 + 机会评分 |
| Pappers | 企业财务 | 🔑 已接客户端，填 `PAPPERS_API_KEY` 启用，否则回退 recherche-entreprises |
| INPI RNE | 企业 | 🔑 已接客户端，填 `INPI_USERNAME/PASSWORD` 启用 |
| EUIPO 商标 | 品牌(M4) | 🔑 已接客户端，填 `EUIPO_CLIENT_ID/SECRET` 启用，否则回退 mock |

> 信用评分的「财务健康」维度由 data.gouv.fr 真实财务驱动（`● live` 标记）；「法律风险」维度由 BODACC 真实法律事件驱动，并列出近期公告。其余维度（付款风险/供应商可靠性/成长）仍为占位评分。
> 新闻雷达为 Google News RSS 实时抓取并做信号分类，源不可达时回退到内置示例。
> 市场(M1) 仍为示意数据，尚未接真实统计源。

## 配置

见 `.env`，关键变量：

- `DATABASE_URL` — Postgres，端口 5436
- `RECHERCHE_ENTREPRISES_API`、`BOAMP_API`、`TED_API` — 免密钥公共端点。

#### 变现 / 邮件 / 分析 / 定时（运行时读取，改完 `pm2 restart` 即可，无需 build）

| 变量 | 用途 |
|------|------|
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRICE_PROFESSIONAL` / `STRIPE_PRICE_BUSINESS` | Stripe 订阅（未配则设置页显示「未开通在线支付」） |
| `RESEND_API_KEY` / `RESEND_FROM` | 事务邮件（找回密码、留资/注册通知、每日摘要）；`RESEND_FROM="FranceGo <noreply@send.ayacloud.fr>"` |
| `ADMIN_EMAIL` | 留资/注册通知收件人（默认 `fdcaptain@gmail.com`） |
| `CRON_SECRET` | 保护 `/api/cron/digest` 的密钥；外部调度每天调用一次 |
| `NEWS_REVALIDATE_SECONDS` | 新闻抓取缓存秒数（默认 43200=12h；设 86400 改为一天一拉） |
| `PARTNER_*` / `NEXT_PUBLIC_PARTNER_*` | 增值服务合作伙伴链接 |

> ⚠️ **构建时注入**（改了要重新 `npm run build`，不是只 restart）：`NEXT_PUBLIC_APP_URL`、`NEXT_PUBLIC_GA_ID`（GA4，默认已内置 `G-DR6YV2QTQN`）。

### AI 引擎（可配置多 provider）

通过 `AI_PROVIDER` 选择大模型后端，无需改代码；不可达或未配置时自动回退 mock：

| provider | 说明 | 需要 |
|----------|------|------|
| `ollama` | **默认**，本地模型（OpenAI 兼容） | `OLLAMA_MODEL`（先 `ollama pull`） |
| `deepseek` | DeepSeek 在线 | `DEEPSEEK_API_KEY` |
| `openai` | OpenAI 在线 | `OPENAI_API_KEY` |
| `qwen` | 通义千问（DashScope 兼容模式） | `QWEN_API_KEY` |
| `claude` | Anthropic Claude | `ANTHROPIC_API_KEY` |

- `AI_MOCK=true` 可强制全程 mock（无需任何模型）。
- 当前生效的 provider/模型会显示在**设置页**（顶部「AI 引擎」卡片；绿色=已生效，黄色=mock/未配置）。
- 默认 `OLLAMA_MODEL=qwen2.5:latest`（本机已检测到该模型并实测通过）。

#### 如何切换 / 更新大模型

> 目前通过编辑根目录的 `.env` 切换，**改完需重启**生效（设置页只显示、不可改）。

**步骤**
1. 打开根目录 `.env`，找到 `# ===== AI / LLM =====` 段；
2. 设 `AI_MOCK="false"`，把 `AI_PROVIDER` 改成下表的值；
3. 填上对应的 `*_API_KEY`（在线模型）；可选地用 `*_MODEL` 指定具体模型版本；
4. **重启**：双击 `start.bat`（或先 `./stop.ps1` 再 `start.bat`）；
5. 打开**设置页**确认「AI 引擎」显示为目标 provider 且为绿色。

| 想用 | `AI_PROVIDER` | 必填 | 可选模型变量（默认值） |
|------|---------------|------|------------------------|
| 本地 Ollama | `ollama` | 无 key，先 `ollama pull <model>` | `OLLAMA_MODEL`（`qwen2.5:latest`） |
| DeepSeek | `deepseek` | `DEEPSEEK_API_KEY` | `DEEPSEEK_MODEL`（`deepseek-chat`） |
| OpenAI | `openai` | `OPENAI_API_KEY` | `OPENAI_MODEL`（`gpt-4o-mini`） |
| 通义千问 | `qwen` | `QWEN_API_KEY` | `QWEN_MODEL`（`qwen-plus`） |
| Claude | `claude` | `ANTHROPIC_API_KEY` | `CLAUDE_MODEL`（`claude-opus-4-8`） |

**示例：切到 DeepSeek 在线**
```env
AI_MOCK="false"
AI_PROVIDER="deepseek"
DEEPSEEK_API_KEY="sk-你的key"
# DEEPSEEK_MODEL="deepseek-chat"   # 如需指定其它版本
```

**更新模型版本**：只改对应的 `*_MODEL`（如 `OPENAI_MODEL="gpt-4o"`），重启即可。
**注意**：任一 provider 若 key 错误或服务不可达，会**自动回退 mock**，不会崩溃。
影响范围：Copilot 对话、市场进入报告编排、报告中心生成、各处 AI 摘要、**新闻/动态流标题翻译**。
> **省 token**：标题翻译走持久化 DB 缓存（`lib/translation-cache.ts` + `Translation` 表，按 sha1(目标语+原文) 永久存储）——同一标题只翻一次，跨用户/刷新复用，不重复消耗 token。

## 目录结构

```
src/
  app/[locale]/page.tsx   公开营销落地页（SEO/AIO + GA + Cookie 同意）
  app/[locale]/(auth)/    登录、注册、忘记/重置密码
  app/[locale]/(app)/     认证后的外壳 + 各模块页面（含 watchlist/funding/signals/compliance/admin）
  app/api/                各模块 + stripe(checkout/portal/webhook) + leads/saved/aides/signals/cron/digest
  app/actions/            服务端动作（auth、admin、digest）
  components/             ui/、shell/、dashboard/、landing/、saved/、signals/、funding/、compliance/、admin/、settings/、services/
  lib/                    auth、prisma、配额、套餐、ai、stripe、notify、events、digest、dashboard-metrics、translation-cache、sources/、data/
  i18n/ + messages/       next-intl 配置 + en/fr/zh
prisma/                   数据库结构（User/Session/Lead/Event/SavedItem/PasswordResetToken/Translation…）+ 种子
```

## 故障排查

- **`EINVAL: invalid argument, readlink ...\.next\...`**：项目位于 OneDrive 同步目录时，OneDrive 的占位文件机制会让 Next(webpack) 的 `readlink` 报错。
  本项目的 `npm run dev` 已默认改用 **Turbopack**（`next dev --turbopack`）规避此问题。若仍需 webpack 版可用 `npm run dev:webpack`，或将项目移出 OneDrive 目录。
- **`EPERM ... rename query_engine...`（prisma generate）**：通常是已有 dev 进程占用了引擎 DLL。`start.ps1` 会先释放 3000 端口；或先运行 `./stop.ps1` 再启动。

## VPS 部署（下一阶段）

平台目标环境为 VPS + PostgreSQL + CloudPanel，详见 `DEPLOYMENT.md`。
