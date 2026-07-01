# 部署指南 — CloudPanel VPS（实战版）

**线上地址：https://francego.fr**
本指南记录本项目在 **CloudPanel VPS（与其他站点共存）** 的完整部署流程，以及实战中踩过的坑。
方案：复用现有 PostgreSQL（独立库，带 pgvector）· 在线大模型 + API Key · Git 拉取 + **手动部署**（`npm run deploy`）。

> 当前生产环境概况：
> - 站点目录 `/home/france-infor/htdocs/infr.europeanaialliance.org`，以 **root** 运行（PM2）
> - PM2 进程 `france-os`（id 因重建会变），监听 **3011**（CloudPanel 反代 443 → 3011）
> - PostgreSQL 独立库 `france_os`，独立用户 `france_os`，**已装 pgvector 扩展**
> - **部署方式：手动 `npm run deploy`**（GitHub Actions 自动部署已于 2026-07 移除，见 §10）
> - ⚠️ 这是一台多站点共享机，2026-07 曾遭挖矿木马入侵（SSH root 爆破入口），已加固；安全基线见 §13。

---

## 0. 前提
- VPS 已装 **Node.js 20+**（本项目用 22）、**PM2**（`npm i -g pm2`）、**PostgreSQL 16**、**Git**。
- **pgvector 扩展**（L2 语义检索用；不装会导致 `prisma db push` 全部失败）：
  ```bash
  sudo apt install -y postgresql-16-pgvector          # 版本号对应你的 pg
  sudo -u postgres psql -d france_os -c "CREATE EXTENSION IF NOT EXISTS vector;"
  ```
  > ⚠️ **坑（实战）**：漏装 pgvector 时，`prisma db push` 会在 `CREATE EXTENSION vector` 处直接报 `extension "vector" is not available` 并**中止整个 push** → 之后所有 schema 变更（新表/新列）都没建，页面查这些表就 500。
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
- `PORT="3011"`、`NEXT_PUBLIC_APP_URL="https://francego.fr"`

### 功能性变量（按需启用；运行时读取，改完 `pm2 restart` 即可，无需 build）
```env
# Stripe 订阅（未配则设置页显示「未开通在线支付」）
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."          # Webhook 指向 /api/stripe/webhook
STRIPE_PRICE_PROFESSIONAL="price_..."      # Live 价格
STRIPE_PRICE_BUSINESS="price_..."
# 邮件（找回密码 / 留资·注册通知 / 每日摘要）—— Resend
RESEND_API_KEY="re_..."
RESEND_FROM="FranceGo <noreply@send.francego.fr>"   # 发信域名（需在 Resend 验证 send.francego.fr）
ADMIN_EMAIL="wenke2012@gmail.com"          # 留资/注册通知收件人（默认 fdcaptain@gmail.com）
# 每日机会邮件 cron 密钥
CRON_SECRET="<openssl rand -hex 16>"
# 新闻抓取频率（默认 12h；一天一拉填 86400）
NEWS_REVALIDATE_SECONDS="43200"
```
> ⚠️ **构建时注入**（改了必须重新 `npm run build`，不是只 restart）：`NEXT_PUBLIC_APP_URL`、`NEXT_PUBLIC_GA_ID`（GA4，默认已内置 `G-DR6YV2QTQN`，要换才需设）。自动部署会重新 build，所以改这些 push 一次即可。

### 每日知识刷新 + 机会邮件定时（设完 `CRON_SECRET` 后）
仓库已带脚本 `scripts/daily-cron.sh`，按顺序打 `ingest → index → extract → digest` 四个 cron 端点（用 Node 的全局 fetch，不依赖 curl/wget，自动从 `.env` 读 `CRON_SECRET`）。
`sudo crontab -e` 加一行（每天 06:00）：
```cron
0 6 * * * /home/france-infor/htdocs/infr.europeanaialliance.org/scripts/daily-cron.sh >> /var/log/francego-cron.log 2>&1
```
> - 每日摘要邮件按用户界面语言发送（标题+章节标签本地化、新闻/招标标题翻译），HTML 版式；需 `RESEND_API_KEY` + 已验证发信域。
> - 手动触发单个端点：`node -e "fetch('https://francego.fr/api/cron/digest?key='+process.env.KEY).then(r=>r.text()).then(console.log)"`（先 `export KEY=$(grep -E '^CRON_SECRET=' .env | cut -d= -f2-)`）。
> - 知识图谱抽取只需配置了对话模型（如 DeepSeek）即可跑；`index` 的高质量向量需 `OPENAI_API_KEY` + `EMBED_PROVIDER=openai`，否则用本地兜底向量。

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
CloudPanel 站点 → SSL/TLS → Let's Encrypt → 签发对应域名。

## 8b. 域名迁移到 francego.fr（实操记录）
主域已从 `infr.europeanaialliance.org` 迁到 **`francego.fr`**（DNS 在 **Cloudflare**，灰云 DNS-only）。**应用、pm2 进程、站点目录都不变**——只是多挂一个域名指向同一个 app（`127.0.0.1:3011`）。
1. **Cloudflare DNS**：`A @ → 51.210.7.13`、`A www → 51.210.7.13`，**灰云**（Proxied 关）；删除任何指向 OVH 停放 `213.186.33.5` 的旧记录；OVH 注册商 NS 已切到 Cloudflare（`dig NS francego.fr` 确认）。
   > 踩坑：CloudPanel 反代站点**不能在「Domains」加多域名** → 给 francego.fr **单独新建一个 Reverse Proxy 站点**（Add Site → Create a Reverse Proxy，URL `http://127.0.0.1:3011`），再签 SSL。SSL 报 `unauthorized / 213.186.33.5 ... Site en construction` = DNS 还指着 OVH 停放，没指向 VPS。
2. **应用 URL**：服务器 `.env` 设 `NEXT_PUBLIC_APP_URL="https://francego.fr"` → 因是构建时注入，须 `npm run build && pm2 reload france-os`（或 push 触发自动部署）。
3. **Stripe**：Webhook URL 改 `https://francego.fr/api/stripe/webhook`。
4. **Resend**：在 Resend 验证 `send.francego.fr`（DNS 记录加到 Cloudflare）→ `.env` 改 `RESEND_FROM="FranceGo <noreply@send.francego.fr>"` → `pm2 restart`。
5. **旧域名 301**：编辑旧站点 Vhost，把 `location / { proxy_pass ... }` 换成 `location / { return 301 https://francego.fr$request_uri; }`。
6. **cron**：把每日摘要 crontab 的 URL 改成 francego.fr。

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

## 10. 部署方式：手动 `npm run deploy`（当前）

> **变更（2026-07）**：原 GitHub Actions 自动部署（`.github/workflows/deploy.yml`）**已删除**。原因：服务器 pgvector 缺失导致 workflow 里的 `prisma db push` 每次失败（`set -e` 中止），且服务器发生过安全事件——改为手动部署更可控。

服务器上更新上线：
```bash
cd /home/france-infor/htdocs/infr.europeanaialliance.org
npm run deploy      # = git pull && npm ci && prisma db push && npm run build && pm2 reload ecosystem.config.cjs
```
分步（排错时）：
```bash
git pull
npm ci
npx prisma db push          # 需 pgvector 已装（见 §0）
npm run build               # 要看到 ✓ Compiled successfully
pm2 restart france-os --update-env
pm2 save
```
> - 改了 `.env` 的**运行时**变量（`AI_PROVIDER`/key、`RESEND_*`、`CRON_SECRET` 等）：`pm2 restart france-os --update-env` 即可，无需 build。
> - 改了 `NEXT_PUBLIC_*`（构建时注入）或 `src/messages/*.json`（三语文案）：**必须重新 `npm run build`** 才生效。

### ⚠️ 坑：端口 3011 被占用导致崩溃循环（EADDRINUSE，多次踩到）
`pm2 restart` 时若旧进程没干净退出、僵尸进程仍占着 3011，新实例会 `Error: listen EADDRINUSE :::3011` → 反复重启（`pm2 ls` 显示 `errored`、`↺` 飙升），而站点仍被旧僵尸进程（旧构建）顶着 → 表现为"改了代码/文案不生效"。**干净重启**：
```bash
pm2 delete france-os
sudo fuser -k 3011/tcp 2>/dev/null; sleep 2
sudo fuser 3011/tcp 2>/dev/null && echo "还占用" || echo "端口已空"
rm -rf .next && npm run build            # 确保新构建
pm2 start ecosystem.config.cjs --only france-os
pm2 save
pm2 ls                                   # france-os 应为 online、↺ 不再涨
```
> 判断是不是踩了这个坑：`pm2 ls` 看 france-os 是否 `errored`；`pm2 logs france-os --lines 30 --nostream` 有没有 `EADDRINUSE`。

### 被入侵后已撤销的旧部署密钥（历史）
原自动部署用过两把 key：`~/.ssh/gh_actions`（GitHub→VPS）、`~/.ssh/github_deploy`（VPS→GitHub deploy key）。2026-07 服务器遭 root 级入侵后，**这两把及 `~/.ssh/id_ed25519` 均视为泄露、已在 GitHub 撤销**。若将来恢复自动部署，需重新生成并只授只读 deploy key。

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

---

## 13. 安全加固与事件记录（2026-07）

### 发生了什么
这台多站点共享机遭 **XMRig 挖矿木马**入侵：入口是 **SSH `root` 密码爆破**（`PermitRootLogin yes` + `PasswordAuthentication yes`），攻击者植入 root 授权公钥做持久化，并用伪装成 `kworker/R-slub_` 的 `/tmp/sh` 看门狗反复重投矿机（`/6mW0g`、`/hKCysr`，矿池 `91.208.184.203` 等）。已清除矿机+看门狗、删除攻击者公钥。

### 已做的加固
- **SSH**：`/etc/ssh/sshd_config.d/99-lockdown.conf` 设 `PermitRootLogin no` + `AllowUsers ubuntu`（+ 目标 `PasswordAuthentication no`，改密钥登录后启用）。日常用 `ubuntu`（有 `NOPASSWD:ALL` sudo）登录再提权，**不再直接 root SSH**。
- **矿机看门狗**：`/usr/local/sbin/miner-watch.sh` + root cron 每 3 分钟——杀掉从 `/tmp`、`/dev/shm`、根目录随机名运行的进程并封矿池 IP，日志 `/var/log/miner-watch.log`。
- **fail2ban**：sshd jail 生效（已封数万次）。

### 新机/加固基线（务必遵守）
1. SSH **仅密钥登录**（`PasswordAuthentication no`）、`PermitRootLogin no`、`AllowUsers` 白名单、fail2ban。
2. 数据库/缓存只 `bind 127.0.0.1`（Redis 已是；核对 MySQL/PG/memcached 别暴露公网——挖矿常见入口）。
3. **应用别用 root 跑**（当前 pm2 以 root 运行，属技术债；新机用专用非特权用户）。
4. CloudPanel 自管防火墙——**别盲目 `ufw enable`**，会打挂其它站点。
5. 一旦怀疑入侵：`.env` 里所有密钥（Stripe/Resend/DeepSeek/DB/`CRON_SECRET`）与 SSH/部署 key **全部视为泄露，逐一轮换**。
6. root 被控过的机器无法保证清干净——**长期正解是迁到干净机器 + 全量换密钥**（本机因托管多站点暂缓，处于加固后"带病运行"状态）。
