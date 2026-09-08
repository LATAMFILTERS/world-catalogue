param(
  [string]$RepoPath = "C:\ELIMSERVER\repos\world-catalogue",
  [string]$TaskName = "ELIMFILTERS-Lenovo-Monitor",
  [int]$IntervalMinutes = 30
)

$ErrorActionPreference = 'Stop'

if ($IntervalMinutes -lt 5) { throw 'IntervalMinutes must be at least 5.' }
if (-not (Test-Path (Join-Path $RepoPath '.git'))) { throw "Repository not found: $RepoPath" }

$monitor = Join-Path $RepoPath 'automation\windows\monitor-lenovo.ps1'
if (-not (Test-Path $monitor)) { throw "Monitoring script not found: $monitor" }

$action = New-ScheduledTaskAction `
  -Execute 'powershell.exe' `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$monitor`""

$trigger = New-ScheduledTaskTrigger `
  -Once `
  -At ((Get-Date).AddMinutes(2)) `
  -RepetitionInterval (New-TimeSpan -Minutes $IntervalMinutes)

$settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 10) `
  -RestartCount 2 `
  -RestartInterval (New-TimeSpan -Minutes 5)

$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$principal = New-ScheduledTaskPrincipal `
  -UserId $currentUser `
  -LogonType Interactive `
  -RunLevel Highest

$task = New-ScheduledTask -Action $action -Trigger $trigger -Settings $settings -Principal $principal
Register-ScheduledTask -TaskName $TaskName -InputObject $task -Force | Out-Null

Write-Host "Installed: $TaskName"
Write-Host "Interval: every $IntervalMinutes minutes"
Write-Host "Runner: $monitor"
Write-Host "User: $currentUser"
Write-Host ''
Write-Host 'Running initial monitoring check and sending first health report...'

& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $monitor -ForceNotify
$monitorExit = $LASTEXITCODE

Write-Host ''
Get-ScheduledTask -TaskName $TaskName | Select-Object TaskName,State
Get-ScheduledTaskInfo -TaskName $TaskName | Select-Object LastRunTime,LastTaskResult,NextRunTime

if ($monitorExit -eq 0) {
  Write-Host 'LENOVO MONITORING ACTIVE: HEALTHY'
  exit 0
}
if ($monitorExit -eq 1) {
  Write-Warning 'LENOVO MONITORING ACTIVE: WARNING detected. Review status.json.'
  exit 1
}
Write-Warning 'LENOVO MONITORING ACTIVE: CRITICAL condition detected. Review status.json.'
exit 2
