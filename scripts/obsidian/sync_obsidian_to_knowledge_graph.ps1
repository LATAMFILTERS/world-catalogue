# sync_obsidian_to_knowledge_graph.ps1
# ELIMFILTERS Obsidian ? Knowledge Graph Sync Placeholder

Write-Host "ELIMFILTERS Obsidian Knowledge Sync"
Write-Host "Scanning Obsidian vault..."

$VaultPath = "obsidian"

$Folders = @(
    "Technologies",
    "Systems",
    "Industries",
    "Problems",
    "Assets",
    "Standards",
    "OEMs",
    "Equipment",
    "Products",
    "Intelligence",
    "DigitalTwins",
    "Predictions",
    "Governance"
)

foreach ($Folder in $Folders) {
    $Path = Join-Path $VaultPath $Folder

    if (Test-Path $Path) {
        $Files = Get-ChildItem $Path -Filter "*.md" -ErrorAction SilentlyContinue
        Write-Host "$Folder : $($Files.Count) notes"
    }
}

Write-Host "Sync scan completed."
