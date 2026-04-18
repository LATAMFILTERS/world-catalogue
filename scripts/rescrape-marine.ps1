cd "C:\Users\VICTOR ABREU\Desktop\world-catalogue"
git pull origin claude/implement-ooda-loop-fPdAN
Write-Host "`n=== Re-scrapeando Marine FUEL ===" -ForegroundColor Yellow
node scripts/rescrape-missing-details.js --type "Marine FUEL"
Write-Host "`n=== Re-scrapeando Marine OIL ===" -ForegroundColor Yellow
node scripts/rescrape-missing-details.js --type "Marine OIL"
Write-Host "`n=== Re-scrapeando Marine WATER_SEP ===" -ForegroundColor Yellow
node scripts/rescrape-missing-details.js --type "Marine WATER_SEP"
Write-Host "`nListo." -ForegroundColor Green
