param(
    [string]$VaultPath = "obsidian",
    [string]$OutputFile = "exports\knowledge_graph.json"
)

New-Item -ItemType Directory -Force -Path "exports" | Out-Null

$nodes = @()

Get-ChildItem $VaultPath -Recurse -Filter *.md | ForEach-Object {

    $content = Get-Content $_.FullName -Raw

    $entityType = ""
    $entityCode = ""

    if ($content -match "entity_type:\s*(.+)") {
        $entityType = $Matches[1].Trim()
    }

    if ($content -match "entity_code:\s*(.+)") {
        $entityCode = $Matches[1].Trim()
    }

    $nodes += @{
        file = $_.Name
        path = $_.FullName
        entity_type = $entityType
        entity_code = $entityCode
    }
}

$json = $nodes | ConvertTo-Json -Depth 10

Set-Content $OutputFile $json

Write-Host ""
Write-Host "Nodes exported:" $nodes.Count
Write-Host "Output:" $OutputFile
Write-Host ""
