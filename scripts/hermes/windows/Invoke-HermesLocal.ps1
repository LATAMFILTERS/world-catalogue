[CmdletBinding()]
param(
  [ValidateSet('Weekly','Recovery','Test')]
  [string]$Mode = 'Test',
  [string]$RepoRoot = 'C:\ELIMSERVER\repos\world-catalogue',
  [string]$VaultPath = 'C:\ELIMSERVER\secrets\hermes-secrets.clixml',
  [string]$StateRoot = 'C:\ELIMSERVER\state\hermes',
  [string]$LogRoot = 'C:\ELIMSERVER\logs\hermes'
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
Set-StrictMode -Version 2.0

function Convert-SecureValue([Security.SecureString]$Value) {
  if ($null -eq $Value) { throw 'A required encrypted credential is missing.' }
  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
  try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
}

function Write-Log([string]$Message) {
  $line = '{0} [{1}] {2}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz'), $Mode.ToUpperInvariant(), $Message
  $line | Out-File -FilePath $script:LogFile -Append -Encoding utf8
  Write-Host $line
}

function New-FallbackReport([System.Collections.IDictionary]$Status) {
  $date = Get-Date -Format 'yyyy-MM-dd'
  $path = Join-Path $RepoRoot "hermes\reports\hermes-weekly-$date.md"
  $failed = @($Status.Keys | Where-Object { -not $Status[$_] })
  $body = @(
    '# HERMES Weekly Intelligence Review', '',
    '**PARTIAL / DEGRADED DELIVERY**', '',
    "Generated: $((Get-Date).ToUniversalTime().ToString('o'))", '',
    'HERMES delivered the scheduled notice although one or more stages did not complete.', '',
    "Incomplete stages: $($failed -join ', ')", '',
    'No incomplete result was published or promoted automatically.', '',
    'Decision authority: Victor Abreu.'
  ) -join [Environment]::NewLine
  New-Item -ItemType Directory -Force (Split-Path $path) | Out-Null
  [IO.File]::WriteAllText($path, $body, [Text.UTF8Encoding]::new($false))
  Write-Log "Fallback report created: $path"
}

function Invoke-LimitedProcess {
  param(
    [string]$Name,
    [string]$FilePath,
    [string[]]$Arguments,
    [int]$TimeoutMinutes
  )
  $stdout = Join-Path $env:TEMP ('hermes-{0}-{1}.out' -f $PID, [guid]::NewGuid().ToString('N'))
  $stderr = Join-Path $env:TEMP ('hermes-{0}-{1}.err' -f $PID, [guid]::NewGuid().ToString('N'))
  Write-Log "START $Name (timeout ${TimeoutMinutes}m)"
  try {
    $process = Start-Process -FilePath $FilePath -ArgumentList $Arguments -WorkingDirectory $RepoRoot -NoNewWindow -PassThru -RedirectStandardOutput $stdout -RedirectStandardError $stderr
    if (-not $process.WaitForExit($TimeoutMinutes * 60000)) {
      $process.Kill()
      $process.WaitForExit()
      Write-Log "TIMEOUT $Name"
      return $false
    }
    if (Test-Path $stdout) { Get-Content $stdout | ForEach-Object { Write-Log "[$Name] $_" } }
    if (Test-Path $stderr) { Get-Content $stderr | ForEach-Object { Write-Log "[$Name] $_" } }
    if ($process.ExitCode -ne 0) {
      Write-Log "FAILED $Name exit=$($process.ExitCode)"
      return $false
    }
    Write-Log "SUCCESS $Name"
    return $true
  }
  catch {
    Write-Log "FAILED $Name $($_.Exception.Message)"
    return $false
  }
  finally {
    Remove-Item $stdout,$stderr -Force -ErrorAction SilentlyContinue
  }
}

function Get-CycleId {
  $today = (Get-Date).Date
  $daysSinceMonday = (([int]$today.DayOfWeek + 6) % 7)
  return $today.AddDays(-$daysSinceMonday).ToString('yyyy-MM-dd')
}

New-Item -ItemType Directory -Force $StateRoot,$LogRoot | Out-Null
$script:LogFile = Join-Path $LogRoot ('hermes-{0}-{1}.log' -f (Get-Date -Format 'yyyyMMdd-HHmmss'), $Mode.ToLowerInvariant())
Get-ChildItem $LogRoot -Filter 'hermes-*.log' -File -ErrorAction SilentlyContinue | Where-Object LastWriteTime -lt (Get-Date).AddDays(-30) | Remove-Item -Force -ErrorAction SilentlyContinue

$lockPath = Join-Path $StateRoot 'hermes.lock'
$lock = $null
try {
  try { $lock = [IO.File]::Open($lockPath, 'OpenOrCreate', 'ReadWrite', 'None') }
  catch { Write-Log 'SKIPPED another HERMES process is already running'; exit 0 }

  if ((Get-TimeZone).Id -ne 'Central Standard Time') { throw 'Windows time zone must be Central Standard Time.' }
  if (-not (Test-Path $RepoRoot)) { throw "Repository not found: $RepoRoot" }
  if (-not (Test-Path $VaultPath)) { throw "Encrypted vault not found: $VaultPath" }
  if (-not (Test-Path (Join-Path $RepoRoot 'node_modules'))) { throw 'node_modules is missing. Install dependencies manually once; the scheduler will not run npm ci.' }

  $npm = 'C:\Program Files\nodejs\npm.cmd'
  $node = 'C:\Program Files\nodejs\node.exe'
  $python = (Get-Command python.exe -ErrorAction Stop).Source
  if (-not (Test-Path $npm) -or -not (Test-Path $node)) { throw 'Node.js 20 was not found in C:\Program Files\nodejs.' }

  $pendingPath = Join-Path $StateRoot 'recovery-pending.json'
  $cycle = Get-CycleId
  $sentPath = Join-Path $StateRoot ("weekly-$cycle.sent.json")
  if ($Mode -eq 'Weekly' -and (Test-Path $sentPath)) { Write-Log "SKIPPED weekly email already sent for cycle $cycle"; exit 0 }
  if ($Mode -eq 'Recovery' -and -not (Test-Path $pendingPath)) { Write-Log 'SKIPPED no recovery is pending'; exit 0 }

  $attempt = 0
  if ($Mode -eq 'Recovery') {
    $pending = Get-Content $pendingPath -Raw | ConvertFrom-Json
    $attempt = [int]$pending.attempts
    if ($attempt -ge 4) { Write-Log 'SKIPPED recovery limit of 4 attempts reached'; exit 0 }
    $attempt++
  }

  $vault = Import-Clixml $VaultPath
  $env:GROQ_API_KEY = Convert-SecureValue $vault.GROQ_API_KEY
  $env:AZURE_CLIENT_ID = Convert-SecureValue $vault.AZURE_CLIENT_ID
  $env:AZURE_TENANT_ID = Convert-SecureValue $vault.AZURE_TENANT_ID
  $env:AZURE_CLIENT_SECRET = Convert-SecureValue $vault.AZURE_CLIENT_SECRET
  $env:HERMES_SENDER_EMAIL = Convert-SecureValue $vault.HERMES_SENDER_EMAIL
  $env:HERMES_REVIEW_EMAIL = Convert-SecureValue $vault.HERMES_REVIEW_EMAIL
  $env:HERMES_EMAIL_PROVIDER = 'outlook'
  $env:HERMES_EMAIL_LIVE = 'false'
  $env:HERMES_COLLECTION_DRY_RUN = 'true'
  $env:HERMES_BASELINE_MODE = 'false'
  $env:HERMES_MAX_SOURCES_PER_RUN = '35'
  $env:HERMES_GROQ_MODEL = 'groq/compound'

  if ($Mode -ne 'Test') {
    $reportDate = Get-Date -Format 'yyyy-MM-dd'
    Remove-Item (Join-Path $RepoRoot "hermes\reports\hermes-weekly-$reportDate.md"),(Join-Path $RepoRoot "hermes\reports\hermes-weekly-$reportDate.json") -Force -ErrorAction SilentlyContinue
  }

  $status = [ordered]@{}
  $status.preflight = Invoke-LimitedProcess 'preflight' $npm @('run','hermes:preflight') 5
  if (-not $status.preflight) { throw 'Preflight failed; expensive stages were not started.' }

  if ($Mode -eq 'Test') {
    $status.report = Invoke-LimitedProcess 'report-test' $npm @('run','hermes:report:real') 5
    $status.email = Invoke-LimitedProcess 'email-preview' $npm @('run','hermes:email:real') 5
    if (-not ($status.report -and $status.email)) { exit 1 }
    Write-Log 'TEST COMPLETE; no email was sent and no scheduled state was changed'
    exit 0
  }

  $status.baseline = Invoke-LimitedProcess 'baseline-restore' $npm @('run','hermes:baseline:restore') 10
  $status.harvestRestore = Invoke-LimitedProcess 'harvest-restore' $npm @('run','hermes:harvest:restore') 10
  $status.collect = Invoke-LimitedProcess 'collect' $npm @('run','hermes:collect') 30
  if ($status.collect) { $status.harvestPersist = Invoke-LimitedProcess 'harvest-persist' $npm @('run','hermes:harvest:persist') 10 }
  else { $status.harvestPersist = $false }
  $status.sweep = Invoke-LimitedProcess 'industry-sweep' $npm @('run','hermes:sweep') 45
  $status.seoAudit = Invoke-LimitedProcess 'seo-audit' $python @('scripts/seo-geo-audit/audit.py','--out-dir','seo-geo-audit-out') 15
  if ($status.seoAudit) { $status.seoTriage = Invoke-LimitedProcess 'seo-triage' $python @('scripts/seo-geo-audit/triage_short_pages.py','seo-geo-audit-out/seo-geo-audit.csv','--threshold','250','--out-dir','seo-geo-audit-out') 10 } else { $status.seoTriage = $false }
  if ($status.seoTriage) { $status.seoGaps = Invoke-LimitedProcess 'seo-gaps' $python @('scripts/seo-geo-audit/build_hermes_knowledge_gaps.py','seo-geo-audit-out/short-pages-triage.csv','--out-dir','seo-geo-audit-out') 10 } else { $status.seoGaps = $false }
  if ($status.seoGaps) { $status.seoImport = Invoke-LimitedProcess 'seo-import' $node @('scripts/hermes/import-seo-knowledge-gaps.mjs','seo-geo-audit-out/hermes-knowledge-gaps.json') 10 } else { $status.seoImport = $false }
  $status.research = Invoke-LimitedProcess 'research' $npm @('run','hermes:research') 45
  $status.validate = Invoke-LimitedProcess 'validate' $npm @('run','hermes:validate:real') 15

  $env:HERMES_COLLECT_STATUS = $(if ($status.collect) {'success'} else {'failure'})
  $env:HERMES_SWEEP_STATUS = $(if ($status.sweep) {'success'} else {'failure'})
  $env:HERMES_SEO_GAPS_STATUS = $(if ($status.seoImport) {'success'} else {'failure'})
  $env:HERMES_RESEARCH_STATUS = $(if ($status.research) {'success'} else {'failure'})
  $env:HERMES_VALIDATE_STATUS = $(if ($status.validate) {'success'} else {'failure'})
  $status.report = Invoke-LimitedProcess 'report' $npm @('run','hermes:report:real') 10

  if ($Mode -eq 'Weekly' -and -not $status.report) { New-FallbackReport $status }

  $critical = @('baseline','collect','sweep','seoImport','research','validate','report')
  $complete = @($critical | Where-Object { -not $status[$_] }).Count -eq 0
  $sendNow = ($Mode -eq 'Weekly') -or (($Mode -eq 'Recovery') -and $complete)
  $status.email = $false
  if ($sendNow) {
    $env:HERMES_EMAIL_LIVE = 'true'
    $status.email = Invoke-LimitedProcess 'email' $npm @('run','hermes:email:real') 10
    $env:HERMES_EMAIL_LIVE = 'false'
  }

  if ($Mode -eq 'Weekly' -and $status.email) {
    @{ cycle=$cycle; sentAt=(Get-Date).ToUniversalTime().ToString('o'); complete=$complete } | ConvertTo-Json | Set-Content $sentPath -Encoding UTF8
  }

  if ($complete -and $status.email) {
    Remove-Item $pendingPath -Force -ErrorAction SilentlyContinue
    Write-Log 'PIPELINE COMPLETE'
    exit 0
  }

  if ($Mode -eq 'Weekly') { $attempt = 0 }
  @{ cycle=$cycle; attempts=$attempt; updatedAt=(Get-Date).ToUniversalTime().ToString('o'); failed=@($status.Keys | Where-Object { -not $status[$_] }) } | ConvertTo-Json | Set-Content $pendingPath -Encoding UTF8
  Write-Log "PIPELINE DEGRADED; recovery pending with attempt=$attempt"
  exit 1
}
catch {
  Write-Log "FATAL $($_.Exception.Message)"
  exit 1
}
finally {
  $env:HERMES_EMAIL_LIVE = 'false'
  foreach ($name in 'GROQ_API_KEY','AZURE_CLIENT_ID','AZURE_TENANT_ID','AZURE_CLIENT_SECRET','HERMES_SENDER_EMAIL','HERMES_REVIEW_EMAIL') { Remove-Item "Env:$name" -ErrorAction SilentlyContinue }
  if ($null -ne $lock) { $lock.Dispose() }
}
