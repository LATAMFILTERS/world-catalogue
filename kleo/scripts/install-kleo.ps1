<#
.SYNOPSIS
    Installs KLEO: creates a Python virtual environment, installs
    dependencies, and seeds .env / config.json from their .example files
    (without overwriting anything that already exists).
#>

$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$KleoRoot = Split-Path $ScriptDir -Parent

Write-Host "KLEO install — root: $KleoRoot"

# 1. Locate Python 3.11+
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    throw "Python was not found on PATH. Install Python 3.11+ from https://www.python.org/downloads/ and re-run this script."
}

$versionOutput = & python --version 2>&1
if ($versionOutput -notmatch "Python (\d+)\.(\d+)") {
    throw "Could not parse Python version from '$versionOutput'."
}
$major = [int]$Matches[1]
$minor = [int]$Matches[2]
if ($major -lt 3 -or ($major -eq 3 -and $minor -lt 11)) {
    throw "KLEO requires Python 3.11+. Found: $versionOutput"
}
Write-Host "Found $versionOutput"

# 2. Create virtual environment
$VenvDir = Join-Path $KleoRoot ".venv"
if (-not (Test-Path $VenvDir)) {
    Write-Host "Creating virtual environment at $VenvDir"
    & python -m venv $VenvDir
    if ($LASTEXITCODE -ne 0) { throw "Failed to create virtual environment." }
} else {
    Write-Host "Virtual environment already exists at $VenvDir"
}

$VenvPython = Join-Path $VenvDir "Scripts\python.exe"
if (-not (Test-Path $VenvPython)) {
    throw "Virtual environment python.exe not found at $VenvPython"
}

# 3. Install dependencies + KLEO itself (editable)
Write-Host "Installing dependencies..."
& $VenvPython -m pip install --upgrade pip
if ($LASTEXITCODE -ne 0) { throw "pip upgrade failed." }

& $VenvPython -m pip install -r (Join-Path $KleoRoot "requirements.txt")
if ($LASTEXITCODE -ne 0) { throw "Dependency installation failed." }

& $VenvPython -m pip install -e $KleoRoot
if ($LASTEXITCODE -ne 0) { throw "KLEO package installation failed." }

# 4. Seed .env and config.json without overwriting existing files
$EnvExample = Join-Path $KleoRoot ".env.example"
$EnvFile = Join-Path $KleoRoot ".env"
if (-not (Test-Path $EnvFile)) {
    Copy-Item $EnvExample $EnvFile
    Write-Host "Created $EnvFile from .env.example — edit it and fill in TELEGRAM_BOT_TOKEN / TELEGRAM_AUTHORIZED_CHAT_ID."
} else {
    Write-Host "$EnvFile already exists — left untouched."
}

$ConfigExample = Join-Path $KleoRoot "config\config.example.json"
$ConfigFile = Join-Path $KleoRoot "config.json"
if (-not (Test-Path $ConfigFile)) {
    Copy-Item $ConfigExample $ConfigFile
    Write-Host "Created $ConfigFile from config/config.example.json — edit the 'projects' paths for this machine."
} else {
    Write-Host "$ConfigFile already exists — left untouched."
}

# 5. Create data directory for the SQLite DB and logs
$DataDir = Join-Path $KleoRoot "data"
if (-not (Test-Path $DataDir)) {
    New-Item -ItemType Directory -Path $DataDir | Out-Null
}

Write-Host ""
Write-Host "KLEO install complete."
Write-Host "Next steps:"
Write-Host "  1. Edit $EnvFile (Telegram bot token + authorized chat id)"
Write-Host "  2. Edit $ConfigFile (project paths for this machine)"
Write-Host "  3. Run scripts\start-kleo.ps1"
