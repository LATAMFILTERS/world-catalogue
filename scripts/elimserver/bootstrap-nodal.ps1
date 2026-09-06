[CmdletBinding()]
param([string]$Root='C:\ELIMSERVER\nodal-center')
$ErrorActionPreference='Stop'
$folders=@('01_PRODUCTS','02_SYSTEMS','03_INDUSTRIES','04_PROBLEMS','05_INTELLIGENCE','06_COMPONENTS','07_MARKETS','08_ACCOUNTS','09_OPERATIONS','10_DECISIONS','_INBOX','_ARCHIVE')
New-Item -ItemType Directory -Force $Root | Out-Null
foreach($f in $folders){New-Item -ItemType Directory -Force (Join-Path $Root $f)|Out-Null}
$readme=@'
# ELIMFILTERS Nodal Center

Governed local knowledge and relationship layer for ELIMFILTERS.

Rules:
- HERMES may create research/candidate material but may not auto-publish canonical truth.
- Commercial account state belongs to ELIMFILTERS CRM; this vault may hold governed summaries/links, not duplicate the CRM system of record.
- Product and technology canonical facts must trace to approved ELIMFILTERS sources.
- External competitor material remains evidence only and must never be represented as ELIMFILTERS technology.
- CEO approval is required for sensitive commercial or canonical publication decisions.

Folders:
01_PRODUCTS, 02_SYSTEMS, 03_INDUSTRIES, 04_PROBLEMS, 05_INTELLIGENCE, 06_COMPONENTS,
07_MARKETS, 08_ACCOUNTS, 09_OPERATIONS, 10_DECISIONS, _INBOX, _ARCHIVE.
'@
Set-Content (Join-Path $Root 'README.md') $readme -Encoding UTF8
@{schema_version='1.0.0';createdAt=(Get-Date).ToUniversalTime().ToString('o');folders=$folders;governance='CEO_APPROVAL_REQUIRED_FOR_CANONICAL_PUBLICATION'}|ConvertTo-Json -Depth 5|Set-Content (Join-Path $Root '.nodal-manifest.json') -Encoding UTF8
Write-Host "NODAL CENTER READY $Root"
