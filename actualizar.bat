@echo off
echo Cerrando servidor...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Actualizando archivos...
cd /d "C:\Users\VICTOR ABREU\Documents\world-catalogue"
git fetch origin claude/ecstatic-fermi-rqhwq2

git checkout origin/claude/ecstatic-fermi-rqhwq2 -- frontend/out/images/manufactura.avif
git checkout origin/claude/ecstatic-fermi-rqhwq2 -- frontend/out/images/ing-railway.avif
git checkout origin/claude/ecstatic-fermi-rqhwq2 -- frontend/out/images/wasted-municipal.avif
git checkout origin/claude/ecstatic-fermi-rqhwq2 -- frontend/out/images/ingpetrolero.avif
git checkout origin/claude/ecstatic-fermi-rqhwq2 -- frontend/out/images/ingmarine.avif
git checkout origin/claude/ecstatic-fermi-rqhwq2 -- frontend/out/images/generatorsupervisor.avif
git checkout origin/claude/ecstatic-fermi-rqhwq2 -- frontend/out/images/transport.avif

git checkout origin/claude/ecstatic-fermi-rqhwq2 -- frontend/out/assets/MACROCORE.avif
git checkout origin/claude/ecstatic-fermi-rqhwq2 -- frontend/out/assets/SYNTEPORE.avif
git checkout origin/claude/ecstatic-fermi-rqhwq2 -- frontend/out/assets/INTEKCORE.avif
git checkout origin/claude/ecstatic-fermi-rqhwq2 -- frontend/out/assets/DRYCORE.avif
git checkout origin/claude/ecstatic-fermi-rqhwq2 -- frontend/out/assets/HYDROCORE.avif
git checkout origin/claude/ecstatic-fermi-rqhwq2 -- frontend/out/assets/SYNTRAX.avif
git checkout origin/claude/ecstatic-fermi-rqhwq2 -- frontend/out/assets/NANOFORCE.avif
git checkout origin/claude/ecstatic-fermi-rqhwq2 -- frontend/out/assets/THERMACORE.avif
git checkout origin/claude/ecstatic-fermi-rqhwq2 -- frontend/out/assets/MICROKAPPA.avif

git checkout origin/claude/ecstatic-fermi-rqhwq2 -- frontend/out/industries/index.html
git checkout origin/claude/ecstatic-fermi-rqhwq2 -- frontend/out/technologies/index.html

echo Iniciando servidor...
start cmd /k "npx serve@latest -l 3000 \"C:\Users\VICTOR ABREU\Documents\world-catalogue\frontend\out\""

echo Listo. Abre http://localhost:3000/technologies/ en modo incognito
pause
