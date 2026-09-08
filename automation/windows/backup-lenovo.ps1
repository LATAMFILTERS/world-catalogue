param(
  [string]$Root = "C:\ELIMSERVER",
  [string]$BackupRoot = "C:\ELIMSERVER\backups\lenovo",
  [int]$RetentionDays = 30,
  [string]$R2Remote = $env:ELIM_R2_REMOTE
)

$ErrorActionPreference = 'Stop'

function Copy-TreeIfPresent {
  param([string]$Source, [string]$Destination)
  if (-not (Test-Path $Source)) { return $false }
  New-Item -ItemType Directory -Force -Path $Destination | Out-Null
  Copy-Item -Path (Join-Path $Source '*') -Destination $Destination -Recurse -Force -ErrorAction Stop
  return $true
}

function Copy-FileIfPresent {
  param([string]$Source, [string]$DestinationDir)
  if (-not (Test-Path $Source)) { return $false }
  New-Item -ItemType Directory -Force -Path $DestinationDir | Out-Null
  Copy-Item -Path $Source -Destination $DestinationDir -Force -ErrorAction Stop
  return $true
}

New-Item -ItemType Directory -Force -Path $BackupRoot | Out-Null
$stamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$stagingRoot = Join-Path $BackupRoot ".staging-$stamp"
$payloadRoot = Join-Path $stagingRoot 'payload'
$metaRoot = Join-Path $stagingRoot 'meta'
$zipPath = Join-Path $BackupRoot "elimserver-lenovo-$stamp.zip"
$hashPath = "$zipPath.sha256"
$manifestPath = "$zipPath.manifest.json"

New-Item -ItemType Directory -Force -Path $payloadRoot,$metaRoot | Out-Null

$included = New-Object System.Collections.Generic.List[string]
$missing = New-Object System.Collections.Generic.List[string]

$targets = @(
  @{ Source = (Join-Path $Root 'secrets'); Relative = 'secrets' },
  @{ Source = (Join-Path $Root 'state'); Relative = 'state' },
  @{ Source = (Join-Path $Root 'logs\hermes'); Relative = 'logs\hermes' },
  @{ Source = (Join-Path $Root 'apps\hermes-runtime\hermes\baselines'); Relative = 'apps\hermes-runtime\hermes\baselines' },
  @{ Source = (Join-Path $Root 'apps\hermes-runtime\hermes\reports'); Relative = 'apps\hermes-runtime\hermes\reports' },
  @{ Source = (Join-Path $Root 'repos\world-catalogue\hermes\config'); Relative = 'repos\world-catalogue\hermes\config' }
)

foreach ($target in $targets) {
  $destination = Join-Path $payloadRoot $target.Relative
  if (Copy-TreeIfPresent -Source $target.Source -Destination $destination) {
    $included.Add($target.Relative)
  } else {
    $missing.Add($target.Relative)
  }
}

# Export the scheduled tasks required to rebuild the node.
$taskNames = @('ELIMFILTERS-HERMES-Weekly','ELIMFILTERS-Lenovo-Backup')
foreach ($taskName in $taskNames) {
  try {
    $task = Get-ScheduledTask -TaskName $taskName -ErrorAction Stop
    Export-ScheduledTask -TaskName $taskName | Out-File -FilePath (Join-Path $metaRoot "$taskName.xml") -Encoding utf8
  } catch {
    $missing.Add("scheduled-task:$taskName")
  }
}

$gitMeta = @{}
foreach ($repoName in @('world-catalogue','elimfilters-crm')) {
  $repoPath = Join-Path $Root "repos\$repoName"
  if (Test-Path (Join-Path $repoPath '.git')) {
    Push-Location $repoPath
    try {
      $gitMeta[$repoName] = [ordered]@{
        head = (git rev-parse HEAD).Trim()
        branch = (git branch --show-current).Trim()
        origin = (git remote get-url origin).Trim()
      }
    } finally { Pop-Location }
  }
}

$manifest = [ordered]@{
  schema_version = '1.0.0'
  created_at = (Get-Date).ToString('o')
  computer = $env:COMPUTERNAME
  user = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
  root = $Root
  included = @($included)
  missing = @($missing)
  git = $gitMeta
  notes = @(
    'Git repositories themselves are not archived because GitHub is the source master.',
    'CLIXML secrets protected with Windows DPAPI may only decrypt under the same Windows identity/profile; re-provision secrets on replacement hardware if necessary.'
  )
}
$manifest | ConvertTo-Json -Depth 8 | Out-File -FilePath (Join-Path $metaRoot 'manifest.json') -Encoding utf8

Compress-Archive -Path (Join-Path $stagingRoot '*') -DestinationPath $zipPath -CompressionLevel Optimal -Force
$hash = (Get-FileHash -Path $zipPath -Algorithm SHA256).Hash.ToLowerInvariant()
"$hash  $(Split-Path $zipPath -Leaf)" | Out-File -FilePath $hashPath -Encoding ascii
Copy-Item -Path (Join-Path $metaRoot 'manifest.json') -Destination $manifestPath -Force

# Verify the archive can be opened and that the manifest exists inside it.
$verifyDir = Join-Path $BackupRoot ".verify-$stamp"
New-Item -ItemType Directory -Force -Path $verifyDir | Out-Null
try {
  Expand-Archive -Path $zipPath -DestinationPath $verifyDir -Force
  if (-not (Test-Path (Join-Path $verifyDir 'meta\manifest.json'))) {
    throw 'Backup verification failed: manifest missing after extraction.'
  }
} finally {
  Remove-Item $verifyDir -Recurse -Force -ErrorAction SilentlyContinue
}

$r2Outcome = 'SKIPPED_NOT_CONFIGURED'
if (-not [string]::IsNullOrWhiteSpace($R2Remote)) {
  $rclone = Get-Command rclone -ErrorAction SilentlyContinue
  if ($null -eq $rclone) {
    $r2Outcome = 'SKIPPED_RCLONE_NOT_INSTALLED'
  } else {
    & rclone copyto $zipPath "$R2Remote/lenovo/$(Split-Path $zipPath -Leaf)" --checksum
    if ($LASTEXITCODE -ne 0) { throw 'R2 upload failed for backup archive.' }
    & rclone copyto $hashPath "$R2Remote/lenovo/$(Split-Path $hashPath -Leaf)"
    if ($LASTEXITCODE -ne 0) { throw 'R2 upload failed for checksum.' }
    & rclone copyto $manifestPath "$R2Remote/lenovo/$(Split-Path $manifestPath -Leaf)"
    if ($LASTEXITCODE -ne 0) { throw 'R2 upload failed for manifest.' }
    $r2Outcome = 'UPLOADED'
  }
}

Remove-Item $stagingRoot -Recurse -Force -ErrorAction SilentlyContinue

$cutoff = (Get-Date).AddDays(-1 * [Math]::Abs($RetentionDays))
Get-ChildItem $BackupRoot -File -ErrorAction SilentlyContinue |
  Where-Object { $_.LastWriteTime -lt $cutoff -and $_.Name -match '^elimserver-lenovo-.*\.(zip|sha256|json)$' } |
  Remove-Item -Force -ErrorAction SilentlyContinue

$result = [ordered]@{
  outcome = 'OK'
  archive = $zipPath
  sha256 = $hash
  manifest = $manifestPath
  local_verified = $true
  r2 = $r2Outcome
  retention_days = $RetentionDays
  included_count = $included.Count
  missing_count = $missing.Count
}
$result | ConvertTo-Json -Depth 5
