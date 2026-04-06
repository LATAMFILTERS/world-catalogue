<#
.SYNOPSIS
  Scraper de cross-references desde fuelfilter-crossreference.com
  para Fuel Filter / Fuel Separator / Marine / Coolant del catálogo ELIMFILTERS.

.PARAMETER Limit
  Número máximo de códigos a procesar (default: todos)

.PARAMETER Sku
  Código Donaldson específico para testear (ej: P550440)

.PARAMETER DryRun
  Si se especifica, NO actualiza la base de datos

.EXAMPLES
  # Testear un código:
  .\scripts\scrape-fuelfilter-crossrefs.ps1 -Sku P550440 -DryRun

  # Testear fuel separator:
  .\scripts\scrape-fuelfilter-crossrefs.ps1 -Sku P558000 -DryRun

  # Correr todos:
  .\scripts\scrape-fuelfilter-crossrefs.ps1

  # Solo primeros 100:
  .\scripts\scrape-fuelfilter-crossrefs.ps1 -Limit 100
#>

param(
  [int]    $Limit  = 0,
  [string] $Sku    = "",
  [switch] $DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host ""
Write-Host "=== FUEL FILTER CROSS-REFERENCE SCRAPER ===" -ForegroundColor Cyan
Write-Host "Proyecto : $ProjectRoot"
Write-Host "Fecha    : $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host ""

$NodeArgs = @("scripts\fuelfilter-crossref-scraper.js")

if ($Limit -gt 0) {
  $NodeArgs += "--limit"
  $NodeArgs += $Limit.ToString()
  Write-Host "Límite : $Limit" -ForegroundColor Yellow
}
if ($Sku -ne "") {
  $NodeArgs += "--sku"
  $NodeArgs += $Sku
  Write-Host "SKU    : $Sku" -ForegroundColor Yellow
}
if ($DryRun) {
  $NodeArgs += "--dry-run"
  Write-Host "Modo   : DRY-RUN (no modifica DB)" -ForegroundColor Yellow
} else {
  Write-Host "Modo   : PRODUCCION (actualiza DB)" -ForegroundColor Green
}

Write-Host ""
$Start = Get-Date

node @NodeArgs

$Elapsed = (Get-Date) - $Start
Write-Host ""
Write-Host "Tiempo: $($Elapsed.ToString('hh\:mm\:ss'))" -ForegroundColor Cyan
Write-Host "Listo." -ForegroundColor Green
