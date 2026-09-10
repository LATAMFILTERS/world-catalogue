# ELIMFILTERS World Catalogue native Notification Center — Lenovo primary node.
Set-Location "C:\ELIMSERVER\repos\world-catalogue"

node --env-file=.env scripts/migrations/run_102_native_notifications.js *>> "C:\ELIMSERVER\logs\world-catalogue\notification-center.log"
if ($LASTEXITCODE -ne 0) {
  Add-Content "C:\ELIMSERVER\logs\world-catalogue\notification-center.log" "[world-notifications] migration failed at $(Get-Date -Format o)"
  exit 1
}

while ($true) {
  node --env-file=.env scripts/native-notification-center.js *>> "C:\ELIMSERVER\logs\world-catalogue\notification-center.log"
  Add-Content "C:\ELIMSERVER\logs\world-catalogue\notification-center.log" "[world-notifications] process exited, restarting in 5s at $(Get-Date -Format o)"
  Start-Sleep -Seconds 5
}
