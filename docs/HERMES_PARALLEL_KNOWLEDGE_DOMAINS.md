# HERMES Parallel Knowledge Domains — HD / LD

## Purpose

ELIMFILTERS operates one governed knowledge system with two parallel application domains and one shared engineering layer:

```text
HEAVY_DUTY_KNOWLEDGE_DOMAIN     LIGHT_DUTY_KNOWLEDGE_DOMAIN
              \                     /
               \                   /
                SHARED_ENGINEERING_KNOWLEDGE
                           |
                         HERMES
                           |
                    NODAL CENTER / OBSIDIAN
                           |
                     KNOWLEDGE GRAPH
                           |
              Website / Search / AI Engine
```

This is not two independent platforms. The domains share contracts, engineering concepts, governance, source evidence and publication controls while retaining domain-specific industries, applications and components.

## Authority boundaries

The existing knowledge-governance rules remain unchanged:

- HERMES investigates and creates evidence/research candidates.
- Obsidian/Nodal Center is the reviewed technical knowledge authority.
- PostgreSQL is the only SKU authority.
- External sources never create cross references automatically.
- Groq may interpret and draft but cannot approve facts, applications, technologies or SKUs.
- The orchestrator remains the final enforcement boundary.

## Domains

### HEAVY_DUTY_KNOWLEDGE_DOMAIN

Industries:

- Agriculture
- Bus & Coach
- Construction
- Manufacturing
- Marine
- Mining
- Oil & Gas
- Power Generation
- Railway
- Truck Fleets
- Waste Municipal

Primary systems:

- Air Intake & Airflow Protection Systems
- Fuel Cleanliness Protection Systems
- Lube/Oil Protection Systems
- Hydraulic Systems Protection
- Compressed Air Systems

### LIGHT_DUTY_KNOWLEDGE_DOMAIN

Industry:

- Automotive

Primary systems:

- Lube/Oil Protection Systems
- Air Intake & Airflow Protection Systems
- Cabin Air / MICROKAPPA? (subdomain of Air Intake & Airflow Protection Systems)
- Fuel Cleanliness Protection Systems (expandable as validated knowledge is added)

Primary technologies:

- SYNTRAX™ — oil/lubrication context when technically confirmed
- MACROCORE™ — engine air intake context when technically confirmed
- MICROKAPPA™ — cabin air context when technically confirmed
- HYDROCORE™ — only when a validated Light Duty fuel/water application supports the relationship

## Shared engineering layer

The following concepts are defined once and contextualized by domain instead of duplicated:

- Filtration Efficiency
- Micron Rating
- Beta Ratio
- Dirt Holding Capacity
- Flow Rate
- Differential Pressure
- Restriction
- Bypass
- Contaminant Loading
- Media Saturation
- Sealing
- Service Life
- Installation
- Failure Analysis
- Standards

## Canonical knowledge object

`lib/knowledge-governance/knowledge-object-contract.js` is the common shape for both HD and LD knowledge.

A knowledge object can connect:

```text
domain
-> industry
-> system
-> technology
-> component
-> application
-> problem
-> failure_mode
-> symptom
-> root_cause
-> diagnostic_method
-> corrective_action
-> maintenance_procedure
-> technical_parameters
-> operating_conditions
-> standards
-> related_products
-> source_evidence
-> validation_sources
-> publication_status
```

Relationships are many-to-many. A shared engineering fact is stored once and may later be linked to more than one domain after validation.

## Relationship governance

Technology relationship:

```text
confirmed | probable | none
```

Only a technically confirmed relationship is eligible to become a public technology linkage. A probable relationship remains internal/reviewable.

Application relationship:

```text
verified | candidate | rejected
```

A vehicle, engine, model, year, OE number or part number found in external evidence begins as a candidate. It cannot become a product cross or application automatically.

## FRAM automotive technical corpus

The approved FRAM automotive corpus is registered in:

`lib/knowledge-governance/fram-automotive-source-corpus.js`

It contains 36 unique canonical URLs. Duplicate URL variants are removed before collection.

Governance metadata is fixed as:

```text
knowledge_domain = LIGHT_DUTY_KNOWLEDGE_DOMAIN
industry = Automotive
source_type = external_industry_evidence
public_brand_reference = false
catalog_auto_update = false
technology_relation default = probable
application_relation default = candidate
approval_required = true
```

FRAM is internal evidence provenance, not public ELIMFILTERS copy. Technical facts must be extracted, normalized, validated and rewritten into ELIMFILTERS-neutral engineering language before any reviewed public use.

## LD corpus classification

The corpus classifier routes source topics into:

```text
Oil/lubrication
-> Lube/Oil Protection Systems
-> SYNTRAX™ candidate relationship

Engine air filter
-> Air Intake & Airflow Protection Systems
-> MACROCORE™ candidate relationship

Cabin air filter
-> Air Intake & Airflow Protection Systems -> Cabin Air / MICROKAPPA?
-> MICROKAPPA™ candidate relationship

Cross-system/general maintenance material
-> shared engineering candidate
```

The technology relationship remains `probable` at ingestion. Classification is not approval.

For compatibility, HERMES keeps the existing `candidate_type` taxonomy. A second field, `knowledge_content_type`, supplies the technical document classification used by the Knowledge Center:

```text
Engineering Reference
Failure Analysis Guide
Installation Procedure
Application Note
Service Reference
```

This avoids changing historical HERMES workflow enums while allowing engineering-grade content organization.

## Operational collector

Project commands:

```powershell
npm run hermes:ld:baseline
npm run hermes:ld:collect
npm run test:hermes-knowledge-domains
```

The collector uses the existing HERMES collection engine and maintains dedicated LD automotive source state:

- `hermes/automotive-source-cache/`
- `hermes/baselines/fram-automotive-source-baseline.json`
- `hermes/baselines/fram-automotive-source-observations.json`
- review candidates continue through the governed HERMES candidate path
- audit output continues under `elimfilters-vault/94-sync-log/`

Default behavior follows the global HERMES dry-run rule. A dry run creates previews rather than approved knowledge.

`npm run hermes:ld:baseline` records/refreshes the dedicated corpus baseline and generates no intelligence candidate.

`npm run hermes:ld:collect` performs the governed comparison/first semantic harvest. Every generated candidate is enriched with its knowledge domain, Automotive industry, systems, technical content type, technology candidates and relationship states, then validated again using the central HERMES candidate validator.

No mode of this collector directly writes catalogue data, creates product crosses, writes pgvector data or authorizes publication.

## Source visibility governance

Source provenance must be retained internally. Public source exposure follows an explicit-deny-by-default policy.

`lib/knowledge-governance/obsidian-publication-contract.js` sets:

```text
public_source_policy = explicit_allow_only
```

Every approved source defaults to:

```text
public_reference_allowed = false
```

A public renderer may receive a publisher or source URL only when editorial review explicitly changes that source to `public_reference_allowed = true`.

For HERMES candidates, `scripts/hermes/publish-approved-candidate.mjs` records:

```text
public_source_visibility = internal_only
```

unless the candidate explicitly carries `source_governance.public_brand_reference = true`.

The canonical DRAFT note retains publisher, URL and source hash under `Internal evidence provenance` for auditability, but that section is marked not for public rendering when visibility is internal-only.

This preserves evidence provenance without exposing competitor/source branding in ELIMFILTERS-facing content.

## HERMES research contract

`lib/knowledge-governance/hermes-research-contract.js` carries optional governed context:

- `knowledge_domain`
- `industry`
- `system`
- `technology`
- `technology_relation`
- `component`
- `applications`
- `application_relation`

This allows a knowledge gap to enter HERMES already identified as HD, LD or Shared instead of assigning the domain after research.

Invalid mixed-domain requests are rejected, for example `LIGHT_DUTY + Mining`.

## Nodal Center target model

The knowledge-domain indexes are materialized under:

`elimfilters-vault/00-meta/knowledge-domains/`

They provide governed domain navigation without restructuring the established canonical folders.

The logical knowledge graph remains:

```text
Industry
<-> System
<-> Technology
<-> Component
<-> Problem
<-> Application
<-> Technical Knowledge
```

Knowledge-domain membership is contextual metadata, not a second copy of the same technical fact.

## Publication sequence

```text
SOURCE
-> DOCUMENT
-> DEDUPLICATION
-> EXTRACTION
-> TECHNICAL FACTS
-> DOMAIN CLASSIFICATION
-> INDUSTRY
-> SYSTEM
-> KNOWLEDGE CONTENT TYPE
-> TECHNOLOGY RELATION
-> COMPONENT
-> PROBLEM / FAILURE MODE
-> APPLICATION RELATION
-> VALIDATION
-> OBSIDIAN / NODAL CENTER REVIEW
-> PUBLICATION ELIGIBILITY
-> WEBSITE / TECHNOLOGY / INDUSTRY / KNOWLEDGE CENTER / SEARCH
```

Forbidden sequence:

```text
EXTERNAL ARTICLE -> COPY -> ELIMFILTERS PUBLIC WEBSITE
```

Forbidden catalogue sequence:

```text
EXTERNAL PART NUMBER -> AUTOMATIC CROSS
```

## Image requirements

The architecture and ingestion contracts do not require image assets.

When public technical documentation is produced, images may be requested for specific articles. Preferred original ELIMFILTERS assets include:

- oil-filter cutaway/anatomy
- spin-on oil flow and bypass-valve diagram
- cartridge filter anatomy
- engine air intake contamination/airflow diagram
- engine air-filter media cross-section
- cabin filter airflow-direction diagram
- activated-carbon cabin media cross-section
- contamination path diagrams

If an approved asset is not present in GitHub, its exact subject, orientation and intended article/section should be specified before generating or sourcing it.
