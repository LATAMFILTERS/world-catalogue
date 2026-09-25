<#
Aplica (up) o revierte (down) las migraciones de unificación, cada una en una sola transacción y registrada en
public.catalog_migration_log. Uso:
  .\run.ps1 -Direction up   -Port 5450 -User rehearsal_admin -Secret <clixml> -Database rehearsal [-Only 03]
  .\run.ps1 -Direction down -Port 5450 -User rehearsal_admin -Secret <clixml> -Database rehearsal
Down recorre en orden inverso y solo revierte las migraciones aplicadas.
Sin -Secret pide la contraseña de forma interactiva (p. ej. postgres en 5432 durante la ventana).
#>
param(
  [Parameter(Mandatory)][ValidateSet('up', 'down')][string]$Direction,
  [Parameter(Mandatory)][int]$Port, [Parameter(Mandatory)][string]$User, [string]$Secret,
  [Parameter(Mandatory)][string]$Database, [string]$Only
)
$ErrorActionPreference = 'Stop'
$bin = 'C:\Program Files\PostgreSQL\18\bin'; $here = Split-Path $MyInvocation.MyCommand.Path
function Plain($v) { $b = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($v); try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($b) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b) } }
$pg = @('-h', '127.0.0.1', '-p', $Port, '-U', $User, '-w', '-d', $Database, '-X', '-q', '-v', 'ON_ERROR_STOP=1')
$env:PGPASSWORD = Plain $(if ($Secret) { (Import-Clixml $Secret).Password } else { Read-Host "Password for $User@$Port" -AsSecureString }); $env:PGAPPNAME = 'catalog-unification-migrations'
$env:PGOPTIONS = '-c client_min_messages=warning'
try {
  $files = Get-ChildItem $here -Filter "*.$Direction.sql" | Sort-Object Name
  if ($Direction -eq 'down') { [array]::Reverse($files) }
  if ($Only) { $files = @($files | Where-Object { $_.Name.StartsWith($Only) }) }
  foreach ($f in $files) {
    $id = $f.Name -replace "\.$Direction\.sql$", ''
    $hasLog = (& "$bin\psql.exe" @pg -A -t -c "SELECT to_regclass('public.catalog_migration_log') IS NOT NULL") | Select-Object -First 1
    $state = 'none'
    if ($hasLog -eq 't') { $state = (& "$bin\psql.exe" @pg -A -t -c "SELECT coalesce((SELECT CASE WHEN reverted_at IS NULL THEN 'applied' ELSE 'reverted' END FROM public.catalog_migration_log WHERE id = '$id'), 'none')") | Select-Object -First 1 }
    if ($Direction -eq 'up' -and $state -eq 'applied') { "skip $id (already applied)"; continue }
    if ($Direction -eq 'down' -and $state -ne 'applied') { "skip $id (not applied)"; continue }
    $sha = (Get-FileHash $f.FullName -Algorithm SHA256).Hash.ToLower()
    $t0 = Get-Date
    Push-Location $here
    try { & "$bin\psql.exe" @pg -1 -v "migration_id=$id" -v "migration_sha=$sha" -f $f.FullName; $rc = $LASTEXITCODE } finally { Pop-Location }
    if ($rc -ne 0) { throw "$($f.Name) failed (exit $rc); transaction rolled back" }
    "{0,-40} {1,-4} ok  {2,7:N1}s" -f $id, $Direction, ((Get-Date) - $t0).TotalSeconds
  }
} finally { $env:PGPASSWORD = $null; $env:PGOPTIONS = $null }
