# Scrape Donaldson Air Dryers (ED4) - categoria 2748940002
# Uso: .\scripts\scrape-air-dryers.ps1

Write-Host "`n=== PASO 1: Descargando cambios ===" -ForegroundColor Cyan
git pull origin claude/implement-ooda-loop-fPdAN

Write-Host "`n=== PASO 2: Scrapeando 12 productos Air Dryer ===" -ForegroundColor Cyan
node scripts/donaldson-category-scraper.js --category 2748940002 --locale en-nl --total 12 --extra "Nr=product.language%3AEnglish&st=parts"

Write-Host "`n=== PASO 3: Generando SKUs ED4 con tecnologia DRYCORE(TM) ===" -ForegroundColor Cyan
$latest = Get-ChildItem "scrape_reports\donaldson-categoria-2748940002-*.json" | Sort-Object LastWriteTime -Desc | Select-Object -First 1
if ($latest) {
    node scripts/generate-elimfilters-skus.js --input $latest.FullName
} else {
    Write-Host "ERROR: No se encontro el archivo scrapeado." -ForegroundColor Red
    exit 1
}

Write-Host "`n=== PASO 4: Cargando a PostgreSQL ===" -ForegroundColor Cyan
$catalog = Get-ChildItem "scrape_reports\elimfilters-catalog-*.json" | Sort-Object LastWriteTime -Desc | Select-Object -First 1
node scripts/load-donaldson-to-postgres.js --input $catalog.FullName

Write-Host "`n=== PASO 5: Verificando resultado ===" -ForegroundColor Cyan
node scripts/check-postgres.js
