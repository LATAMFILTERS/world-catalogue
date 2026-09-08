param(
  [string]$RepoPath = "C:\ELIMSERVER\repos\world-catalogue",
  [string]$TaskName = "ELIMFILTERS-Lenovo-Heartbeat",
  [int]$IntervalMinutes = 5
)

$ErrorActionPreference = 'Stop'
if ($IntervalMinutes -lt 5) { throw 'IntervalMinutes must be at least 5.' }

$runner = Join-Path $RepoPath 'automation\windows\publish-lenovo-heartbeat.ps1'
if (-not (Test-Path $runner)) { throw "Heartbeat runner not found: $runner" }

$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$runner`""
$trigger = New-ScheduledTaskTrigger -Once -At ((Get-Date).AddMinutes(1)) -RepetitionInterval (New-TimeSpan -Minutes $IntervalMinutes)
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 3) -RestartCount 2 -RestartInterval (New-TimeSpan -Minutes 2)
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$principal = New-ScheduledTaskPrincipal -UserId $currentUser -LogonType Interactive -RunLevel Highest
$task = New-ScheduledTask -Action $action -Trigger $trigger -Settings $settings -Principal $principal
Register-ScheduledTask -TaskName $TaskName -InputObject $task -Force | Out-Null

Write-Host "Installed: $TaskName"
Write-Host "Interval: every $IntervalMinutes minutes"
Write-Host "Runner: $runner"
Write-Host "User: $currentUser"
Write-Host ''
Write-Host 'Publishing initial PRIMARY heartbeat...'
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $runner
if ($LASTEXITCODE -ne 0) { throw 'Initial Lenovo heartbeat failed.' }

Get-ScheduledTask -TaskName $TaskName | Select-Object TaskName,State
Get-ScheduledTaskInfo -TaskName $TaskName | Select-Object LastRunTime,LastTaskResult,NextRunTime
Write-Host 'LENOVO HA HEARTBEAT ACTIVE'
