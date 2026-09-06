[CmdletBinding()]
param([string]$Root='C:\ELIMSERVER',[string]$TaskPath='\ELIMFILTERS\')
$ErrorActionPreference='Stop'
$repo=Join-Path $Root 'repos\world-catalogue'
if(-not(Test-Path $repo)){throw "world-catalogue missing: $repo"}
Set-Location $repo
$node='C:\Program Files\nodejs\node.exe'
if(-not(Test-Path $node)){throw 'Node.js 20 not found'}

Write-Host '=== ELIMSERVER FULL INSTALL ==='
foreach($d in @('state','state\alerts','logs','backups','nodal-center','repos')){New-Item -ItemType Directory -Force (Join-Path $Root $d)|Out-Null}

# Validate code before changing Windows services/tasks.
$js=@('scripts\elimserver\command-center.mjs','scripts\hermes\validate-operational-state.mjs','scripts\hermes\validate-sweep-checkpoint.mjs')
foreach($f in $js){& $node --check (Join-Path $repo $f);if($LASTEXITCODE -ne 0){throw "Node syntax failed: $f"};Write-Host "PASS $f"}
$ps=@('scripts\elimserver\watchdog.ps1','scripts\elimserver\backup.ps1','scripts\elimserver\safe-update.ps1','scripts\elimserver\bootstrap-nodal.ps1','scripts\elimserver\install-all.ps1')
foreach($f in $ps){$t=$null;$e=$null;[void][Management.Automation.Language.Parser]::ParseFile((Join-Path $repo $f),[ref]$t,[ref]$e);if($e.Count){$e|% Message;throw "PowerShell parse failed: $f"};Write-Host "PASS $f"}

# Nodal Center
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $repo 'scripts\elimserver\bootstrap-nodal.ps1') -Root (Join-Path $Root 'nodal-center')
if($LASTEXITCODE -ne 0){throw 'Nodal Center bootstrap failed'}

# CRM clone/update is done in the interactive installer so existing GitHub credentials are reused.
$crm=Join-Path $Root 'repos\elimfilters-crm'
if(-not(Test-Path $crm)){
  Write-Host 'Cloning ELIMFILTERS CRM...'
  & git clone https://github.com/LATAMFILTERS/elimfilters-crm.git $crm
  if($LASTEXITCODE -ne 0){Write-Warning 'CRM clone failed. Other ELIMSERVER components will still be installed.'}
}else{
  Write-Host 'CRM repository already present.'
}
if(Test-Path (Join-Path $crm 'package.json')){Push-Location $crm;try{& npm.cmd install;if($LASTEXITCODE -ne 0){Write-Warning 'CRM npm install failed'};& npm.cmd run check;if($LASTEXITCODE -ne 0){Write-Warning 'CRM check failed'}}finally{Pop-Location}}

# Scheduled tasks use SYSTEM only for local server functions. Existing HERMES tasks/credentials are untouched.
function Register-SystemTask([string]$Name,[string]$Command,[object[]]$Triggers){
  $action=New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -NonInteractive -ExecutionPolicy Bypass -Command $Command"
  $principal=New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest
  $settings=New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Hours 2)
  Register-ScheduledTask -TaskPath $TaskPath -TaskName $Name -Action $action -Trigger $Triggers -Principal $principal -Settings $settings -Force|Out-Null
}

$dashboardCmd="& '$node' '$(Join-Path $repo 'scripts\elimserver\command-center.mjs')'"
Register-SystemTask 'ELIMSERVER Command Center' $dashboardCmd @((New-ScheduledTaskTrigger -AtStartup))
$watchdogCmd="& powershell.exe -NoProfile -ExecutionPolicy Bypass -File '$(Join-Path $repo 'scripts\elimserver\watchdog.ps1')'"
$watchTrigger=New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 30)
Register-SystemTask 'ELIMSERVER Watchdog' $watchdogCmd @($watchTrigger)
$backupCmd="& powershell.exe -NoProfile -ExecutionPolicy Bypass -File '$(Join-Path $repo 'scripts\elimserver\backup.ps1')'"
Register-SystemTask 'ELIMSERVER Backup' $backupCmd @((New-ScheduledTaskTrigger -Daily -At '02:00'))

Start-ScheduledTask -TaskPath $TaskPath -TaskName 'ELIMSERVER Command Center'
Start-Sleep -Seconds 2
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $repo 'scripts\elimserver\watchdog.ps1')
$watchExit=$LASTEXITCODE
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $repo 'scripts\elimserver\backup.ps1')
if($LASTEXITCODE -ne 0){throw 'Initial backup failed'}

@{schema_version='1.0.0';installedAt=(Get-Date).ToUniversalTime().ToString('o');commit=(& git -C $repo rev-parse --short HEAD).Trim();commandCenter='http://127.0.0.1:8787';watchdogMinutes=30;backup='daily 02:00';crmPresent=(Test-Path $crm);nodalCenter=(Join-Path $Root 'nodal-center');watchdogInitialExit=$watchExit}|ConvertTo-Json -Depth 5|Set-Content (Join-Path $Root 'state\installation.json') -Encoding UTF8

Write-Host "`n=== INSTALLED ==="
Get-ScheduledTask -TaskPath $TaskPath | Where-Object TaskName -Like 'ELIMSERVER*' | Select-Object TaskName,State | Format-Table -AutoSize
Write-Host 'Command Center: http://127.0.0.1:8787'
Write-Host 'Nodal Center: C:\ELIMSERVER\nodal-center'
Write-Host 'Backups: C:\ELIMSERVER\backups'
Write-Host 'Health: C:\ELIMSERVER\state\server-health.json'
Write-Host 'ELIMSERVER FULL INSTALL COMPLETE'
