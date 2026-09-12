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
$log = Join-Path $LogRoot 'knowledge-center-api.log'
$secrets = Get-Content $SecretPath -Raw | ConvertFrom-Json
$env:NODE_ENV = 'production'
$env:PORT = [string]$secrets.apiPort
$env:DATABASE_URL = Get-EnvValue $CrmEnv 'DATABASE_URL'
$env:DATABASE_SSL = 'false'
$env:KNOWLEDGE_API_KEYS = [string]$secrets.knowledgeApiKey
$env:KNOWLEDGE_REVIEW_BASE_URL = 'https://elimfilters.com/knowledge-center/'
$env:KNOWLEDGE_REVIEW_MAILBOX = 'support@elimfilters.com'
$env:REQUEST_BODY_LIMIT = '1mb'
$serviceRoot = Join-Path $RepoRoot 'services\knowledge-center-api'
Set-Location $serviceRoot
$node = (Get-Command node -ErrorAction Stop).Source
while ($true) {
  & $node 'dist\server.js' *>> $log
  Add-Content $log "[knowledge-center-api] process exited; restarting in 5s at $(Get-Date -Format o)"
  Start-Sleep -Seconds 5
}
