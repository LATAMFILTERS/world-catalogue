param(
  [string]$RepoPath = "C:\ELIMSERVER\apps\hermes-runtime",
  [string]$LogDir = "C:\ELIMSERVER\logs\hermes",
  [string]$StateDir = "C:\ELIMSERVER\state\hermes",
  [string]$SecretsPath = "C:\ELIMSERVER\secrets\hermes-secrets.clixml"
)

$ErrorActionPreference = 'Stop'

function Convert-SecretValueToPlainText($Value) {
  if ($null -eq $Value) { return $null }
  if ($Value -is [System.Security.SecureString]) {
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
    try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
  }
  return [string]$Value
}

function Set-EnvFromSecret($Secrets, [string]$Name) {
  $prop = $Secrets.PSObject.Properties[$Name]
  if ($null -eq $prop) { throw "Required HERMES secret is missing from ${SecretsPath}: $Name" }
  $plain = Convert-SecretValueToPlainText $prop.Value
  if ([string]::IsNullOrWhiteSpace($plain)) { throw "Required HERMES secret is empty: $Name" }
  [Environment]::SetEnvironmentVariable($Name, $plain, 'Process')
}

function Set-OptionalEnvFromSecret($Secrets, [string]$Name) {
  $prop = $Secrets.PSObject.Properties[$Name]
  if ($null -eq $prop) { return }
  $plain = Convert-SecretValueToPlainText $prop.Value
  if (-not [string]::IsNullOrWhiteSpace($plain)) {
    [Environment]::SetEnvironmentVariable($Name, $plain, 'Process')
  }
}

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
New-Item -ItemType Directory -Force -Path $StateDir | Out-Null
$stamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$log = Join-Path $LogDir "hermes-weekly-$stamp.log"
$lock = Join-Path $StateDir 'weekly.lock'

try {
  "[$(Get-Date -Format o)] HERMES Lenovo bootstrap starting." | Tee-Object -FilePath $log -Append

  $env:ELIM_RUNTIME_NODE = 'LENOVO'
  $env:ELIM_RUNTIME_ROLE = 'PRIMARY'
  $env:ELIM_DOMAIN = 'WORLD_CATALOGUE'
  $env:ELIM_SCHEDULER_ENABLED = 'true'
  $env:HERMES_EMAIL_PROVIDER = 'outlook'
  $env:HERMES_EMAIL_LIVE = 'true'
  $env:HERMES_COLLECTION_DRY_RUN = 'false'
  $env:HERMES_BASELINE_MODE = 'false'
  $env:HERMES_GROQ_MODEL = 'groq/compound'
  $env:HERMES_REVIEW_BASE_URL = 'https://elimfilters-search-pro.onrender.com/hermes/review'

  if (-not (Test-Path (Join-Path $RepoPath '.git'))) {
    throw "HERMES runtime clone not found: $RepoPath"
  }
  if (-not (Test-Path $SecretsPath)) {
    throw "HERMES secrets file not found: $SecretsPath"
  }

  "[$(Get-Date -Format o)] Loading HERMES secrets." | Tee-Object -FilePath $log -Append
  $secrets = Import-Clixml $SecretsPath
  @(
    'GROQ_API_KEY',
    'AZURE_CLIENT_ID',
    'AZURE_TENANT_ID',
    'AZURE_CLIENT_SECRET',
    'HERMES_SENDER_EMAIL',
    'HERMES_REVIEW_EMAIL',
    'DATABASE_URL',
    'CATALOG_DATABASE_URL'
  ) | ForEach-Object { Set-EnvFromSecret $secrets $_ }
  Set-OptionalEnvFromSecret $secrets 'HERMES_REVIEW_TOKEN_SECRET'
  "[$(Get-Date -Format o)] Required HERMES secrets loaded." | Tee-Object -FilePath $log -Append

  if (Test-Path $lock) {
    $age = (Get-Date) - (Get-Item $lock).LastWriteTime
    if ($age.TotalHours -lt 6) {
      "[$(Get-Date -Format o)] Another HERMES weekly run appears active; exiting." | Tee-Object -FilePath $log -Append
      exit 0
    }
    Remove-Item $lock -Force
  }
  New-Item -ItemType File -Force -Path $lock | Out-Null

  Set-Location $RepoPath
  git fetch origin main | Tee-Object -FilePath $log -Append
  if ($LASTEXITCODE -ne 0) { throw 'git fetch origin main failed' }
  git reset --hard origin/main | Tee-Object -FilePath $log -Append
  if ($LASTEXITCODE -ne 0) { throw 'git reset --hard origin/main failed' }
  git clean -fd -e hermes/ -e seo-geo-audit-out/ | Tee-Object -FilePath $log -Append

  node scripts\validate-hybrid-runtime.js | Tee-Object -FilePath $log -Append
  if ($LASTEXITCODE -ne 0) { throw 'Hybrid runtime validation failed' }

  npm ci | Tee-Object -FilePath $log -Append
  if ($LASTEXITCODE -ne 0) { throw 'npm ci failed' }

  node scripts\hermes\apply-review-decisions-from-db.mjs | Tee-Object -FilePath $log -Append
  if ($LASTEXITCODE -ne 0) { throw 'Failed to apply one or more HERMES review decisions from durable queue' }

  npm run hermes:baseline:restore | Tee-Object -FilePath $log -Append
  try { npm run hermes:harvest:restore | Tee-Object -FilePath $log -Append } catch { $_ | Out-String | Tee-Object -FilePath $log -Append }
  try { npm run hermes:collect | Tee-Object -FilePath $log -Append } catch { $_ | Out-String | Tee-Object -FilePath $log -Append }
  try { npm run hermes:harvest:persist | Tee-Object -FilePath $log -Append } catch { $_ | Out-String | Tee-Object -FilePath $log -Append }
  try { npm run hermes:sweep | Tee-Object -FilePath $log -Append } catch { $_ | Out-String | Tee-Object -FilePath $log -Append }

  try {
    python scripts\seo-geo-audit\audit.py --out-dir seo-geo-audit-out | Tee-Object -FilePath $log -Append
    python scripts\seo-geo-audit\triage_short_pages.py seo-geo-audit-out\seo-geo-audit.csv --threshold 250 --out-dir seo-geo-audit-out | Tee-Object -FilePath $log -Append
    python scripts\seo-geo-audit\build_hermes_knowledge_gaps.py seo-geo-audit-out\short-pages-triage.csv --out-dir seo-geo-audit-out | Tee-Object -FilePath $log -Append
    node scripts\hermes\import-seo-knowledge-gaps.mjs seo-geo-audit-out\hermes-knowledge-gaps.json | Tee-Object -FilePath $log -Append
  } catch { $_ | Out-String | Tee-Object -FilePath $log -Append }

  try { npm run hermes:research | Tee-Object -FilePath $log -Append } catch { $_ | Out-String | Tee-Object -FilePath $log -Append }
  try { npm run hermes:validate:real | Tee-Object -FilePath $log -Append } catch { $_ | Out-String | Tee-Object -FilePath $log -Append }
  try { npm run hermes:report:real | Tee-Object -FilePath $log -Append } catch { $_ | Out-String | Tee-Object -FilePath $log -Append }

  $emailLines = @(& node scripts\hermes\send-weekly-email-actions.mjs hermes/reports 2>&1)
  $emailLines | Tee-Object -FilePath $log -Append | Out-Host
  if ($LASTEXITCODE -ne 0) { throw 'HERMES email command failed' }

  $jsonStart = -1
  for ($i = 0; $i -lt $emailLines.Count; $i++) {
    if ([string]$emailLines[$i] -match '^\s*\{\s*$') { $jsonStart = $i; break }
  }
  if ($jsonStart -lt 0) { throw 'HERMES email result JSON was not found' }
  $emailJson = ($emailLines[$jsonStart..($emailLines.Count - 1)] -join "`n") | ConvertFrom-Json

  if ($emailJson.outcome -eq 'NO_REVIEW_READY') {
    $noReviewState = [ordered]@{
      timestamp = (Get-Date).ToUniversalTime().ToString('o')
      outcome = 'NO_REVIEW_READY'
      review_ready = [int]$emailJson.review_ready
      queued_pending = [int]$emailJson.queued_pending
      duplicates = [int]$emailJson.duplicates
      invalid = [int]$emailJson.invalid
      report = [string]$emailJson.report
    }
    $noReviewPath = Join-Path $StateDir 'last-no-review-ready.json'
    $noReviewState | ConvertTo-Json -Depth 5 | Set-Content -Path $noReviewPath -Encoding UTF8
    "[$(Get-Date -Format o)] HERMES cycle completed with no review-ready findings. Email suppressed. queued_pending=$($emailJson.queued_pending)." | Tee-Object -FilePath $log -Append
    exit 0
  }

  if ($emailJson.outcome -ne 'SENT') { throw "HERMES email was not sent; outcome=$($emailJson.outcome)" }
  if ([string]::IsNullOrWhiteSpace([string]$emailJson.recipient)) { throw 'HERMES email reported SENT but recipient is empty' }
  if ($emailJson.actionable -ne $true) { throw 'HERMES review email was sent without active review actions' }

  node scripts\hermes\weekly-send-guard.mjs mark | Tee-Object -FilePath $log -Append
  if ($LASTEXITCODE -ne 0) { throw 'Failed to mark weekly send state' }

  "[$(Get-Date -Format o)] HERMES weekly run completed and actionable review-ready email SENT to configured recipient." | Tee-Object -FilePath $log -Append
}
catch {
  "[$(Get-Date -Format o)] HERMES FAILURE: $($_.Exception.Message)" | Tee-Object -FilePath $log -Append
  $_ | Out-String | Tee-Object -FilePath $log -Append
  exit 1
}
finally {
  Remove-Item $lock -Force -ErrorAction SilentlyContinue
}
