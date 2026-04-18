<#
.SYNOPSIS
  Scraper de cross-references desde airfilter-crossreference.com
  para todos los Air Filters / Cabin Air del catálogo ELIMFILTERS.

.DESCRIPTION
  Usa Puppeteer para navegar las páginas de cross-reference de cada
  código Donaldson y clasifica los resultados en:
    - OEM Codes       (fabricantes de equipo: CAT, Volvo, John Deere…)
    - Cross Ref Codes (marcas de filtros: Baldwin, Fleetguard, WIX…)

  Los propios códigos ELIMFILTERS (EA1, EC1…) se excluyen.

.PARAMETER Limit
  Número máximo de códigos a procesar (default: todos)

.PARAMETER Sku
  Código Donaldson específico para testear (ej: P527682)

.PARAMETER DryRun
  Si se especifica, NO actualiza la base de datos (solo muestra resultados)

.EXAMPLES
  # Correr sobre TODOS los Air Filters:
  .\scripts\scrape-airfilter-crossrefs.ps1

  # Solo los primeros 50:
  .\scripts\scrape-airfilter-crossrefs.ps1 -Limit 50

  # Testear un código específico:
  .\scripts\scrape-airfilter-crossrefs.ps1 -Sku P527682 -DryRun

  # Dry-run completo (sin tocar DB):
  .\scripts\scrape-airfilter-crossrefs.ps1 -DryRun
#>

param(
  [int]    $Limit  = 0,
  [string] $Sku    = "",
  [switch] $DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ─── Ubicación del proyecto ───────────────────────────────────────────────────
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host ""
Write-Host "=== AIRFILTER CROSS-REFERENCE SCRAPER ===" -ForegroundColor Cyan
Write-Host "Proyecto : $ProjectRoot"
Write-Host "Fecha    : $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host ""

# ─── Construir argumentos Node ────────────────────────────────────────────────
$NodeArgs = @("scripts\airfilter-crossref-scraper.js")

if ($Limit -gt 0) {
  $NodeArgs += "--limit"
  $NodeArgs += $Limit.ToString()
  Write-Host "Límite   : $Limit códigos" -ForegroundColor Yellow
}

if ($Sku -ne "") {
  $NodeArgs += "--sku"
  $NodeArgs += $Sku
  Write-Host "SKU      : $Sku" -ForegroundColor Yellow
}

if ($DryRun) {
  $NodeArgs += "--dry-run"
  Write-Host "Modo     : DRY-RUN (no modifica DB)" -ForegroundColor Yellow
} else {
  Write-Host "Modo     : PRODUCCION (actualiza DB)" -ForegroundColor Green
}

Write-Host ""

# ─── Ejecutar ─────────────────────────────────────────────────────────────────
$StartTime = Get-Date

try {
  node @NodeArgs
  $ExitCode = $LASTEXITCODE
} catch {
  Write-Host "ERROR al ejecutar node: $_" -ForegroundColor Red
  exit 1
}

$Elapsed = (Get-Date) - $StartTime
Write-Host ""
Write-Host "Tiempo total: $($Elapsed.ToString('hh\:mm\:ss'))" -ForegroundColor Cyan

if ($ExitCode -ne 0) {
  Write-Host "El proceso terminó con errores (exit code $ExitCode)" -ForegroundColor Red
  exit $ExitCode
}

Write-Host "Listo." -ForegroundColor Green
