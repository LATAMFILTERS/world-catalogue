param(
  [string]$DevRepoPath = "C:\ELIMSERVER\repos\world-catalogue",
  [string]$RuntimePath = "C:\ELIMSERVER\apps\hermes-runtime",
  [string]$TaskName = "ELIMFILTERS-HERMES-Weekly",
  [string]$RunAt = "08:00"
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path (Join-Path $DevRepoPath '.git'))) {
  throw "Development repository not found: $DevRepoPath"
}

Set-Location $DevRepoPath
git fetch origin main

if (-not (Test-Path $RuntimePath)) {
  New-Item -ItemType Directory -Force -Path (Split-Path $RuntimePath -Parent) | Out-Null
  git clone --branch main --single-branch origin $RuntimePath
} elseif (-not (Test-Path (Join-Path $RuntimePath '.git'))) {
  throw "Runtime path exists but is not a git clone: $RuntimePath"
}

$runner = Join-Path $RuntimePath 'automation\windows\run-hermes-weekly.ps1'
Set-Location $RuntimePath
git fetch origin main
git reset --hard origin/main

if (-not (Test-Path $runner)) {
  throw "HERMES runner not found after runtime sync: $runner"
}

# Monday at 08:00 in Lenovo's Windows local timezone.
$action = New-ScheduledTaskAction `
  -Execute 'powershell.exe' `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$runner`" -RepoPath `"$RuntimePath`""

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
Write-Host "Development checkout: $DevRepoPath"
Write-Host "Isolated HERMES runtime: $RuntimePath"
Write-Host "Runner: $runner"
Write-Host "User: $currentUser"
Write-Host "StartWhenAvailable: enabled"
Write-Host "Retries: 3 every 15 minutes"
Write-Host "GitHub weekly schedule must remain enabled until a successful Lenovo test run is confirmed."

Get-ScheduledTask -TaskName $TaskName | Select-Object TaskName, State
Get-ScheduledTaskInfo -TaskName $TaskName | Select-Object LastRunTime, LastTaskResult, NextRunTime
