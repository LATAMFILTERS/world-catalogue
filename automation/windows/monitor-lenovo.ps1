param(
  [string]$Root = "C:\ELIMSERVER",
  [string]$RepoPath = "C:\ELIMSERVER\repos\world-catalogue",
  [string]$StateDir = "C:\ELIMSERVER\state\monitoring",
  [string]$SecretsPath = "C:\ELIMSERVER\secrets\hermes-secrets.clixml",
  [string]$R2Remote = $env:ELIM_R2_REMOTE,
  [switch]$ForceNotify
)

$ErrorActionPreference = 'Stop'

function Convert-SecretValueToPlainText($Value) {
  if ($null -eq $Value) { return $null }
  if ($Value -is [System.Security.SecureString]) {
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
    try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
  }
  return [string]$Value
}

function Add-Check {
  param(
    [System.Collections.Generic.List[object]]$List,
    [string]$Name,
    [ValidateSet('OK','WARN','CRITICAL')] [string]$Status,
    [string]$Message,
    $Data = $null
  )
  $List.Add([pscustomobject]@{
    name = $Name
    status = $Status
    message = $Message
    data = $Data
  }) | Out-Null
}

function Get-RcloneExe {
  $cmd = Get-Command rclone -ErrorAction SilentlyContinue
  if ($null -ne $cmd) { return $cmd.Source }
  $candidate = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter rclone.exe -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($null -ne $candidate) { return $candidate.FullName }
  return $null
}

function Send-MonitorEmail {
  param(
    [string]$Subject,
    [string]$BodyText,
    [string]$SecretsFile
  )

  if (-not (Test-Path $SecretsFile)) { throw "Monitoring alert secrets file not found: $SecretsFile" }
  $secrets = Import-Clixml $SecretsFile

  $required = @('AZURE_CLIENT_ID','AZURE_TENANT_ID','AZURE_CLIENT_SECRET','HERMES_SENDER_EMAIL','HERMES_REVIEW_EMAIL')
  $values = @{}
  foreach ($name in $required) {
    $prop = $secrets.PSObject.Properties[$name]
    if ($null -eq $prop) { throw "Monitoring alert secret missing: $name" }
    $plain = Convert-SecretValueToPlainText $prop.Value
    if ([string]::IsNullOrWhiteSpace($plain)) { throw "Monitoring alert secret empty: $name" }
    $values[$name] = $plain
  }

  $tokenUri = "https://login.microsoftonline.com/$($values.AZURE_TENANT_ID)/oauth2/v2.0/token"
  $token = Invoke-RestMethod -Method Post -Uri $tokenUri -ContentType 'application/x-www-form-urlencoded' -Body @{
    client_id = $values.AZURE_CLIENT_ID
    client_secret = $values.AZURE_CLIENT_SECRET
    scope = 'https://graph.microsoft.com/.default'
    grant_type = 'client_credentials'
  }

  if ([string]::IsNullOrWhiteSpace([string]$token.access_token)) { throw 'Microsoft Graph token acquisition failed.' }

  $mailBody = @{
    message = @{
      subject = $Subject
      body = @{
        contentType = 'Text'
        content = $BodyText
      }
      toRecipients = @(
        @{ emailAddress = @{ address = $values.HERMES_REVIEW_EMAIL } }
      )
    }
    saveToSentItems = $true
  } | ConvertTo-Json -Depth 8

  $senderEncoded = [uri]::EscapeDataString($values.HERMES_SENDER_EMAIL)
  Invoke-RestMethod -Method Post -Uri "https://graph.microsoft.com/v1.0/users/$senderEncoded/sendMail" -Headers @{ Authorization = "Bearer $($token.access_token)" } -ContentType 'application/json' -Body $mailBody | Out-Null
}

New-Item -ItemType Directory -Force -Path $StateDir | Out-Null
$statusPath = Join-Path $StateDir 'status.json'
$historyPath = Join-Path $StateDir 'history.jsonl'
$alertStatePath = Join-Path $StateDir 'alert-state.json'

$checks = New-Object 'System.Collections.Generic.List[object]'
$now = Get-Date

try {
  $drive = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"
  $freeGB = [math]::Round($drive.FreeSpace / 1GB, 2)
  $totalGB = [math]::Round($drive.Size / 1GB, 2)
  if ($freeGB -lt 15) {
    Add-Check $checks 'disk_c' 'CRITICAL' "C: free space is ${freeGB} GB (critical below 15 GB)." @{ free_gb = $freeGB; total_gb = $totalGB }
  } elseif ($freeGB -lt 25) {
    Add-Check $checks 'disk_c' 'WARN' "C: free space is ${freeGB} GB (warning below 25 GB)." @{ free_gb = $freeGB; total_gb = $totalGB }
  } else {
    Add-Check $checks 'disk_c' 'OK' "C: free space is ${freeGB} GB." @{ free_gb = $freeGB; total_gb = $totalGB }
  }
} catch {
  Add-Check $checks 'disk_c' 'CRITICAL' "Unable to read C: disk health: $($_.Exception.Message)"
}

foreach ($pathSpec in @(
  @{ name='world_catalogue_repo'; path=$RepoPath },
  @{ name='hermes_runtime'; path=(Join-Path $Root 'apps\hermes-runtime') },
  @{ name='hermes_secrets'; path=$SecretsPath }
)) {
  if (Test-Path $pathSpec.path) {
    Add-Check $checks $pathSpec.name 'OK' "Present: $($pathSpec.path)"
  } else {
    Add-Check $checks $pathSpec.name 'CRITICAL' "Missing: $($pathSpec.path)"
  }
}

$taskSpecs = @(
  @{ name='hermes_task'; task='ELIMFILTERS-HERMES-Weekly'; maxAgeHours=192 },
  @{ name='backup_task'; task='ELIMFILTERS-Lenovo-Backup'; maxAgeHours=36 }
)
foreach ($spec in $taskSpecs) {
  try {
    $task = Get-ScheduledTask -TaskName $spec.task -ErrorAction Stop
    $info = Get-ScheduledTaskInfo -TaskName $spec.task -ErrorAction Stop
    $ageHours = $null
    if ($info.LastRunTime -and $info.LastRunTime.Year -gt 2000) {
      $ageHours = [math]::Round((New-TimeSpan -Start $info.LastRunTime -End $now).TotalHours, 2)
    }

    if ($info.LastTaskResult -ne 0) {
      Add-Check $checks $spec.name 'CRITICAL' "$($spec.task) last result=$($info.LastTaskResult)." @{ state=[string]$task.State; last_run=$info.LastRunTime; next_run=$info.NextRunTime; age_hours=$ageHours }
    } elseif ($null -ne $ageHours -and $ageHours -gt $spec.maxAgeHours) {
      Add-Check $checks $spec.name 'CRITICAL' "$($spec.task) last successful run is ${ageHours} hours old." @{ state=[string]$task.State; last_run=$info.LastRunTime; next_run=$info.NextRunTime; age_hours=$ageHours }
    } elseif ([string]$task.State -eq 'Disabled') {
      Add-Check $checks $spec.name 'CRITICAL' "$($spec.task) is disabled." @{ last_run=$info.LastRunTime; next_run=$info.NextRunTime }
    } else {
      Add-Check $checks $spec.name 'OK' "$($spec.task) healthy; last result=0." @{ state=[string]$task.State; last_run=$info.LastRunTime; next_run=$info.NextRunTime; age_hours=$ageHours }
    }
  } catch {
    Add-Check $checks $spec.name 'CRITICAL' "$($spec.task) unavailable: $($_.Exception.Message)"
  }
}

$backupRoot = Join-Path $Root 'backups\lenovo'
try {
  $latestZip = Get-ChildItem $backupRoot -Filter 'elimserver-lenovo-*.zip' -File -ErrorAction Stop | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if ($null -eq $latestZip) {
    Add-Check $checks 'local_backup' 'CRITICAL' 'No Lenovo backup ZIP found.'
  } else {
    $ageHours = [math]::Round((New-TimeSpan -Start $latestZip.LastWriteTime -End $now).TotalHours, 2)
    $hashPath = "$($latestZip.FullName).sha256"
    $manifestPath = "$($latestZip.FullName).manifest.json"
    if ($ageHours -gt 36) {
      Add-Check $checks 'local_backup' 'CRITICAL' "Latest local backup is ${ageHours} hours old." @{ file=$latestZip.Name; age_hours=$ageHours }
    } elseif (-not (Test-Path $hashPath) -or -not (Test-Path $manifestPath)) {
      Add-Check $checks 'local_backup' 'CRITICAL' 'Latest local backup is missing SHA256 or manifest sidecar.' @{ file=$latestZip.Name; age_hours=$ageHours }
    } else {
      Add-Check $checks 'local_backup' 'OK' "Latest local backup is ${ageHours} hours old with sidecars present." @{ file=$latestZip.Name; age_hours=$ageHours }
    }
  }
} catch {
  Add-Check $checks 'local_backup' 'CRITICAL' "Unable to inspect local backups: $($_.Exception.Message)"
}

$hermesLock = Join-Path $Root 'state\hermes\weekly.lock'
if (Test-Path $hermesLock) {
  $lockAge = [math]::Round((New-TimeSpan -Start (Get-Item $hermesLock).LastWriteTime -End $now).TotalHours, 2)
  if ($lockAge -gt 6) {
    Add-Check $checks 'hermes_lock' 'CRITICAL' "HERMES weekly.lock is stale (${lockAge} hours)." @{ age_hours=$lockAge }
  } else {
    Add-Check $checks 'hermes_lock' 'OK' "HERMES run lock present and recent (${lockAge} hours)." @{ age_hours=$lockAge }
  }
} else {
  Add-Check $checks 'hermes_lock' 'OK' 'No stale HERMES run lock present.'
}

if ([string]::IsNullOrWhiteSpace($R2Remote)) {
  $R2Remote = [Environment]::GetEnvironmentVariable('ELIM_R2_REMOTE','User')
}
$rcloneExe = Get-RcloneExe
if ([string]::IsNullOrWhiteSpace($R2Remote)) {
  Add-Check $checks 'r2_backup' 'CRITICAL' 'ELIM_R2_REMOTE is not configured.'
} elseif ([string]::IsNullOrWhiteSpace($rcloneExe)) {
  Add-Check $checks 'r2_backup' 'CRITICAL' 'rclone.exe is not available.'
} else {
  try {
    $remoteFiles = @(& $rcloneExe lsf "$R2Remote/lenovo" --files-only --s3-no-check-bucket 2>&1)
    if ($LASTEXITCODE -ne 0) { throw ($remoteFiles -join ' ') }
    $remoteZips = @($remoteFiles | Where-Object { $_ -match '^elimserver-lenovo-.*\.zip$' } | Sort-Object)
    if ($remoteZips.Count -eq 0) {
      Add-Check $checks 'r2_backup' 'CRITICAL' "R2 is reachable but contains no Lenovo backup ZIPs at $R2Remote/lenovo."
    } else {
      $remoteLatest = $remoteZips[-1]
      $localLatest = Get-ChildItem $backupRoot -Filter 'elimserver-lenovo-*.zip' -File -ErrorAction SilentlyContinue | Sort-Object Name | Select-Object -Last 1
      if ($null -ne $localLatest -and $remoteLatest -ne $localLatest.Name) {
        Add-Check $checks 'r2_backup' 'WARN' 'R2 reachable, but latest remote ZIP differs from latest local ZIP.' @{ remote_latest=$remoteLatest; local_latest=$localLatest.Name }
      } else {
        Add-Check $checks 'r2_backup' 'OK' 'R2 reachable; latest Lenovo backup visible.' @{ remote_latest=$remoteLatest }
      }
    }
  } catch {
    Add-Check $checks 'r2_backup' 'CRITICAL' "R2 health check failed: $($_.Exception.Message)"
  }
}

$checkArray = @($checks | ForEach-Object { $_ })
$criticalCount = @($checkArray | Where-Object status -eq 'CRITICAL').Count
$warnCount = @($checkArray | Where-Object status -eq 'WARN').Count
$overall = if ($criticalCount -gt 0) { 'CRITICAL' } elseif ($warnCount -gt 0) { 'WARN' } else { 'OK' }

$status = [ordered]@{
  schema_version = '1.0.1'
  checked_at = $now.ToString('o')
  computer = $env:COMPUTERNAME
  overall = $overall
  critical_count = $criticalCount
  warning_count = $warnCount
  checks = $checkArray
}

$statusJson = $status | ConvertTo-Json -Depth 8
$statusJson | Out-File -FilePath $statusPath -Encoding utf8
($status | ConvertTo-Json -Depth 8 -Compress) | Add-Content -Path $historyPath -Encoding utf8

$lastNotifiedOverall = $null
if (Test-Path $alertStatePath) {
  try { $lastNotifiedOverall = (Get-Content $alertStatePath -Raw | ConvertFrom-Json).last_notified_overall } catch { $lastNotifiedOverall = $null }
}

$shouldNotify = $ForceNotify -or [string]::IsNullOrWhiteSpace([string]$lastNotifiedOverall) -or ($lastNotifiedOverall -ne $overall)
$notificationOutcome = 'SKIPPED_NO_STATE_CHANGE'
if ($shouldNotify) {
  $lines = New-Object System.Collections.Generic.List[string]
  $lines.Add("ELIMFILTERS Lenovo monitoring status: $overall") | Out-Null
  $lines.Add("Computer: $env:COMPUTERNAME") | Out-Null
  $lines.Add("Checked: $($now.ToString('yyyy-MM-dd HH:mm:ss zzz'))") | Out-Null
  $lines.Add('') | Out-Null
  foreach ($check in $checkArray) {
    $lines.Add("[$($check.status)] $($check.name): $($check.message)") | Out-Null
  }
  $bodyText = $lines -join "`r`n"
  try {
    Send-MonitorEmail -Subject "[ELIMFILTERS Lenovo] $overall monitoring status" -BodyText $bodyText -SecretsFile $SecretsPath
    $notificationOutcome = 'SENT'
    $lastNotifiedOverall = $overall
  } catch {
    $notificationOutcome = "FAILED: $($_.Exception.Message)"
  }
}

@{
  current_overall = $overall
  last_notified_overall = $lastNotifiedOverall
  updated_at = $now.ToString('o')
  notification = $notificationOutcome
} | ConvertTo-Json | Out-File -FilePath $alertStatePath -Encoding utf8

$result = [ordered]@{
  outcome = 'OK'
  monitoring = $overall
  critical_count = $criticalCount
  warning_count = $warnCount
  notification = $notificationOutcome
  status_file = $statusPath
  history_file = $historyPath
}
$result | ConvertTo-Json -Depth 5

if ($overall -eq 'CRITICAL') { exit 2 }
if ($overall -eq 'WARN') { exit 1 }
exit 0
