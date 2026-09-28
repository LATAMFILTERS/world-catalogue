$ErrorActionPreference='Stop'
Set-Location 'C:\Users\ELIMSERVER\world-catalogue'
function Plain($v){if($v -is [Security.SecureString]){$p=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($v);try{return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($p)}finally{[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($p)}}return [string]$v}
$s=Import-Clixml 'C:\ELIMSERVER\secrets\catalog-local-pg.clixml'
$pw=Plain $s.Password
$enc=[uri]::EscapeDataString($pw)
$env:CATALOG_DATABASE_URL=('postgresql://{0}:{1}@127.0.0.1:{2}/{3}?sslmode=disable' -f $s.User,$enc,$s.Port,$s.Database)
node scripts\hermes\materialize-isuzu-v151-products.mjs
if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}
