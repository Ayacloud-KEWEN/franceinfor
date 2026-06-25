# 停止本地环境 (Windows / PowerShell)
$ErrorActionPreference = 'SilentlyContinue'
Set-Location -Path $PSScriptRoot

Write-Host "==> 停止数据库容器 (Postgres / Redis)" -ForegroundColor Cyan
docker compose down

# 关闭占用 3000 端口的 dev 进程（如仍在运行）
$c = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($c) {
  Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
  Write-Host "==> 已停止 3000 端口的开发服务器" -ForegroundColor Cyan
}
Write-Host "完成。数据已保留在 Docker 卷中，下次启动自动复用。" -ForegroundColor Green
