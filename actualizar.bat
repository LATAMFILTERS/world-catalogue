@echo off
echo Cerrando servidor...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Actualizando repositorio...
cd /d "C:\Users\VICTOR ABREU\Documents\world-catalogue"
git fetch origin claude/ecstatic-fermi-rqhwq2

echo Borrando out/ anterior...
rmdir /s /q frontend\out

echo Restaurando out/ desde rama...
git checkout origin/claude/ecstatic-fermi-rqhwq2 -- frontend/out

echo Iniciando servidor...
start cmd /k "npx serve@latest -l 3000 \"C:\Users\VICTOR ABREU\Documents\world-catalogue\frontend\out\""

echo Listo. Abre http://localhost:3000/technologies/ en modo incognito
pause
