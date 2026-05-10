# Fix elimfilters server - PowerShell script
# Este script arregla la configuración local y prepara para un deploy limpio en Railway

Write-Host "=== ELIMFILTERS SERVER FIX ===" -ForegroundColor Green

# 1. Verificar que estamos en la carpeta correcta
if (!(Test-Path "E:\world-catalogue\.git")) {
    Write-Host "ERROR: No se encontró repositorio git en E:\world-catalogue" -ForegroundColor Red
    exit 1
}

Set-Location "E:\world-catalogue"

# 2. Limpiar deploys viejos (remover archivos temporales)
Write-Host "`n[1/5] Limpiando archivos temporales..." -ForegroundColor Cyan
Remove-Item -Path ".\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".\.next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".\dist" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Verificar package.json vs package-lock.json
Write-Host "[2/5] Sincronizando dependencias..." -ForegroundColor Cyan
& npm install --force

# 4. Verificar configuración de servidor
Write-Host "[3/5] Verificando server.js..." -ForegroundColor Cyan
$serverContent = Get-Content ".\server.js" -Raw
if ($serverContent -match "const PORT = process.env.PORT \|\| 3000") {
    Write-Host "✓ Puerto 3000 configurado correctamente" -ForegroundColor Green
} else {
    Write-Host "✗ ERROR: Puerto no configurado correctamente" -ForegroundColor Red
}

# 5. Verificar railway.toml existe y railway.json NO existe
Write-Host "[4/5] Verificando archivos Railway..." -ForegroundColor Cyan
if (Test-Path ".\railway.toml") {
    Write-Host "✓ railway.toml existe" -ForegroundColor Green
} else {
    Write-Host "✗ ERROR: railway.toml no existe" -ForegroundColor Red
}

if (Test-Path ".\railway.json") {
    Write-Host "✗ ADVERTENCIA: railway.json existe (debe ser eliminado)" -ForegroundColor Yellow
    Remove-Item ".\railway.json" -Force
    git add railway.json
    git commit -m "Remove duplicate railway.json"
}

# 6. Último commit y push
Write-Host "[5/5] Preparando para push a Railway..." -ForegroundColor Cyan
$status = & git status --porcelain
if ($status) {
    Write-Host "Cambios pendientes, committeando..." -ForegroundColor Yellow
    git add -A
    git commit -m "Local fixes: clean dependencies and config"
}

# 7. Push a la rama
Write-Host "`nPusheando a Railway..." -ForegroundColor Cyan
git push origin claude/trucks-fleets-image-lNP9y

Write-Host "`n=== LISTO ===" -ForegroundColor Green
Write-Host "Ahora en Railway:" -ForegroundColor Cyan
Write-Host "1. Ve a Deployments"
Write-Host "2. Cancela TODOS los deploys en cola"
Write-Host "3. Haz click en REDEPLOY"
Write-Host "`nEl servidor debería estar verde en 2-3 minutos" -ForegroundColor Green
