param(
  [string]$RepoPath = "C:\ELIMSERVER\repos\world-catalogue",
  [string]$SecretsPath = "C:\ELIMSERVER\secrets\hermes-secrets.clixml",
  [string]$NodeId = "LENOVO",
  [string]$Role = "PRIMARY"
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

$legacyRunner = Join-Path $RepoPath 'automation\windows\run-hermes-weekly.ps1'
$haControl = Join-Path $RepoPath 'scripts\hermes\hermes-ha-control.mjs'
if (-not (Test-Path $legacyRunner)) { throw "Legacy HERMES runner not found: $legacyRunner" }
if (-not (Test-Path $haControl)) { throw "HA control script not found: $haControl" }
if (-not (Test-Path $SecretsPath)) { throw "HERMES secrets file not found: $SecretsPath" }

$secrets = Import-Clixml $SecretsPath
$dbProp = $secrets.PSObject.Properties['DATABASE_URL']
if ($null -eq $dbProp) { $dbProp = $secrets.PSObject.Properties['CATALOG_DATABASE_URL'] }
if ($null -eq $dbProp) { throw 'DATABASE_URL/CATALOG_DATABASE_URL missing from HERMES secrets.' }
$dbUrl = Convert-SecretValueToPlainText $dbProp.Value
if ([string]::IsNullOrWhiteSpace($dbUrl)) { throw 'Database URL is empty.' }

$oldDatabaseUrl = $env:DATABASE_URL
$oldCatalogDatabaseUrl = $env:CATALOG_DATABASE_URL
try {
  $env:DATABASE_URL = $dbUrl
  $env:CATALOG_DATABASE_URL = $dbUrl
  Push-Location $RepoPath
  try {
    $claimLines = @(& node scripts\hermes\hermes-ha-control.mjs claim --node $NodeId --role $Role --lease-hours 6 2>&1)
    $claimLines | Out-Host
    if ($LASTEXITCODE -ne 0) { throw 'Unable to acquire HERMES HA lease.' }
    $claim = ($claimLines -join "`n") | ConvertFrom-Json
    if (-not $claim.claimed) {
      Write-Host "HERMES HA: SKIPPED - $($claim.reason)"
      exit 0
    }

    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $legacyRunner
    $runExit = $LASTEXITCODE
    if ($runExit -eq 0) {
      & node scripts\hermes\hermes-ha-control.mjs complete --node $NodeId
      if ($LASTEXITCODE -ne 0) { throw 'HERMES completed but HA ledger completion failed.' }
      Write-Host 'HERMES HA: PRIMARY run COMPLETED.'
      exit 0
    }

    & node scripts\hermes\hermes-ha-control.mjs fail --node $NodeId --error "Lenovo weekly runner exit code $runExit"
    throw "Lenovo HERMES weekly run failed with exit code $runExit"
  } finally { Pop-Location }
}
finally {
  $env:DATABASE_URL = $oldDatabaseUrl
  $env:CATALOG_DATABASE_URL = $oldCatalogDatabaseUrl
  $dbUrl = $null
}
