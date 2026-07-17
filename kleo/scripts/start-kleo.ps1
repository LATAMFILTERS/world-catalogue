<#
.SYNOPSIS
    Starts KLEO as a background process using the project's virtual
    environment, and records its PID so stop-kleo.ps1 can find it later.
#>

$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$KleoRoot = Split-Path $ScriptDir -Parent
$VenvPython = Join-Path $KleoRoot ".venv\Scripts\python.exe"
$PidFile = Join-Path $KleoRoot "kleo.pid"

if (-not (Test-Path $VenvPython)) {
    throw "Virtual environment not found. Run scripts\install-kleo.ps1 first."
}

if (Test-Path $PidFile) {
    $existingPid = Get-Content $PidFile -ErrorAction SilentlyContinue
    if ($existingPid) {
        $existingProcess = Get-Process -Id $existingPid -ErrorAction SilentlyContinue
        if ($existingProcess) {
            Write-Host "KLEO already appears to be running (PID $existingPid). Run stop-kleo.ps1 first if you want to restart it."
            exit 0
        }
    }
}

$DataDir = Join-Path $KleoRoot "data"
if (-not (Test-Path $DataDir)) {
    New-Item -ItemType Directory -Path $DataDir | Out-Null
}
$StdOutLog = Join-Path $DataDir "kleo-stdout.log"
$StdErrLog = Join-Path $DataDir "kleo-stderr.log"

Write-Host "Starting KLEO from $KleoRoot ..."
$process = Start-Process -FilePath $VenvPython `
    -ArgumentList "-m", "kleo.app" `
    -WorkingDirectory $KleoRoot `
    -RedirectStandardOutput $StdOutLog `
    -RedirectStandardError $StdErrLog `
    -WindowStyle Hidden `
    -PassThru

$process.Id | Out-File -FilePath $PidFile -Encoding utf8 -NoNewline

Write-Host "Starting KLEO (PID $($process.Id)), verifying it stays up..."
Start-Sleep -Seconds 2
$stillRunning = Get-Process -Id $process.Id -ErrorAction SilentlyContinue

if ($null -eq $stillRunning) {
    Remove-Item -Path $PidFile -ErrorAction SilentlyContinue
    Write-Host "KLEO exited immediately after starting (PID $($process.Id) is gone). It did not stay up." -ForegroundColor Red
    Write-Host "Last lines of ${StdErrLog}:" -ForegroundColor Red
    if (Test-Path $StdErrLog) {
        Get-Content $StdErrLog -Tail 20
    } else {
        Write-Host "(no stderr log was written)"
    }
    exit 1
}

Write-Host "KLEO started (PID $($process.Id))."
Write-Host "Logs: $StdOutLog / $StdErrLog"
Write-Host "Stop with: scripts\stop-kleo.ps1"
