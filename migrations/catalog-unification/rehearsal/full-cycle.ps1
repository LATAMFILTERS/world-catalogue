<#
Ensayo completo en el cluster 5450: base nueva con el locale de 5432 desde el dump de 5432, staging desde el dump de 5441,
huella base, UP con sonda de lecturas en paralelo, DOWN y comparación con la huella base, y UP final (queda migrada).
Uso: .\full-cycle.ps1 -DumpRoot C:\ELIMSERVER\backups\catalogo_elimfilters\<carpeta con 5432\ y 5441\>
Criterio de éxito: todas las migraciones ok, DOWN con 0 tablas distintas, sonda sin errores y sin lecturas > 5 s.
#>
param([Parameter(Mandatory)][string]$DumpRoot, [string]$OutDir = "C:\ELIMSERVER\state\catalog-rehearsal\cycle-$(Get-Date -Format yyyyMMdd-HHmmss)")
$ErrorActionPreference = 'Continue'
function Plain($v) { $b = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($v); try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($b) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b) } }
$bin = 'C:\Program Files\PostgreSQL\18\bin'; $here = Split-Path $MyInvocation.MyCommand.Path; $mig = Split-Path $here
$secret = 'C:\ELIMSERVER\secrets\catalog-rehearsal.clixml'
New-Item -ItemType Directory -Force $OutDir | Out-Null
$pw = Plain (Import-Clixml $secret).Password
$pg = @('-h', '127.0.0.1', '-p', '5450', '-U', 'rehearsal_admin', '-w')
function Fingerprint($file) { $env:PGPASSWORD = $pw; & "$bin\psql.exe" @pg -d rehearsal -X -q -f "$here\fingerprint.sql" -o $file; $env:PGPASSWORD = $null }
function Compare-Fp($x, $y) {
  $a = @{}; Get-Content $x | Where-Object { $_ -match '\|' } | ForEach-Object { $f = $_.Split('|'); $a[$f[0]] = "$($f[1])|$($f[2])" }
  $b = @{}; Get-Content $y | Where-Object { $_ -match '\|' } | ForEach-Object { $f = $_.Split('|'); $b[$f[0]] = "$($f[1])|$($f[2])" }
  $d = @(($a.Keys + $b.Keys) | Sort-Object -Unique | Where-Object { $a[$_] -ne $b[$_] })
  "  fingerprint: tables $($a.Count) vs $($b.Count), mismatched $($d.Count)"; $d | ForEach-Object { "    DIFF $_ $($a[$_]) -> $($b[$_])" }
}
function Run($dir) { & powershell -NoProfile -ExecutionPolicy Bypass -File "$mig\run.ps1" -Direction $dir -Port 5450 -User rehearsal_admin -Secret $secret -Database rehearsal 2>&1 | ForEach-Object { "  $_" } }

"== 1. fresh rehearsal DB (5432 locale) from $DumpRoot\5432"
$env:PGPASSWORD = $pw
& "$bin\dropdb.exe" @pg --if-exists smoke 2>$null; & "$bin\dropdb.exe" @pg --if-exists rehearsal 2>$null
& "$bin\createdb.exe" @pg -T template0 -E UTF8 --locale='English_United States.1252' rehearsal
& "$bin\pg_restore.exe" @pg -d rehearsal --no-owner --no-privileges --jobs=4 "$DumpRoot\5432\catalogo_elimfilters.dump"; "  restore exit=$LASTEXITCODE"
$env:PGPASSWORD = $null
"== 2. staging from $DumpRoot\5441"
& powershell -NoProfile -ExecutionPolicy Bypass -File "$mig\stage-sources.ps1" -Dump "$DumpRoot\5441\catalogo_elimfilters.dump" -ScratchSecret $secret -TargetPort 5450 -TargetUser rehearsal_admin -TargetSecret $secret -TargetDb rehearsal | Measure-Object | ForEach-Object { "  staged tables: $($_.Count)" }
"== 3. baseline fingerprint"; Fingerprint "$OutDir\fp-base.txt"

"== 4. UP with concurrent read probe"
$psi = New-Object Diagnostics.ProcessStartInfo 'C:\Program Files\nodejs\node.exe', "`"$here\read-probe.cjs`" 150 `"$OutDir\probe-up.json`""
$psi.UseShellExecute = $false; $psi.EnvironmentVariables['DATABASE_URL'] = "postgresql://rehearsal_admin:$([Uri]::EscapeDataString($pw))@127.0.0.1:5450/rehearsal"
$probe = [Diagnostics.Process]::Start($psi); Start-Sleep 3
$t0 = Get-Date; Run 'up'; "  total up: $([int]((Get-Date) - $t0).TotalSeconds)s"
$probe.WaitForExit(200000) | Out-Null
$p = Get-Content "$OutDir\probe-up.json" -Raw | ConvertFrom-Json
foreach ($k in $p.stats.PSObject.Properties) { "  probe {0,-15} n={1,5} avg={2,7}ms max={3,8}ms errors={4}" -f $k.Name, $k.Value.n, $k.Value.avg, $k.Value.max, $k.Value.errors }
"  probe queries over 250ms: $(@($p.slow_over_250ms).Count)"; @($p.slow_over_250ms) | Sort-Object ms -Descending | Select-Object -First 5 | ForEach-Object { "    $($_.at) $($_.name) $($_.ms)ms $($_.err)" }
Fingerprint "$OutDir\fp-up.txt"

"== 5. DOWN"; $t0 = Get-Date; Run 'down'; "  total down: $([int]((Get-Date) - $t0).TotalSeconds)s"
Fingerprint "$OutDir\fp-down.txt"; Compare-Fp "$OutDir\fp-base.txt" "$OutDir\fp-down.txt"

"== 6. UP again (final migrated state for review)"; Run 'up'
$env:PGPASSWORD = $pw; & "$bin\psql.exe" @pg -d rehearsal -X -q -f "$here\validate.sql" -o "$OutDir\validate.txt"; $env:PGPASSWORD = $null
"  validation written to $OutDir\validate.txt"
$pw = $null
