<#
pg_dump de catalogo_elimfilters en los clusters indicados, huella del origen y prueba de restauración en el cluster de ensayo.
Uso: .\dump-and-verify.ps1 -Root C:\ELIMSERVER\backups\catalogo_elimfilters\<carpeta> [-Ports 5432,5441,5440]
Credenciales: 5432 -> elimos-ro.clixml (solo lectura); 5441 -> catalog_admin (trust local); 5440 -> catalog-local-pg.clixml.
Todas las lecturas de origen se fuerzan en solo lectura. La restauración se hace en 5450 como r<puerto> (se reemplaza si existe).
#>
param([Parameter(Mandatory)][string]$Root, [int[]]$Ports = @(5432, 5441, 5440))
$ErrorActionPreference = 'Continue'
function Plain($v) { $b = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($v); try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($b) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b) } }
$bin = 'C:\Program Files\PostgreSQL\18\bin'; $here = Split-Path $MyInvocation.MyCommand.Path; $fp = Join-Path $here 'fingerprint.sql'
$src = @{
  5432 = @{ user = 'elimos_ro'; secret = 'C:\ELIMSERVER\secrets\elimos-ro.clixml' }
  5441 = @{ user = 'catalog_admin'; secret = $null }
  5440 = @{ user = 'catalog_admin'; secret = 'C:\ELIMSERVER\secrets\catalog-local-pg.clixml' } }
$rhPw = Plain (Import-Clixml C:\ELIMSERVER\secrets\catalog-rehearsal.clixml).Password
$rh = @('-h', '127.0.0.1', '-p', '5450', '-U', 'rehearsal_admin', '-w')
$env:PGAPPNAME = 'elimos-dump-and-verify'
foreach ($port in $Ports) {
  $s = $src[$port]; $dir = Join-Path $Root $port; New-Item -ItemType Directory -Force $dir | Out-Null
  $env:PGPASSWORD = if ($s.secret) { Plain (Import-Clixml $s.secret).Password } else { $null }
  $env:PGOPTIONS = '-c default_transaction_read_only=on'
  $t0 = Get-Date
  & "$bin\pg_dump.exe" -h 127.0.0.1 -p $port -U $s.user -d catalogo_elimfilters -w -Fc -Z 6 --no-owner --no-privileges -f "$dir\catalogo_elimfilters.dump" 2> "$dir\pg_dump.stderr.txt"
  $rc = $LASTEXITCODE
  & "$bin\psql.exe" -h 127.0.0.1 -p $port -U $s.user -d catalogo_elimfilters -w -X -q -f $fp -o "$dir\source-fingerprint.txt" 2> "$dir\fingerprint.stderr.txt"
  $env:PGOPTIONS = $null
  $sha = (Get-FileHash "$dir\catalogo_elimfilters.dump" -Algorithm SHA256).Hash
  [pscustomobject]@{ port = $port; user = $s.user; dump_exit = $rc; dump_started = $t0.ToString('o'); sha256 = $sha; bytes = (Get-Item "$dir\catalogo_elimfilters.dump").Length } |
    ConvertTo-Json | Set-Content "$dir\manifest.json" -Encoding utf8

  $env:PGPASSWORD = $rhPw; $db = "r$port"
  & "$bin\dropdb.exe" @rh --if-exists $db 2>$null
  & "$bin\createdb.exe" @rh -T template0 -E UTF8 $db
  & "$bin\pg_restore.exe" @rh -d $db --no-owner --no-privileges --jobs=4 "$dir\catalogo_elimfilters.dump" 2> "$dir\restore-test.stderr.txt"; $rrc = $LASTEXITCODE
  & "$bin\psql.exe" @rh -d $db -X -q -f $fp -o "$dir\restored-fingerprint.txt"
  $a = @{}; Get-Content "$dir\source-fingerprint.txt" | Where-Object { $_ -match '\|' } | ForEach-Object { $f = $_.Split('|'); $a[$f[0]] = $f[1] }
  $b = @{}; Get-Content "$dir\restored-fingerprint.txt" | Where-Object { $_ -match '\|' } | ForEach-Object { $f = $_.Split('|'); $b[$f[0]] = $f[1] }
  $countDiff = @(($a.Keys + $b.Keys) | Sort-Object -Unique | Where-Object { $a[$_] -ne $b[$_] })
  "{0}: dump exit={1} restore exit={2} sha256={3} tables={4}/{5} row-count mismatches={6}" -f $port, $rc, $rrc, $sha.Substring(0, 16), $a.Count, $b.Count, $countDiff.Count
  $countDiff | ForEach-Object { "    COUNT DIFF $_ source=$($a[$_]) restored=$($b[$_])" }
}
$env:PGPASSWORD = $null; $rhPw = $null
# Nota: se comparan conteos. Los hashes de fila pueden diferir entre clusters con distinto locale (comillas en texto CJK)
# aunque los datos sean idénticos; para 5432 restaurar en una base con locale 'English_United States.1252'.
