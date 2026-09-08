param(
  [string]$RepoPath = "C:\ELIMSERVER\repos\world-catalogue",
  [string]$R2Remote = "elim-r2:elimfilters-lenovo-backups"
)

$ErrorActionPreference = 'Stop'

$backupScript = Join-Path $RepoPath 'automation\windows\backup-lenovo.ps1'
if (-not (Test-Path $backupScript)) {
  throw "Backup script not found: $backupScript"
}

$rclone = Get-Command rclone -ErrorAction SilentlyContinue
if ($null -eq $rclone) {
  $candidate = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter rclone.exe -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if ($null -eq $candidate) {
    throw 'rclone.exe not found. Install Rclone.Rclone with winget.'
  }
  $rcloneDir = Split-Path $candidate.FullName -Parent
  $env:Path = "$rcloneDir;$env:Path"
}

& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $backupScript -R2Remote $R2Remote
if ($LASTEXITCODE -ne 0) {
  throw "Lenovo backup failed with exit code $LASTEXITCODE"
}
