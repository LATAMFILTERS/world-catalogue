[CmdletBinding()]
param(
  [string]$RepoRoot = 'C:\ELIMSERVER\repos\world-catalogue',
  [string]$TaskPath = '\ELIMFILTERS\'
)

$ErrorActionPreference = 'Stop'
$runner = Join-Path $RepoRoot 'scripts\hermes\windows\Invoke-HermesLocal.ps1'
if (-not (Test-Path $runner)) { throw "Runner not found: $runner" }
if ((Get-TimeZone).Id -ne 'Central Standard Time') { throw 'Set Windows time zone to Central Standard Time first.' }

Write-Host 'Use the same Windows account that created the encrypted HERMES vault.'
$credential = Get-Credential -UserName "$env:USERDOMAIN\$env:USERNAME" -Message 'Windows credentials for the HERMES scheduled tasks'
$plainPassword = $credential.GetNetworkCredential().Password

$powerShell = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -WakeToRun -ExecutionTimeLimit (New-TimeSpan -Hours 3) -MultipleInstances IgnoreNew

$weeklyAction = New-ScheduledTaskAction -Execute $powerShell -Argument "-NoProfile -NonInteractive -ExecutionPolicy Bypass -File `"$runner`" -Mode Weekly" -WorkingDirectory $RepoRoot
$weeklyTrigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At '08:00'
Register-ScheduledTask -TaskName 'HERMES Weekly' -TaskPath $TaskPath -Action $weeklyAction -Trigger $weeklyTrigger -Settings $settings -User $credential.UserName -Password $plainPassword -RunLevel Limited -Force | Out-Null

# Recovery is checkpoint-aware and safe to invoke frequently. Thirty minutes is
# short enough to resume promptly after transient provider recovery, while the
# runner lock and per-item nextAttemptAt prevent duplicate work or API hammering.
$recoveryAction = New-ScheduledTaskAction -Execute $powerShell -Argument "-NoProfile -NonInteractive -ExecutionPolicy Bypass -File `"$runner`" -Mode Recovery" -WorkingDirectory $RepoRoot
$recoveryTrigger = New-ScheduledTaskTrigger -Once -At ((Get-Date).AddMinutes(5)) -RepetitionInterval (New-TimeSpan -Minutes 30)
Register-ScheduledTask -TaskName 'HERMES Recovery' -TaskPath $TaskPath -Action $recoveryAction -Trigger $recoveryTrigger -Settings $settings -User $credential.UserName -Password $plainPassword -RunLevel Limited -Force | Out-Null

$plainPassword = $null
$credential = $null

Get-ScheduledTask -TaskPath $TaskPath | Where-Object TaskName -Like 'HERMES*' | Select-Object TaskName,State,@{Name='NextRun';Expression={(Get-ScheduledTaskInfo -TaskName $_.TaskName -TaskPath $_.TaskPath).NextRunTime}}
