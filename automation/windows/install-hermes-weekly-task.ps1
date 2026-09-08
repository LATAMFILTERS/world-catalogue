param(
  [string]$RepoPath = "C:\ELIMSERVER\repos\world-catalogue",
  [string]$TaskName = "ELIMFILTERS-HERMES-Weekly",
  [string]$RunAt = "08:00"
)

$ErrorActionPreference = 'Stop'

$runner = Join-Path $RepoPath 'automation\windows\run-hermes-weekly.ps1'
if (-not (Test-Path $runner)) {
  throw "HERMES runner not found: $runner. Run git pull origin main first."
}

# Monday at 08:00 in the Lenovo's local Windows timezone.
$action = New-ScheduledTaskAction `
  -Execute 'powershell.exe' `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$runner`" -RepoPath `"$RepoPath`""

$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At $RunAt

$settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Hours 6) `
  -RestartCount 3 `
  -RestartInterval (New-TimeSpan -Minutes 15)

$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$principal = New-ScheduledTaskPrincipal `
  -UserId $currentUser `
  -LogonType Interactive `
  -RunLevel Highest

$task = New-ScheduledTask -Action $action -Trigger $trigger -Settings $settings -Principal $principal
Register-ScheduledTask -TaskName $TaskName -InputObject $task -Force | Out-Null

Write-Host "Installed: $TaskName"
Write-Host "Schedule: Monday $RunAt (Windows local timezone)"
Write-Host "Runner: $runner"
Write-Host "User: $currentUser"
Write-Host "StartWhenAvailable: enabled"
Write-Host "Retries: 3 every 15 minutes"
Write-Host "GitHub weekly schedule must remain enabled until a successful Lenovo test run is confirmed."

Get-ScheduledTask -TaskName $TaskName | Select-Object TaskName, State
Get-ScheduledTaskInfo -TaskName $TaskName | Select-Object LastRunTime, LastTaskResult, NextRunTime
