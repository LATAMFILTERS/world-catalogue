param(
  [Parameter(Mandatory=$true)][string]$ArchivePath,
  [string]$Root = "C:\ELIMSERVER",
  [switch]$Apply
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $ArchivePath)) { throw "Backup archive not found: $ArchivePath" }
$hashPath = "$ArchivePath.sha256"
if (-not (Test-Path $hashPath)) { throw "Checksum file not found: $hashPath" }

$expected = ((Get-Content $hashPath -Raw).Trim() -split '\s+')[0].ToLowerInvariant()
$actual = (Get-FileHash -Path $ArchivePath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($expected -ne $actual) { throw "Checksum mismatch. expected=$expected actual=$actual" }

$stamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$temp = Join-Path $env:TEMP "elimserver-restore-$stamp"
New-Item -ItemType Directory -Force -Path $temp | Out-Null

try {
  Expand-Archive -Path $ArchivePath -DestinationPath $temp -Force
  $manifestPath = Join-Path $temp 'meta\manifest.json'
  if (-not (Test-Path $manifestPath)) { throw 'Manifest missing from backup archive.' }
  $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json

  Write-Host "Backup verified: $ArchivePath"
  Write-Host "Created: $($manifest.created_at)"
  Write-Host "Computer: $($manifest.computer)"
  Write-Host "Included: $($manifest.included -join ', ')"

  if (-not $Apply) {
    Write-Host 'VERIFY-ONLY: no files restored. Re-run with -Apply to restore payload data.'
    exit 0
  }

  $payload = Join-Path $temp 'payload'
  if (-not (Test-Path $payload)) { throw 'Payload directory missing from backup archive.' }

  foreach ($relative in @($manifest.included)) {
    $source = Join-Path $payload $relative
    if (-not (Test-Path $source)) { continue }
    $destination = Join-Path $Root $relative
    New-Item -ItemType Directory -Force -Path $destination | Out-Null
    Copy-Item -Path (Join-Path $source '*') -Destination $destination -Recurse -Force
    Write-Host "RESTORED $relative"
  }

  Write-Host 'Restore completed.'
  Write-Warning 'If this is replacement hardware, re-provision and validate CLIXML secrets before running HERMES because Windows DPAPI can be identity/profile-bound.'
} finally {
  Remove-Item $temp -Recurse -Force -ErrorAction SilentlyContinue
}
