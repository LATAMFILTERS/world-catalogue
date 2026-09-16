$root = 'C:\Work\world-catalogue-hd\scripts'
$marker = Join-Path $root 'donaldson_hd_air_1608_complete.marker'
$lock = Join-Path $root 'donaldson_hd_air_resilient_supervisor.lock'
$out = Join-Path $root 'donaldson_hd_air_supervisor.out.log'
$err = Join-Path $root 'donaldson_hd_air_supervisor.err.log'
if (Test-Path $marker) { exit 0 }
$alive = $false
if (Test-Path $lock) {
  try { $state = Get-Content $lock -Raw | ConvertFrom-Json; if ($state.pid) { $alive = [bool](Get-Process -Id $state.pid -ErrorAction SilentlyContinue) } } catch {}
}
if (-not $alive) {
  Start-Process node -ArgumentList @('scripts\donaldson_hd_air_resilient_supervisor.js') -WorkingDirectory 'C:\Work\world-catalogue-hd' -RedirectStandardOutput $out -RedirectStandardError $err -WindowStyle Hidden
}
