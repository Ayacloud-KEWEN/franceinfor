# 部署指南 — CloudPanel VPS（实战版）

**线上地址：https://infr.europeanaialliance.org**
本指南记录本项目在 **CloudPanel VPS（与其他站点共存）** 的完整部署流程，以及实战中踩过的坑。
方案：复用现有 PostgreSQL（独立库）· 在线大模型 + API Key · Git 拉取 + GitHub Actions 自动部署。

> 当前生产环境概况：
> - 站点目录 `/home/france-infor/htdocs/infr.europeanaialliance.org`，以 **root** 运行
> - PM2 进程 `france-os`，监听 **3011**（CloudPanel 反代 443 → 3011）
> - PostgreSQL 独立库 `france_os`，独立用户 `france_os`
> - 推送到 `main` 自动部署

---

## 0. 前提
- VPS 已装 **Node.js 20+**（本项目用 22）、**PM2**（`npm i -g pm2`）、**PostgreSQL**、**Git**。
- 代码仓库：`https://github.com/Ayacloud-KEWEN/franceinfor`（可私有）。
- 确认仓库不含真实 `.env`（已在 `.gitignore`）。

---

## 1. DNS
DNS 加 A 记录：`infr` → VPS 的**公网 IPv4**。等解析生效后再签证书。

## 2. CloudPanel 建站
**+ Add Site → Create a Node.js Site**：
- Domain：`infr.europeanaialliance.org`
- Node version：20+
- **App Port：3011**（先 `ss -ltnp | grep 3011` 确认空闲；要换端口则同步改 `ecosystem.config.cjs` 和 `.env` 的 `PORT`）

CloudPanel 自动生成 Nginx 反代（443/80 → 3011）和站点 SSH 用户 `france-infor`。

## 3. 数据库（现有 Postgres 上建独立库）
```bash
sudo -u postgres psql
```
```sql
CREATE USER france_os WITH PASSWORD '你的强密码';
CREATE DATABASE france_os OWNER france_os;
\q
```

> ⚠️ **坑 1：密码里的 `$` 必须在连接串里转义。** Next 的环境变量加载器（@next/env，基于 dotenv-expand）会把 `.env` 里的 `$xxx` 当变量展开。
> 所以 `DATABASE_URL` 里要把密码的特殊字符**百分号编码**：`$` → `%24`、`@` → `%40` 等。
> 例：密码 `Fdcaptain$10138` → 连接串写 `postgresql://france_os:Fdcaptain%2410138@127.0.0.1:5432/france_os?schema=public`（数据库里存的还是原始密码，不用改）。

## 4. 拉代码
```bash
cd /home/france-infor/htdocs/infr.europeanaialliance.org
git clone https://github.com/Ayacloud-KEWEN/franceinfor.git .
```

> ⚠️ **坑 2：root 操作 france-infor 拥有的目录会触发 git「dubious ownership」。** 加例外（root 全局，自动部署也是 root，一次解决）：
> ```bash
> git config --global --add safe.directory /home/france-infor/htdocs/infr.europeanaialliance.org
> ```

## 5. 配置 .env
`cp .env.production.example .env`，至少填：
- `DATABASE_URL`（第 3 步，注意 `%24`）
- `SESSION_SECRET`（`openssl rand -hex 32`）
- `AI_PROVIDER` + 对应 `*_API_KEY`（在线模型；空着会自动回退 mock，不崩）
- `PORT="3011"`、`NEXT_PUBLIC_APP_URL="https://infr.europeanaialliance.org"`

### 功能性变量（按需启用；运行时读取，改完 `pm2 restart` 即可，无需 build）
```env
# Stripe 订阅（未配则设置页显示「未开通在线支付」）
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."          # Webhook 指向 /api/stripe/webhook
STRIPE_PRICE_PROFESSIONAL="price_..."      # Live 价格
STRIPE_PRICE_BUSINESS="price_..."
# 邮件（找回密码 / 留资·注册通知 / 每日摘要）—— Resend
RESEND_API_KEY="re_..."
RESEND_FROM="FranceGo <noreply@send.ayacloud.fr>"   # 发信域名已验证
ADMIN_EMAIL="wenke2012@gmail.com"          # 留资/注册通知收件人（默认 fdcaptain@gmail.com）
# 每日机会邮件 cron 密钥
CRON_SECRET="<openssl rand -hex 16>"
# 新闻抓取频率（默认 12h；一天一拉填 86400）
NEWS_REVALIDATE_SECONDS="43200"
```
> ⚠️ **构建时注入**（改了必须重新 `npm run build`，不是只 restart）：`NEXT_PUBLIC_APP_URL`、`NEXT_PUBLIC_GA_ID`（GA4，默认已内置 `G-DR6YV2QTQN`，要换才需设）。自动部署会重新 build，所以改这些 push 一次即可。

### 每日机会邮件定时（设完 `CRON_SECRET` 后）
`crontab -e` 加一行（每天 07:00 触发摘要）：
```cron
0 7 * * * curl -s "https://infr.europeanaialliance.org/api/cron/digest?key=<CRON_SECRET>" >/dev/null
```

## 6. 安装 / 建表 / 构建
```bash
node -v                   # 确认 ≥ 20
npm ci --include=dev      # --include=dev 确保 TS/Tailwind 等构建依赖被装；postinstall 自动 prisma generate
npx prisma db push        # 建表（Prisma 自动读 .env 的 DATABASE_URL）
npx tsx prisma/seed.ts    # 可选：建管理员账号（见下方安全提示）
npm run build             # 生产构建（Linux 无 OneDrive 那个 EINVAL 问题）
```

## 7. PM2 启动 + 自启
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup               # 执行它打印的命令
pm2 status
curl -I http://127.0.0.1:3011/en/login   # 期望 200
```

## 8. SSL
CloudPanel 站点 → SSL/TLS → Let's Encrypt → 签发 `infr.europeanaialliance.org`。

## 9. 安全收尾（重要）
`prisma/seed.ts` 会建一个**公开已知密码的演示管理员** `demo@france-os.com / demo1234`。上线后务必：
1. 在站点注册你自己的账号；
2. ```bash
   sudo -u postgres psql -d france_os
   ```
   ```sql
   UPDATE "User" SET role='ADMIN', plan='ENTERPRISE' WHERE email='你的邮箱';
   DELETE FROM "User" WHERE email='demo@france-os.com';
   \q
   ```

---

## 10. 自动部署（GitHub Actions，已配好）

推送到 `main` → GitHub 自动 SSH 到 VPS → `git pull` + 构建 + `pm2 reload`（零停机）。
工作流：`.github/workflows/deploy.yml`。

> ⚠️ **坑 3：不要用 `appleboy/ssh-action`。** 它内部的 drone-ssh 在本项目环境会**静默失败**（2 秒退出、无任何日志）。
> 改用**原生 ssh**（workflow 里直接 `ssh ... bash -s <<'REMOTE' ... REMOTE`），稳定可靠。

### 需要的两把 SSH 钥匙（别搞混）
| 用途 | 钥匙 | 公钥放哪 | 私钥放哪 |
|------|------|----------|----------|
| **GitHub → VPS**（Action 登录服务器） | `~/.ssh/gh_actions` | VPS 的 `~/.ssh/authorized_keys` | GitHub secret `SSH_PRIVATE_KEY` |
| **VPS → GitHub**（服务器拉私有仓库） | `~/.ssh/github_deploy` | 仓库 Settings → Deploy keys（只读） | VPS，`~/.ssh/config` 指定 |

### GitHub Secrets（仓库 Settings → Secrets and variables → Actions）
| Secret | 值 |
|--------|-----|
| `SSH_HOST` | VPS 公网 **IPv4**（⚠️ **坑 4**：GitHub 跑机走 IPv4，填 IPv6 连不上） |
| `SSH_USER` | `root` |
| `SSH_PRIVATE_KEY` | `cat ~/.ssh/gh_actions` 私钥**全文**（含 BEGIN/END 行、保留换行；别填成 `.pub` 或 `github_deploy`） |
| `SSH_PORT` | 非 22 端口才填 |

### 一次性配置命令（在 VPS 上，root）
```bash
# 1) GitHub→VPS 钥匙
ssh-keygen -t ed25519 -f ~/.ssh/gh_actions -N "" -C "github-actions"
cat ~/.ssh/gh_actions.pub >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys
cat ~/.ssh/gh_actions        # 私钥 → 填到 GitHub secret SSH_PRIVATE_KEY

# 2) VPS→GitHub deploy key（仓库私有时需要）
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N "" -C "vps-deploy"
cat >> ~/.ssh/config <<'EOF'

Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_deploy
  IdentitiesOnly yes
EOF
chmod 600 ~/.ssh/config
cat ~/.ssh/github_deploy.pub  # 公钥 → 仓库 Settings → Deploy keys（只读）

# 3) 远端切 SSH 并测试
cd /home/france-infor/htdocs/infr.europeanaialliance.org
git remote set-url origin git@github.com:Ayacloud-KEWEN/franceinfor.git
ssh -T git@github.com         # 输 yes；看到 "successfully authenticated" 即可
git pull
```

### 排查 SSH 连接（如 Action 连不上）
临时加一个手动工作流用 `ssh -vvv` 看真实原因（`KEY_INVALID`/`Permission denied`/`timed out`/`Could not resolve`），排查完删掉。本项目当时就是这样定位到「appleboy 有问题、原生 ssh 正常」的。

### 手动触发 / 更新
- 自动：`git push` 到 main。
- 手动：仓库 Actions → Deploy to VPS → Run workflow。
- 服务器手动：`npm run deploy`（= git pull && npm ci && prisma db push && build && pm2 reload）。

---

## 11. 常见排错
- **反代 502**：Node 没起来 → `pm2 logs france-os`；确认 `.env` 的 `PORT`、建站端口、`ecosystem.config.cjs` 三者一致（都是 3011）。
- **DB 连不上**：核对 `DATABASE_URL`（密码 `%24`、端口、用户）；`psql` 手动连验证。
- **构建 OOM/Killed**：VPS 内存偏小 → 加临时 swap：
  ```bash
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  ```
- **AI 不工作**：key 错/不可达会自动回退 mock；`pm2 logs` 里有 `[ai] ... falling back to mock`。
- **某模块服务器上没数据**：检查出站网络/防火墙（需能访问 recherche-entreprises / BOAMP / TED / Eurostat / Google News / data DILA）。

## 12. 监控（可选，规格书要求）
- **GlitchTip**（Sentry 兼容）：加 `@sentry/nextjs`，DSN 指向自托管实例。
- **Umami**：自托管后把统计脚本加进 `src/app/[locale]/layout.tsx`。
