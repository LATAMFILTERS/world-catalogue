[CmdletBinding()]
param(
  [string]$RepoRoot = 'C:\ELIMSERVER\repos\world-catalogue',
  [string]$TaskPath = '\ELIMFILTERS\'
)

$ErrorActionPreference = 'Stop'
Set-Location $RepoRoot

Write-Host "=== HERMES RELIABILITY APPLY ==="
Write-Host "Repo: $RepoRoot"

$node = 'C:\Program Files\nodejs\node.exe'
if (-not (Test-Path $node)) { throw "Node.js not found: $node" }

$jsFiles = @(
  'scripts\hermes\industry-sweep-compound.mjs',
  'scripts\hermes\research-real-candidates-compound.mjs',
  'scripts\hermes\industry-sweep-reliable.mjs'
)

foreach ($file in $jsFiles) {
  & $node --check (Join-Path $RepoRoot $file)
  if ($LASTEXITCODE -ne 0) { throw "Node syntax validation failed: $file" }
  Write-Host "PASS node --check $file"
}

$psFiles = @(
  'scripts\hermes\windows\Invoke-HermesLocal.ps1',
  'scripts\hermes\windows\Install-HermesScheduledTasks.ps1',
  'scripts\hermes\windows\Apply-HermesReliabilityFix.ps1'
)

foreach ($file in $psFiles) {
  $tokens = $null
  $errors = $null
  [void][System.Management.Automation.Language.Parser]::ParseFile((Join-Path $RepoRoot $file), [ref]$tokens, [ref]$errors)
  if ($errors.Count -gt 0) {
    $errors | ForEach-Object { Write-Host $_.Message }
    throw "PowerShell syntax validation failed: $file"
  }
  Write-Host "PASS PowerShell parse $file"
}

# Do not modify the ScheduledTask trigger here. Tasks registered with LogonType=Password
# require the account password again on Set-ScheduledTask. HERMES reliability is enforced
# inside Invoke-HermesLocal.ps1 by lock/checkpoint/retry-state, so an existing trigger may
# fire more frequently without duplicating completed work or losing the pending cycle.
$recovery = Get-ScheduledTask -TaskPath $TaskPath -TaskName 'HERMES Recovery' -ErrorAction Stop
$recoveryInfo = Get-ScheduledTaskInfo -TaskPath $TaskPath -TaskName 'HERMES Recovery'
Write-Host "Scheduler credentials preserved; existing Recovery trigger left unchanged."
Write-Host "Recovery next scheduled run: $($recoveryInfo.NextRunTime)"

$pending = 'C:\ELIMSERVER\state\hermes\recovery-pending.json'
if (Test-Path $pending) {
  Write-Host "Pending recovery found. Starting HERMES Recovery with checkpoint-aware runner."
  if ($recovery.State -ne 'Running') {
    Start-ScheduledTask -TaskPath $TaskPath -TaskName 'HERMES Recovery'
  } else {
    Write-Host "HERMES Recovery is already running; no duplicate instance started."
  }
} else {
  Write-Host "No recovery pending. Scheduler is ready for the next cycle."
}

Write-Host "`n=== TASK MATRIX ==="
Get-ScheduledTask -TaskPath $TaskPath | Where-Object TaskName -Like 'HERMES*' | ForEach-Object {
  $info = Get-ScheduledTaskInfo -TaskPath $_.TaskPath -TaskName $_.TaskName
  [pscustomobject]@{
    Task = $_.TaskName
    State = $_.State
    LastRun = $info.LastRunTime
    LastResult = $info.LastTaskResult
    NextRun = $info.NextRunTime
  }
} | Format-Table -AutoSize

Write-Host "`n=== CURRENT COMMIT ==="
& git rev-parse --short HEAD

Write-Host "`nHERMES reliability apply completed."
