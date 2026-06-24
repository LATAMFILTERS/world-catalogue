# ELIMFILTERS — Pull, Build & Serve
# Ejecutar desde la raiz del proyecto: .\update-and-serve.ps1

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$FRONTEND = Join-Path $ROOT "frontend"

Write-Host ""
Write-Host ">>> ELIMFILTERS World Catalogue" -ForegroundColor Yellow
Write-Host ">>> Pull + Build + Serve" -ForegroundColor Yellow
Write-Host ""

# 1. Descartar cambios locales en archivos generados
Write-Host "[1/4] Descartando cambios locales..." -ForegroundColor Cyan
Set-Location $ROOT
git checkout -- .

# 2. Pull
Write-Host "[2/4] Descargando cambios del servidor..." -ForegroundColor Cyan
git pull --no-rebase origin claude/dazzling-franklin-ALGY1

# 3. Build
Write-Host "[3/4] Construyendo..." -ForegroundColor Cyan
Set-Location $FRONTEND
npm run build

# 4. Serve
Write-Host "[4/4] Iniciando servidor en http://localhost:3000" -ForegroundColor Green
Write-Host "      Presiona Ctrl+C para detener." -ForegroundColor Gray
Write-Host ""
npx serve@latest -l 3000 out
