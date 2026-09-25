<#
Carga en la base destino el esquema de solo consulta `unif_src_5441` con las tablas de 5441 que usan las migraciones 03-05.
No lee de 5441 en vivo: parte de su pg_dump. Se restaura en una base scratch del cluster de trabajo, se copian las tablas
con CREATE TABLE AS (sin defaults, FKs ni triggers) y se transfiere solo ese esquema.

Uso: .\stage-sources.ps1 -Dump <5441.dump> -ScratchPort 5450 -ScratchUser rehearsal_admin -ScratchSecret <clixml> `
                         -TargetPort 5450 -TargetUser rehearsal_admin -TargetSecret <clixml> -TargetDb rehearsal
Sin -TargetSecret pide la contraseña del destino de forma interactiva (p. ej. postgres en 5432 durante la ventana).
Reversa: DROP SCHEMA unif_src_5441 CASCADE en la base destino.
#>
param(
  [Parameter(Mandatory)][string]$Dump,
  [int]$ScratchPort = 5450, [string]$ScratchUser = 'rehearsal_admin', [string]$ScratchSecret = 'C:\ELIMSERVER\secrets\catalog-rehearsal.clixml',
  [Parameter(Mandatory)][int]$TargetPort, [Parameter(Mandatory)][string]$TargetUser, [string]$TargetSecret,
  [Parameter(Mandatory)][string]$TargetDb
)
$ErrorActionPreference = 'Stop'
$bin = 'C:\Program Files\PostgreSQL\18\bin'
function Plain($v) { $b = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($v); try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($b) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b) } }
function Check($what) { if ($LASTEXITCODE -ne 0) { throw "$what failed (exit $LASTEXITCODE)" } }

$tables = @(
  'elimfilters_catalog', 'hermes_catalogue_backlog', 'hermes_catalogue_readiness', 'hermes_catalogue_evidence', 'hermes_catalogue_dossier',
  'catalog_application_evidence', 'catalog_codigo_base_evidence', 'catalog_codigo_base_sanitation_queue', 'catalog_sku_certification',
  'exact_part_reference', 'kg_product_equipment', 'kg_product_systems', 'kg_product_technologies', 'kit_components',
  'mann_donaldson_matches', 'product_element', 'product_model', 'oem_codes_legacy', 'catalog_hydraulic_sku_remap_backup_20260917')
$scratch = 'unif_scratch_5441'
$sp = @('-h', '127.0.0.1', '-p', $ScratchPort, '-U', $ScratchUser, '-w')
$tp = @('-h', '127.0.0.1', '-p', $TargetPort, '-U', $TargetUser, '-w')
$targetPw = if (-not $TargetSecret) { Read-Host "Password for $TargetUser@$TargetPort" -AsSecureString }
$tmp = Join-Path $env:TEMP "unif_src_5441_$(Get-Date -Format yyyyMMddHHmmss).dump"
try {
  $env:PGPASSWORD = Plain (Import-Clixml $ScratchSecret).Password
  & "$bin\createdb.exe" @sp -T template0 -E UTF8 $scratch; Check 'createdb scratch'
  & "$bin\pg_restore.exe" @sp -d $scratch --no-owner --no-privileges --jobs=4 $Dump; Check 'restore 5441 dump'
  $ctas = "CREATE SCHEMA unif_src_5441;`n" + (($tables | ForEach-Object { "CREATE TABLE unif_src_5441.$_ AS TABLE public.$_;" }) -join "`n")
  $ctas | & "$bin\psql.exe" @sp -d $scratch -X -q -v ON_ERROR_STOP=1 -1; Check 'CTAS'
  & "$bin\pg_dump.exe" @sp -d $scratch -n unif_src_5441 -Fc --no-owner --no-privileges -f $tmp; Check 'dump staging schema'
  & "$bin\dropdb.exe" @sp $scratch; Check 'drop scratch'

  $env:PGPASSWORD = Plain $(if ($TargetSecret) { (Import-Clixml $TargetSecret).Password } else { $targetPw });
  & "$bin\pg_restore.exe" @tp -d $TargetDb --no-owner --no-privileges $tmp; Check 'restore staging schema'
  "SELECT 'staged', table_name, (xpath('/row/n/text()', query_to_xml(format('SELECT count(*) AS n FROM unif_src_5441.%I', table_name), false, true, '')))[1]::text FROM information_schema.tables WHERE table_schema = 'unif_src_5441' ORDER BY 2;" |
    & "$bin\psql.exe" @tp -d $TargetDb -X -A -t -F ' '
} finally {
  $env:PGPASSWORD = $null
  if (Test-Path $tmp) { [IO.File]::Delete($tmp) }
}
