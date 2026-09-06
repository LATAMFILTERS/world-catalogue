[CmdletBinding()]
param(
  [ValidateSet('Weekly','Recovery','Test')]
  [string]$Mode = 'Test',
  [string]$RepoRoot = 'C:\ELIMSERVER\repos\world-catalogue',
  [string]$VaultPath = 'C:\ELIMSERVER\secrets\hermes-secrets.clixml',
  [string]$StateRoot = 'C:\ELIMSERVER\state\hermes',
  [string]$LogRoot = 'C:\ELIMSERVER\logs\hermes'
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
Set-StrictMode -Version 2.0

function Convert-SecureValue([Security.SecureString]$Value) {
  if ($null -eq $Value) { throw 'A required encrypted credential is missing.' }
  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
  try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
}

function Write-Log([string]$Message) {
  $line = '{0} [{1}] {2}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz'), $Mode.ToUpperInvariant(), $Message
  $line | Out-File -FilePath $script:LogFile -Append -Encoding utf8
  Write-Host $line
}

function New-FallbackReport([System.Collections.IDictionary]$Status) {
  $date = Get-Date -Format 'yyyy-MM-dd'
  $path = Join-Path $RepoRoot "hermes\reports\hermes-weekly-$date.md"
  $failed = @($Status.Keys | Where-Object { -not $Status[$_] })
  $body = @('# HERMES Weekly Intelligence Review','','**PARTIAL / DEGRADED DELIVERY**','',"Generated: $((Get-Date).ToUniversalTime().ToString('o'))",'','HERMES delivered the scheduled notice although one or more stages did not complete.','',"Incomplete stages: $($failed -join ', ')",'','No incomplete result was published or promoted automatically.','','Decision authority: Victor Abreu.') -join [Environment]::NewLine
  New-Item -ItemType Directory -Force (Split-Path $path) | Out-Null
  [IO.File]::WriteAllText($path, $body, [Text.UTF8Encoding]::new($false))
  Write-Log "Fallback report created: $path"
}

function Invoke-LimitedProcess {
  param([string]$Name,[string]$FilePath,[string[]]$Arguments,[int]$TimeoutMinutes)
  $id = [guid]::NewGuid().ToString('N')
  $stdout = Join-Path $env:TEMP ("hermes-$PID-$id.out")
  $stderr = Join-Path $env:TEMP ("hermes-$PID-$id.err")
  $exitFile = Join-Path $env:TEMP ("hermes-$PID-$id.exit")
  $wrapper = Join-Path $env:TEMP ("hermes-$PID-$id.ps1")
  $quotedFile = "'" + $FilePath.Replace("'","''") + "'"
  $quotedArguments = @($Arguments | ForEach-Object { "'" + ([string]$_).Replace("'","''") + "'" })
  $quotedExitFile = "'" + $exitFile.Replace("'","''") + "'"
  $wrapperBody = @('$ErrorActionPreference = ''Continue''',"& $quotedFile $($quotedArguments -join ' ')",'$childExit = $LASTEXITCODE','if ($null -eq $childExit) { $childExit = 1 }',("[IO.File]::WriteAllText(" + $quotedExitFile + ', [string]$childExit)'),'exit $childExit') -join [Environment]::NewLine
  [IO.File]::WriteAllText($wrapper, $wrapperBody, [Text.UTF8Encoding]::new($false))
  Write-Log "START $Name (timeout $($TimeoutMinutes)m)"
  try {
    $powerShell = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
    $process = Start-Process -FilePath $powerShell -ArgumentList @('-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',$wrapper) -WorkingDirectory $RepoRoot -NoNewWindow -PassThru -RedirectStandardOutput $stdout -RedirectStandardError $stderr
    if (-not $process.WaitForExit($TimeoutMinutes * 60000)) { & taskkill.exe /PID $process.Id /T /F | Out-Null; Write-Log "TIMEOUT $Name"; return $false }
    $process.WaitForExit()
    if (Test-Path $stdout) { Get-Content $stdout | ForEach-Object { Write-Log "[$Name] $_" } }
    if (Test-Path $stderr) { Get-Content $stderr | ForEach-Object { Write-Log "[$Name] $_" } }
    if (-not (Test-Path $exitFile)) { Write-Log "FAILED $Name no exit status was produced"; return $false }
    $exitCode = [int]([IO.File]::ReadAllText($exitFile))
    if ($exitCode -ne 0) { Write-Log "FAILED $Name exit=$exitCode"; return $false }
    Write-Log "SUCCESS $Name"; return $true
  } catch { Write-Log "FAILED $Name $($_.Exception.Message)"; return $false }
  finally { Remove-Item $stdout,$stderr,$exitFile,$wrapper -Force -ErrorAction SilentlyContinue }
}

function Get-CycleId {
  $today = (Get-Date).Date
  $daysSinceMonday = (([int]$today.DayOfWeek + 6) % 7)
  return $today.AddDays(-$daysSinceMonday).ToString('yyyy-MM-dd')
}

function Get-RecoveryPlan([object]$Pending) {
  $failed = @($Pending.failed)
  $order = @('baseline','collect','sweep','seoImport','research','validate','report','email')
  $start = 'email'
  foreach ($stage in $order) { if ($failed -contains $stage -or @($failed | Where-Object { $_ -like "fatal:*" }).Count -gt 0) { $start = $stage; break } }
  switch ($start) {
    'baseline' { return @('baseline','harvestRestore','collect','harvestPersist','sweep','seoAudit','seoTriage','seoGaps','seoImport','research','validate','report','email') }
    'collect' { return @('collect','harvestPersist','sweep','seoAudit','seoTriage','seoGaps','seoImport','research','validate','report','email') }
    'sweep' { return @('sweep','research','validate','report','email') }
    'seoImport' { return @('seoAudit','seoTriage','seoGaps','seoImport','research','validate','report','email') }
    'research' { return @('research','validate','report','email') }
    'validate' { return @('validate','report','email') }
    'report' { return @('report','email') }
    default { return @('email') }
  }
}

New-Item -ItemType Directory -Force $StateRoot,$LogRoot | Out-Null
$script:LogFile = Join-Path $LogRoot ('hermes-{0}-{1}.log' -f (Get-Date -Format 'yyyyMMdd-HHmmss'), $Mode.ToLowerInvariant())
Get-ChildItem $LogRoot -Filter 'hermes-*.log' -File -ErrorAction SilentlyContinue | Where-Object LastWriteTime -lt (Get-Date).AddDays(-30) | Remove-Item -Force -ErrorAction SilentlyContinue
$lockPath = Join-Path $StateRoot 'hermes.lock'
$pendingPath = Join-Path $StateRoot 'recovery-pending.json'
$cycle = Get-CycleId
$attempt = 0
$lock = $null

function Stop-RecoveryAtFailure([string]$Stage) {
  if ($Mode -ne 'Recovery') { return }
  $payload = @{
    cycle = $cycle
    attempts = $attempt
    updatedAt = (Get-Date).ToUniversalTime().ToString('o')
    failed = @($Stage)
    emailState = 'NOT_ATTEMPTED_PIPELINE_INCOMPLETE'
  }
  $payload | ConvertTo-Json | Set-Content $pendingPath -Encoding UTF8
  Write-Log "RECOVERY CHECKPOINT; halted at failed dependency=$Stage; downstream stages deferred"
  exit 1
}

try {
  try { $lock = [IO.File]::Open($lockPath, 'OpenOrCreate', 'ReadWrite', 'None') } catch { Write-Log 'SKIPPED another HERMES process is already running'; exit 0 }
  if ((Get-TimeZone).Id -ne 'Central Standard Time') { throw 'Windows time zone must be Central Standard Time.' }
  if (-not (Test-Path $RepoRoot)) { throw "Repository not found: $RepoRoot" }
  if (-not (Test-Path $VaultPath)) { throw "Encrypted vault not found: $VaultPath" }
  if (-not (Test-Path (Join-Path $RepoRoot 'node_modules'))) { throw 'node_modules is missing. Install dependencies manually once; the scheduler will not run npm ci.' }

  $npm='C:\Program Files\nodejs\npm.cmd'; $node='C:\Program Files\nodejs\node.exe'; $python=(Get-Command python.exe -ErrorAction Stop).Source
  if (-not (Test-Path $npm) -or -not (Test-Path $node)) { throw 'Node.js 20 was not found in C:\Program Files\nodejs.' }

  $sentPath = Join-Path $StateRoot ("weekly-$cycle.sent.json")
  if ($Mode -eq 'Weekly' -and (Test-Path $sentPath)) { Write-Log "SKIPPED weekly email already sent for cycle $cycle"; exit 0 }
  if ($Mode -eq 'Recovery' -and -not (Test-Path $pendingPath)) { Write-Log 'SKIPPED no recovery is pending'; exit 0 }

  $plan = @('baseline','harvestRestore','collect','harvestPersist','sweep','seoAudit','seoTriage','seoGaps','seoImport','research','validate','report','email')
  if ($Mode -eq 'Recovery') {
    $pending = Get-Content $pendingPath -Raw | ConvertFrom-Json
    $cycle = [string]$pending.cycle
    $attempt = [int]$pending.attempts + 1
    $plan = Get-RecoveryPlan $pending
    Write-Log "RECOVERY attempt=$attempt cycle=$cycle resume_plan=$($plan -join ',')"
  }

  $vault=Import-Clixml $VaultPath
  $env:GROQ_API_KEY=Convert-SecureValue $vault.GROQ_API_KEY; $env:AZURE_CLIENT_ID=Convert-SecureValue $vault.AZURE_CLIENT_ID; $env:AZURE_TENANT_ID=Convert-SecureValue $vault.AZURE_TENANT_ID; $env:AZURE_CLIENT_SECRET=Convert-SecureValue $vault.AZURE_CLIENT_SECRET; $env:HERMES_SENDER_EMAIL=Convert-SecureValue $vault.HERMES_SENDER_EMAIL; $env:HERMES_REVIEW_EMAIL=Convert-SecureValue $vault.HERMES_REVIEW_EMAIL
  $env:HERMES_EMAIL_PROVIDER='outlook'; $env:HERMES_EMAIL_LIVE='false'; $env:HERMES_COLLECTION_DRY_RUN='true'; $env:HERMES_BASELINE_MODE='false'; $env:HERMES_MAX_SOURCES_PER_RUN='35'
  $env:HERMES_CYCLE_ID=$cycle; $env:HERMES_STATE_ROOT=$StateRoot
  $env:HERMES_GROQ_MODEL='groq/compound'; $env:HERMES_SWEEP_MODEL='groq/compound-mini'; $env:HERMES_SWEEP_DOMAIN_BATCH='1'; $env:HERMES_SWEEP_MAX_TOPICS_PER_REQUEST='4'; $env:HERMES_SWEEP_MAX_FINDINGS_PER_DOMAIN='2'; $env:HERMES_SWEEP_MAX_RETRIES='2'; $env:HERMES_SWEEP_MIN_INTERVAL_MS='10000'; $env:HERMES_SWEEP_MIN_429_BACKOFF_MS='10000'; $env:HERMES_SWEEP_BACKOFF_MS='10000'; $env:HERMES_SWEEP_MAX_BACKOFF_MS='60000'; $env:HERMES_SWEEP_BUDGET_MS='2100000'; $env:HERMES_RESEARCH_BUDGET_MS='1800000'; $env:HERMES_RESEARCH_RETRY_DELAY_MS='21600000'; $env:HERMES_GROQ_TPD_FALLBACK='true'

  $status=[ordered]@{}
  $status.preflight=Invoke-LimitedProcess 'preflight' $npm @('run','hermes:preflight') 5
  if (-not $status.preflight) { throw 'Preflight failed; expensive stages were not started.' }
  if ($Mode -eq 'Test') { $status.report=Invoke-LimitedProcess 'report-test' $npm @('run','hermes:report:real') 5; $status.email=Invoke-LimitedProcess 'email-preview' $npm @('run','hermes:email:real') 5; if(-not($status.report -and $status.email)){exit 1}; Write-Log 'TEST COMPLETE; no email was sent and no scheduled state was changed'; exit 0 }

  foreach($stage in @('baseline','harvestRestore','collect','harvestPersist','sweep','seoAudit','seoTriage','seoGaps','seoImport','research','validate','report')) { if(-not ($plan -contains $stage)){ $status[$stage]=$true; Write-Log "RESUME SKIP $stage already satisfied in prior attempt" } }

  if($plan -contains 'baseline'){ $status.baseline=Invoke-LimitedProcess 'baseline-restore' $npm @('run','hermes:baseline:restore') 10; if(-not $status.baseline){Stop-RecoveryAtFailure 'baseline'} }
  if($plan -contains 'harvestRestore'){ $status.harvestRestore=Invoke-LimitedProcess 'harvest-restore' $npm @('run','hermes:harvest:restore') 10 }
  if($plan -contains 'collect'){ $status.collect=Invoke-LimitedProcess 'collect' $npm @('run','hermes:collect') 30; if(-not $status.collect){Stop-RecoveryAtFailure 'collect'} }
  if($plan -contains 'harvestPersist'){ if($status.collect){$status.harvestPersist=Invoke-LimitedProcess 'harvest-persist' $npm @('run','hermes:harvest:persist') 10}else{$status.harvestPersist=$false} }
  if($plan -contains 'sweep'){ $status.sweep=Invoke-LimitedProcess 'industry-sweep' $npm @('run','hermes:sweep') 45; if(-not $status.sweep){Stop-RecoveryAtFailure 'sweep'} }
  if($plan -contains 'seoAudit'){ $status.seoAudit=Invoke-LimitedProcess 'seo-audit' $python @('scripts/seo-geo-audit/audit.py','--out-dir','seo-geo-audit-out') 15 }
  if($plan -contains 'seoTriage'){ if($status.seoAudit){$status.seoTriage=Invoke-LimitedProcess 'seo-triage' $python @('scripts/seo-geo-audit/triage_short_pages.py','seo-geo-audit-out/seo-geo-audit.csv','--threshold','250','--out-dir','seo-geo-audit-out') 10}else{$status.seoTriage=$false} }
  if($plan -contains 'seoGaps'){ if($status.seoTriage){$status.seoGaps=Invoke-LimitedProcess 'seo-gaps' $python @('scripts/seo-geo-audit/build_hermes_knowledge_gaps.py','seo-geo-audit-out/short-pages-triage.csv','--out-dir','seo-geo-audit-out') 10}else{$status.seoGaps=$false} }
  if($plan -contains 'seoImport'){ if($status.seoGaps){$status.seoImport=Invoke-LimitedProcess 'seo-import' $node @('scripts/hermes/import-seo-knowledge-gaps.mjs','seo-geo-audit-out/hermes-knowledge-gaps.json') 10}else{$status.seoImport=$false}; if(-not $status.seoImport){Stop-RecoveryAtFailure 'seoImport'} }
  if($plan -contains 'research'){ $status.research=Invoke-LimitedProcess 'research' $npm @('run','hermes:research') 45; if(-not $status.research){Stop-RecoveryAtFailure 'research'} }
  if($plan -contains 'validate'){ $status.validate=Invoke-LimitedProcess 'validate' $npm @('run','hermes:validate:real') 15; if(-not $status.validate){Stop-RecoveryAtFailure 'validate'} }

  $env:HERMES_COLLECT_STATUS=$(if($status.collect){'success'}else{'failure'}); $env:HERMES_SWEEP_STATUS=$(if($status.sweep){'success'}else{'failure'}); $env:HERMES_SEO_GAPS_STATUS=$(if($status.seoImport){'success'}else{'failure'}); $env:HERMES_RESEARCH_STATUS=$(if($status.research){'success'}else{'failure'}); $env:HERMES_VALIDATE_STATUS=$(if($status.validate){'success'}else{'failure'})
  if($plan -contains 'report'){ $status.report=Invoke-LimitedProcess 'report' $npm @('run','hermes:report:real') 10; if(-not $status.report){Stop-RecoveryAtFailure 'report'} }
  if($Mode -eq 'Weekly' -and -not $status.report){New-FallbackReport $status}

  $critical=@('baseline','collect','sweep','seoImport','research','validate','report'); $complete=@($critical|Where-Object{-not $status[$_]}).Count -eq 0
  $emailAttempted=$false; $status.email=$false
  if(($Mode -eq 'Weekly') -or (($plan -contains 'email') -and $complete)){ $emailAttempted=$true; $env:HERMES_EMAIL_LIVE='true'; $status.email=Invoke-LimitedProcess 'email' $npm @('run','hermes:email:real') 10; $env:HERMES_EMAIL_LIVE='false' }
  if($Mode -eq 'Weekly' -and $status.email){ @{cycle=$cycle;sentAt=(Get-Date).ToUniversalTime().ToString('o');complete=$complete}|ConvertTo-Json|Set-Content $sentPath -Encoding UTF8 }
  if($complete -and $status.email){ Remove-Item $pendingPath -Force -ErrorAction SilentlyContinue; Write-Log 'PIPELINE COMPLETE'; exit 0 }

  if($Mode -eq 'Weekly'){$attempt=0}
  $failedStages=@($critical|Where-Object{-not $status[$_]}); if($emailAttempted -and -not $status.email){$failedStages+=@('email')}
  $emailState=$(if(-not $emailAttempted){'NOT_ATTEMPTED_PIPELINE_INCOMPLETE'}elseif($status.email){'SUCCESS'}else{'FAILED'})
  @{cycle=$cycle;attempts=$attempt;updatedAt=(Get-Date).ToUniversalTime().ToString('o');failed=$failedStages;emailState=$emailState}|ConvertTo-Json|Set-Content $pendingPath -Encoding UTF8
  Write-Log "PIPELINE DEGRADED; recovery pending attempt=$attempt failed=$($failedStages -join ',') emailState=$emailState"; exit 1
}
catch {
  $fatalMessage=$_.Exception.Message; Write-Log "FATAL $fatalMessage"
  if($Mode -ne 'Test'){ try{ @{cycle=$cycle;attempts=$attempt;updatedAt=(Get-Date).ToUniversalTime().ToString('o');failed=@("fatal:$fatalMessage");emailState='NOT_ATTEMPTED_FATAL'}|ConvertTo-Json|Set-Content $pendingPath -Encoding UTF8; Write-Log "RECOVERY PENDING persisted after fatal error attempt=$attempt" }catch{ Write-Log "FAILED to persist recovery state after fatal error: $($_.Exception.Message)" } }
  exit 1
}
finally {
  $env:HERMES_EMAIL_LIVE='false'
  foreach($name in 'GROQ_API_KEY','AZURE_CLIENT_ID','AZURE_TENANT_ID','AZURE_CLIENT_SECRET','HERMES_SENDER_EMAIL','HERMES_REVIEW_EMAIL','HERMES_CYCLE_ID','HERMES_STATE_ROOT','HERMES_SWEEP_MODEL','HERMES_SWEEP_DOMAIN_BATCH','HERMES_SWEEP_MAX_TOPICS_PER_REQUEST','HERMES_SWEEP_MAX_FINDINGS_PER_DOMAIN','HERMES_SWEEP_MAX_RETRIES','HERMES_SWEEP_MIN_INTERVAL_MS','HERMES_SWEEP_MIN_429_BACKOFF_MS','HERMES_SWEEP_BACKOFF_MS','HERMES_SWEEP_MAX_BACKOFF_MS','HERMES_SWEEP_BUDGET_MS','HERMES_RESEARCH_BUDGET_MS','HERMES_RESEARCH_RETRY_DELAY_MS'){Remove-Item "Env:$name" -ErrorAction SilentlyContinue}
  if($null -ne $lock){$lock.Dispose()}
}
