$ErrorActionPreference = 'Stop'
$repo = 'C:\ELIMSERVER\repos\world-catalogue'
$startup = [Environment]::GetFolderPath('Startup')
$launcher = Join-Path $repo 'deploy\lenovo\run-world-notification-center.ps1'
$shortcutPath = Join-Path $startup 'ELIMFILTERS World Notifications.lnk'

Set-Location $repo
New-Item -ItemType Directory -Force -Path 'C:\ELIMSERVER\logs\world-catalogue' | Out-Null

node --env-file=.env scripts/migrations/run_102_native_notifications.js
if ($LASTEXITCODE -ne 0) { throw 'World notification migration failed' }

$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = 'powershell.exe'
$shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$launcher`""
$shortcut.WorkingDirectory = $repo
$shortcut.WindowStyle = 7
$shortcut.Save()

$running = Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -like '*native-notification-center.js*' } |
  Select-Object -First 1
if (-not $running) {
  Start-Process powershell -WindowStyle Hidden -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',$launcher)
}

Start-Sleep -Seconds 4
$health = Invoke-RestMethod -Uri 'http://127.0.0.1:8791/health' -TimeoutSec 10
if (-not $health.ok) { throw 'World notification center health check failed' }
Write-Host 'WORLD_NATIVE_NOTIFICATIONS=INSTALLED_AND_HEALTHY'
Write-Host 'NTFY_ACTIVE=false'
