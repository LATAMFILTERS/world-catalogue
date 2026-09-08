param(
  [string]$RepoPath = "C:\ELIMSERVER\repos\world-catalogue",
  [string]$TaskName = "ELIMFILTERS-Lenovo-Backup",
  [string]$RunAt = "02:30"
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path (Join-Path $RepoPath '.git'))) {
  throw "Repository not found: $RepoPath"
}

$runner = Join-Path $RepoPath 'automation\windows\backup-lenovo.ps1'
if (-not (Test-Path $runner)) {
  throw "Backup runner not found: $runner"
}

$action = New-ScheduledTaskAction `
  -Execute 'powershell.exe' `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$runner`""

$trigger = New-ScheduledTaskTrigger -Daily -At $RunAt

$settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Hours 2) `
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
Write-Host "Schedule: daily $RunAt (Windows local timezone)"
Write-Host "Runner: $runner"
Write-Host "Local backup root: C:\ELIMSERVER\backups\lenovo"
Write-Host "Retention: 30 days"
Write-Host "R2: automatic when ELIM_R2_REMOTE is set and rclone is installed/configured"
Write-Host "User: $currentUser"

Get-ScheduledTask -TaskName $TaskName | Select-Object TaskName,State
Get-ScheduledTaskInfo -TaskName $TaskName | Select-Object LastRunTime,LastTaskResult,NextRunTime
