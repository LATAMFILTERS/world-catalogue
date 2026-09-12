[CmdletBinding()]
param(
  [string]$RepoRoot = 'C:\ELIMSERVER\worktrees\lenovo-zero-cost',
  [string]$CrmEnv = 'C:\ELIMSERVER\repos\elimfilters-crm\.env',
  [string]$InstallRoot = 'C:\ELIMSERVER\automation\knowledge-stack',
  [string]$SecretPath = 'C:\ELIMSERVER\secrets\knowledge-stack-local.json',
  [int]$ApiPort = 8802,
  [int]$EnginePort = 8806
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

function Get-EnvValue([string]$Path,[string]$Name) {
  $line = Get-Content $Path | Where-Object { $_ -match "^$([regex]::Escape($Name))=" } | Select-Object -First 1
  if (-not $line) { throw "$Name not found in $Path" }
  return (($line -split '=',2)[1]).Trim()
}
function New-RandomHex([int]$Bytes) {
  $buffer = New-Object byte[] $Bytes
  [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($buffer)
  return ([BitConverter]::ToString($buffer)).Replace('-','').ToLowerInvariant()
}
if (-not (Test-Path $CrmEnv)) { throw "CRM env missing: $CrmEnv" }
$databaseUrl = Get-EnvValue $CrmEnv 'DATABASE_URL'
$psql = 'C:\Program Files\PostgreSQL\18\bin\psql.exe'
if (-not (Test-Path $psql)) { throw 'PostgreSQL 18 client not found.' }

function Invoke-Sql([string]$Sql) {
  & $psql $databaseUrl -X -v ON_ERROR_STOP=1 -Atc $Sql
  if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL command failed.' }
}
function Invoke-MigrationFile([string]$RelativePath,[switch]$SingleTransaction) {
  $path = Join-Path (Join-Path $RepoRoot 'migrations') $RelativePath
  Write-Host "APPLY $RelativePath"
  if ($SingleTransaction) { & $psql $databaseUrl -X -v ON_ERROR_STOP=1 -1 -f $path }
  else { & $psql $databaseUrl -X -v ON_ERROR_STOP=1 -f $path }
  if ($LASTEXITCODE -ne 0) { throw "Migration failed: $RelativePath" }
}

$schemaExists = (Invoke-Sql "SELECT CASE WHEN to_regnamespace('knowledge_center') IS NULL THEN '0' ELSE '1' END").Trim()
if ($schemaExists -ne '1') {
  Invoke-MigrationFile 'knowledge-center-phase2\001_create_schema.sql'
}
$phase2Indexes = [int](Invoke-Sql "SELECT count(*) FROM pg_indexes WHERE schemaname='knowledge_center' AND indexname='idx_kc_records_type_status'")
if ($phase2Indexes -eq 0) {
  Invoke-MigrationFile 'knowledge-center-phase2\002_indexes_and_constraints.sql'
}
$recordCount = [int](Invoke-Sql "SELECT count(*) FROM knowledge_center.knowledge_records")
if ($recordCount -eq 0) {
  Invoke-MigrationFile 'knowledge-center-phase2\003_seed_technology_knowledge.sql' -SingleTransaction
}
$sourceCount = [int](Invoke-Sql "SELECT count(*) FROM knowledge_center.sources")
if ($sourceCount -eq 0) {
  Invoke-MigrationFile 'knowledge-center-phase2\004_seed_technology_sources.sql'
}

$migrationVersion = { param($v) (Invoke-Sql "SELECT count(*) FROM knowledge_center.schema_migrations WHERE version='$v'").Trim() }
if ([int](& $migrationVersion '5.0.0') -eq 0) { Invoke-MigrationFile 'knowledge-center-phase5\001_channel_ingestion.sql' }
if ([int](& $migrationVersion '6.0.0') -eq 0) { Invoke-MigrationFile 'knowledge-center-phase6\001_reasoning_traces.sql' }
if ([int](& $migrationVersion '7.0.0') -eq 0) { Invoke-MigrationFile 'knowledge-center-phase7\001_observability.sql' }
$readinessCount = [int](Invoke-Sql "SELECT count(*) FROM knowledge_center.production_readiness_checks")
if ($readinessCount -eq 0) { Invoke-MigrationFile 'knowledge-center-phase7\002_seed_readiness_checks.sql' }

Invoke-Sql "ALTER TABLE knowledge_center.schema_migrations ADD COLUMN IF NOT EXISTS executed_at timestamptz DEFAULT now()" | Out-Null
Invoke-Sql "ALTER TABLE knowledge_center.schema_migrations ADD COLUMN IF NOT EXISTS execution_time_ms integer" | Out-Null
Invoke-Sql "ALTER TABLE knowledge_center.schema_migrations ADD COLUMN IF NOT EXISTS status text DEFAULT 'SUCCESS'" | Out-Null
foreach ($v in @('001_create_schema','002_indexes_and_constraints','003_seed_technology_knowledge','004_seed_technology_sources')) {
  $description = "Phase 2 Migration: $v"
  Invoke-Sql "INSERT INTO knowledge_center.schema_migrations(version,description,status) VALUES ('$v','$description','SUCCESS') ON CONFLICT(version) DO UPDATE SET status='SUCCESS'" | Out-Null
}

New-Item -ItemType Directory -Force -Path $InstallRoot,(Split-Path $SecretPath -Parent) | Out-Null
if (Test-Path $SecretPath) {
  $secrets = Get-Content $SecretPath -Raw | ConvertFrom-Json
} else {
  $secrets = [ordered]@{
    schema_version = '1.0.0'
    created_at = (Get-Date).ToUniversalTime().ToString('o')
    knowledgeApiKey = New-RandomHex 32
    engineApiKey = New-RandomHex 32
    apiPort = $ApiPort
    enginePort = $EnginePort
  }
  $secrets | ConvertTo-Json | Set-Content $SecretPath -Encoding UTF8
  $identity = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
  & icacls.exe $SecretPath /inheritance:r /grant:r "$identity`:F" 'SYSTEM:F' 'BUILTIN\Administrators:F' | Out-Null
}

$node = (Get-Command node -ErrorAction Stop).Source
$npm = (Get-Command npm -ErrorAction Stop).Source
foreach ($service in @('knowledge-center-api','knowledge-engine-runtime')) {
  $serviceRoot = Join-Path $RepoRoot "services\$service"
  Push-Location $serviceRoot
  try {
    & $npm install --include=dev
    if ($LASTEXITCODE -ne 0) { throw "npm install failed for $service" }
    & $npm run build
    if ($LASTEXITCODE -ne 0) { throw "npm build failed for $service" }
  }
  finally { Pop-Location }
}

foreach ($launcher in @('run-knowledge-center-api-local.ps1','run-knowledge-engine-runtime-local.ps1')) {
  Copy-Item (Join-Path (Split-Path $MyInvocation.MyCommand.Path -Parent) $launcher) (Join-Path $InstallRoot $launcher) -Force
}

$startup = [Environment]::GetFolderPath('Startup')
$apiVbs = Join-Path $startup 'elimfilters-knowledge-center-api.vbs'
$engineVbs = Join-Path $startup 'elimfilters-knowledge-engine-runtime.vbs'
$apiScript = Join-Path $InstallRoot 'run-knowledge-center-api-local.ps1'
$engineScript = Join-Path $InstallRoot 'run-knowledge-engine-runtime-local.ps1'
@"
Set shell = CreateObject("WScript.Shell")
shell.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -File ""$apiScript""", 0, False
"@ | Set-Content $apiVbs -Encoding ASCII
@"
Set shell = CreateObject("WScript.Shell")
shell.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -File ""$engineScript""", 0, False
"@ | Set-Content $engineVbs -Encoding ASCII

function Ensure-Launcher([string]$Pattern,[string]$ScriptPath) {
  $running = Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -like "*$Pattern*" } | Select-Object -First 1
  if (-not $running) {
    Start-Process powershell -WindowStyle Hidden -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',$ScriptPath)
  }
}
Ensure-Launcher 'run-knowledge-center-api-local.ps1' $apiScript
Ensure-Launcher 'run-knowledge-engine-runtime-local.ps1' $engineScript

$apiHealth = "http://127.0.0.1:$ApiPort/health"
$engineHealth = "http://127.0.0.1:$EnginePort/health"
function Wait-Health([string]$Url,[string]$Name) {
  for ($i=0; $i -lt 30; $i++) {
    try {
      $response = Invoke-RestMethod -Uri $Url -TimeoutSec 3
      if ($response.status -eq 'ok') { return $true }
    } catch {}
    Start-Sleep -Seconds 1
  }
  throw "$Name did not become healthy at $Url"
}
$apiOk = Wait-Health $apiHealth 'Knowledge Center API'
$engineOk = Wait-Health $engineHealth 'Knowledge Engine Runtime'

$result = [ordered]@{
  outcome = 'OK'
  database = 'shared-local-postgres-schema-isolated'
  schema = 'knowledge_center'
  api = [ordered]@{ port=$ApiPort; health=$apiOk }
  engine = [ordered]@{ port=$EnginePort; health=$engineOk }
  records = [int](Invoke-Sql "SELECT count(*) FROM knowledge_center.knowledge_records")
  sources = [int](Invoke-Sql "SELECT count(*) FROM knowledge_center.sources")
  readiness_checks = [int](Invoke-Sql "SELECT count(*) FROM knowledge_center.production_readiness_checks")
  secret_path = $SecretPath
  startup = @($apiVbs,$engineVbs)
}
$result | ConvertTo-Json -Depth 6
