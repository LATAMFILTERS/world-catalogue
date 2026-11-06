# Safe, non-disruptive release staging for Part Search. NEVER restarts production.
[CmdletBinding()]
param(
  [string]$Runtime = 'C:\ELIMSERVER\worktrees\search-cutover',
  [string]$StageRoot = 'C:\ELIMSERVER\worktrees\search-release-staging',
  [string]$Node = 'C:\Users\ELIMSERVER\AppData\Local\nvm\v22.23.4\node.exe',
  [switch]$InstallDependencies
)
$ErrorActionPreference = 'Stop'
$git = (Get-Command git -ErrorAction Stop).Source
$runtimeSeo = Join-Path $Runtime 'lib\install-part-seo-pages.js'
if (!(Test-Path $runtimeSeo) -or !(Test-Path $Node)) { throw 'Missing runtime SEO module or Node executable' }

function RunGit([string[]]$argv) {
  $output = & $git -C $Runtime @argv 2>&1
  if ($LASTEXITCODE -ne 0) { throw "git command failed: $output" }
  return $output
}

$beforeStatus = @(& $git -C $Runtime status --porcelain=v1 --untracked-files=all)
if ($LASTEXITCODE -ne 0) { throw 'Cannot inspect runtime status' }
$beforeCommit = (RunGit @('rev-parse','HEAD') | Select-Object -First 1)
$beforeHash = (Get-FileHash $runtimeSeo -Algorithm SHA256).Hash

# Fetch is safe for dirty worktrees; do not checkout, reset, merge or stash runtime.
RunGit @('fetch','origin','main') | Out-Null
$target = (RunGit @('rev-parse','refs/remotes/origin/main') | Select-Object -First 1)
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$stage = Join-Path $StageRoot "search-$stamp"
if (Test-Path $stage) { throw 'Staging directory already exists' }
New-Item -ItemType Directory -Force -Path $StageRoot | Out-Null
RunGit @('worktree','add','--detach',$stage,$target) | Out-Null

$seo = Join-Path $stage 'lib\install-part-seo-pages.js'
$test = Join-Path $stage 'tests\part-seo-retired-sku.test.js'
if (!(Test-Path $seo) -or !(Test-Path $test)) { throw "BLOCKED: required files missing in $stage" }
& $Node --check $seo
if ($LASTEXITCODE -ne 0) { throw 'BLOCKED: SEO syntax failed' }
& $Node --check $test
if ($LASTEXITCODE -ne 0) { throw 'BLOCKED: regression syntax failed' }

if ($InstallDependencies) {
  $npm = (Get-Command npm.cmd -ErrorAction Stop).Source
  Push-Location $stage
  try {
    & $npm ci --ignore-scripts --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { throw 'BLOCKED: staging npm ci failed' }
  } finally { Pop-Location }
}

$testStatus = 'NOT_RUN: staging dependencies absent'
if (Test-Path (Join-Path $stage 'node_modules\express')) {
  Push-Location $stage
  try {
    & $Node --test 'tests/part-seo-retired-sku.test.js'
    if ($LASTEXITCODE -ne 0) { throw 'BLOCKED: regression test failed' }
    $testStatus = 'PASS'
  } finally { Pop-Location }
}

$afterStatus = @(& $git -C $Runtime status --porcelain=v1 --untracked-files=all)
if ($LASTEXITCODE -ne 0) { throw 'Cannot verify runtime status' }
$afterCommit = (RunGit @('rev-parse','HEAD') | Select-Object -First 1)
$afterHash = (Get-FileHash $runtimeSeo -Algorithm SHA256).Hash
if ($beforeCommit -ne $afterCommit -or $beforeHash -ne $afterHash -or
  (($beforeStatus -join [char]10) -ne ($afterStatus -join [char]10))) {
  throw 'NO-GO: runtime changed during staging'
}

$report = [ordered]@{
  release_status = if ($testStatus -eq 'PASS') { 'STAGED_ONLY' } else { 'BLOCKED_TESTS' }
  source_commit = $target
  stage = $stage
  live_commit = $afterCommit
  live_seo_sha256 = $afterHash
  preserved_uncommitted_entries = $afterStatus.Count
  regression_test = $testStatus
  production_cutover = 'NOT_PERFORMED'
  next_gate = 'Review runtime-only modifications and compatibility before directing scheduled task to stage'
}
$report | ConvertTo-Json -Depth 3 | Set-Content (Join-Path $stage 'release-preflight.json') -Encoding UTF8
$report | Format-List
