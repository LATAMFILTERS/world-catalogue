# Reclasifica y recarga el catalogo ELIMFILTERS en PostgreSQL
# Uso: .\scripts\reclasificar-y-cargar.ps1

Write-Host "`n=== PASO 1: Descargando cambios ===" -ForegroundColor Cyan
git pull origin claude/implement-ooda-loop-fPdAN

Write-Host "`n=== PASO 2: Generando catalogo ELIMFILTERS ===" -ForegroundColor Cyan
node scripts/generate-elimfilters-skus.js

Write-Host "`n=== PASO 3: Cargando a PostgreSQL ===" -ForegroundColor Cyan
node scripts/load-donaldson-to-postgres.js

Write-Host "`n=== PASO 4: Verificando resultado ===" -ForegroundColor Cyan
node scripts/check-postgres.js
