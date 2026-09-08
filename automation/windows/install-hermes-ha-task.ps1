param(
  [string]$RepoPath = "C:\ELIMSERVER\repos\world-catalogue",
  [string]$TaskName = "ELIMFILTERS-HERMES-Weekly",
  [string]$RunAt = "08:00"
)

$ErrorActionPreference = 'Stop'
$runner = Join-Path $RepoPath 'automation\windows\run-hermes-weekly-ha.ps1'
if (-not (Test-Path $runner)) { throw "HA HERMES runner not found: $runner" }

$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$runner`""
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At $RunAt
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Hours 6) -RestartCount 2 -RestartInterval (New-TimeSpan -Minutes 15)
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$principal = New-ScheduledTaskPrincipal -UserId $currentUser -LogonType Interactive -RunLevel Highest
$task = New-ScheduledTask -Action $action -Trigger $trigger -Settings $settings -Principal $principal
Register-ScheduledTask -TaskName $TaskName -InputObject $task -Force | Out-Null

Write-Host "Updated: $TaskName"
Write-Host "Schedule: Monday $RunAt"
Write-Host "HA runner: $runner"
Write-Host "Role: LENOVO PRIMARY"
Get-ScheduledTask -TaskName $TaskName | Select-Object TaskName,State
Get-ScheduledTaskInfo -TaskName $TaskName | Select-Object LastRunTime,LastTaskResult,NextRunTime
Write-Host 'LENOVO HERMES HA LEASE PROTECTION ACTIVE'
