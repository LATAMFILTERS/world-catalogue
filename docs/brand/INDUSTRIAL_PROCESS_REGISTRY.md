# INDUSTRIAL_PROCESS_REGISTRY

Status: Active
Scope: ELIMFILTERS Industrial & Process
Governance state: Natural Gas Filtration v1 CLOSED; remaining Industrial & Process families pending source extraction and validation.

## 1. Purpose

This registry defines the canonical ELIMFILTERS architecture for the Industrial & Process segment.

Industrial & Process is not a replacement for the existing Industries, Systems, or Technologies registries. It is a specialized product-and-application domain that reuses the existing ELIMFILTERS knowledge architecture while adding process-specific filtration functions, operating conditions, and validation requirements.

Rule:
- Discover from real manufacturer/source evidence first.
- Normalize source terminology into ELIMFILTERS canonical dimensions second.
- Create or extend ELIMFILTERS technologies only after a distinct physical mechanism, measurable performance, and repeatable cross-application use are demonstrated.
- Never convert a supplier claim directly into an ELIMFILTERS claim.
- Do not create parallel taxonomies, duplicate product families, duplicate systems, or duplicate technology names.

## 2. Protected Existing Technology Scope

The following existing technologies keep their current governed scope and MUST NOT be repurposed as generic Industrial & Process technologies:

- DURATECH™ — Integrated Maintenance and Asset Protection Kits.
- MARINECLEAN™ — Marine filtration systems / filters for marine vessel applications.

Other existing ELIMFILTERS technologies may only be reused in Industrial & Process when their current technical definition actually matches the industrial product being normalized.

## 3. Primary Discovery Source

Initial source manufacturer:
- Xinxiang Filter Co., Ltd.
- Brand/source reference: REIKE
- Source site: http://xxslqq.xx207.cxjs.net.cn/
- Corporate product families observed:
  - Air filtration
  - 3D printing dust and smoke filtering
  - Natural gas filtration
  - Hydraulic filtration
  - Water filtration
  - Filtration equipment and systems

Source-handling rule:
- Supplier data enters as manufacturer-declared evidence.
- Each technical claim must preserve its provenance.
- Canonical ELIMFILTERS values require validation before public technical use.

## 4. Canonical Industrial & Process Data Model

Industrial & Process must keep these dimensions separate:

1. Industry
2. Application
3. System
4. Filtration Function
5. Product Family / Product Configuration
6. Technology Core
7. ELIMFILTERS Technology
8. Technical Performance
9. Source Evidence
10. Validation Status

Canonical path:

Industry
→ Application
→ System
→ Filtration Function
→ Product Family
→ Technology
→ Performance

Applications and physical filtration mechanisms MUST NOT be stored as the same taxonomy layer.

## 5. Natural Gas Filtration — v1 CLOSED

Canonical domain:

Industrial & Process
→ Natural Gas Filtration

### 5.1 Industries / operating contexts

Observed operating contexts include:
- Oil & Gas
- Gas Distribution
- Power Generation
- LNG
- Petrochemical
- Industrial Gas
- Marine gas-turbine fuel applications

These are contexts/applications, not technology names.

### 5.2 Applications

Canonical application set v1:
- Long-Distance Pipeline
- City Gate Station
- Compressor Inlet
- Compressor Outlet
- Gas Processing
- Post-Desulfurization / Dehydration
- Metering Station
- Gas Turbine Fuel Gas
- Industrial Pressure-Regulating Station
- Gas Storage Injection / Withdrawal

### 5.3 Filtration functions

Canonical function set v1:
- Gas Particulate Filtration
- Gas-Liquid Coalescence
- Gas-Liquid Separation
- Cyclonic Pre-Separation
- Integrated Gas Conditioning

### 5.4 Product configurations

Canonical product/configuration set v1:
- Particulate Element
- Coalescing Element
- Separation Element
- Integrated Coalescing-Separation Element
- Filter-Separator System
- Cyclone + Filter System

## 6. Technology Core Registry — Natural Gas

These are INTERNAL technical cores only. They are NOT commercial technology names.

### TC-NG-01 — Gas-Liquid Coalescence

Status: TECHNOLOGY CANDIDATE

Physical mechanism:
- Capture of fine liquid aerosols
- Droplet collision
- Agglomeration / coalescence
- Growth into larger droplets
- Drainage / downstream separation

Manufacturer-declared REIKE characteristics observed:
- Multilayer borosilicate glass-fiber media
- Inside-to-outside flow
- Pleated high-area construction
- Fine aerosol removal
- Chemical compatibility claims for natural-gas condensate, lubricants, amine solutions, and dehydration solvents
- Declared 99.97% removal for droplets ≥0.3 μm
- Declared outlet liquid content <0.1 ppm by weight
- Declared initial differential pressure about 3–8 psi
- Declared change-out differential pressure about 15–25 psi
- Declared typical service life 6–18 months

Governance:
All numerical performance values above remain MANUFACTURER-DECLARED until independently validated.

### TC-NG-02 — Gas-Liquid Separation

Status: TECHNOLOGY CANDIDATE

Physical mechanism:
- Downstream separation after coalescence
- Hydrophobic / oleophobic surface behavior
- Rejection and removal of large coalesced droplets
- Low-resistance separation stage

Manufacturer-declared REIKE characteristics observed:
- Downstream of coalescing element
- Separation of already-coalesced large droplets
- Very low pressure drop, stated as typically <0.2 psi
- All-metal or metal-reinforced construction
- 316L stainless-steel frame
- Teflon-coated surface
- H2S / CO2 corrosion-resistance claims
- High-pressure service claims
- Separation-element life stated as 2–4 times coalescer life
- Separation target described as large droplets, including ≥50 μm in supplier FAQ

Governance:
Supplier pressure, efficiency, corrosion-resistance, and service-life claims remain unvalidated manufacturer claims.

### TC-NG-03 — High-Pressure Gas Particulate Filtration

Status: CAPABILITY CORE / NOT YET BRAND TECHNOLOGY

Observed engineering requirements:
- High-pressure resistance
- High rigidity
- Pulsation resistance
- High dirt-holding capacity
- Solid-particle removal
- Liquid contamination handling when integrated with coalescence
- Pipe-cleaning / pigging contamination tolerance
- Optional antistatic design depending on application

This core is currently an engineering capability set, not a standalone ELIMFILTERS technology.

### TC-NG-04 — Integrated Gas Conditioning

Status: SYSTEM ARCHITECTURE / NOT YET BRAND TECHNOLOGY

System concept:
- Particulate removal
- Fine aerosol coalescence
- Large-droplet separation
- Optional cyclonic pre-separation
- Final gas conditioning before protected downstream equipment

This is a system architecture, not a media technology.

## 7. Source Product Families — Natural Gas

REIKE source family mapping:

### Coalescing Element

Canonical function:
- Gas-Liquid Coalescence

Observed supplier claims:
- Multilayer borosilicate glass-fiber media
- Fine liquid aerosol removal
- Inside-to-outside flow
- Pleated construction
- 99.97% at ≥0.3 μm
- Outlet liquid <0.1 ppm wt

ELIMFILTERS handling:
- Store claims with source provenance.
- Do not publish as ELIMFILTERS performance until validated.

### Separation Element

Canonical function:
- Gas-Liquid Separation

Observed supplier claims:
- Installed downstream of coalescer
- Hydrophobic / oleophobic surface
- Low differential pressure
- Metal / reinforced construction
- 316L stainless-steel frame
- Teflon coating
- Long service life compared with coalescer

### City Gate Station Filter Element

Canonical application:
- City Gate Station / terminal gas purification

Canonical functions:
- Gas Particulate Filtration
- Gas-Liquid Coalescence
- Gas-Liquid Separation when integrated

Observed supplier claims:
- Solid removal: 1–5 μm
- Liquid removal target: 0.3 μm
- Fiberglass media
- Pleated large-area construction
- Initial ΔP ≤5 kPa at rated flow
- Integrated end-cap sealing / bypass-control claim
- Can be single-stage coalescing or integrated coalescing + separation

Important taxonomy rule:
City Gate is an APPLICATION, not a technology.

### Natural Gas Pipeline Filter Element

Canonical application:
- Long-distance natural gas pipeline

Canonical functions:
- Gas Particulate Filtration
- Liquid removal / coalescence
- Cyclonic pre-separation where contamination load requires it

Observed contaminants:
- Pipeline rust / Fe2O3
- Dust
- Water
- Compressor lubricating oil
- Heavy hydrocarbons
- Pipe-cleaning contamination peaks

Observed supplier claims:
- Stainless-steel frame + fiberglass media
- High-pressure and pulsation resistance
- Multi-stage composite construction
- Main-line selection example: 10 μm solid + 0.3 μm liquid
- Side-line selection example: 5 μm solid
- Cyclone pre-separation for high-contamination cleaning stations

Important taxonomy rule:
Pipeline is an APPLICATION, not a technology.

### Turbine Gas Filter Element

Canonical application:
- Gas Turbine Fuel Gas / final precision fuel-gas conditioning

Canonical functions:
- Fine gas particulate filtration
- Liquid aerosol coalescence
- Integrated gas conditioning

Observed supplier claims:
- Solid target range: 0.1–5 μm
- Liquid target range: 0.1–0.3 μm
- HEPA-grade borosilicate glass fiber
- 99.97%+ filtration claim
- Antistatic design
- High-flow transient capability during startup, shutdown, or fuel switching

Observed application examples:
- Heavy-duty gas-turbine power plants
- Pipeline compressor drives
- LNG plant drives
- Marine gas turbines
- Aeroderivative gas turbines
- Reciprocating gas engines

Important taxonomy rule:
Fuel Gas Conditioning is an APPLICATION / SYSTEM function, not automatically a standalone technology.

## 8. Natural Gas Product Selection Logic for HERMES

Required input model:

Application
→ Gas Type
→ Contaminant Type
→ Solid Particle Size
→ Liquid Droplet Size
→ Flow
→ Operating Pressure
→ Temperature
→ Allowable Differential Pressure
→ Required Efficiency
→ Chemical Environment
→ Antistatic Requirement
→ Housing / System Compatibility

Expected output model:

Required Filtration Function
→ Product Configuration
→ Technical Performance Envelope
→ Compatible Housing / System
→ OEM / Competitor Cross
→ ELIMFILTERS Candidate
→ Evidence / Validation State

HERMES must not select industrial gas products by dimensions or part number alone.

## 9. Minimum Canonical Product Record — Natural Gas

Every ELIMFILTERS Natural Gas product record should support:

- Canonical Product ID
- Supplier
- Supplier SKU
- Source Product Name
- OEM / Competitor Cross
- Industry
- Application
- Gas Type
- Contaminant Type
- Filtration Function
- Product Configuration
- Solid Micron Rating
- Solid Efficiency
- Liquid Droplet Rating
- Liquid Removal Efficiency
- Outlet Liquid Content
- Flow
- Operating Pressure
- Maximum / Design Pressure
- Temperature
- Initial Differential Pressure
- Change-Out Differential Pressure
- Media
- Drainage Media
- Core / Support Material
- End-Cap Material
- Seal Material
- Chemical Compatibility
- Antistatic Capability
- Housing Compatibility
- Service Interval
- Regenerable / Non-Regenerable
- Test Standard
- Source URL
- Source Evidence
- Source Claim Status
- Validation Status
- Technology Core
- ELIMFILTERS Technology
- Canonical SKU

## 10. Evidence and Claim Governance

Required states:

- SOURCE_ONLY
- MANUFACTURER_DECLARED
- CROSS_VALIDATED
- TECHNICALLY_VALIDATED
- ELIMFILTERS_APPROVED

Rules:
- MANUFACTURER CLAIM ≠ ELIMFILTERS CLAIM.
- Supplier marketing claims must remain attributed until validated.
- A supplier case study is evidence of a supplier claim, not independent validation.
- Standards claims such as ISO, API, ASME, military, CE, or other certification references must be verified against the exact certificate, scope, edition, test method, and product applicability before ELIMFILTERS uses them publicly.
- Performance values cannot be promoted to canonical truth solely because they appear on a supplier webpage.
- No ELIMFILTERS commercial technology name is approved by this registry.

## 11. Technology Naming Gate

A new ELIMFILTERS Industrial & Process technology may only be created when all four are present:

1. Distinct physical mechanism
2. Measurable technical benefit
3. Verifiable performance evidence
4. Repeatable use across a meaningful product/application family

Natural Gas v1 currently identifies two technology candidates:
- TC-NG-01 — Gas-Liquid Coalescence
- TC-NG-02 — Gas-Liquid Separation

No commercial names are assigned yet.

## 12. Next Industrial & Process Family

Next source-discovery block:
- Hydraulic Filtration

Required workflow:
1. Reconstruct supplier source families.
2. Preserve source terminology and claims.
3. Separate application, function, product, technology, and performance.
4. Check existing ELIMFILTERS technologies for true technical reuse.
5. Create no new technology unless the Technology Naming Gate is satisfied.
6. Store the result in this registry as the next closed v1 block.

## 13. Closure Record

Natural Gas Filtration v1:
- Source discovery: COMPLETE for the five REIKE source families currently identified.
- Canonical function architecture: CLOSED.
- Canonical application architecture: CLOSED v1.
- Product configuration architecture: CLOSED v1.
- Technical core discovery: CLOSED v1.
- Commercial technology naming: intentionally NOT CLOSED.
- Supplier technical claims: retained as manufacturer-declared pending validation.
- Next block: Hydraulic Filtration.


## 14. Hydraulic Filtration — Source Discovery v0.1

Status: SOURCE FAMILY DISCOVERY COMPLETE; TECHNICAL DECOMPOSITION PENDING.

Primary source:
- Xinxiang Filter Co., Ltd. / REIKE
- Source category: Hydraulic filtration
- Source page: http://xxslqq.xx207.cxjs.net.cn/product/19.html

### 14.1 Source Families Observed

REIKE currently exposes six source families under Hydraulic filtration:

1. Lubricating oil filter element
2. Oil filter / Engine oil filter cartridge
3. High-temperature resistant filter cartridge
4. Hydraulic oil filter element
5. Coal power filter element
6. Import substitution of oil filter elements

Supplier-level commercial attributes repeated across these families:
- Supports non-standard items
- Customization supported
- Safe and reliable
- Long-lasting stability

These attributes remain SOURCE / MANUFACTURER-DECLARED and are not canonical ELIMFILTERS performance claims.

### 14.2 Initial Normalization Rules

The REIKE source menu mixes physical filtration domains, operating-condition variants, application-specific products, and commercial replacement strategies.

Therefore these source labels MUST NOT be copied one-to-one into the ELIMFILTERS canonical taxonomy.

Preliminary interpretation:

- Lubricating oil filter element
  - likely product/function domain: Lubrication Filtration
  - technical decomposition pending product-page evidence

- Oil filter / Engine oil filter cartridge
  - likely product/function domain: Engine / Industrial Engine Lubrication Filtration
  - must not be merged automatically with existing mobile-equipment lube products until application, media, pressure, flow, and cross-reference evidence are reviewed

- High-temperature resistant filter cartridge
  - operating-condition / capability label, not automatically a standalone product family or technology
  - requires evidence for fluid, temperature range, media, seals, pressure, and application

- Hydraulic oil filter element
  - likely product/function domain: Hydraulic Fluid Contamination Control
  - technical decomposition pending

- Coal power filter element
  - application-specific label
  - application context: Power Generation / Coal Power
  - underlying filtration function must be determined from source technical data before normalization

- Import substitution of oil filter elements
  - commercial / sourcing strategy, not a filtration mechanism
  - must be modeled as OEM / competitor replacement intelligence, not as an ELIMFILTERS technology or product family

### 14.3 Existing Technology Reuse Gate

The existing ELIMFILTERS TECHNOLOGY_REGISTRY already defines:

- SYNTRAX™ — Lubrication Protection / Lube Filters
- NANOFORCE™ — Hydraulic Protection / Hydraulic Filters

Before creating any new Industrial & Process hydraulic or lubrication technology, each REIKE family must be tested against the governed technical scope of SYNTRAX™ and NANOFORCE™.

Rule:
- Reuse SYNTRAX™ or NANOFORCE™ only if the industrial product's filtration function and technical performance fit the existing governed technology definition.
- Do not extend either technology solely because the source product contains oil or is physically shaped like an existing filter.
- High-temperature, power-generation, or import-substitution labels alone do not justify a new technology.

### 14.4 Required Technical Extraction Sequence

Technical pages must be reviewed in this order:

1. Lubricating oil filter element
2. Hydraulic oil filter element
3. High-temperature resistant filter cartridge
4. Coal power filter element
5. Import substitution of oil filter elements
6. Oil filter / Engine oil filter cartridge

For each source family, capture:
- Source product name
- Source SKU / reference if present
- Intended fluid
- Application
- Filtration function
- Micron rating
- Beta ratio / efficiency if declared
- Flow
- Operating pressure
- Collapse / burst / fatigue data if declared
- Operating temperature
- Initial / terminal ΔP if declared
- Media
- Core / support
- End caps
- Seal material
- Dirt-holding capacity
- Fluid compatibility
- Test standard
- Housing compatibility
- OEM / competitor cross
- Customization / non-standard capability
- Source claim status
- Validation status

### 14.5 Current Closure State

Hydraulic Filtration:
- Source category discovery: COMPLETE
- Six REIKE source families identified: COMPLETE
- Canonical technical architecture: OPEN
- Technology-core discovery: OPEN
- Existing-technology reuse assessment: OPEN
- Commercial technology naming: BLOCKED pending technical evidence
- Next source page: Lubricating oil filter element
