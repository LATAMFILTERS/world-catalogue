# Investiga los 52 productos vacios y los re-scrape
# Ventana separada de PowerShell
cd "C:\Users\VICTOR ABREU\Desktop\world-catalogue"
git pull origin claude/implement-ooda-loop-fPdAN

Write-Host "`n=== PASO 1: Investigando 52 productos sin datos ===" -ForegroundColor Yellow
node scripts/investigate-empty-products.js

Write-Host "`n=== PASO 2: Re-scrapeando productos vacios ===" -ForegroundColor Yellow
node scripts/rescrape-missing-details.js --file scrape_reports/empty-products-to-rescrape.json

Write-Host "`n=== PASO 3: Verificando resultado ===" -ForegroundColor Green
node scripts/check-data-completeness.js
