# Re-scrape Hydraulic filters con datos incompletos
# Ventana separada de PowerShell
cd "C:\Users\VICTOR ABREU\Desktop\world-catalogue"
git pull origin claude/implement-ooda-loop-fPdAN
Write-Host "`n=== Re-scrapeando Hydraulic (gaps en alternates/equipment) ===" -ForegroundColor Yellow
node scripts/rescrape-missing-details.js --type Hydraulic
Write-Host "`nListo. Verifica con: node scripts/check-data-completeness.js" -ForegroundColor Green
