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
  'scripts\hermes\industry-sweep-reliable.mjs',
  'scripts\hermes\validate-sweep-checkpoint.mjs',
  'scripts\hermes\validate-operational-state.mjs',
  'scripts\hermes\validate-runner-contract.mjs'
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

Write-Host "`n=== HERMES RUNNER CONTRACT ==="
& $node (Join-Path $RepoRoot 'scripts\hermes\validate-runner-contract.mjs')
if ($LASTEXITCODE -ne 0) { throw 'HERMES runner reliability contract failed.' }

$recovery = Get-ScheduledTask -TaskPath $TaskPath -TaskName 'HERMES Recovery' -ErrorAction Stop
$recoveryInfo = Get-ScheduledTaskInfo -TaskPath $TaskPath -TaskName 'HERMES Recovery'
Write-Host "Scheduler credentials preserved; existing Recovery trigger left unchanged."
Write-Host "Recovery next scheduled run: $($recoveryInfo.NextRunTime)"

$stateRoot = 'C:\ELIMSERVER\state\hermes'
$pending = Join-Path $stateRoot 'recovery-pending.json'

# Reconcile the control-plane pending state against the authoritative sweep checkpoint.
if (Test-Path $pending) {
  $pendingState = Get-Content $pending -Raw | ConvertFrom-Json
  $cycle = [string]$pendingState.cycle
  $sweepPath = Join-Path $stateRoot ("sweep-$cycle.json")

  if (Test-Path $sweepPath) {
    $sweepState = Get-Content $sweepPath -Raw | ConvertFrom-Json
    $totalWork = [int]$sweepState.total_work
    $completedCount = @($sweepState.completed_work).Count
    $sweepComplete = ($sweepState.complete -eq $true) -and ($totalWork -gt 0) -and ($completedCount -eq $totalWork)

    if (-not $sweepComplete) {
      $reconciled = @{
        cycle = $cycle
        attempts = [int]$pendingState.attempts
        updatedAt = (Get-Date).ToUniversalTime().ToString('o')
        failed = @('sweep')
        emailState = 'NOT_ATTEMPTED_PIPELINE_INCOMPLETE'
        reconciledFromCheckpoint = $true
      }
      $reconciled | ConvertTo-Json | Set-Content $pending -Encoding UTF8
      Write-Host "RECOVERY STATE RECONCILED: sweep incomplete ($completedCount/$totalWork); pending reset to sweep."
    } else {
      Write-Host "Sweep checkpoint COMPLETE ($completedCount/$totalWork)."
    }
  }
}

# Certify the full operational state before starting another Recovery run.
$oldStateRoot = $env:HERMES_STATE_ROOT
$oldCycleId = $env:HERMES_CYCLE_ID
try {
  $env:HERMES_STATE_ROOT = $stateRoot
  if (Test-Path $pending) {
    $certPending = Get-Content $pending -Raw | ConvertFrom-Json
    $env:HERMES_CYCLE_ID = [string]$certPending.cycle
  } else {
    Remove-Item Env:HERMES_CYCLE_ID -ErrorAction SilentlyContinue
  }
  & $node (Join-Path $RepoRoot 'scripts\hermes\validate-operational-state.mjs')
  if ($LASTEXITCODE -ne 0) { throw 'HERMES operational state certification failed.' }
  Write-Host "Operational state certificate: $stateRoot\operational-validation.json"
}
finally {
  if ($null -ne $oldStateRoot) { $env:HERMES_STATE_ROOT = $oldStateRoot } else { Remove-Item Env:HERMES_STATE_ROOT -ErrorAction SilentlyContinue }
  if ($null -ne $oldCycleId) { $env:HERMES_CYCLE_ID = $oldCycleId } else { Remove-Item Env:HERMES_CYCLE_ID -ErrorAction SilentlyContinue }
}

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
