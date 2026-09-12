param(
  [string]$RepoRoot = 'C:\ELIMSERVER\worktrees\lenovo-zero-cost',
  [string]$CrmEnv = 'C:\ELIMSERVER\repos\elimfilters-crm\.env',
  [string]$SecretPath = 'C:\ELIMSERVER\secrets\knowledge-stack-local.json',
  [string]$LogRoot = 'C:\ELIMSERVER\logs\knowledge-stack'
)
$ErrorActionPreference = 'Stop'
function Get-EnvValue([string]$Path,[string]$Name) {
  $line = Get-Content $Path | Where-Object { $_ -match "^$([regex]::Escape($Name))=" } | Select-Object -First 1
  if (-not $line) { throw "$Name not found in $Path" }
  return (($line -split '=',2)[1]).Trim()
}
New-Item -ItemType Directory -Force -Path $LogRoot | Out-Null
$log = Join-Path $LogRoot 'knowledge-engine-runtime.log'
$secrets = Get-Content $SecretPath -Raw | ConvertFrom-Json
$env:PORT = [string]$secrets.enginePort
$env:DATABASE_URL = Get-EnvValue $CrmEnv 'DATABASE_URL'
$env:DATABASE_SSL = 'false'
$env:ENGINE_API_KEY = [string]$secrets.engineApiKey
$env:DEFAULT_AUDIENCE = 'TECHNICAL_SUPPORT'
$env:MAX_RETRIEVAL_RECORDS = '12'
$env:MIN_ANSWER_CONFIDENCE = '0.72'
$env:MIN_PRODUCTION_CONFIDENCE = '0.85'
$env:LOG_LEVEL = 'info'
$serviceRoot = Join-Path $RepoRoot 'services\knowledge-engine-runtime'
Set-Location $serviceRoot
$node = (Get-Command node -ErrorAction Stop).Source
while ($true) {
  & $node 'dist\server.js' *>> $log
  Add-Content $log "[knowledge-engine-runtime] process exited; restarting in 5s at $(Get-Date -Format o)"
  Start-Sleep -Seconds 5
}
