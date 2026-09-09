param(
  [string]$RuntimePath = "C:\ELIMSERVER\apps\hermes-runtime",
  [string]$StateDir = "C:\ELIMSERVER\state\hermes",
  [string]$LogDir = "C:\ELIMSERVER\logs\hermes",
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
  if ($null -eq $prop) { throw "Required HERMES secret is missing: $Name" }
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

New-Item -ItemType Directory -Force -Path $StateDir,$LogDir | Out-Null
$stamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$log = Join-Path $LogDir "hermes-research-retry-$stamp.log"
$lock = Join-Path $StateDir 'research-retry.lock'

try {
  if (Test-Path $lock) {
    $age = (Get-Date) - (Get-Item $lock).LastWriteTime
    if ($age.TotalHours -lt 5) {
      "[$(Get-Date -Format o)] Research retry already active; exiting." | Tee-Object -FilePath $log -Append
      exit 0
    }
    Remove-Item $lock -Force
  }
  New-Item -ItemType File -Force -Path $lock | Out-Null

  if (-not (Test-Path (Join-Path $RuntimePath '.git'))) { throw "HERMES runtime not found: $RuntimePath" }
  if (-not (Test-Path $SecretsPath)) { throw "HERMES secrets file not found: $SecretsPath" }

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

  $env:ELIM_RUNTIME_NODE = 'LENOVO'
  $env:ELIM_RUNTIME_ROLE = 'PRIMARY'
  $env:HERMES_EMAIL_PROVIDER = 'outlook'
  $env:HERMES_EMAIL_LIVE = 'true'
  $env:HERMES_COLLECTION_DRY_RUN = 'false'
  $env:HERMES_GROQ_MODEL = 'groq/compound'
  $env:HERMES_REVIEW_BASE_URL = 'https://elimfilters-search-pro.onrender.com/hermes/review'
  $env:HERMES_STATE_ROOT = (Join-Path $StateDir 'research')

  Set-Location $RuntimePath
  git fetch origin main | Tee-Object -FilePath $log -Append
  if ($LASTEXITCODE -ne 0) { throw 'git fetch failed' }
  git reset --hard origin/main | Tee-Object -FilePath $log -Append
  if ($LASTEXITCODE -ne 0) { throw 'git reset failed' }

  if (-not (Test-Path (Join-Path $RuntimePath 'node_modules'))) {
    npm ci | Tee-Object -FilePath $log -Append
    if ($LASTEXITCODE -ne 0) { throw 'npm ci failed' }
  }

  node scripts\hermes\apply-review-decisions-from-db.mjs | Tee-Object -FilePath $log -Append
  if ($LASTEXITCODE -ne 0) { throw 'Failed to apply one or more HERMES review decisions from durable queue' }

  # Do not send a second review email in the same ISO week.
  $guardFile = Join-Path $StateDir 'weekly-guard-output.txt'
  Remove-Item $guardFile -Force -ErrorAction SilentlyContinue
  $env:GITHUB_OUTPUT = $guardFile
  node scripts\hermes\weekly-send-guard.mjs check | Tee-Object -FilePath $log -Append
  $guardProceed = $true
  if (Test-Path $guardFile) {
    $guardProceed = -not ((Get-Content $guardFile -Raw) -match 'proceed=false')
  }
  Remove-Item Env:GITHUB_OUTPUT -ErrorAction SilentlyContinue

  npm run hermes:research | Tee-Object -FilePath $log -Append
  $researchExit = $LASTEXITCODE
  if ($researchExit -ne 0) {
    "[$(Get-Date -Format o)] Research remains deferred; HERMES will retry again on the next scheduled recovery cycle." | Tee-Object -FilePath $log -Append
  }

  npm run hermes:validate:real | Tee-Object -FilePath $log -Append
  if ($LASTEXITCODE -ne 0) { throw 'HERMES validation failed' }
  npm run hermes:report:real | Tee-Object -FilePath $log -Append
  if ($LASTEXITCODE -ne 0) { throw 'HERMES report generation failed' }

  if (-not $guardProceed) {
    "[$(Get-Date -Format o)] Review email already sent this ISO week. Pending queue processed; no duplicate email sent." | Tee-Object -FilePath $log -Append
    exit 0
  }

  $emailLines = @(& node scripts\hermes\send-weekly-email-actions.mjs hermes/reports 2>&1)
  $emailLines | Tee-Object -FilePath $log -Append | Out-Host
  if ($LASTEXITCODE -ne 0) { throw 'HERMES email command failed' }

  $jsonStart = -1
  for ($i = 0; $i -lt $emailLines.Count; $i++) {
    if ([string]$emailLines[$i] -match '^\s*\{\s*$') { $jsonStart = $i; break }
  }
  if ($jsonStart -lt 0) { throw 'HERMES email result JSON not found' }
  $result = ($emailLines[$jsonStart..($emailLines.Count - 1)] -join "`n") | ConvertFrom-Json

  if ($result.outcome -eq 'NO_REVIEW_READY') {
    "[$(Get-Date -Format o)] No verified candidates ready. Email suppressed. queued_pending=$($result.queued_pending)." | Tee-Object -FilePath $log -Append
    exit 0
  }
  if ($result.outcome -ne 'SENT') { throw "Unexpected HERMES email outcome: $($result.outcome)" }
  if ($result.actionable -ne $true) { throw 'HERMES review email was sent without active review actions' }

  node scripts\hermes\weekly-send-guard.mjs mark | Tee-Object -FilePath $log -Append
  if ($LASTEXITCODE -ne 0) { throw 'Failed to mark weekly send state' }
  "[$(Get-Date -Format o)] Verified actionable HERMES email sent. review_ready=$($result.review_ready)." | Tee-Object -FilePath $log -Append
}
catch {
  "[$(Get-Date -Format o)] HERMES RESEARCH RETRY FAILURE: $($_.Exception.Message)" | Tee-Object -FilePath $log -Append
  exit 1
}
finally {
  Remove-Item $lock -Force -ErrorAction SilentlyContinue
}
