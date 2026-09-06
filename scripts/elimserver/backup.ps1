[CmdletBinding()]
param([string]$Root='C:\ELIMSERVER',[int]$RetentionDays=30)
$ErrorActionPreference='Stop'
$dest=Join-Path $Root 'backups'
$tmp=Join-Path $env:TEMP ('elimserver-backup-'+[guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force $dest,$tmp | Out-Null
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
$targets=@(
  @{src=(Join-Path $Root 'state');name='state'},
  @{src=(Join-Path $Root 'nodal-center');name='nodal-center'},
  @{src=(Join-Path $Root 'logs\hermes');name='hermes-logs'}
)
foreach($t in $targets){if(Test-Path $t.src){Copy-Item $t.src (Join-Path $tmp $t.name) -Recurse -Force}}
$repo=Join-Path $Root 'repos\world-catalogue'
if(Test-Path $repo){New-Item -ItemType Directory -Force (Join-Path $tmp 'repo-meta')|Out-Null;& git -C $repo rev-parse HEAD | Set-Content (Join-Path $tmp 'repo-meta\world-catalogue.commit.txt')}
$archive=Join-Path $dest "elimserver-$stamp.zip"
Compress-Archive -Path (Join-Path $tmp '*') -DestinationPath $archive -CompressionLevel Optimal
Remove-Item $tmp -Recurse -Force
Get-ChildItem $dest -Filter 'elimserver-*.zip' -File | Where-Object LastWriteTime -lt (Get-Date).AddDays(-$RetentionDays) | Remove-Item -Force
$hash=(Get-FileHash $archive -Algorithm SHA256).Hash
@{createdAt=(Get-Date).ToUniversalTime().ToString('o');archive=$archive;sha256=$hash;retentionDays=$RetentionDays}|ConvertTo-Json|Set-Content (Join-Path $Root 'state\last-backup.json') -Encoding UTF8
Write-Host "BACKUP COMPLETE $archive SHA256=$hash"
