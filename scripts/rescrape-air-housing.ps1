cd "C:\Users\VICTOR ABREU\Desktop\world-catalogue"
git pull origin claude/implement-ooda-loop-fPdAN
Write-Host "`n=== Re-scrapeando Air Housing ===" -ForegroundColor Yellow
node scripts/rescrape-missing-details.js --type "Air Housing"
Write-Host "`nListo." -ForegroundColor Green
