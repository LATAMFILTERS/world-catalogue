@echo off
REM ========================================
REM PHASE 5A - PORTAL PRIVADO PARA VICTOR
REM ========================================
REM Este archivo abre el portal en tu navegador
REM
REM USO: Doble-click para entrar al portal
REM ========================================

REM Abre el portal privado en el navegador por defecto
start http://localhost:3000/knowledge-system/phase5a-private?token=phase5a-victor-2026

REM Muestra un mensaje
echo.
echo ========================================
echo PHASE 5A Portal abierto en el navegador
echo ========================================
echo.
echo Si el navegador no abre automaticamente:
echo - Copia esta URL: http://localhost:3000/knowledge-system/phase5a-private?token=phase5a-victor-2026
echo - Pégala en la barra de direcciones
echo.
pause
