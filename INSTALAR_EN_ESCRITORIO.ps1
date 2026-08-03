# ========================================
# INSTALAR PHASE 5A EN ESCRITORIO
# ========================================
# Este script coloca los accesos directos
# automáticamente en tu escritorio
#
# Uso: Click derecho > Ejecutar con PowerShell
# ========================================

# Obtener rutas
$desktop = [Environment]::GetFolderPath("Desktop")
$projectFolder = $PSScriptRoot
$batFile = Join-Path $projectFolder "PHASE5A_ACCESO_DIRECTO.bat"

# Crear acceso directo en escritorio
$shell = New-Object -ComObject WScript.Shell

# Opción 1: Crear acceso directo que ejecuta el .bat
$shortcutPath = Join-Path $desktop "Phase 5A - Portal Privado.lnk"
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $batFile
$shortcut.WorkingDirectory = $projectFolder
$shortcut.Description = "PHASE 5A - Portal Privado para Victor"
$shortcut.IconLocation = "C:\Windows\System32\cmd.exe,0"
$shortcut.Save()

# Opción 2: Crear acceso directo directo a la URL
$shortcutPath2 = Join-Path $desktop "Phase 5A - Portal (URL).lnk"
$shortcut2 = $shell.CreateShortcut($shortcutPath2)
$shortcut2.TargetPath = "http://localhost:3000/knowledge-system/phase5a-private?token=phase5a-victor-2026"
$shortcut2.Description = "PHASE 5A - Portal Privado"
$shortcut2.IconLocation = "C:\Windows\System32\url.dll,0"
$shortcut2.Save()

# Mostrar confirmación
Write-Host "✓ Instalación completada!" -ForegroundColor Green
Write-Host ""
Write-Host "Se han creado 2 accesos directos en tu escritorio:" -ForegroundColor Cyan
Write-Host "1. Phase 5A - Portal Privado.lnk (ejecuta el script .bat)" -ForegroundColor Yellow
Write-Host "2. Phase 5A - Portal (URL).lnk (abre la URL directamente)" -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANTE: El servidor debe estar corriendo" -ForegroundColor Magenta
Write-Host "Si no está corriendo, ejecuta en PowerShell:" -ForegroundColor Magenta
Write-Host "  cd frontend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Presiona cualquier tecla para cerrar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
