@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ========================================
REM INSTALAR PHASE 5A EN ESCRITORIO
REM ========================================
REM Este script crea automáticamente
REM los accesos directos en tu escritorio
REM ========================================

REM Obtener ruta del escritorio
for /f "tokens=3" %%A in ('reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders" /v Desktop 2^>nul ^| find "Desktop"') do set DESKTOP=%%A

REM Obtener ruta de este script
set SCRIPT_DIR=%~dp0

REM Crear acceso directo con URL
echo Creating Phase 5A shortcuts...

REM Opción 1: Crear acceso directo usando PowerShell (más confiable)
powershell -NoProfile -ExecutionPolicy Bypass -Command "^
$shell = New-Object -ComObject WScript.Shell;^
$desktop = [Environment]::GetFolderPath('Desktop');^
$projectFolder = '%SCRIPT_DIR%';^
$batFile = Join-Path $projectFolder 'PHASE5A_ACCESO_DIRECTO.bat';^
^
$shortcut1 = $shell.CreateShortcut((Join-Path $desktop 'Phase 5A - Portal Privado.lnk'));^
$shortcut1.TargetPath = $batFile;^
$shortcut1.WorkingDirectory = $projectFolder;^
$shortcut1.Description = 'PHASE 5A - Portal Privado para Victor';^
$shortcut1.IconLocation = 'C:\Windows\System32\cmd.exe,0';^
$shortcut1.Save();^
^
$shortcut2 = $shell.CreateShortcut((Join-Path $desktop 'Phase 5A - Portal (URL).lnk'));^
$shortcut2.TargetPath = 'https://phase5a-portal.onrender.com/knowledge-system/phase5a-private?token=phase5a-victor-2026';^
$shortcut2.Description = 'PHASE 5A - Portal Privado';^
$shortcut2.IconLocation = 'C:\Windows\System32\url.dll,0';^
$shortcut2.Save();^
^
Write-Host '✓ ¡Accesos directos creados en el escritorio!' -ForegroundColor Green;^
Write-Host '' -ForegroundColor Green;^
Write-Host 'Se crearon 2 accesos:' -ForegroundColor Cyan;^
Write-Host '  1. Phase 5A - Portal Privado.lnk' -ForegroundColor Yellow;^
Write-Host '  2. Phase 5A - Portal (URL).lnk' -ForegroundColor Yellow;^
Write-Host '' -ForegroundColor Green;^
Write-Host 'Presiona ENTER para cerrar...' -ForegroundColor Magenta;^
Read-Host | Out-Null;^
"

if errorlevel 1 (
    echo.
    echo ✗ Error al crear los accesos directos
    echo.
    echo Intenta ejecutar este archivo como administrador
    echo.
    pause
    exit /b 1
)

exit /b 0
