@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0claude-nvidia-fallback.ps1" %*
exit /b %ERRORLEVEL%
