<#
Levanta un search-api local (puerto de prueba, sin .env de producción) contra una base de ensayo y comprueba casos.
Uso: .\search-smoke.ps1 -SearchDir <worktree del search> -Database smoke -Cases <cases.csv> [-Port 8831] [-FromTemplate rehearsal]
cases.csv: q,expect_source,expect_sku   (expect_sku vacío = no se comprueba)
Sale con código 1 si algún caso falla. Nunca apunta a 5432 ni al 8821.
#>
param(
  [Parameter(Mandatory)][string]$SearchDir, [Parameter(Mandatory)][string]$Database, [Parameter(Mandatory)][string]$Cases,
  [int]$Port = 8831, [string]$FromTemplate, [string]$Secret = 'C:\ELIMSERVER\secrets\catalog-rehearsal.clixml',
  [string]$NodeModules = 'C:\ELIMSERVER\worktrees\search-cutover\node_modules'
)
$ErrorActionPreference = 'Continue'
if ($Port -eq 8821) { throw 'port 8821 is production' }
function Plain($v) { $b = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($v); try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($b) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b) } }
$bin = 'C:\Program Files\PostgreSQL\18\bin'
$pw = Plain (Import-Clixml $Secret).Password
if ($FromTemplate) {
  $env:PGPASSWORD = $pw; $pg = @('-h', '127.0.0.1', '-p', '5450', '-U', 'rehearsal_admin', '-w')
  & "$bin\dropdb.exe" @pg --if-exists $Database 2>$null
  & "$bin\createdb.exe" @pg -T $FromTemplate $Database; if ($LASTEXITCODE) { throw "createdb $Database failed" }
  $env:PGPASSWORD = $null
}
$psi = New-Object Diagnostics.ProcessStartInfo 'C:\Program Files\nodejs\node.exe', 'server-protocol.js'
$psi.WorkingDirectory = $SearchDir; $psi.UseShellExecute = $false; $psi.RedirectStandardOutput = $true; $psi.RedirectStandardError = $true
$url = "postgresql://rehearsal_admin:$([Uri]::EscapeDataString($pw))@127.0.0.1:5450/$Database`?sslmode=disable"; $pw = $null
$vars = @{ DATABASE_URL = $url; CATALOG_DATABASE_URL = $url; PORT = "$Port"; NODE_ENV = 'production'; DB_SSL_VERIFY = 'false'; REDIS_URL = '';
  CATALOG_HISTORICAL_SANITATION_LIVE = 'false'; ELIM_HERMES_FAILOVER_ENABLED = 'false'; ELIM_STARTUP_MIGRATIONS_ASYNC = 'true';
  ADMIN_KEY = [guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N'); NODE_PATH = $NodeModules }
foreach ($k in $vars.Keys) { $psi.EnvironmentVariables[$k] = $vars[$k] }
$url = $null
$p = [Diagnostics.Process]::Start($psi); $o = $p.StandardOutput.ReadToEndAsync(); $e = $p.StandardError.ReadToEndAsync()
$fail = 0
try {
  $base = "http://127.0.0.1:$Port/api/search"; $h = 'X-Forwarded-Proto: https'
  for ($i = 0; $i -lt 90; $i++) { Start-Sleep 1; if ((& curl.exe -s -o NUL -w '%{http_code}' -m 5 -H $h "$base`?q=EL30158") -eq '200') { break }; if ($p.HasExited) { break } }
  foreach ($c in Import-Csv $Cases) {
    $r = ((& curl.exe -s -m 20 -H $h "$base`?q=$($c.q)") -join '') | ConvertFrom-Json
    $sku = @($r.results | ForEach-Object { if ($_.sku) { $_.sku } elseif ($_.elimfilters_sku) { $_.elimfilters_sku } elseif ($_.code) { $_.code } }) | Select-Object -First 1
    if ($r.alias) { $sku = $r.alias.resolved }
    $ok = ($r.source -eq $c.expect_source) -and (-not $c.expect_sku -or $sku -eq $c.expect_sku)
    if (-not $ok) { $fail++ }
    "{0}  {1,-10} source={2,-24} resolved={3,-9} (expected {4} {5})" -f ($(if ($ok) { 'PASS' } else { 'FAIL' })), $c.q, $r.source, $sku, $c.expect_source, $c.expect_sku
  }
} finally {
  if (-not $p.HasExited) { $p.Kill(); $p.WaitForExit(10000) | Out-Null }
  $errs = ($e.Result -split "`n") | Where-Object { $_ -match '(?i)error|exception' -and $_ -notmatch 'AZURE|outlook|Email delivery' }
  "server stderr errors: $(@($errs).Count)"; $errs | Select-Object -First 5 | ForEach-Object { "  $($_ -replace 'postgres(ql)?://[^@ ]+@', 'postgresql://***@')" }
}
"RESULT: $(if ($fail) { "$fail FAILED" } else { 'ALL PASS' })"
if ($fail) { exit 1 }
