param(
  [string]$RepoPath = "C:\ELIMSERVER\repos\world-catalogue",
  [string]$RemoteName = "elim-r2",
  [string]$Bucket = "elimfilters-lenovo-backups",
  [string]$Endpoint = "https://6b5071d61650157117074aefcbb8bf5b.r2.cloudflarestorage.com",
  [string]$TaskName = "ELIMFILTERS-Lenovo-Backup"
)

$ErrorActionPreference = 'Stop'

function Convert-SecureStringToPlainText([Security.SecureString]$Value) {
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
  try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

$rcloneCommand = Get-Command rclone -ErrorAction SilentlyContinue
if ($null -eq $rcloneCommand) {
  $candidate = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter rclone.exe -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if ($null -eq $candidate) {
    throw 'rclone.exe not found. Install Rclone.Rclone with winget first.'
  }
  $rcloneExe = $candidate.FullName
  $rcloneDir = Split-Path $rcloneExe -Parent
  $env:Path = "$rcloneDir;$env:Path"
} else {
  $rcloneExe = $rcloneCommand.Source
  $rcloneDir = Split-Path $rcloneExe -Parent
}

Write-Host ''
Write-Host 'Enter the NEW Cloudflare R2 S3 credentials locally. They are not uploaded to GitHub.'
$accessKey = Read-Host 'R2 Access Key ID'
$secretSecure = Read-Host 'R2 Secret Access Key' -AsSecureString
$secretKey = Convert-SecureStringToPlainText $secretSecure

if ([string]::IsNullOrWhiteSpace($accessKey)) { throw 'Access Key ID cannot be empty.' }
if ([string]::IsNullOrWhiteSpace($secretKey)) { throw 'Secret Access Key cannot be empty.' }
if ($accessKey.StartsWith('cfat_', [System.StringComparison]::OrdinalIgnoreCase)) {
  throw 'The Access Key ID is invalid: do not use the Cloudflare API token beginning with cfat_.'
}

try {
  $existing = @(& $rcloneExe listremotes 2>$null)
  if ($existing -contains "$RemoteName`:") {
    & $rcloneExe config delete $RemoteName
    if ($LASTEXITCODE -ne 0) { throw "Could not delete existing remote $RemoteName" }
  }

  & $rcloneExe config create $RemoteName s3 `
    provider Cloudflare `
    env_auth false `
    access_key_id $accessKey `
    secret_access_key $secretKey `
    region auto `
    endpoint $Endpoint `
    bucket_object_lock_enabled false `
    --non-interactive
  if ($LASTEXITCODE -ne 0) { throw 'rclone remote creation failed.' }

  # The token is intentionally scoped to one bucket. Do not call `lsd remote:`
  # because that invokes S3 ListBuckets, which correctly returns 403 for a
  # bucket-scoped Cloudflare R2 token.
  $remotePath = "$RemoteName`:$Bucket"
  Write-Host "Testing scoped R2 bucket access: $remotePath"
  $bucketListing = @(& $rcloneExe lsf $remotePath --max-depth 1 2>&1)
  if ($LASTEXITCODE -ne 0) {
    $bucketListing | Out-Host
    throw "Cannot access scoped bucket $Bucket. Verify the S3 Access Key ID, Secret Access Key, and token bucket scope."
  }
  $bucketListing | Out-Host
  Write-Host 'Scoped R2 bucket access: OK'

  [Environment]::SetEnvironmentVariable('ELIM_R2_REMOTE', $remotePath, 'User')
  $env:ELIM_R2_REMOTE = $remotePath

  $wrapper = Join-Path $RepoPath 'automation\windows\run-lenovo-backup-r2.ps1'
  if (-not (Test-Path $wrapper)) { throw "R2 backup wrapper not found: $wrapper" }

  $action = New-ScheduledTaskAction `
    -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$wrapper`" -RepoPath `"$RepoPath`" -R2Remote `"$remotePath`""
  Set-ScheduledTask -TaskName $TaskName -Action $action | Out-Null

  Write-Host 'Running one live backup to R2...'
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $wrapper -RepoPath $RepoPath -R2Remote $remotePath
  if ($LASTEXITCODE -ne 0) { throw 'Live backup to R2 failed.' }

  Write-Host 'Verifying uploaded Lenovo backup objects...'
  $remoteFiles = @(& $rcloneExe lsf "$remotePath/lenovo" --files-only 2>&1)
  if ($LASTEXITCODE -ne 0) {
    $remoteFiles | Out-Host
    throw 'R2 upload verification failed.'
  }
  $remoteFiles | Select-Object -Last 9 | Out-Host

  Write-Host ''
  Write-Host 'R2 CONFIGURATION COMPLETE'
  Write-Host "Remote: $remotePath"
  Write-Host "Task: $TaskName"
  Write-Host 'Daily Lenovo backup now uploads local ZIP + SHA256 + manifest to Cloudflare R2.'
}
finally {
  $secretKey = $null
  $secretSecure = $null
}
