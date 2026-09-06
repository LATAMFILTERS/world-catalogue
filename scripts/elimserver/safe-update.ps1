[CmdletBinding()]
param([string]$Repo='C:\ELIMSERVER\repos\world-catalogue',[string]$Branch='main')
$ErrorActionPreference='Stop'
Set-Location $Repo
if((& git status --porcelain)){throw 'Safe update refused: working tree is dirty.'}
$before=(& git rev-parse HEAD).Trim()
Write-Host "SAFE UPDATE from $before"
& git fetch origin $Branch
if($LASTEXITCODE -ne 0){throw 'git fetch failed'}
$target=(& git rev-parse "origin/$Branch").Trim()
if($before -eq $target){Write-Host 'Already current.';exit 0}
try{
  & git checkout $Branch
  & git reset --hard $target
  if($LASTEXITCODE -ne 0){throw 'git reset failed'}
  $node='C:\Program Files\nodejs\node.exe'
  foreach($f in @('scripts\hermes\industry-sweep-compound.mjs','scripts\hermes\research-real-candidates-compound.mjs','scripts\hermes\validate-operational-state.mjs','scripts\elimserver\command-center.mjs')){
    if(Test-Path $f){& $node --check $f;if($LASTEXITCODE -ne 0){throw "syntax failed $f"}}
  }
  $tokens=$null;$errors=$null
  [void][System.Management.Automation.Language.Parser]::ParseFile((Join-Path $Repo 'scripts\hermes\windows\Invoke-HermesLocal.ps1'),[ref]$tokens,[ref]$errors)
  if($errors.Count){throw 'HERMES runner PowerShell parse failed'}
  & npm.cmd run hermes:preflight
  if($LASTEXITCODE -ne 0){throw 'HERMES preflight failed'}
  @{updatedAt=(Get-Date).ToUniversalTime().ToString('o');from=$before;to=$target;status='SUCCESS'}|ConvertTo-Json|Set-Content 'C:\ELIMSERVER\state\last-safe-update.json' -Encoding UTF8
  Write-Host "SAFE UPDATE SUCCESS $target"
}catch{
  Write-Host "SAFE UPDATE FAILED: $($_.Exception.Message) -- rolling back"
  & git reset --hard $before
  @{updatedAt=(Get-Date).ToUniversalTime().ToString('o');from=$before;attempted=$target;status='ROLLED_BACK';error=$_.Exception.Message}|ConvertTo-Json|Set-Content 'C:\ELIMSERVER\state\last-safe-update.json' -Encoding UTF8
  throw
}
