<#
.SYNOPSIS
    Stops the KLEO process previously started by start-kleo.ps1, using the
    recorded PID file.
#>

$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$KleoRoot = Split-Path $ScriptDir -Parent
$PidFile = Join-Path $KleoRoot "kleo.pid"

if (-not (Test-Path $PidFile)) {
    Write-Host "No kleo.pid file found — KLEO does not appear to be running (or was not started with start-kleo.ps1)."
    exit 0
}

$targetPid = Get-Content $PidFile -ErrorAction SilentlyContinue
if (-not $targetPid) {
    Write-Host "kleo.pid is empty. Removing stale file."
    Remove-Item $PidFile -Force
    exit 0
}

$targetProcess = Get-Process -Id $targetPid -ErrorAction SilentlyContinue
if (-not $targetProcess) {
    Write-Host "No running process with PID $targetPid. Removing stale kleo.pid."
    Remove-Item $PidFile -Force
    exit 0
}

Write-Host "Stopping KLEO (PID $targetPid)..."
Stop-Process -Id $targetPid -Force -Confirm:$false
Remove-Item $PidFile -Force
Write-Host "KLEO stopped."
