# 部署指南 — CloudPanel VPS

目标域名：**infr.europeanaialliance.org**
服务器：CloudPanel（**上面已有其他站点**）。本指南全程**独立隔离**——独立站点、独立端口、独立数据库、独立 PM2 进程，**不影响现有网站**。

方案：复用服务器现有 PostgreSQL（新建专用库）· 在线大模型 + API Key · Git 拉取部署。

---

## 0. 前提

- 服务器已装 **Node.js 20+**（CloudPanel 站点可指定 Node 版本，或系统全局安装）。
- 服务器已运行 **PostgreSQL**（本指南复用它）。
- 已装 **PM2**（没有就 `npm i -g pm2`）。
- 代码已推到一个 Git 仓库（GitHub/GitLab，私有即可）。
  - ⚠️ 确认仓库**不含 `.env`**（已在 `.gitignore` 里，本地密钥不会上传）。

---

## 1. DNS

在 `europeanaialliance.org` 的 DNS 后台加一条记录，指向 VPS 公网 IP：

```
类型 A    主机 infr    值 <你的VPS_IP>
```

等解析生效（`ping infr.europeanaialliance.org` 能解析到 VPS IP）。

---

## 2. CloudPanel 建站（Node.js 站点）

CloudPanel 面板 → **+ Add Site** → **Create a Node.js Site**：

- **Domain name**：`infr.europeanaialliance.org`
- **Node.js version**：20（或更高）
- **App Port**：`3001` ← 记住这个端口，必须和 `ecosystem.config.cjs` 一致
  - 先确认 3001 没被其他站点占用：`ss -ltnp | grep 3001`（无输出即空闲；被占用就换 3002 等，并同步改 `ecosystem.config.cjs` 和 `.env` 的 `PORT`）。
- 创建后 CloudPanel 会自动生成 Nginx 反向代理（80/443 → 3001）和一个**站点专属 SSH 用户**。

> CloudPanel 的 Node 站点模板已经把反代配好，你**不用手改 Nginx**。

---

## 3. 数据库（在现有 Postgres 上建独立库）

SSH 进服务器，用 postgres 超级用户建**专用库和用户**（不要复用其他站点的库）：

```bash
sudo -u postgres psql
```
```sql
CREATE USER france_os WITH PASSWORD '换成强密码';
CREATE DATABASE france_os OWNER france_os;
\q
```

记下连接串（端口用你 Postgres 实际端口，默认 5432）：
```
postgresql://france_os:换成强密码@127.0.0.1:5432/france_os?schema=public
```

---

## 4. 拉取代码

用**站点 SSH 用户**登录，进站点根目录（CloudPanel 站点目录通常是
`/home/<站点用户>/htdocs/infr.europeanaialliance.org/`）：

```bash
cd /home/<站点用户>/htdocs/infr.europeanaialliance.org
# 仓库克隆到当前目录（注意末尾的点）
git clone <你的仓库地址> .
```

---

## 5. 配置 `.env`

用模板生成生产 `.env`：

```bash
cp .env.production.example .env
nano .env
```

至少填这几项：
- `DATABASE_URL` → 第 3 步的连接串
- `SESSION_SECRET` → `openssl rand -hex 32` 生成的随机串
- `AI_PROVIDER` + 对应的 `*_API_KEY`（如 `deepseek` + `DEEPSEEK_API_KEY`）
- `PORT="3001"`（与建站端口一致）
- `NEXT_PUBLIC_APP_URL="https://infr.europeanaialliance.org"`

---

## 6. 安装依赖 · 建表 · 构建

```bash
npm ci                 # 安装依赖（postinstall 会自动 prisma generate）
npx prisma db push     # 在专用库里创建表结构
npx tsx prisma/seed.ts # 可选：建演示/管理员账号 demo@france-os.com / demo1234
npm run build          # 生产构建（Linux 上不会有 OneDrive 那个 EINVAL 问题）
```

> 上线后建议立刻改掉或删除演示账号密码。

---

## 7. 用 PM2 启动 + 开机自启

```bash
pm2 start ecosystem.config.cjs   # 启动 france-os 进程（端口 3001）
pm2 save                         # 保存进程列表
pm2 startup                      # 按提示执行它打印的那条命令，实现重启自启
```

检查：
```bash
pm2 status
curl -I http://127.0.0.1:3001/en/login   # 期望 200
```

---

## 8. SSL（HTTPS）

CloudPanel 站点 → **SSL/TLS** → **Let's Encrypt** → 为 `infr.europeanaialliance.org` 签发证书。
签发后访问 `https://infr.europeanaialliance.org` 应自动跳转 HTTPS。

> 应用的会话 Cookie 在生产下是 `Secure`，必须走 HTTPS（CloudPanel 已配好，无需额外处理）。

---

## 9. 验证

浏览器打开 `https://infr.europeanaialliance.org` →
- 跳转到登录页；用演示账号登录；
- Dashboard、企业搜索（实时 data.gouv.fr）、招标（BOAMP/TED）、新闻、市场（Eurostat）应正常；
- 设置页「AI 引擎」显示你配的在线 provider（绿色徽标）。

---

## 10. 后续更新（一条命令）

代码有更新时，在站点目录执行：

```bash
npm run deploy
# = git pull && npm ci && prisma db push && npm run build && pm2 reload ecosystem.config.cjs
```

`pm2 reload` 是**零停机**重启。

---

## 11. 与其他站点的隔离要点 / 排错

- **端口**：本应用只占 `3001`（或你改的端口），不碰其他站点。冲突就换端口并同步 3 处（建站、`ecosystem.config.cjs`、`.env`）。
- **数据库**：独立库 `france_os` + 独立用户，和其他站点互不影响。
- **进程**：PM2 里独立的 `france-os`，`pm2 restart france-os` 只重启本应用。
- **反代 502**：多半是 Node 进程没起来 → `pm2 logs france-os` 看日志；确认 `.env` 的 `PORT` 和建站端口、`ecosystem.config.cjs` 三者一致。
- **数据库连不上**：核对 `DATABASE_URL` 的端口/密码；`psql` 手动连一下验证。
- **AI 不工作**：key 错或不可达会自动回退 mock（不会崩）；`pm2 logs` 里会有 `[ai] ... falling back to mock`。
- **内存**：`ecosystem.config.cjs` 设了 `max_memory_restart: 600M`，超了自动重启，避免拖垮服务器。

---

## 监控（可选，按需）

规格书要求 GlitchTip + Umami：
- **GlitchTip**（Sentry 兼容）：加 `@sentry/nextjs`，DSN 指向你的 GlitchTip 实例。
- **Umami**：自托管后把统计脚本加到 `src/app/[locale]/layout.tsx`。

## CI/CD（可选，下一步）

GitHub Actions：install → lint → `prisma generate` → `next build`，然后 SSH 到服务器执行 `npm run deploy`。需要的话我可以补一个 workflow 文件。
