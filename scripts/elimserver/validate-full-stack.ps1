[CmdletBinding()]
param([string]$Root='C:\ELIMSERVER',[string]$TaskPath='\ELIMFILTERS\')
$ErrorActionPreference='Stop'
$results=@()
function Add([string]$Name,[bool]$Ok,[string]$Detail){$script:results += [pscustomobject]@{name=$Name;ok=$Ok;detail=$Detail}}
$repo=Join-Path $Root 'repos\world-catalogue'
foreach($p in @('state','logs','backups','nodal-center','repos\world-catalogue')){Add "path:$p" (Test-Path (Join-Path $Root $p)) (Join-Path $Root $p)}
foreach($task in @('HERMES Weekly','HERMES Recovery','ELIMSERVER Command Center','ELIMSERVER Watchdog','ELIMSERVER Backup')){try{$t=Get-ScheduledTask -TaskPath $TaskPath -TaskName $task -ErrorAction Stop;Add "task:$task" ($t.State -ne 'Disabled') "state=$($t.State)"}catch{Add "task:$task" $false $_.Exception.Message}}
try{$r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 5 'http://127.0.0.1:8787/health';Add 'command-center-http' ($r.StatusCode -eq 200) "http=$($r.StatusCode)"}catch{Add 'command-center-http' $false $_.Exception.Message}
$manifest=Join-Path $Root 'nodal-center\.nodal-manifest.json';Add 'nodal-manifest' (Test-Path $manifest) $manifest
$health=Join-Path $Root 'state\server-health.json';Add 'watchdog-state' (Test-Path $health) $health
$backup=Get-ChildItem (Join-Path $Root 'backups') -Filter 'elimserver-*.zip' -File -ErrorAction SilentlyContinue|Sort-Object LastWriteTime -Descending|Select-Object -First 1;Add 'backup-artifact' ($null -ne $backup) $(if($backup){$backup.FullName}else{'none'})
$crm=Join-Path $Root 'repos\elimfilters-crm';Add 'crm-repo' (Test-Path $crm) $crm
$agents=Join-Path $repo 'config\elimserver\agents.json';Add 'agents-policy' (Test-Path $agents) $agents
$workflows=Join-Path $repo 'config\elimserver\workflows.json';Add 'workflow-policy' (Test-Path $workflows) $workflows
$failed=@($results|Where-Object{-not $_.ok})
$status=if($failed.Count -eq 0){'VALID'}else{'INCOMPLETE'}
$payload=[ordered]@{schema_version='1.0.0';validatedAt=(Get-Date).ToUniversalTime().ToString('o');status=$status;checks=$results}
$payload|ConvertTo-Json -Depth 8|Set-Content (Join-Path $Root 'state\full-stack-validation.json') -Encoding UTF8
Write-Host "ELIMSERVER FULL STACK $status"
$results|Format-Table -AutoSize
if($failed.Count){exit 1}
