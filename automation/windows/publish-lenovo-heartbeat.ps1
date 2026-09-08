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

if (-not (Test-Path $SecretsPath)) { throw "HERMES secrets file not found: $SecretsPath" }
if (-not (Test-Path (Join-Path $RepoPath 'scripts\hermes\hermes-ha-control.mjs'))) { throw "HA control script not found in $RepoPath" }

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
    & node scripts\hermes\hermes-ha-control.mjs heartbeat --node $NodeId --role $Role --status OK --source windows-heartbeat
    if ($LASTEXITCODE -ne 0) { throw "Heartbeat publisher failed with exit code $LASTEXITCODE" }
  } finally { Pop-Location }
}
finally {
  $env:DATABASE_URL = $oldDatabaseUrl
  $env:CATALOG_DATABASE_URL = $oldCatalogDatabaseUrl
  $dbUrl = $null
}
