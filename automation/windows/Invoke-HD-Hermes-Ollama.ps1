# Install and run bounded, resumable HERMES/Ollama HD review.
# Never updates PostgreSQL, applications, or certification.
param([switch]$Cycle)
$ErrorActionPreference = 'Stop'
$repo = 'C:\ELIMSERVER\work\hd-recovery'
$evidenceRoot = 'C:\ELIMSERVER\evidence\hd-audit-20261106'
$stateDir = Join-Path $evidenceRoot 'ollama-hd-autonomous'
$bundleDir = if ($env:HERMES_OFFICIAL_EVIDENCE_BUNDLE_DIR) { $env:HERMES_OFFICIAL_EVIDENCE_BUNDLE_DIR } else { Join-Path $evidenceRoot 'official-bundles' }
$allowedHosts = if ($env:HERMES_OFFICIAL_SOURCE_HOSTS) { $env:HERMES_OFFICIAL_SOURCE_HOSTS } else { 'donaldson.com,parker.com,fleetguard.com,cummins.com,mann-filter.com' }
$taskName = 'ELIMFILTERS-HD-HERMES-OLLAMA-REVIEW'
$scriptPath = Join-Path $stateDir 'Invoke-HD-Hermes-Ollama.ps1'
$logPath = Join-Path $stateDir 'worker.log'
$statePath = Join-Path $stateDir 'state.json'
New-Item -ItemType Directory -Path $stateDir -Force | Out-Null
function LogLine([string]$message) {
  $message = ('{0} {1}' -f (Get-Date -Format o), $message)
  Add-Content -LiteralPath $logPath -Value $message
  Write-Host $message
}
function SaveState($state) {
  $tmp = $statePath + '.writing'
  $json = $state | ConvertTo-Json -Depth 8
  [System.IO.File]::WriteAllText($tmp,$json,(New-Object System.Text.UTF8Encoding($false)))
  Move-Item -LiteralPath $tmp -Destination $statePath -Force
}
function GetSkuList {
  $snapshot = Join-Path $evidenceRoot 'hd-active-snapshot.json'
  if (-not (Test-Path $snapshot)) {
    # Known HD conflict queue from verified run_273 v2 dry-run; explicitly HD only.
    # Does not invent a full-catalogue snapshot and never silently processes LD.
    $known='EA10696 EA11373 EA11750 EA11767 EA12148 EA12481 EA13553 EA13611 EA13881 EA15362 EA15903 EA15904 EA16062 EA16409 EA16921 EA17360 EA18653 EA20161 EA27455 EF95686 EH60085 EH60747 EH60752 EH60754 EH60756 EH61371 EH61372 EH61373 EH61374 EH61376 EH61386 EH61387 EH61388 EH61464 EH61560 EH61735 EH61736 EH61819 EH62326 EH62328 EH63729 EH63730 EH63731 EH63732 EH63733 EH63734 EH63735 EH63736 EH64015 EH64016 EH64292 EH64293 EH64300 EH64301 EH64861 EH64862 EH64863 EH64866 EH64867 EH64868 EH64869 EH64870 EH64936 EH64937 EH64939 EH66225 EH66226 EH66228 EH66464 EH66469 EH66481 EH66482 EH66633 EH66670 EH66671 EH66684 EH66961 EH66962 EH66963 EH66964 EH67021 EH67022 EH67027 EH67028 EH67040 EH67046 EH67084 EH68713 EH68714 EH68716 ES91437 ES94943'
    LogLine 'HD_ACTIVE_SNAPSHOT_MISSING_USING_VERIFIED_92_SKU_CONFLICT_SET'
    return @($known -split ' ')
  }
  $parsed = Get-Content -LiteralPath $snapshot -Raw | ConvertFrom-Json
  $records = if ($parsed -is [array]) { $parsed } elseif ($parsed.skus) { $parsed.skus } elseif ($parsed.rows) { $parsed.rows } elseif ($parsed.items) { $parsed.items } else { throw 'UNKNOWN_HD_SNAPSHOT_SHAPE' }
  $all = @($records | ForEach-Object {
    if ($_ -is [string]) { $_ }
    elseif ($_.sku) { $_.sku }
  } | Where-Object { $_ -and $_ -match '^[A-Z]{2}[0-9]{4,8}$' } | Sort-Object -Unique)
  if ($all.Count -lt 1) { throw 'HD_SNAPSHOT_EMPTY_OR_INVALID' }
  return $all
}
function RunCycle {
  $lock = New-Object System.Threading.Mutex($false,'Local\ELIMFILTERS_HD_HERMES_OLLAMA_REVIEW')
  if (-not $lock.WaitOne(0)) { LogLine 'ALREADY_RUNNING'; return }
  try {
    if ((Get-PSDrive C).Free -lt 3GB) { LogLine 'BLOCKED_DISK_BELOW_3_GB'; return }
    $module = Join-Path $repo 'scripts\hermes\hd-local-evidence-review.mjs'
    if (-not (Test-Path $module)) { LogLine 'BLOCKED_REVIEW_MODULE_MISSING'; return }
    $all = @(GetSkuList)
    $state = if (Test-Path $statePath) { Get-Content $statePath -Raw | ConvertFrom-Json } else { [pscustomobject]@{version=1; completed=@(); last_update=$null} }
    $done = New-Object 'System.Collections.Generic.HashSet[string]'
    foreach($s in $state.completed) { [void]$done.Add([string]$s) }
    $pending = @($all | Where-Object { -not $done.Contains($_) })
    if ($pending.Count -eq 0) { LogLine ('QUEUE_EMPTY processed=' + $done.Count); return }
    $outDir = Join-Path $stateDir 'reviews'
    New-Item -Path $outDir -ItemType Directory -Force | Out-Null
    $manual = Join-Path $stateDir 'manual-review.csv'
    if (-not (Test-Path $manual)) { 'sku,reason' | Set-Content -LiteralPath $manual -Encoding ASCII }
    $selected = @($pending | Select-Object -First 100)
    $ready = @()
    foreach($sku in $selected) {
      if (Test-Path (Join-Path $bundleDir ($sku + '.json'))) { $ready += $sku }
      else {
        Add-Content -LiteralPath $manual -Value ($sku + ',OFFICIAL_EVIDENCE_BUNDLE_MISSING')
        [void]$done.Add($sku)
      }
      if ($ready.Count -ge 3) { break }
    }
    if ($ready.Count -gt 0) {
      $list = Join-Path $stateDir 'current-batch.txt'
      [System.IO.File]::WriteAllLines($list,[string[]]$ready,(New-Object System.Text.UTF8Encoding($false)))
      $node = (Get-Command node -ErrorAction Stop).Source
      & $node $module --sku-file $list --bundle-dir $bundleDir --out-dir $outDir --allowed-hosts $allowedHosts --limit 3 2>&1 | Out-File -LiteralPath $logPath -Append -Encoding utf8
      if ($LASTEXITCODE -ne 0) { LogLine ('BATCH_ERROR exit=' + $LASTEXITCODE); return }
      foreach($sku in $ready) {
        $result = Join-Path $outDir ($sku + '.review.json')
        if (-not (Test-Path $result)) { LogLine ('BATCH_RESULT_MISSING ' + $sku); continue }
        $rec = Get-Content -LiteralPath $result -Raw | ConvertFrom-Json
        if ($rec.status -ne 'REVIEW_REQUIRED') {
          Add-Content -LiteralPath $manual -Value ($sku + ',' + $rec.status + '_' + $rec.reason)
        }
        [void]$done.Add($sku)
      }
    }
    $state = [pscustomobject]@{version=1; completed=@($done | Sort-Object); last_update=(Get-Date).ToString('o'); total=$all.Count}
    SaveState $state
    LogLine ('CYCLE_DONE examined=' + $selected.Count + ' ollama=' + $ready.Count + ' completed=' + $done.Count + ' total=' + $all.Count)
  } catch {
    LogLine ('CYCLE_ERROR ' + $_.Exception.Message)
    throw
  } finally {
    $lock.ReleaseMutex()
    $lock.Dispose()
  }
}
if ($Cycle) { RunCycle; exit 0 }
if (-not (Test-Path (Join-Path $repo '.git'))) { throw ('HD_WORKTREE_MISSING ' + $repo) }
$git=(Get-Command git -ErrorAction Stop).Source
& $git -C $repo fetch origin 'refs/heads/feat/hd-hermes-ollama-evidence-pilot-20261108:refs/remotes/origin/hd-local-ollama-review'
if ($LASTEXITCODE -ne 0) { throw 'FETCH_PR1270_FAILED' }
$module = Join-Path $repo 'scripts\hermes\hd-local-evidence-review.mjs'
if (-not (Test-Path $module)) {
  $source = & $git -C $repo show 'refs/remotes/origin/hd-local-ollama-review:scripts/hermes/hd-local-evidence-review.mjs'
  if ($LASTEXITCODE -ne 0) { throw 'FETCH_MODULE_FAILED' }
  [System.IO.File]::WriteAllText($module, (($source -join [Environment]::NewLine) + [Environment]::NewLine), (New-Object System.Text.UTF8Encoding($false)))
}
if (-not (Test-Path (Join-Path $repo 'scripts\hermes\local-evidence-ollama.mjs'))) { throw 'EXISTING_HERMES_ADAPTER_MISSING' }
& node --check $module
if ($LASTEXITCODE -ne 0) { throw 'MODULE_SYNTAX_ERROR' }
$testPath = Join-Path $repo 'tests\hd-local-evidence-review.test.mjs'
if (-not (Test-Path $testPath)) {
  $testSource = & $git -C $repo show 'refs/remotes/origin/hd-local-ollama-review:tests/hd-local-evidence-review.test.mjs'
  if ($LASTEXITCODE -ne 0) { throw 'FETCH_TESTS_FAILED' }
  [System.IO.File]::WriteAllText($testPath, (($testSource -join [Environment]::NewLine) + [Environment]::NewLine), (New-Object System.Text.UTF8Encoding($false)))
}
Push-Location $repo
try {
  & node --test $testPath
  if ($LASTEXITCODE -ne 0) { throw 'UNIT_TESTS_FAILED' }
} finally { Pop-Location }
$scriptContent = Get-Content -LiteralPath $PSCommandPath -Raw
[System.IO.File]::WriteAllText($scriptPath,$scriptContent,(New-Object System.Text.UTF8Encoding($false)))
$action=New-ScheduledTaskAction -Execute 'powershell.exe' -Argument ('-NoProfile -NonInteractive -ExecutionPolicy Bypass -File "{0}" -Cycle' -f $scriptPath)
$trigger=New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 15) -RepetitionDuration (New-TimeSpan -Days 30)
$principal=New-ScheduledTaskPrincipal -UserId ([Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType Interactive -RunLevel Limited
$settings=New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 13) -StartWhenAvailable
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null
LogLine 'SUPERVISED_TASK_REGISTERED'
RunCycle
Get-ScheduledTask -TaskName $taskName | Select-Object TaskName,State
LogLine 'EVIDENCE_REVIEW_ONLY_NO_POSTGRESQL_WRITES_NO_AUTO_CERTIFICATION'
