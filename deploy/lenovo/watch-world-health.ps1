# Owns WORLD-CATALOGUE/HERMES health notifications on the Lenovo.
# Reads HERMES operational-validation.json and records only state changes in the
# native World Catalogue Notification Center. No external relay is used.
$stateFile = "C:\ELIMSERVER\state\hermes\operational-validation.json"
$lastAlertedFile = "C:\ELIMSERVER\state\hermes\.last-native-alerted-reason.txt"
$log = "C:\ELIMSERVER\logs\hermes\health-watch.log"
$notificationUrl = "http://127.0.0.1:8791/api/notifications"

function Send-NativeWorldAlert {
  param([string]$Title,[string]$Message,[string]$Priority="INFO",[string]$Type="HERMES_HEALTH")
  try {
    $body = @{
      notificationType = $Type
      priority = $Priority
      module = "HERMES"
      title = $Title
      message = $Message
      recipientKey = "CEO"
      metadata = @{ source = "operational-validation.json" }
    } | ConvertTo-Json -Depth 5
    Invoke-RestMethod -Uri $notificationUrl -Method Post -Body $body -ContentType "application/json" -TimeoutSec 5 | Out-Null
  } catch {
    Add-Content $log "[$(Get-Date -Format o)] WARNING - native notification unavailable"
  }
}

while ($true) {
  if (Test-Path $stateFile) {
    try {
      $state = Get-Content $stateFile -Raw | ConvertFrom-Json
      $lastAlerted = if (Test-Path $lastAlertedFile) { Get-Content $lastAlertedFile -Raw } else { "" }
      if (-not $state.valid) {
        $reasonKey = "$($state.status)|$($state.reason)"
        if ($reasonKey -ne $lastAlerted) {
          Add-Content $log "[$(Get-Date -Format o)] HERMES unhealthy: $reasonKey"
          Send-NativeWorldAlert -Title "HERMES: research engine issue" -Priority "HIGH" -Message "Status: $($state.status). $($state.reason). Sweep: $($state.sweep.completed)/$($state.sweep.total)."
          Set-Content $lastAlertedFile $reasonKey
        }
      } elseif ($lastAlerted -ne "OK") {
        Add-Content $log "[$(Get-Date -Format o)] HERMES recovered"
        Send-NativeWorldAlert -Title "HERMES: recovered" -Priority "INFO" -Message "The catalogue research engine returned to a valid state."
        Set-Content $lastAlertedFile "OK"
      }
    } catch {
      Add-Content $log "[$(Get-Date -Format o)] WARNING - could not parse HERMES validation state"
    }
  }
  Start-Sleep -Seconds 900
}
