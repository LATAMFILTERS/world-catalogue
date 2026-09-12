param(
  [string]$UgreenRoot = "\\192.168.1.153\personal_folder\ELIMFILTERS-SERVER\backups\postgres",
  [string]$CrmEnv = "C:\ELIMSERVER\repos\elimfilters-crm\.env",
  [string]$PgBin = "C:\Program Files\PostgreSQL\18\bin",
  [int]$RetentionDays = 30
)

$ErrorActionPreference = 'Stop'

function Get-EnvValue {
  param([string]$Path, [string]$Name)
  if (-not (Test-Path $Path)) { throw "Environment file not found: $Path" }
  $line = Get-Content $Path | Where-Object { $_ -match "^$([regex]::Escape($Name))=" } | Select-Object -First 1
  if (-not $line) { throw "$Name is not present in $Path" }
  return (($line -split '=', 2)[1]).Trim()
}

if (-not (Test-Path '\\192.168.1.153\personal_folder')) { throw 'UGREEN network share is not available.' }
$pgDump = Join-Path $PgBin 'pg_dump.exe'
$pgRestore = Join-Path $PgBin 'pg_restore.exe'
if (-not (Test-Path $pgDump)) { throw "pg_dump not found: $pgDump" }
if (-not (Test-Path $pgRestore)) { throw "pg_restore not found: $pgRestore" }
$databaseUrl = Get-EnvValue -Path $CrmEnv -Name 'DATABASE_URL'
$uri = [Uri]$databaseUrl
$dbName = $uri.AbsolutePath.Trim('/')
if ([string]::IsNullOrWhiteSpace($dbName)) { throw 'DATABASE_URL does not include a database name.' }

$stamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$dbRoot = Join-Path $UgreenRoot $dbName
New-Item -ItemType Directory -Force -Path $dbRoot | Out-Null
$dumpPath = Join-Path $dbRoot "$dbName-$stamp.dump"
$hashPath = "$dumpPath.sha256"
$manifestPath = "$dumpPath.manifest.json"

& $pgDump --format=custom --compress=6 --file=$dumpPath $databaseUrl
if ($LASTEXITCODE -ne 0 -or -not (Test-Path $dumpPath)) {
  throw "pg_dump failed for $dbName with exit code $LASTEXITCODE"
}

$restoreList = & $pgRestore --list $dumpPath
if ($LASTEXITCODE -ne 0 -or @($restoreList).Count -lt 3) {
  Remove-Item $dumpPath -Force -ErrorAction SilentlyContinue
  throw "Backup verification failed for $dbName"
}
$hash = (Get-FileHash -Path $dumpPath -Algorithm SHA256).Hash.ToLowerInvariant()
"$hash  $(Split-Path $dumpPath -Leaf)" | Out-File -FilePath $hashPath -Encoding ascii

$manifest = [ordered]@{
  schema_version = '1.0.0'
  created_at = (Get-Date).ToString('o')
  computer = $env:COMPUTERNAME
  database = $dbName
  host = $uri.Host
  port = $uri.Port
  format = 'postgres-custom'
  file = (Split-Path $dumpPath -Leaf)
  bytes = (Get-Item $dumpPath).Length
  sha256 = $hash
  verified_with_pg_restore = $true
}
$manifest | ConvertTo-Json -Depth 4 | Out-File -FilePath $manifestPath -Encoding utf8

$cutoff = (Get-Date).AddDays(-1 * [Math]::Abs($RetentionDays))
Get-ChildItem $dbRoot -File -ErrorAction SilentlyContinue |
  Where-Object { $_.LastWriteTime -lt $cutoff -and $_.Name -match '^.+-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.dump(\.sha256|\.manifest\.json)?$' } |
  Remove-Item -Force -ErrorAction SilentlyContinue
$result = [ordered]@{
  outcome = 'OK'
  database = $dbName
  destination = $dumpPath
  bytes = (Get-Item $dumpPath).Length
  sha256 = $hash
  retention_days = $RetentionDays
  ugreen_root = $UgreenRoot
}
$result | ConvertTo-Json -Depth 4
