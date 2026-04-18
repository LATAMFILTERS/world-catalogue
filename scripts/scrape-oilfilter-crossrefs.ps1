param(
    [int]$Limit    = 999999,
    [string]$Sku   = "",
    [switch]$DryRun
)

$start = Get-Date
Write-Host "=== Oil/Hydraulic Cross-Reference Scraper ===" -ForegroundColor Cyan

$args = @()
if ($Limit -lt 999999) { $args += "--limit"; $args += $Limit }
if ($Sku)              { $args += "--sku";   $args += $Sku   }
if ($DryRun)           { $args += "--dry-run" }

node scripts/oilfilter-crossref-scraper.js @args

$elapsed = (Get-Date) - $start
Write-Host "`nTiempo: $($elapsed.ToString('hh\:mm\:ss'))" -ForegroundColor Green
Write-Host "Listo." -ForegroundColor Green
