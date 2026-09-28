$ErrorActionPreference = 'Stop'
Set-Location 'C:\Users\ELIMSERVER\world-catalogue'

function Ensure-CatalogDbUrl {
    if ($env:CATALOG_DATABASE_URL) { return }
    function Plain($v) {
        if ($v -is [Security.SecureString]) {
            $p = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($v)
            try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($p) }
            finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($p) }
        }
        return [string]$v
    }
    $s = Import-Clixml 'C:\ELIMSERVER\secrets\catalog-local-pg.clixml'
    $pw = Plain $s.Password
    $enc = [uri]::EscapeDataString($pw)
    $env:CATALOG_DATABASE_URL = ('postgresql://{0}:{1}@127.0.0.1:{2}/{3}?sslmode=disable' -f $s.User,$enc,$s.Port,$s.Database)
}

Ensure-CatalogDbUrl

if (-not (Test-Path 'hermes\reports\isuzu-v160-decision-ledger.json')) {
    node scripts\hermes\build-isuzu-v160-decision-ledger.mjs
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

node scripts\hermes\hydrate-isuzu-v160-decision-ledger.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

node scripts\hermes\resolve-isuzu-v160-official-evidence.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

node scripts\hermes\compile-isuzu-v160-execution-plan.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$plan = Get-Content 'hermes\reports\isuzu-v160-execution-plan.json' -Raw | ConvertFrom-Json
$readyCount = [int]$plan.summary.ready + [int]$plan.summary.remap

Write-Host ("ISUZU v160: {0} direct/remap tuples ready; {1} already satisfied; {2} hold; {3} materialize; {4} retired" -f $readyCount,$plan.summary.satisfied,$plan.summary.hold,$plan.summary.materialize,$plan.summary.retired)

if ($plan.summary.materialize -gt 0) {
    throw 'READY_MATERIALIZE rows require the dedicated materialization lane before application release.'
}

if ($readyCount -eq 0) {
    Write-Host 'No verified tuples are READY_TO_IMPLEMENT. Database unchanged.'
    exit 0
}

node scripts\hermes\release-isuzu-v160-matrix.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

node scripts\hermes\release-isuzu-v160-matrix.mjs --apply
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

node scripts\hermes\audit-isuzu-v160-matrix.mjs
exit $LASTEXITCODE
