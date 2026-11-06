# Free, autonomous Lenovo deploy watcher for world-catalogue.
# Reuses the established ELIMSERVER pull/test/health/rollback pattern used by elimfilters-crm.
Set-Location "C:\ELIMSERVER\repos\world-catalogue"

$logDir = "C:\ELIMSERVER\logs\world-catalogue"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
$log = Join-Path $logDir "ci-watch.log"
$healthUrl = "http://127.0.0.1:3100"
$notificationUrl = "http://127.0.0.1:8791/api/notifications"

function Send-NativeAlert {
  param([string]$Title, [string]$Message, [string]$Priority = "INFO")
  try {
    $body = @{
      notificationType = "SYSTEM_HEALTH"
      priority = $Priority
      module = "WORLD_CATALOGUE"
      title = $Title
      message = $Message
      recipientKey = "CEO"
      metadata = @{ source = "watch-world-updates.ps1" }
    } | ConvertTo-Json -Depth 5
    Invoke-RestMethod -Uri $notificationUrl -Method Post -Body $body -ContentType "application/json" -TimeoutSec 5 | Out-Null
  } catch {
    Add-Content $log "[$(Get-Date -Format o)] WARNING - native notification unavailable: $Title"
  }
}

# The public Cloudflare tunnel currently points to localhost:8821, not the
# compose port 3100. Both must report the *same expected commit* before PASS.
$publicOriginUrl = "http://127.0.0.1:8821/__runtime-revision"
$containerRevisionUrl = "http://127.0.0.1:3100/__runtime-revision"

function Test-WorldHealth {
  param([string]$ExpectedSha)
  try {
    $headers = @{ Host = "part-search.elimfilters.com"; "X-Forwarded-Proto" = "https" }
    $container = Invoke-RestMethod -Uri $containerRevisionUrl -TimeoutSec 15
    $published = Invoke-RestMethod -Uri $publicOriginUrl -Headers $headers -TimeoutSec 15
    $valid = ($container.commit -ceq $ExpectedSha -and $published.commit -ceq $ExpectedSha)
    if (-not $valid) {
      Add-Content $log "[$(Get-Date -Format o)] RELEASE MISMATCH expected=$ExpectedSha container=$($container.commit) public_origin=$($published.commit)"
    }
    return $valid
  } catch {
    Add-Content $log "[$(Get-Date -Format o)] RELEASE UNVERIFIED expected=$ExpectedSha: $($_.Exception.Message)"
    return $false
  }
}

function Deploy-World {
  param([string]$ReleaseSha)
  $env:ELIM_RELEASE_SHA = $ReleaseSha
  Push-Location "deploy\lenovo"
  try {
    docker compose up -d --build 2>&1 | Add-Content $log
    if ($LASTEXITCODE -ne 0) { throw "docker compose failed: exit=$LASTEXITCODE" }
  } finally { Pop-Location }
}

while ($true) {
  try {
    $before = git rev-parse HEAD
    git fetch origin main --quiet 2>&1 | Out-Null
    $remote = git rev-parse origin/main

    if ($before -ne $remote) {
      Add-Content $log "[$(Get-Date -Format o)] new commits detected ($before -> $remote), pulling and validating"
      git merge origin/main --ff-only 2>&1 | Add-Content $log

      $testOutput = npm run test:hermes-phase5 2>&1 | Out-String
      $testOk = $LASTEXITCODE -eq 0
      if (-not $testOk) {
        Add-Content $log "[$(Get-Date -Format o)] HERMES TEST GATE FAILED at $remote; reverting to $before"
        Add-Content $log ($testOutput -split "`n" | Select-Object -Last 80 | Out-String)
        git reset --hard $before 2>&1 | Out-Null
        Send-NativeAlert -Title "World Catalogue: push rejected" -Priority "HIGH" -Message "Commit $remote failed HERMES validation. Live runtime remains on $before."
      } else {
        Deploy-World -ReleaseSha $remote
        Start-Sleep -Seconds 12
        if (Test-WorldHealth -ExpectedSha $remote) {
          Add-Content $log "[$(Get-Date -Format o)] HEALTH PASSED - DEPLOYED $remote"
          Send-NativeAlert -Title "World Catalogue: deployed" -Message "Commit $remote passed HERMES tests and is live on Lenovo."
        } else {
          Add-Content $log "[$(Get-Date -Format o)] RELEASE NOT VERIFIED ON PUBLIC ORIGIN - rolling back to $before"
          git reset --hard $before 2>&1 | Out-Null
          Deploy-World -ReleaseSha $before
          Start-Sleep -Seconds 12
          if (Test-WorldHealth -ExpectedSha $before) {
            Add-Content $log "[$(Get-Date -Format o)] ROLLBACK OK - healthy on $before"
            Send-NativeAlert -Title "World Catalogue: auto rollback" -Priority "HIGH" -Message "Commit $remote failed live health and was rolled back to $before."
          } else {
            Add-Content $log "[$(Get-Date -Format o)] ROLLBACK REVISION UNVERIFIED - manual verification needed"
            Send-NativeAlert -Title "World Catalogue: runtime revision unverified" -Priority "CRITICAL" -Message "Runtime revision could not be proven after deploy and rollback."
          }
        }
      }
    }
  } catch {
    Add-Content $log "[$(Get-Date -Format o)] watcher error: $($_.Exception.Message)"
  }

  Start-Sleep -Seconds 900
}
