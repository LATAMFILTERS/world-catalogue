param(
  [string]$UgreenRoot = "\\192.168.1.153\personal_folder\ELIMFILTERS\Repositories\Lenovo-Workspaces",
  [int]$RetentionDays = 14
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path '\\192.168.1.153\personal_folder')) { throw 'UGREEN network share is not available.' }
New-Item -ItemType Directory -Force -Path $UgreenRoot | Out-Null

$repos = @(
  @{ Name = 'world-catalogue-hd'; Path = 'C:\Work\world-catalogue-hd' },
  @{ Name = 'world-catalogue-server'; Path = 'C:\ELIMSERVER\repos\world-catalogue' },
  @{ Name = 'elimfilters-crm'; Path = 'C:\ELIMSERVER\repos\elimfilters-crm' },
  @{ Name = 'hermes-runtime'; Path = 'C:\ELIMSERVER\apps\hermes-runtime' }
)

$stamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$runRoot = Join-Path $UgreenRoot $stamp
New-Item -ItemType Directory -Force -Path $runRoot | Out-Null
$summary = New-Object System.Collections.Generic.List[object]
foreach ($repo in $repos) {
  if (-not (Test-Path (Join-Path $repo.Path '.git'))) { continue }
  Push-Location $repo.Path
  try {
    $head = (git rev-parse HEAD).Trim()
    $branch = (git branch --show-current).Trim()
    $tracked = @((git diff --name-only HEAD) | Where-Object { $_ })
    $untracked = @((git ls-files --others --exclude-standard) | Where-Object { $_ })
    $deleted = @((git ls-files --deleted) | Where-Object { $_ })
    $files = @($tracked + $untracked | Sort-Object -Unique)

    $repoRoot = Join-Path $runRoot $repo.Name
    $filesRoot = Join-Path $repoRoot 'files'
    New-Item -ItemType Directory -Force -Path $filesRoot | Out-Null

    $copied = 0
    foreach ($relative in $files) {
      $source = Join-Path $repo.Path $relative
      if (-not (Test-Path $source -PathType Leaf)) { continue }
      $destination = Join-Path $filesRoot $relative
      New-Item -ItemType Directory -Force -Path (Split-Path $destination -Parent) | Out-Null
      Copy-Item -LiteralPath $source -Destination $destination -Force
      $copied++
    }
    $statusText = git status --short --branch
    $statusText | Out-File -FilePath (Join-Path $repoRoot 'git-status.txt') -Encoding utf8
    git diff HEAD | Out-File -FilePath (Join-Path $repoRoot 'tracked-changes.patch') -Encoding utf8

    $manifest = [ordered]@{
      schema_version = '1.0.0'
      created_at = (Get-Date).ToString('o')
      name = $repo.Name
      source = $repo.Path
      branch = $branch
      head = $head
      copied_files = $copied
      tracked_changes = $tracked
      untracked_files = $untracked
      deleted_files = $deleted
    }
    $manifest | ConvertTo-Json -Depth 8 | Out-File -FilePath (Join-Path $repoRoot 'manifest.json') -Encoding utf8
    $summary.Add([pscustomobject]@{ name=$repo.Name; head=$head; branch=$branch; copied=$copied })
  }
  finally {
    Pop-Location
  }
}
$cutoff = (Get-Date).AddDays(-1 * [Math]::Abs($RetentionDays))
Get-ChildItem $UgreenRoot -Directory -ErrorAction SilentlyContinue |
  Where-Object { $_.LastWriteTime -lt $cutoff -and $_.Name -match '^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$' } |
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

$result = [ordered]@{
  outcome = 'OK'
  snapshot_root = $runRoot
  retention_days = $RetentionDays
  repositories = [object[]]$summary
}
$result | ConvertTo-Json -Depth 6
