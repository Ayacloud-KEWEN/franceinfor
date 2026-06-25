#!/usr/bin/env bash
# France Business Development OS — 一键本地启动 (macOS / Linux / Git Bash)
set -euo pipefail
cd "$(dirname "$0")"

cyan(){ printf '\n\033[36m==> %s\033[0m\n' "$1"; }
ok(){   printf '\033[32m    %s\033[0m\n' "$1"; }
warn(){ printf '\033[33m    %s\033[0m\n' "$1"; }
fail(){ printf '\n\033[31m[X] %s\033[0m\n' "$1"; exit 1; }

echo "France Business Development OS — 本地启动"

cyan "检查运行环境"
command -v node >/dev/null 2>&1 || fail "未找到 Node.js，请先安装 Node 20+。"
ok "Node $(node -v)"
command -v docker >/dev/null 2>&1 || fail "未找到 Docker，请先安装并启动 Docker Desktop。"
docker info >/dev/null 2>&1 || fail "Docker 未运行，请先启动 Docker Desktop。"
ok "Docker 已就绪"

[ -f .env ] || { [ -f .env.example ] && cp .env.example .env && ok "已从 .env.example 生成 .env"; }

cyan "安装依赖 (首次较慢)"
if [ ! -d node_modules ]; then npm install; else ok "node_modules 已存在，跳过"; fi

cyan "启动 Postgres(5436) + Redis(6380)"
docker compose up -d

cyan "等待 Postgres 就绪"
ready=false
for _ in $(seq 1 30); do
  h="$(docker inspect --format '{{.State.Health.Status}}' france_os_postgres 2>/dev/null || echo '')"
  [ "$h" = "healthy" ] && { ready=true; break; }
  sleep 2
done
[ "$ready" = true ] || fail "Postgres 未在 60s 内就绪。"
ok "Postgres healthy"

cyan "初始化数据库 (Prisma)"
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts || warn "种子脚本失败（可能已存在），继续。"
ok "数据库已就绪 · 演示账号 demo@france-os.com / demo1234"

cyan "启动开发服务器 http://localhost:3000"
warn "按 Ctrl+C 停止；数据库容器会继续后台运行 (停止用: docker compose down)。"
npm run dev
