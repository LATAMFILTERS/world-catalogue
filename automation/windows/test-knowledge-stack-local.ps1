param(
  [string]$SecretPath = 'C:\ELIMSERVER\secrets\knowledge-stack-local.json',
  [int]$ApiPort = 8802,
  [int]$EnginePort = 8806
)
$ErrorActionPreference = 'Stop'
$secrets = Get-Content $SecretPath -Raw | ConvertFrom-Json
$results = New-Object System.Collections.Generic.List[object]
function Add-Result([string]$Name,[bool]$Ok,[string]$Detail) {
  $results.Add([pscustomobject]@{ test=$Name; ok=$Ok; detail=$Detail })
}
try {
  $r = Invoke-RestMethod "http://127.0.0.1:$ApiPort/health" -TimeoutSec 5
  Add-Result 'api.health' ($r.status -eq 'ok') $r.service
} catch { Add-Result 'api.health' $false $_.Exception.Message }
try {
  Invoke-WebRequest "http://127.0.0.1:$ApiPort/api/knowledge-center/v1/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop | Out-Null
  Add-Result 'api.auth_required' $false 'unexpected success'
} catch {
  Add-Result 'api.auth_required' ($_.Exception.Response.StatusCode.value__ -eq 401) "status=$($_.Exception.Response.StatusCode.value__)"
}
$apiHeaders = @{
  'x-api-key' = [string]$secrets.knowledgeApiKey
  'x-actor-id' = '00000000-0000-0000-0000-000000000200'
  'x-actor-role' = 'SYSTEM'
}
try {
  $r = Invoke-RestMethod "http://127.0.0.1:$ApiPort/api/knowledge-center/v1/health" -Headers $apiHeaders -TimeoutSec 5
  Add-Result 'api.authenticated' ($r.status -eq 'ok') $r.service
} catch { Add-Result 'api.authenticated' $false $_.Exception.Message }
try {
  $r = Invoke-RestMethod "http://127.0.0.1:$EnginePort/health" -TimeoutSec 5
  Add-Result 'engine.health' ($r.status -eq 'ok') "$($r.service) $($r.schema)"
} catch { Add-Result 'engine.health' $false $_.Exception.Message }
try {
  Invoke-WebRequest "http://127.0.0.1:$EnginePort/api/knowledge-engine/v1/reason" -Method POST -ContentType 'application/json' -Body '{"query":"SYNTRAX","channel":"WEB_CHAT","audience":"TECHNICAL_SUPPORT"}' -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop | Out-Null
  Add-Result 'engine.auth_required' $false 'unexpected success'
} catch {
  Add-Result 'engine.auth_required' ($_.Exception.Response.StatusCode.value__ -eq 401) "status=$($_.Exception.Response.StatusCode.value__)"
}
$engineHeaders = @{ 'x-engine-api-key' = [string]$secrets.engineApiKey }
$body = @{ query='What is SYNTRAX technology?'; channel='WEB_CHAT'; audience='TECHNICAL_SUPPORT' } | ConvertTo-Json
try {
  $r = Invoke-RestMethod "http://127.0.0.1:$EnginePort/api/knowledge-engine/v1/reason" -Method POST -Headers $engineHeaders -ContentType 'application/json' -Body $body -TimeoutSec 5
  Add-Result 'engine.reasoning' ($r.action -eq 'ANSWER') "action=$($r.action) confidence=$($r.confidence) citations=$(@($r.citations).Count)"
} catch { Add-Result 'engine.reasoning' $false $_.Exception.Message }

$failed = @($results | Where-Object { -not $_.ok }).Count
[ordered]@{
  outcome = $(if ($failed -eq 0) { 'OK' } else { 'FAILED' })
  passed = $results.Count - $failed
  failed = $failed
  tests = [object[]]$results
} | ConvertTo-Json -Depth 6
if ($failed -gt 0) { exit 1 }
