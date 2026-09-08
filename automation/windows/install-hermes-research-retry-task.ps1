param(
  [string]$RepoPath = "C:\ELIMSERVER\repos\world-catalogue",
  [string]$TaskName = "ELIMFILTERS-HERMES-Research-Retry",
  [int]$IntervalHours = 6
)

$ErrorActionPreference = 'Stop'
$runner = Join-Path $RepoPath 'automation\windows\run-hermes-research-retry.ps1'
if (-not (Test-Path $runner)) { throw "Runner not found: $runner" }

$user = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$runner`""
$trigger = New-ScheduledTaskTrigger -Once -At ((Get-Date).AddMinutes(3)) -RepetitionInterval (New-TimeSpan -Hours $IntervalHours)
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Hours 2) -RestartCount 2 -RestartInterval (New-TimeSpan -Minutes 10)
$principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Highest

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null

Write-Host "Installed: $TaskName"
Write-Host "Interval: every $IntervalHours hours"
Write-Host "Runner: $runner"
Write-Host "User: $user"
Write-Host ''
Write-Host 'HERMES PENDING RESEARCH AUTO-RETRY ACTIVE'
Get-ScheduledTask -TaskName $TaskName | Select-Object TaskName,State
