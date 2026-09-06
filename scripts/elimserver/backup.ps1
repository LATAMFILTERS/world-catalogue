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
  @{src=(Join-Path $Root 'logs\hermes');name='hermes-logs'},
  @{src=(Join-Path $Root 'secrets');name='encrypted-secrets'}
)
foreach($t in $targets){if(Test-Path $t.src){Copy-Item $t.src (Join-Path $tmp $t.name) -Recurse -Force}}
$meta=Join-Path $tmp 'repo-meta';New-Item -ItemType Directory -Force $meta|Out-Null
foreach($r in @('world-catalogue','elimfilters-crm')){$repo=Join-Path $Root "repos\$r";if(Test-Path $repo){& git -C $repo rev-parse HEAD | Set-Content (Join-Path $meta "$r.commit.txt")}}
$archive=Join-Path $dest "elimserver-$stamp.zip"
Compress-Archive -Path (Join-Path $tmp '*') -DestinationPath $archive -CompressionLevel Optimal
Remove-Item $tmp -Recurse -Force
Get-ChildItem $dest -Filter 'elimserver-*.zip' -File | Where-Object LastWriteTime -lt (Get-Date).AddDays(-$RetentionDays) | Remove-Item -Force
$hash=(Get-FileHash $archive -Algorithm SHA256).Hash
@{createdAt=(Get-Date).ToUniversalTime().ToString('o');archive=$archive;sha256=$hash;retentionDays=$RetentionDays;encryptedSecretsIncluded=(Test-Path (Join-Path $Root 'secrets'))}|ConvertTo-Json|Set-Content (Join-Path $Root 'state\last-backup.json') -Encoding UTF8
Write-Host "BACKUP COMPLETE $archive SHA256=$hash"
