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

The following existing technologies keep their current governed scope and MUST NOT be repurposed as Industrial & Process technologies:

- DURATECH™ — Integrated Maintenance and Asset Protection Kits.
- MARINECLEAN™ — Marine filtration systems / filters for marine vessel applications.
- SYNTRAX™ — reserved for On-Road and Off-Road lubrication filtration.
- NANOFORCE™ — reserved for On-Road and Off-Road hydraulic filtration.

Industrial & Process is governed as a separate technology universe. Existing On-Road / Off-Road technology names are not inherited automatically, even when the physical filtration function appears similar. Industrial technologies must be discovered, validated, and named from the engineering evidence of the Industrial & Process segment itself.

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

### 14.3 Industrial Technology Separation Rule

SYNTRAX™ and NANOFORCE™ are explicitly reserved for On-Road and Off-Road applications and MUST NOT be reused, extended, inherited, or referenced as Industrial & Process technologies.

Industrial & Process is treated as a new technology universe.

Rules:
- Industrial lubrication filtration starts with no assigned ELIMFILTERS technology.
- Industrial hydraulic filtration starts with no assigned ELIMFILTERS technology.
- Technical similarity to On-Road or Off-Road products does not authorize reuse of SYNTRAX™ or NANOFORCE™.
- Industrial technology cores must be discovered from industrial mechanisms, operating conditions, materials, performance requirements, and repeatable applications.
- New commercial technology names remain blocked until the Technology Naming Gate is satisfied.
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
- Existing-technology reuse assessment: CLOSED — SYNTRAX™ and NANOFORCE™ excluded from Industrial & Process
- Commercial technology naming: BLOCKED pending technical evidence
- Next source page: Lubricating oil filter element


### 14.6 Lubricating Oil Filter Element — Technical Decomposition v1

Status: SOURCE TECHNICAL EXTRACTION COMPLETE; CANONICAL TECHNOLOGY NAME NOT ASSIGNED.

Source:
- Xinxiang Filter Co., Ltd. / REIKE
- Source product: Lubricating oil filter element
- Source page: http://xxslqq.xx207.cxjs.net.cn/product/42.html

#### Source-Declared Function

The source describes the element as removing:
- Metal wear particles, including iron, copper, and tin
- External dust
- Moisture
- Colloids
- Carbon deposits caused by oil oxidation

The stated protection objective is lubricant cleanliness control to support equipment life and reduce unplanned downtime.

The supplier references ISO 4406 cleanliness control and also uses the text "NAS16388 or better." This exact wording is retained as SOURCE TEXT and must not be normalized into a standard claim until the intended standard/reference is verified.

#### Source-Declared Construction and Performance

Manufacturer-declared characteristics:
- Multi-layer composite glass-fiber media
- Filtration range stated as 1–180 μm
- Filtration ratio βx ≥ 200, where x is the nominal accuracy
- Filtration efficiency stated as >99.5%
- Operating temperature stated as -30°C to +110°C
- Initial differential pressure stated as ≤0.05 MPa at rated flow
- Working pressure stated as up to 21 MPa
- Frame: galvanized carbon steel or stainless-steel perforated structure
- End caps: galvanized carbon steel or nylon plastic
- Seal options: fluororubber or nitrile rubber
- Compatible fluids claimed:
  - Mineral oil
  - Synthetic oil
  - Phosphate-ester hydraulic oil
  - Water-ethylene glycol

All values above remain MANUFACTURER_DECLARED until independently validated.

#### Canonical Applications Observed

Application contexts identified by the source:

- Gearbox Lubrication
  - reducers
  - rolling-mill gearboxes
  - recommended source range: 10–20 μm
  - source requirement: fatigue and heat resistance

- Bearing Lubrication
  - fan bearings
  - motor bearings
  - recommended source range: 5–10 μm
  - source requirement: low resistance / high reliability

- Compressor Lubrication
  - screw compressors
  - reciprocating compressors
  - recommended source range: 5–15 μm
  - source requirement: compatibility with oil-gas separation

- Turbine Oil Systems
  - turbine lubricating-oil stations
  - recommended source range: 5–10 μm
  - source requirement: oxidation resistance / long life

- Paper-Machine Circulating Lubrication
  - recommended source range: 10–30 μm
  - source requirement: high contaminant capacity

- Coal-Mill Lubrication
  - medium-speed coal-mill gearboxes
  - recommended source range: 10–20 μm
  - source requirement: vibration and impact resistance

Additional industries/applications explicitly listed by the source:
- Steel and metallurgy
- Power and energy
- Cement and building materials
- General industry
- Wind-power gearboxes
- Hydroturbine bearing lubrication
- Vacuum-pump lubrication
- Mining machinery reducers

#### Maintenance Logic Observed

Supplier-declared replacement trigger:
- Replace when differential pressure reaches 0.2–0.35 MPa, or according to the equipment maintenance interval.

Supplier-declared viscosity guidance:
- High-viscosity oils such as ISO VG 320 gear oil: 10–30 μm
- Medium/low-viscosity oils such as ISO VG 68 turbine oil: 5–10 μm

The supplier explicitly notes that unnecessarily fine filtration can increase flow resistance.

#### Canonical ELIMFILTERS Interpretation

Canonical domain:
Industrial & Process
→ Industrial Lubrication Filtration

Canonical filtration function:
- Lubricant Particulate Contamination Control

Secondary contamination concerns observed:
- Moisture
- Oxidation byproducts
- Colloids
- Carbonaceous deposits

Canonical application dimensions:
- Gearbox Lubrication
- Bearing Lubrication
- Compressor Lubrication
- Turbine Oil Systems
- Paper-Machine Circulating Lubrication
- Coal-Mill Lubrication
- Wind-Power Gearbox Lubrication
- Hydroturbine Bearing Lubrication
- Vacuum-Pump Lubrication
- Mining Reducer Lubrication

Important taxonomy rule:
- "Lubricating oil filter element" is a product/function family.
- Gearbox, compressor, turbine, paper machine, coal mill, wind power, and similar terms are APPLICATIONS.
- High temperature, fatigue resistance, oxidation resistance, vibration resistance, and chemical compatibility are CAPABILITIES / OPERATING REQUIREMENTS.
- None of these labels are approved technology names.

#### Technology-Core Discovery

Provisional internal core:

TC-LUB-01 — Industrial Lubricant Cleanliness Control

Status: TECHNOLOGY CORE CANDIDATE / NOT A COMMERCIAL TECHNOLOGY NAME.

Observed engineering dimensions:
- High-efficiency particulate removal
- Beta-ratio governed filtration
- Dirt-holding capacity
- Low initial differential pressure
- Viscosity-sensitive micron selection
- Broad lubricant compatibility
- Mechanical pressure resistance
- Temperature and seal compatibility
- Application-specific cleanliness targets

This core is distinct from SYNTRAX™ by governance. SYNTRAX™ remains On-Road / Off-Road only and is not inherited by this Industrial & Process family.

#### Required Validation Before ELIMFILTERS Approval

Still missing or unverified:
- Exact ISO 4406 target classes by application
- Exact interpretation of "NAS16388"
- Test method supporting βx ≥ 200
- Beta-ratio test standard / multipass method
- Dirt-holding capacity values
- Rated flow values
- Collapse / burst / fatigue data
- Exact pressure qualification method for the 21 MPa claim
- Media grade by reference
- Seal selection by fluid
- Water-removal capability, if any, versus simple moisture tolerance
- Housing compatibility
- OEM / competitor cross-reference
- Individual source SKU structure

#### Closure State — Lubricating Oil Filter Element

- Source technical extraction: COMPLETE
- Application mapping: COMPLETE v1
- Canonical function mapping: COMPLETE v1
- Technology-core discovery: COMPLETE v1
- Commercial technology naming: BLOCKED
- Supplier performance validation: OPEN
- OEM / competitor mapping: OPEN
- Canonical SKU mapping: OPEN

Next source page:
- Hydraulic oil filter element


### 14.7 Hydraulic Oil Filter Element — External Benchmark Research v1

Status: EXTERNAL TECHNICAL BENCHMARK COMPLETE; REIKE-SPECIFIC PRODUCT DATA NOT AVAILABLE; CANONICAL INDUSTRIAL ARCHITECTURE DEFINED FROM MULTIPLE ESTABLISHED MANUFACTURERS.

Research basis:
- Pall
- Parker
- Donaldson
- Eaton

Research-governance rule:
- Values below are external benchmark evidence, not REIKE specifications.
- Brand-specific performance remains attributed to the source manufacturer.
- Canonical ELIMFILTERS architecture may use the common engineering dimensions validated across multiple manufacturers, but no competitor-specific proprietary technology claim is inherited.

#### Canonical Domain

Industrial & Process
→ Hydraulic Filtration

Canonical filtration function:
- Hydraulic Fluid Particulate Contamination Control

Secondary engineering functions that may apply by product:
- Electrostatic charge mitigation
- Water / mixed-fluid compatibility
- Cold-start / high-viscosity stability
- Flow-fatigue resistance
- High-collapse protection
- Low differential-pressure operation

#### Canonical Hydraulic Circuit Positions

Hydraulic filtration must model circuit location because operating pressure, collapse strength, bypass logic, and contamination duty change by location.

Canonical positions:
- Suction Line
- Pressure Line
- Return Line
- Offline / Kidney Loop
- Tank-Top Return
- Duplex / Continuous-Service Circuit

These are APPLICATION / SYSTEM POSITIONS, not technology names.

#### Canonical Performance Model

Primary efficiency metric:
- Beta ratio βx(c) according to ISO 16889 multi-pass testing

Reference conversion:
- β=2 ≈ 50% efficiency
- β=10 ≈ 90%
- β=75 ≈ 98.7%
- β=100 ≈ 99%
- β=200 ≈ 99.5%
- β=1000 ≈ 99.9%

Observed benchmark levels:
- Pall Coralon / Ultipor families: βx(c) ≥1000
- Pall Athalon / Supralon families: βx(c) ≥2000
- Eaton publishes hydraulic media performance using ISO 16889 and β=200 as a principal reference level
- Donaldson publishes hydraulic media ratings using ISO 16889 with β200 and β1000 points
- Parker publishes Ecoglass III media performance through ISO 16889 beta ratings

Canonical rule:
Nominal micron statements alone are insufficient for Industrial & Process hydraulic qualification. A canonical record should store the particle size x together with its beta ratio and test standard.

#### Canonical Test-Standard Set

Observed repeatedly across established hydraulic filtration manufacturers:

- ISO 16889 — multi-pass filtration performance / beta ratio
- ISO 2941 — element collapse / burst resistance
- ISO 2942 — fabrication integrity / bubble point
- ISO 2943 — material / fluid compatibility
- ISO 3724 — flow-fatigue characteristics
- ISO 3968 — pressure-drop versus flow characteristics

Additional stress / cyclic performance:
- SAE ARP4205 — cyclic stabilization / stress-resistance benchmark used by Pall
- NFPA T2.06.01R2 — fatigue qualification appears in some hydraulic housing applications

These standards form the minimum external benchmark set for future ELIMFILTERS Industrial hydraulic validation where applicable.

#### Media and Construction Benchmark

Common engineering pattern across Pall, Parker, Donaldson, and Eaton:
- Synthetic / inorganic glass-fiber depth media for high-efficiency filtration
- Pleated construction
- Upstream and downstream support layers or mesh
- Corrosion-protected metallic hardware or engineered polymer / coreless structures depending product
- Nitrile or fluorocarbon sealing options
- Media and pleat geometry optimized for low ΔP, contaminant capacity, and fatigue stability

Industrial hydraulic design must therefore treat the following as independent attributes:
- Media composition
- Pleat geometry
- Support layers
- Core type
- End-cap material
- Seal material
- Collapse rating
- Flow-fatigue rating

#### Pressure and Collapse Architecture

External benchmark evidence shows that hydraulic element pressure capability is not one universal number.

Examples:
- Pall Ultipor III lists element collapse ratings ranging from about 7–20 bar for conventional elements and much higher values for high-collapse variants.
- Pall coreless elements and product families carry different collapse values.
- Pall complete hydraulic filter assemblies span low, medium, and high system-pressure classes.
- Parker return/suction systems may use low-pressure housings while pressure-line products operate in materially different pressure regimes.

Canonical rule:
Store separately:
- System / housing maximum allowable working pressure
- Element collapse differential pressure
- Bypass-valve setting
- Rated fatigue pressure / cycles where available

Never interpret housing working pressure as element collapse pressure.

#### Fluid Compatibility Benchmark

Common compatibility classes found across established suppliers:
- Petroleum / mineral hydraulic oils
- Water-glycol fluids
- Water-oil emulsions
- High-water-content fluids
- Selected synthetic hydraulic fluids
- Phosphate esters with appropriate seal / material selection

Canonical rule:
Fluid compatibility must be tied to:
- Media
- Adhesive / resin
- End caps
- Core
- Seal material
- Temperature range

"Compatible with hydraulic oil" is insufficient as a canonical industrial specification.

#### Temperature and Seal Benchmark

Established suppliers commonly differentiate nitrile and fluorocarbon seal configurations and publish operating temperature limits by material.

Canonical attributes:
- Minimum operating temperature
- Maximum operating temperature
- Seal material
- Fluid/seal compatibility
- Cold-start viscosity condition

Cold start is a separate operating condition because high viscosity increases element differential pressure and mechanical stress.

#### Electrostatic Control

Pall explicitly offers anti-static hydraulic elements to reduce electrostatic charging and associated fluid degradation / varnish risk.

Canonical interpretation:
- Anti-static construction is a CAPABILITY / DESIGN FEATURE.
- It is not by itself a standalone Industrial & Process technology.
- Future ELIMFILTERS products may require an electrostatic-control attribute when the application, fluid conductivity, flow velocity, and media create a justified need.

#### Provisional Technology-Core Discovery

TC-HYD-01 — Industrial Hydraulic Contamination Control

Status: TECHNOLOGY CORE CANDIDATE / NOT A COMMERCIAL TECHNOLOGY NAME.

Physical / engineering scope:
- High-efficiency particulate removal under hydraulic flow
- Beta-ratio controlled performance
- Stable cleanliness under changing differential pressure
- High contaminant holding capacity
- Low clean-element pressure drop
- Structural resistance to collapse
- Flow-fatigue resistance
- Fluid and temperature compatibility
- Application-specific pressure class
- Optional electrostatic-charge mitigation

This technology core is completely separate from NANOFORCE™, which remains governed for On-Road and Off-Road only.

#### Required HERMES Inputs — Industrial Hydraulic

Minimum selection inputs:
- Circuit position
- Hydraulic fluid type
- Target ISO cleanliness code
- Required beta ratio / micron(c)
- Rated flow
- Operating pressure
- Maximum system pressure
- Allowable clean ΔP
- Terminal / change-out ΔP
- Required element collapse differential
- Bypass setting
- Fluid viscosity
- Operating temperature
- Cold-start condition
- Seal compatibility
- Water-content / fluid chemistry
- Duty cycle / pulsation / fatigue
- Housing interface
- OEM / competitor reference

Expected HERMES output:
Application
→ Circuit Position
→ Required Cleanliness
→ Required βx(c)
→ Media Class
→ Pressure / Collapse Class
→ Seal / Fluid Compatibility
→ Element Configuration
→ Housing Compatibility
→ OEM / Competitor Cross
→ ELIMFILTERS Candidate
→ Validation State

#### Canonical Record Additions for Hydraulic Products

Add these fields to Industrial hydraulic records:
- Circuit Position
- ISO Cleanliness Target
- Beta Ratio
- Beta Particle Size μm(c)
- Multipass Test Standard
- Element Collapse Differential Pressure
- Housing MAWP
- Bypass Valve Setting
- Flow Fatigue Standard
- Rated Fatigue Cycles
- Clean Element ΔP
- Terminal ΔP
- Fluid Viscosity
- Cold Start Condition
- Anti-Static Capability

#### Closure State — Hydraulic Oil Filter Element

- REIKE-specific technical extraction: NOT AVAILABLE
- External benchmark research: COMPLETE v1
- Canonical hydraulic function architecture: COMPLETE v1
- Circuit-position architecture: COMPLETE v1
- Test-standard architecture: COMPLETE v1
- Technology-core discovery: COMPLETE v1
- Commercial technology naming: BLOCKED
- ELIMFILTERS product specification: OPEN
- OEM / competitor mapping: OPEN
- Canonical SKU mapping: OPEN

Next source family:
- High-temperature resistant filter cartridge
