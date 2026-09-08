param(
  [string]$RepoPath = "C:\ELIMSERVER\repos\world-catalogue",
  [string]$LogDir = "C:\ELIMSERVER\logs\hermes",
  [string]$StateDir = "C:\ELIMSERVER\state\hermes"
)

$ErrorActionPreference = 'Stop'
$env:ELIM_RUNTIME_NODE = 'LENOVO'
$env:ELIM_RUNTIME_ROLE = 'PRIMARY'
$env:ELIM_DOMAIN = 'WORLD_CATALOGUE'
$env:ELIM_SCHEDULER_ENABLED = 'true'

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
New-Item -ItemType Directory -Force -Path $StateDir | Out-Null

$stamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$log = Join-Path $LogDir "hermes-weekly-$stamp.log"
$lock = Join-Path $StateDir 'weekly.lock'

if (Test-Path $lock) {
  $age = (Get-Date) - (Get-Item $lock).LastWriteTime
  if ($age.TotalHours -lt 6) {
    "[$(Get-Date -Format o)] Another HERMES weekly run appears active; exiting." | Tee-Object -FilePath $log
    exit 0
  }
  Remove-Item $lock -Force
}

New-Item -ItemType File -Force -Path $lock | Out-Null

try {
  Set-Location $RepoPath
  node scripts\validate-hybrid-runtime.js | Tee-Object -FilePath $log -Append

  git fetch origin main | Tee-Object -FilePath $log -Append
  git pull --ff-only origin main | Tee-Object -FilePath $log -Append

  npm ci | Tee-Object -FilePath $log -Append

  # Preserve the governed HERMES sequence used by the former GitHub Action.
  npm run hermes:baseline:restore | Tee-Object -FilePath $log -Append
  try { npm run hermes:harvest:restore | Tee-Object -FilePath $log -Append } catch { $_ | Out-String | Tee-Object -FilePath $log -Append }
  try { npm run hermes:collect | Tee-Object -FilePath $log -Append } catch { $_ | Out-String | Tee-Object -FilePath $log -Append }
  try { npm run hermes:harvest:persist | Tee-Object -FilePath $log -Append } catch { $_ | Out-String | Tee-Object -FilePath $log -Append }
  try { npm run hermes:sweep | Tee-Object -FilePath $log -Append } catch { $_ | Out-String | Tee-Object -FilePath $log -Append }
  try {
    python scripts\seo-geo-audit\audit.py --out-dir seo-geo-audit-out | Tee-Object -FilePath $log -Append
    python scripts\seo-geo-audit\triage_short_pages.py seo-geo-audit-out\seo-geo-audit.csv --threshold 250 --out-dir seo-geo-audit-out | Tee-Object -FilePath $log -Append
    python scripts\seo-geo-audit\build_hermes_knowledge_gaps.py seo-geo-audit-out\short-pages-triage.csv --out-dir seo-geo-audit-out | Tee-Object -FilePath $log -Append
    node scripts\hermes\import-seo-knowledge-gaps.mjs seo-geo-audit-out\hermes-knowledge-gaps.json | Tee-Object -FilePath $log -Append
  } catch { $_ | Out-String | Tee-Object -FilePath $log -Append }
  try { npm run hermes:research | Tee-Object -FilePath $log -Append } catch { $_ | Out-String | Tee-Object -FilePath $log -Append }
  try { npm run hermes:validate:real | Tee-Object -FilePath $log -Append } catch { $_ | Out-String | Tee-Object -FilePath $log -Append }
  try { npm run hermes:report:real | Tee-Object -FilePath $log -Append } catch { $_ | Out-String | Tee-Object -FilePath $log -Append }

  # Email delivery must still be attempted even when an upstream stage degraded.
  npm run hermes:email:real | Tee-Object -FilePath $log -Append
  node scripts\hermes\weekly-send-guard.mjs mark | Tee-Object -FilePath $log -Append

  "[$(Get-Date -Format o)] HERMES weekly run completed." | Tee-Object -FilePath $log -Append
}
catch {
  $_ | Out-String | Tee-Object -FilePath $log -Append
  exit 1
}
finally {
  Remove-Item $lock -Force -ErrorAction SilentlyContinue
}
