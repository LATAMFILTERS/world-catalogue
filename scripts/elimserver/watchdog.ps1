[CmdletBinding()]
param(
  [string]$Root='C:\ELIMSERVER',
  [string]$TaskPath='\ELIMFILTERS\'
)
$ErrorActionPreference='Stop'
$stateRoot=Join-Path $Root 'state'
$alertRoot=Join-Path $stateRoot 'alerts'
New-Item -ItemType Directory -Force $stateRoot,$alertRoot | Out-Null
$checks=@()
function Add-Check([string]$Name,[bool]$Ok,[string]$Detail){$script:checks += [pscustomobject]@{name=$Name;ok=$Ok;detail=$Detail}}

try{$disk=Get-PSDrive -Name C;$freeGB=[math]::Round($disk.Free/1GB,1);Add-Check 'disk' ($freeGB -ge 10) "free_gb=$freeGB"}catch{Add-Check 'disk' $false $_.Exception.Message}
foreach($name in 'HERMES Weekly','HERMES Recovery'){
  try{$t=Get-ScheduledTask -TaskPath $TaskPath -TaskName $name -ErrorAction Stop;$i=Get-ScheduledTaskInfo -TaskPath $TaskPath -TaskName $name;Add-Check $name ($t.State -ne 'Disabled') "state=$($t.State) last=$($i.LastRunTime) result=$($i.LastTaskResult) next=$($i.NextRunTime)"}catch{Add-Check $name $false $_.Exception.Message}
}
try{$repo=Join-Path $Root 'repos\world-catalogue';$commit=(& git -C $repo rev-parse --short HEAD).Trim();Add-Check 'world-catalogue' ($LASTEXITCODE -eq 0) "commit=$commit"}catch{Add-Check 'world-catalogue' $false $_.Exception.Message}
try{$r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 10 'http://127.0.0.1:8787/health';Add-Check 'command-center' ($r.StatusCode -eq 200) "http=$($r.StatusCode)"}catch{Add-Check 'command-center' $false $_.Exception.Message}
try{$r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 15 'https://elimfilters.com';Add-Check 'elimfilters.com' ($r.StatusCode -ge 200 -and $r.StatusCode -lt 400) "http=$($r.StatusCode)"}catch{Add-Check 'elimfilters.com' $false $_.Exception.Message}
try{$r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 15 'https://part-search.elimfilters.com';Add-Check 'part-search' ($r.StatusCode -ge 200 -and $r.StatusCode -lt 400) "http=$($r.StatusCode)"}catch{Add-Check 'part-search' $false $_.Exception.Message}
$failed=@($checks|Where-Object{-not $_.ok})
$overall=if($failed.Count -eq 0){'HEALTHY'}else{'DEGRADED'}
$generated=(Get-Date).ToUniversalTime().ToString('o')
$payload=[ordered]@{schema_version='1.0.0';generatedAt=$generated;overall=$overall;checks=$checks}
$payload|ConvertTo-Json -Depth 6|Set-Content (Join-Path $stateRoot 'server-health.json') -Encoding UTF8
if($failed.Count -gt 0){
  $fingerprint=($failed|ForEach-Object{"$($_.name):$($_.detail)"}) -join '|'
  $safe=(($failed|ForEach-Object{$_.name}) -join '-').Replace(' ','_').Replace('/','_')
  $alert=[ordered]@{schema_version='1.0.0';createdAt=$generated;severity='MATERIAL';status='OPEN';source='ELIMSERVER_WATCHDOG';summary="Server health degraded: $($failed.Count) check(s) failed";failed=$failed;fingerprint=$fingerprint}
  $alert|ConvertTo-Json -Depth 8|Set-Content (Join-Path $alertRoot ("watchdog-$(Get-Date -Format 'yyyyMMdd-HHmmss')-$safe.json")) -Encoding UTF8
}
Get-ChildItem $alertRoot -Filter 'watchdog-*.json' -File -ErrorAction SilentlyContinue|Where-Object LastWriteTime -lt (Get-Date).AddDays(-30)|Remove-Item -Force
Write-Host "ELIMSERVER WATCHDOG $overall"
$checks|Format-Table -AutoSize
if($overall -ne 'HEALTHY'){exit 1}
