param(
  [string]$InstallRoot = "C:\ELIMSERVER\automation\storage"
)

$ErrorActionPreference = 'Stop'
$sourceRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
New-Item -ItemType Directory -Force -Path $InstallRoot | Out-Null

$scripts = @(
  'backup-local-postgres-to-ugreen.ps1',
  'snapshot-local-workspaces-to-ugreen.ps1'
)
foreach ($script in $scripts) {
  Copy-Item (Join-Path $sourceRoot $script) (Join-Path $InstallRoot $script) -Force
}

$ps = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
$dbAction = "$ps -NoProfile -ExecutionPolicy Bypass -File $InstallRoot\backup-local-postgres-to-ugreen.ps1"
$wsAction = "$ps -NoProfile -ExecutionPolicy Bypass -File $InstallRoot\snapshot-local-workspaces-to-ugreen.ps1"
& schtasks.exe /Create /TN 'ELIMFILTERS-UGREEN-Postgres-Backup' /TR $dbAction /SC DAILY /ST 03:15 /RL LIMITED /F
if ($LASTEXITCODE -ne 0) { throw 'Failed to register PostgreSQL backup task.' }

& schtasks.exe /Create /TN 'ELIMFILTERS-UGREEN-Workspace-Snapshot' /TR $wsAction /SC HOURLY /MO 6 /ST 00:20 /RL LIMITED /F
if ($LASTEXITCODE -ne 0) { throw 'Failed to register workspace snapshot task.' }

$result = [ordered]@{
  outcome = 'OK'
  install_root = $InstallRoot
  tasks = @(
    'ELIMFILTERS-UGREEN-Postgres-Backup',
    'ELIMFILTERS-UGREEN-Workspace-Snapshot'
  )
  note = 'Tasks run as the interactive ELIMSERVER user so stored SMB credentials remain available.'
}
$result | ConvertTo-Json -Depth 4
