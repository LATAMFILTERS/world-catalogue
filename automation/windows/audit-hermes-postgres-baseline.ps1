# HERMES / PostgreSQL baseline. Read-only; no DB connection, task execution, or secret access.
# Run in Windows PowerShell 5.1 or PowerShell 7 on ELIMSERVER.
[CmdletBinding()]
param()
$ErrorActionPreference = 'Continue'
function Section([string]$Name) { Write-Output ("\n=== " + $Name + " ===") }
Section 'HOST'
[pscustomobject]@{ Computer=$env:COMPUTERNAME; Time=(Get-Date).ToString('o'); PSVersion=$PSVersionTable.PSVersion.ToString() } | Format-List | Out-String | Write-Output
Section 'RESOURCE CAPACITY'
try {
  $os=Get-CimInstance Win32_OperatingSystem
  [pscustomobject]@{
    TotalRAMGiB=[math]::Round($os.TotalVisibleMemorySize/1MB,2)
    FreeRAMGiB=[math]::Round($os.FreePhysicalMemory/1MB,2)
    CFreeGiB=[math]::Round((Get-PSDrive -Name C).Free/1GB,2)
  } | Format-List | Out-String | Write-Output
} catch { Write-Output ("Resource inspection failed: " + $_.Exception.Message) }
Section 'POSTGRES SERVICES'
try { Get-Service | Where-Object {$_.Name -match 'postgres'} | Select-Object Name,Status,StartType | Format-Table -AutoSize | Out-String | Write-Output } catch { Write-Output $_.Exception.Message }
Section 'POSTGRES LOCAL PORTS (no authentication)'
try {
  Get-NetTCPConnection -State Listen -ErrorAction Stop |
    Where-Object { $_.LocalPort -in @(5432,5440) } |
    Select-Object LocalAddress,LocalPort,State |
    Format-Table -AutoSize | Out-String | Write-Output
} catch { Write-Output ("Port inspection unavailable: " + $_.Exception.Message) }
Section 'HERMES SCHEDULED TASKS'
try {
  $tasks=@(Get-ScheduledTask -ErrorAction Stop | Where-Object {($_.TaskName -match 'HERMES') -or ($_.TaskPath -match 'HERMES')})
  if($tasks.Count -eq 0){ Write-Output 'No HERMES tasks found' }
  foreach($t in $tasks) {
    $info=$null
    try { $info=$t | Get-ScheduledTaskInfo -ErrorAction Stop } catch {}
    [pscustomobject]@{
      Task=$t.TaskPath+$t.TaskName
      State=$t.State
      LastRun=if($info){$info.LastRunTime}else{$null}
      LastResult=if($info){$info.LastTaskResult}else{$null}
      NextRun=if($info){$info.NextRunTime}else{$null}
    } | Format-List | Out-String | Write-Output
  }
} catch { Write-Output ("Task inspection failed: " + $_.Exception.Message) }
Section 'HERMES PATHS (existence only)'
@(
'C:\ELIMSERVER\apps\hermes-runtime',
'C:\ELIMSERVER\repos\world-catalogue',
'C:\ELIMSERVER\logs\hermes',
'C:\ELIMSERVER\state\hermes',
'C:\ELIMSERVER\secrets\hermes-secrets.clixml'
) | ForEach-Object { [pscustomobject]@{Path=$_;Exists=(Test-Path -LiteralPath $_)} } | Format-Table -AutoSize | Out-String | Write-Output
Section 'RUNTIME GIT IDENTITY (no changes)'
$runtime='C:\ELIMSERVER\apps\hermes-runtime'
if ((Test-Path -LiteralPath $runtime) -and (Get-Command git -ErrorAction SilentlyContinue)) {
  & git -C $runtime rev-parse --short HEAD 2>&1 | Write-Output
  & git -C $runtime branch --show-current 2>&1 | Write-Output
  $changes=@(& git -C $runtime status --porcelain -uno 2>$null)
  Write-Output ("Tracked working-tree changes: " + $changes.Count)
} else { Write-Output 'Git or runtime directory unavailable' }
Section 'DONE'
Write-Output 'No scheduled task, SQL query, migration, build, backup, or HERMES runner was executed.'
