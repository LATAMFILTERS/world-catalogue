# Scrape Donaldson Air Filters (EA1) - categoria 2975800598
# 1455 productos, 73 paginas, locale en-nl
# Uso: .\scripts\scrape-air-filters.ps1

Write-Host "`n=== PASO 1: Descargando cambios ===" -ForegroundColor Cyan
git pull origin claude/implement-ooda-loop-fPdAN

Write-Host "`n=== PASO 2: Scrapeando 1455 productos Air Filter (73 paginas) ===" -ForegroundColor Cyan
node scripts/donaldson-category-scraper.js --category 2975800598 --locale en-nl --total 1455 --extra "Nr=product.language%3AEnglish&st=parts"

Write-Host "`n=== PASO 3: Generando SKUs EA1 con tecnologia MACROCORE(TM) ===" -ForegroundColor Cyan
$latest = Get-ChildItem "scrape_reports\donaldson-categoria-2975800598-*.json" | Sort-Object LastWriteTime -Desc | Select-Object -First 1
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
