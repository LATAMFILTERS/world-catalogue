$ErrorActionPreference = 'Stop'
Set-Location 'C:\Work\world-catalogue-hd'
$script = 'C:\Work\world-catalogue-hd\scripts\scrape_donaldson_engine_industrial_air.js'
& node $script --category engine-industrial-air --headed
exit $LASTEXITCODE
