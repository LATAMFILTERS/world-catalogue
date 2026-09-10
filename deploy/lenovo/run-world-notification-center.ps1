# ELIMFILTERS World Catalogue native Notification Center — Lenovo primary node.
Set-Location "C:\ELIMSERVER\repos\world-catalogue"
$log = "C:\ELIMSERVER\logs\world-catalogue\notification-center.log"
New-Item -ItemType Directory -Force -Path "C:\ELIMSERVER\logs\world-catalogue" | Out-Null

function ConvertTo-PlainText($secure) {
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
}

$secretStore = "C:\ELIMSERVER\secrets\hermes-secrets.clixml"
$secrets = Import-Clixml -Path $secretStore
$env:CATALOG_DATABASE_URL = ConvertTo-PlainText $secrets.CATALOG_DATABASE_URL

node scripts/migrations/run_102_native_notifications.js *>> $log
if ($LASTEXITCODE -ne 0) {
  Add-Content $log "[world-notifications] migration failed at $(Get-Date -Format o)"
  exit 1
}

$watcher = Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -like '*watch-world-health.ps1*' } | Select-Object -First 1
if (-not $watcher) {
  Start-Process powershell -WindowStyle Hidden -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',"C:\ELIMSERVER\repos\world-catalogue\deploy\lenovo\watch-world-health.ps1")
}

while ($true) {
  node scripts/native-notification-center.js *>> $log
  Add-Content $log "[world-notifications] process exited, restarting in 5s at $(Get-Date -Format o)"
  Start-Sleep -Seconds 5
}