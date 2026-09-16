$wd='C:\Work\world-catalogue-hd'
$out='C:\Work\world-catalogue-hd\scripts\donaldson_hd_air_deep_20260911_run.out.log'
$err='C:\Work\world-catalogue-hd\scripts\donaldson_hd_air_deep_20260911_run.err.log'
$p=Start-Process node -ArgumentList @('scripts\scrape_donaldson_hd_air_deep_20260911.js','--input','scripts\donaldson_hd_air_active_codes.json','--headed') -WorkingDirectory $wd -RedirectStandardOutput $out -RedirectStandardError $err -PassThru
Write-Host ('PID='+$p.Id)
Start-Sleep -Seconds 6
if(Get-Process -Id $p.Id -ErrorAction SilentlyContinue){Write-Host 'STATUS=RUNNING'}else{Write-Host 'STATUS=STOPPED'}
Get-Content $out -Tail 8 -ErrorAction SilentlyContinue
Get-Content $err -Tail 8 -ErrorAction SilentlyContinue