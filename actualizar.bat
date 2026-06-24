@echo off
echo.
echo ==============================================
echo  ELIMFILTERS — Actualizando proyecto local
echo ==============================================
echo.

cd /d "%~dp0"

echo [1/4] Descargando cambios del servidor...
git pull origin main
if %errorlevel% neq 0 (
    echo ERROR: No se pudo conectar. Verifica tu conexion a internet.
    pause
    exit /b 1
)

echo.
echo [2/4] Instalando dependencias del servidor...
call npm install

echo.
echo [3/4] Instalando dependencias del frontend...
cd frontend
call npm install
cd ..

echo.
echo [4/4] Iniciando servidor local...
echo.
echo  El sitio estara disponible en: http://localhost:3000
echo  Presiona Ctrl+C para detener el servidor.
echo.
cd frontend
call npm run dev -- --port 3000
