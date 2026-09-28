param(
  [string]$RepoPath = "C:\Users\ELIMSERVER\world-catalogue",
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

if (-not (Test-Path $SecretsPath)) { throw "HERMES secrets file not found: $SecretsPath" }
$secrets = Import-Clixml $SecretsPath
$dbProp = $secrets.PSObject.Properties['CATALOG_DATABASE_URL']
if ($null -eq $dbProp) { throw 'CATALOG_DATABASE_URL missing from HERMES secrets.' }
$dbUrl = Convert-SecretValueToPlainText $dbProp.Value
if ([string]::IsNullOrWhiteSpace($dbUrl)) { throw 'CATALOG_DATABASE_URL is empty.' }

$uri = [Uri]$dbUrl
$dbName = $uri.AbsolutePath.Trim('/')
if ($dbName -ne 'catalogo_elimfilters') {
  throw "Blocked: CATALOG_DATABASE_URL targets '$dbName', expected 'catalogo_elimfilters'."
}

$oldDatabaseUrl = $env:DATABASE_URL
$oldCatalogDatabaseUrl = $env:CATALOG_DATABASE_URL
$secretUri = [Uri]$dbUrl
$userInfo = $secretUri.UserInfo
if ([string]::IsNullOrWhiteSpace($userInfo)) { throw 'CATALOG_DATABASE_URL has no PostgreSQL credentials.' }
$localCatalogUrl = "postgresql://$userInfo@127.0.0.1:5432/catalogo_elimfilters?sslmode=disable"
try {
  $env:DATABASE_URL = $localCatalogUrl
  $env:CATALOG_DATABASE_URL = $localCatalogUrl
  Set-Location $RepoPath

  Write-Host '=== ISUZU V147 DRY RUN ==='
  & node scripts\hermes\finalize-isuzu-us-v147.mjs
  if ($LASTEXITCODE -ne 0) { throw "Dry run failed with exit code $LASTEXITCODE" }

  Write-Host '=== DRY RUN PASSED - APPLYING ==='
  & node scripts\hermes\finalize-isuzu-us-v147.mjs --apply
  if ($LASTEXITCODE -ne 0) { throw "Apply failed with exit code $LASTEXITCODE" }

  Write-Host '=== POST AUDIT ==='
  & node scripts\audit-catalog-application-coverage.mjs
  if ($LASTEXITCODE -ne 0) { throw "Post-audit failed with exit code $LASTEXITCODE" }

  Write-Host '=== COMPLETE ==='
}
finally {
  $env:DATABASE_URL = $oldDatabaseUrl
  $env:CATALOG_DATABASE_URL = $oldCatalogDatabaseUrl
  $dbUrl = $null
}
