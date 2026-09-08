param(
  [string]$RuntimePath = "C:\ELIMSERVER\apps\hermes-runtime",
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
  if ($null -eq $prop) { return $false }
  $plain = Convert-SecretValueToPlainText $prop.Value
  if ([string]::IsNullOrWhiteSpace($plain)) { return $false }
  [Environment]::SetEnvironmentVariable($Name, $plain, 'Process')
  return $true
}

if (-not (Test-Path (Join-Path $RuntimePath '.git'))) { throw "HERMES runtime not found: $RuntimePath" }
if (-not (Test-Path $SecretsPath)) { throw "HERMES secrets file not found: $SecretsPath" }

Set-Location $RuntimePath
Write-Host 'Refreshing HERMES runtime...'
git fetch origin main | Out-Host
if ($LASTEXITCODE -ne 0) { throw 'git fetch failed' }
git reset --hard origin/main | Out-Host
if ($LASTEXITCODE -ne 0) { throw 'git reset failed' }

$reportsDir = Join-Path $RuntimePath 'hermes\reports'
if (-not (Test-Path $reportsDir)) { throw "HERMES reports directory not found: $reportsDir" }
$latest = Get-ChildItem $reportsDir -Filter 'hermes-weekly-*.md' -File | Sort-Object Name | Select-Object -Last 1
if ($null -eq $latest) { throw 'No HERMES weekly report exists to resend.' }
if ($latest.Length -lt 100) { throw "Latest HERMES weekly Markdown report is too small to resend: $($latest.FullName)" }

$date = [regex]::Match($latest.Name, '\d{4}-\d{2}-\d{2}').Value
$jsonPath = Join-Path $reportsDir "hermes-weekly-$date.json"
if (Test-Path $jsonPath) {
  try {
    $json = Get-Content $jsonPath -Raw | ConvertFrom-Json
    $groupsCount = 0
    if ($json.groups) {
      foreach ($p in $json.groups.PSObject.Properties) {
        if ($p.Value) { $groupsCount += @($p.Value).Count }
      }
    }
    $hasStructuredContent = ($groupsCount -gt 0) -or (@($json.research_pending).Count -gt 0) -or (@($json.duplicates).Count -gt 0) -or (@($json.invalid).Count -gt 0)
    if (-not $hasStructuredContent -and $latest.Length -lt 300) {
      throw 'Structured HERMES report contains no findings and Markdown fallback is insufficient.'
    }
  } catch {
    Write-Warning "Structured report validation warning: $($_.Exception.Message). Markdown fallback will be used if needed."
  }
}

$secrets = Import-Clixml $SecretsPath
@(
  'AZURE_CLIENT_ID',
  'AZURE_TENANT_ID',
  'AZURE_CLIENT_SECRET',
  'HERMES_SENDER_EMAIL',
  'HERMES_REVIEW_EMAIL'
) | ForEach-Object {
  if (-not (Set-EnvFromSecret $secrets $_)) { throw "Required HERMES mail secret missing: $_" }
}
Set-EnvFromSecret $secrets 'HERMES_REVIEW_TOKEN_SECRET' | Out-Null

$env:HERMES_EMAIL_PROVIDER = 'outlook'
$env:HERMES_EMAIL_LIVE = 'true'
$env:HERMES_COLLECTION_DRY_RUN = 'false'
$env:HERMES_REVIEW_BASE_URL = 'https://elimfilters-search-pro.onrender.com/hermes/review'

Write-Host "Resending HERMES weekly intelligence report: $($latest.Name)"
$resultLines = @(& node scripts\hermes\send-weekly-email-actions.mjs hermes/reports 2>&1)
$resultLines | Out-Host
if ($LASTEXITCODE -ne 0) { throw 'HERMES resend failed.' }

$jsonStart = -1
for ($i = 0; $i -lt $resultLines.Count; $i++) {
  if ([string]$resultLines[$i] -match '^\s*\{\s*$') { $jsonStart = $i; break }
}
if ($jsonStart -lt 0) { throw 'HERMES resend result JSON not found.' }
$result = ($resultLines[$jsonStart..($resultLines.Count - 1)] -join "`n") | ConvertFrom-Json
if ($result.outcome -ne 'SENT') { throw "HERMES resend did not report SENT: $($result.outcome)" }
if ([string]::IsNullOrWhiteSpace([string]$result.recipient)) { throw 'HERMES resend reported SENT but recipient is empty.' }

Write-Host ''
Write-Host 'HERMES WEEKLY REPORT RESENT WITH CONTENT VALIDATION'
Write-Host "Recipient: $($result.recipient)"
Write-Host "Report: $($latest.FullName)"
