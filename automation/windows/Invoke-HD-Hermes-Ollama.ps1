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
    elseif ($_.sku -and ((-not $_.PSObject.Properties['duty']) -or $_.duty -eq 'HEAVY_DUTY')) { $_.sku }
  } | ForEach-Object { [string]$_ } | Where-Object { $_ -match '^[A-Z0-9_-]{2,45}$' } | Sort-Object -Unique)
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
    # Old state.completed includes SKUs skipped without evidence; preserve only
    # review files demonstrating Ollama was actually invoked.
    $outDir = Join-Path $stateDir 'reviews'
    New-Item -Path $outDir -ItemType Directory -Force | Out-Null
    $manual = Join-Path $stateDir 'manual-review.csv'
    $reviewed = New-Object 'System.Collections.Generic.HashSet[string]'
    $manualScanned = New-Object 'System.Collections.Generic.HashSet[string]'
    if (Test-Path $manual) {
      foreach ($row in (Import-Csv -LiteralPath $manual)) {
        if ($row.sku -match '^[A-Z0-9_-]{2,45}$') { [void]$manualScanned.Add($row.sku) }
      }
    } else { 'sku,reason' | Set-Content -LiteralPath $manual -Encoding ASCII }
    foreach ($file in @(Get-ChildItem -LiteralPath $outDir -Filter '*.review.json' -File -ErrorAction SilentlyContinue)) {
      try {
        $rec = Get-Content -LiteralPath $file.FullName -Raw | ConvertFrom-Json
        if ($rec.status -eq 'REVIEW_REQUIRED' -and $rec.provider -eq 'HERMES_LOCAL_OLLAMA') {
          [void]$reviewed.Add([string]$rec.sku)
        }
      } catch { LogLine ('REVIEW_FILE_INVALID ' + $file.Name) }
    }
    # New SKUs are examined once per catalogue snapshot, not retried forever
    # without evidence. Previously skipped SKUs become eligible when a bundle appears.
    $unscanned = @($all | Where-Object { -not $reviewed.Contains($_) -and -not $manualScanned.Contains($_) })
    $newScan = @($unscanned | Select-Object -First 100)
    # Acquire only previously unattempted official canonical URLs.
    # Missing evidence is still assigned to manual review, never certified.
    $attemptsFile = Join-Path $stateDir 'official-acquisition-attempted-redirect-v2.txt'
    $attempted = New-Object 'System.Collections.Generic.HashSet[string]'
    if (Test-Path $attemptsFile) {
      foreach ($key in (Get-Content -LiteralPath $attemptsFile)) { [void]$attempted.Add([string]$key) }
    }
    $acquire = @($all | Where-Object {
      -not $attempted.Contains($_) -and -not $reviewed.Contains($_)
    } | Select-Object -First 8)
    if ($acquire.Count -gt 0) {
      $acquirer = Join-Path $repo 'scripts\hermes\hd-official-bundle-acquisition.mjs'
      $acquireList = Join-Path $stateDir 'official-acquisition-batch.txt'
      [System.IO.File]::WriteAllLines($acquireList,[string[]]$acquire,(New-Object System.Text.UTF8Encoding($false)))
      if (Test-Path $acquirer) {
        $node = (Get-Command node -ErrorAction Stop).Source
        & $node $acquirer --sku-file $acquireList --bundle-dir $bundleDir --allowed-hosts $allowedHosts 2>&1 | Out-File -LiteralPath $logPath -Append -Encoding utf8
        if ($LASTEXITCODE -eq 0) {
          Add-Content -LiteralPath $attemptsFile -Value $acquire
          LogLine ('OFFICIAL_ACQUISITION_ATTEMPTED=' + $acquire.Count)
        } else {
          LogLine 'OFFICIAL_ACQUISITION_FAILED_NO_CATALOGUE_WRITES'
        }
      } else { LogLine 'OFFICIAL_ACQUIRER_NOT_INSTALLED' }
    }
    $compactAttemptsFile = Join-Path $stateDir 'ollama-compact-attempted.txt'
    $compactAttempts = New-Object 'System.Collections.Generic.HashSet[string]'
    if (Test-Path $compactAttemptsFile) {
      foreach ($skuAttempt in (Get-Content -LiteralPath $compactAttemptsFile)) { [void]$compactAttempts.Add([string]$skuAttempt) }
    }
    $newlyAvailable = @($all | Where-Object {
      $manualScanned.Contains($_) -and -not $reviewed.Contains($_) -and
      -not $compactAttempts.Contains($_) -and
      (Test-Path (Join-Path $bundleDir ($_ + '.json')))
    } | Select-Object -First 2)
    $ready = New-Object 'System.Collections.Generic.List[string]'
    foreach ($sku in $newlyAvailable) { [void]$ready.Add([string]$sku) }
    foreach ($sku in $newScan) {
      if (Test-Path (Join-Path $bundleDir ($sku + '.json'))) {
        if ($ready.Count -lt 2 -and -not $compactAttempts.Contains($sku) -and -not $ready.Contains($sku)) { [void]$ready.Add([string]$sku) }
      } else {
        Add-Content -LiteralPath $manual -Value ($sku + ',OFFICIAL_EVIDENCE_BUNDLE_MISSING')
        [void]$manualScanned.Add([string]$sku)
      }
    }
    if ($ready.Count -gt 0) {
      $list = Join-Path $stateDir 'current-batch.txt'
      [System.IO.File]::WriteAllLines($list,[string[]]$ready,(New-Object System.Text.UTF8Encoding($false)))
      $node = (Get-Command node -ErrorAction Stop).Source
      & $node $module --sku-file $list --bundle-dir $bundleDir --out-dir $outDir --allowed-hosts $allowedHosts --limit 2 --model qwen3:1.7b 2>&1 | Out-File -LiteralPath $logPath -Append -Encoding utf8
      if ($LASTEXITCODE -ne 0) { LogLine ('BATCH_ERROR exit=' + $LASTEXITCODE); return }
      Add-Content -LiteralPath $compactAttemptsFile -Value @($ready)
      foreach ($sku in $ready) {
        $result = Join-Path $outDir ($sku + '.review.json')
        if (-not (Test-Path $result)) { LogLine ('BATCH_RESULT_MISSING ' + $sku); continue }
        $rec = Get-Content -LiteralPath $result -Raw | ConvertFrom-Json
        if ($rec.status -eq 'REVIEW_REQUIRED') {
          [void]$reviewed.Add([string]$sku)
        } elseif ($manualScanned.Add([string]$sku)) {
          Add-Content -LiteralPath $manual -Value ($sku + ',' + $rec.status + '_' + $rec.reason)
        }
      }
    }
    $state = [pscustomobject]@{
      version=2
      reviewed=@($reviewed | Sort-Object)
      missing_evidence=$manualScanned.Count
      last_update=(Get-Date).ToString('o')
      total=$all.Count
    }
    SaveState $state
    LogLine ('CYCLE_DONE newly_scanned=' + $newScan.Count + ' ollama_attempted=' + $ready.Count + ' reviewed=' + $reviewed.Count + ' manual_queue=' + $manualScanned.Count + ' total_snapshot=' + $all.Count)
    if (-not $newScan.Count -and -not $ready.Count) {
      LogLine 'WAITING_FOR_NEW_OFFICIAL_EVIDENCE_BUNDLES'
    }
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
$moduleSource = & $git -C $repo show 'refs/remotes/origin/hd-local-ollama-review:scripts/hermes/hd-local-evidence-review.mjs'
if ($LASTEXITCODE -ne 0 -or -not $moduleSource) { throw 'FETCH_HD_REVIEW_MODULE_FAILED' }
$moduleText = ($moduleSource -join [Environment]::NewLine) + [Environment]::NewLine
if ((-not (Test-Path $module)) -or ((Get-Content -LiteralPath $module -Raw) -ne $moduleText)) {
  if (Test-Path $module) { Copy-Item -LiteralPath $module -Destination (Join-Path $stateDir 'hd-local-evidence-review.previous.mjs') -Force }
  [System.IO.File]::WriteAllText($module,$moduleText,(New-Object System.Text.UTF8Encoding($false)))
  LogLine 'HD_LOCAL_REVIEW_UPDATED_FROM_BRANCH'
}
$interpreter = Join-Path $repo 'scripts\hermes\local-evidence-ollama.mjs'
if (-not (Test-Path $interpreter)) { throw 'EXISTING_HERMES_ADAPTER_MISSING' }
$interpreterSource = & $git -C $repo show 'refs/remotes/origin/hd-local-ollama-review:scripts/hermes/local-evidence-ollama.mjs'
if ($LASTEXITCODE -ne 0 -or -not $interpreterSource) { throw 'FETCH_EXISTING_HERMES_ADAPTER_FAILED' }
$interpreterText = ($interpreterSource -join [Environment]::NewLine) + [Environment]::NewLine
if ((Get-Content -LiteralPath $interpreter -Raw) -ne $interpreterText) {
  Copy-Item -LiteralPath $interpreter -Destination (Join-Path $stateDir 'local-evidence-ollama.previous.mjs') -Force
  [System.IO.File]::WriteAllText($interpreter,$interpreterText,(New-Object System.Text.UTF8Encoding($false)))
  LogLine 'HERMES_OLLAMA_COMPACT_MODE_UPDATED'
}
& node --check $interpreter
if ($LASTEXITCODE -ne 0) { throw 'INTERPRETER_SYNTAX_ERROR' }
$acquirerPath = Join-Path $repo 'scripts\hermes\hd-official-bundle-acquisition.mjs'
$acquirerSource = & $git -C $repo show 'refs/remotes/origin/hd-local-ollama-review:scripts/hermes/hd-official-bundle-acquisition.mjs'
if ($LASTEXITCODE -ne 0 -or -not $acquirerSource) { throw 'FETCH_OFFICIAL_ACQUIRER_FAILED' }
$acquirerText = ($acquirerSource -join [Environment]::NewLine) + [Environment]::NewLine
if ((-not (Test-Path $acquirerPath)) -or ((Get-Content -LiteralPath $acquirerPath -Raw) -ne $acquirerText)) {
  if (Test-Path $acquirerPath) { Copy-Item -LiteralPath $acquirerPath -Destination (Join-Path $stateDir 'hd-official-bundle-acquisition.previous.mjs') -Force }
  [System.IO.File]::WriteAllText($acquirerPath,$acquirerText,(New-Object System.Text.UTF8Encoding($false)))
  LogLine 'OFFICIAL_ACQUIRER_UPDATED_FROM_BRANCH'
}
& node --check $acquirerPath
if ($LASTEXITCODE -ne 0) { throw 'ACQUIRER_SYNTAX_ERROR' }
$acquirerTest = Join-Path $repo 'tests\hd-official-bundle-acquisition.test.mjs'
$testSource = & $git -C $repo show 'refs/remotes/origin/hd-local-ollama-review:tests/hd-official-bundle-acquisition.test.mjs'
if ($LASTEXITCODE -ne 0 -or -not $testSource) { throw 'FETCH_ACQUIRER_TEST_FAILED' }
$testText = ($testSource -join [Environment]::NewLine) + [Environment]::NewLine
if ((-not (Test-Path $acquirerTest)) -or ((Get-Content -LiteralPath $acquirerTest -Raw) -ne $testText)) {
  [System.IO.File]::WriteAllText($acquirerTest,$testText,(New-Object System.Text.UTF8Encoding($false)))
}
$compactTest = Join-Path $repo 'tests\hd-local-compact-ollama.test.mjs'
$compactSource = & $git -C $repo show 'refs/remotes/origin/hd-local-ollama-review:tests/hd-local-compact-ollama.test.mjs'
if ($LASTEXITCODE -ne 0 -or -not $compactSource) { throw 'FETCH_COMPACT_TEST_FAILED' }
[System.IO.File]::WriteAllText($compactTest,(($compactSource -join [Environment]::NewLine) + [Environment]::NewLine),(New-Object System.Text.UTF8Encoding($false)))
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
  & node --test $testPath $acquirerTest $compactTest
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
