# France Business Development OS — 一键本地启动 (Windows / PowerShell)
# 用法：双击 start.bat，或在终端执行 ./start.ps1
$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Ok($msg)   { Write-Host "    $msg" -ForegroundColor Green }
function Warn($msg) { Write-Host "    $msg" -ForegroundColor Yellow }
function Fail($msg) { Write-Host "`n[X] $msg" -ForegroundColor Red; exit 1 }

Write-Host "France Business Development OS - 本地启动" -ForegroundColor Magenta

# 1) 环境检查
Step "检查运行环境"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Fail "未找到 Node.js，请先安装 Node 20+。" }
Ok "Node $(node -v)"
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { Fail "未找到 Docker，请先安装并启动 Docker Desktop。" }
try { docker info *> $null } catch { Fail "Docker 未运行，请先启动 Docker Desktop。" }
Ok "Docker 已就绪"

# 2) .env
if (-not (Test-Path ".env")) {
  if (Test-Path ".env.example") { Copy-Item ".env.example" ".env"; Ok "已从 .env.example 生成 .env" }
  else { Warn ".env 缺失且无 .env.example，可能导致连接失败。" }
}

# 3) 释放 3000 端口（停掉已在运行的 dev，同时解除对 Prisma 引擎的文件锁）
Step "检查 3000 端口"
$conn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($conn) {
  Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 1
  Ok "已停止占用 3000 的旧进程"
} else { Ok "3000 端口空闲" }

# 4) 依赖
Step "安装依赖 (首次较慢)"
if (-not (Test-Path "node_modules")) { npm install; if ($LASTEXITCODE -ne 0) { Fail "npm install 失败。" } }
else { Ok "node_modules 已存在，跳过" }

# 5) 数据库容器
Step "启动 Postgres(5436) + Redis(6380)"
docker compose up -d
if ($LASTEXITCODE -ne 0) { Fail "docker compose 启动失败。" }

Step "等待 Postgres 就绪"
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
  try { $h = (docker inspect --format '{{.State.Health.Status}}' france_os_postgres 2>$null) } catch { $h = '' }
  if ($h -eq 'healthy') { $ready = $true; break }
  Start-Sleep -Seconds 2
}
if (-not $ready) { Fail "Postgres 未在 60s 内就绪，请检查 docker compose 日志。" }
Ok "Postgres healthy"

# 6) Prisma：客户端已存在则跳过 generate；generate/push 失败不致命（带重试）
Step "初始化数据库 (Prisma)"
if (Test-Path "node_modules/.prisma/client/index.js") {
  Ok "Prisma client 已存在，跳过 generate"
} else {
  $gen = $false
  for ($i = 1; $i -le 3; $i++) {
    npx prisma generate
    if ($LASTEXITCODE -eq 0) { $gen = $true; break }
    Warn "prisma generate 第 $i 次失败（可能被文件占用/OneDrive 同步），2s 后重试..."
    Start-Sleep -Seconds 2
  }
  if (-not $gen) { Warn "prisma generate 仍失败；若应用能正常启动可忽略，否则请关闭占用进程后重试。" }
}

npx prisma db push
if ($LASTEXITCODE -ne 0) { Warn "prisma db push 失败（表可能已存在），继续。" }

npx tsx prisma/seed.ts
if ($LASTEXITCODE -ne 0) { Warn "种子脚本失败（演示用户可能已存在），继续。" }
Ok "数据库已就绪 · 演示账号 demo@france-os.com / demo1234"

# 7) 启动 dev
Step "启动开发服务器 http://localhost:3000"
Write-Host "    按 Ctrl+C 停止。数据库容器会继续后台运行 (停止用 ./stop.ps1)。`n" -ForegroundColor Yellow
npm run dev
