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


### 14.8 High-Temperature Resistant Hydraulic Filter Cartridge — Technical Decomposition v1

Status: SOURCE TECHNICAL EXTRACTION COMPLETE; CLASSIFIED AS HIGH-TEMPERATURE HYDRAULIC CAPABILITY FAMILY; NO COMMERCIAL TECHNOLOGY NAME ASSIGNED.

Source:
- Xinxiang Filter Co., Ltd. / REIKE
- Source product: Hydraulic high-temperature resistant filter element
- Source page: http://xxslqq.xx207.cxjs.net.cn/product/44.html

#### Source-Declared Failure Mode / Design Rationale

The source states that conventional hydraulic elements may suffer loss of media strength, adhesive softening, and seal aging when oil temperature rises above approximately 90°C. The resulting risks described are:
- media displacement
- filtration-accuracy degradation
- structural deformation or collapse
- loss of contamination control

The supplier therefore positions this product as a material-and-structure adaptation for sustained high-temperature hydraulic service.

#### Source-Declared Construction

Manufacturer-declared materials and construction:
- High-temperature glass-fiber filtration media
- Media thermal stability stated up to 200°C
- Metal-reinforced structure
- Stainless-steel internal frame
- Carbon-steel galvanized end-cap option
- Fluororubber / Viton® high-temperature sealing
- Thermosetting adhesive / resin process

Canonical interpretation:
High-temperature performance depends on the complete material stack, not media temperature rating alone.

Required material stack:
Media
→ Adhesive / Resin
→ Core / Support
→ End Caps
→ Seal
→ Fluid Compatibility

#### Source-Declared Performance

Manufacturer-declared characteristics:
- Continuous media temperature capability: up to 200°C
- Claimed high-temperature compatibility verification: ISO 2943
- Supplier claim: after 150°C continuous operation for 1000 hours, filtration-performance degradation ≤10%
- Crush / collapse strength stated up to 21 MPa
- Standard filtration accuracy stated as 1–25 μm
- Filtration ratio stated as βx ≥ 200
- Low initial-pressure-drop design claimed

Governance:
- These values remain MANUFACTURER_DECLARED.
- The exact ISO 2943 test report, specimen configuration, fluid, temperature profile, acceptance criteria, and test laboratory have not been independently verified.
- The supplier's use of the term "crush strength 21 MPa" must not be normalized automatically as ISO 2941 collapse differential pressure until the test method and pressure definition are confirmed.

#### Canonical Applications Observed

1. Injection-Molding Machine Hydraulic Systems
- Oil temperature: 80–120°C
- Fluid: anti-wear hydraulic oil
- Recommended source accuracy: 10–20 μm
- Source requirement: fatigue resistance / long life

2. Die-Casting Machine Hydraulic Systems
- Oil temperature: 100–150°C
- Fluid: flame-resistant hydraulic oil
- Recommended source accuracy: 15–25 μm
- Source requirement: chemical compatibility

3. Continuous-Casting Machine Hydraulic Systems
- Oil temperature: 80–110°C
- Fluid: anti-wear hydraulic oil
- Recommended source accuracy: 10–20 μm
- Source requirement: resistance to high-temperature water vapor

4. Hot-Rolling-Line Hydraulic Systems
- Oil temperature: 90–130°C
- Fluid: anti-wear hydraulic oil
- Recommended source accuracy: 5–10 μm
- Source requirement: high precision / high reliability

5. Industrial-Furnace Hydraulic Systems
- Oil temperature: 120–180°C
- Fluid: flame-resistant hydraulic oil
- Recommended source accuracy: 15–30 μm
- Source requirement: heat-radiation tolerance

6. Asphalt-Paver Hydraulic Systems
- Oil temperature: 80–120°C
- Fluid: anti-wear hydraulic oil
- Recommended source accuracy: 10–20 μm
- Source requirement: vibration resistance / outdoor service

Additional application areas:
- Metallurgical continuous-casting vibration systems
- Hot-rolling AGC hydraulic systems
- Furnace-door hydraulic systems
- Extrusion machines
- Blow-molding machines
- Cold-chamber die-casting machines
- Hot-chamber die-casting machines
- Magnesium-alloy die-casting machines
- Hot presses
- Autoclave hydraulic systems
- Rubber vulcanizing-machine hydraulic systems

#### Fluid / Seal Compatibility

The supplier explicitly states that phosphate-ester fire-resistant fluids are not compatible with conventional nitrile seals and require fluororubber seals and media selected for phosphate-ester compatibility.

Canonical rule:
High-temperature hydraulic qualification requires explicit pairing of:
- Fluid chemistry
- Seal material
- Media
- Resin / adhesive
- Temperature range

No high-temperature product may be approved with temperature rating alone.

#### Failure Indicators

Supplier-declared indicators of thermal failure include:
- Abnormal increase in differential pressure
- Abnormal decrease in differential pressure
- Media collapse or deformation
- Loose end caps
- Adhesive separation
- Persistently contaminated oil downstream

Canonical interpretation:
High-temperature service adds thermal-degradation failure modes to standard hydraulic differential-pressure and contamination monitoring.

#### Canonical ELIMFILTERS Interpretation

Canonical domain:
Industrial & Process
→ Hydraulic Filtration
→ High-Temperature Hydraulic Service

Canonical filtration function:
- Hydraulic Fluid Particulate Contamination Control

Capability overlay:
- High-Temperature Hydraulic Filtration

Important taxonomy rule:
"High-temperature resistant" is a CAPABILITY / OPERATING-ENVIRONMENT CLASS, not a standalone filtration mechanism.

It therefore extends TC-HYD-01 rather than creating a second hydraulic mechanism automatically.

#### Technology-Core Relationship

Parent core:
TC-HYD-01 — Industrial Hydraulic Contamination Control

Capability extension:
HT-HYD — High-Temperature Hydraulic Capability

Status:
CAPABILITY EXTENSION / NOT A COMMERCIAL TECHNOLOGY NAME.

Required engineering dimensions:
- Sustained oil-temperature capability
- Media thermal stability
- Adhesive / resin thermal stability
- Seal thermal and chemical compatibility
- High-temperature collapse stability
- Differential-pressure stability
- Beta-ratio retention after thermal aging
- Vibration / fatigue resistance where application requires it
- Heat-radiation or steam exposure where applicable

#### Required HERMES Inputs — High-Temperature Hydraulic

Add to the standard Industrial hydraulic input model:
- Continuous oil temperature
- Peak oil temperature
- Exposure duration
- Fluid chemistry
- Fire-resistant fluid type
- Seal material requirement
- Thermal cycling profile
- Steam / moisture exposure
- Radiant-heat exposure
- Vibration / shock environment
- Required post-aging beta-ratio retention

Expected selection logic:
Hydraulic Application
→ Circuit Position
→ Fluid Chemistry
→ Continuous / Peak Temperature
→ Required βx(c)
→ Thermal Material Stack
→ Seal Compatibility
→ Collapse / Fatigue Class
→ Housing Compatibility
→ Candidate Element
→ Validation State

#### Required Validation Before ELIMFILTERS Approval

Still required:
- Full ISO 2943 test report
- Exact βx(c) test standard and data at elevated temperature
- ISO 16889 multipass data before and after thermal aging
- ISO 2941 collapse data and confirmation of the 21 MPa claim
- ISO 3724 flow-fatigue data where relevant
- Pressure-drop-versus-flow curves by temperature / viscosity
- Exact media grade
- Exact resin / adhesive specification
- Seal compound identification by fluid class
- Fire-resistant fluid compatibility matrix
- Thermal-cycle test data
- Application-specific housing / interface data
- OEM / competitor cross-reference

#### Closure State — High-Temperature Resistant Filter Cartridge

- Source technical extraction: COMPLETE
- Application mapping: COMPLETE v1
- Canonical function mapping: COMPLETE v1
- Capability classification: COMPLETE v1
- Technology-core relationship: COMPLETE v1
- Commercial technology naming: BLOCKED
- Supplier performance validation: OPEN
- ELIMFILTERS product specification: OPEN
- OEM / competitor mapping: OPEN
- Canonical SKU mapping: OPEN

Next source family:
- Coal power filter element


### 14.9 Power Generation Filtration — External Benchmark Architecture v1

Status: REIKE SOURCE FAMILY CONFIRMED BUT PRODUCT PAGE EMPTY; EXTERNAL BENCHMARK ARCHITECTURE COMPLETE; COMMERCIAL TECHNOLOGY NAME NOT ASSIGNED.

Source condition:
- REIKE lists "Power Generation Filtration" under Hydraulic & Lubrication Filtration.
- The REIKE product page currently contains no technical product content.
- Therefore no REIKE performance values are assigned to this family.

External benchmark basis:
- Pall
- Eaton
- Parker
- Donaldson

#### Canonical Interpretation

Power Generation Filtration is an APPLICATION / INDUSTRY SOLUTION LAYER, not a single filtration mechanism.

Canonical domain:
Industrial & Process
→ Power Generation Filtration

Canonical subdomains observed across established manufacturers:
- Turbine Lubrication Oil Filtration
- Electro-Hydraulic Control (EHC) Fluid Filtration
- Seal Oil Filtration
- Gearbox Lubrication Filtration
- Hydraulic Power Unit Filtration
- Offline / Kidney-Loop Oil Conditioning
- Water Removal / Dehydration
- Varnish / Oil Degradation Control
- Cooling Water Filtration
- Compressed Air / Gas Treatment
- Transformer Oil / Auxiliary Fluid Filtration where applicable

This registry block focuses on the hydraulic and lubrication portion because REIKE places the family under Hydraulic & Lubrication Filtration.

#### Power-Generation Lubrication Architecture

External manufacturer evidence supports these critical lubrication applications:

- Turbine bearing lube oil
- Turbine lube oil flushing
- Hydrogen seal oil
- Steam turbine lubrication
- Gas turbine lubrication
- Gearboxes
- Lubrication modules
- Compressors
- Hydraulic power units

Protection objectives:
- Maintain oil cleanliness
- Reduce particulate contamination
- Control water contamination
- Reduce varnish / degradation risk where applicable
- Protect bearings, shafts, valves, servo components, and hydraulic controls
- Support continuous operation and reduce unplanned downtime

#### Continuous-Service / Duplex Architecture

Power-generation equipment frequently requires filtration without process shutdown.

Canonical configuration:
- Duplex / change-over filter
- Parallel filter chambers
- On-line changeover
- Differential-pressure monitoring
- Element replacement while the protected system remains in service

Governance:
"Duplex" is a SYSTEM CONFIGURATION, not a filtration technology.

#### Water Removal and Oil Conditioning

External benchmark evidence shows power-generation oil conditioning can include:
- Particulate filtration
- Free-water removal
- Emulsified-water removal
- Dissolved-water reduction
- Dissolved-gas removal
- Vacuum dehydration / purification
- Offline filtration

Canonical functions:
- Oil Particulate Contamination Control
- Oil-Water Separation / Water Removal
- Oil Dehydration
- Oil Condition Remediation

These functions must remain separate in the taxonomy.

#### Electrostatic / Varnish Control

Established power-generation filtration suppliers identify electrostatic discharge and varnish / oil-degradation risk in modern turbine and hydraulic fluids.

Canonical treatment:
- Electrostatic-charge mitigation = CAPABILITY / DESIGN FEATURE
- Varnish remediation = OIL CONDITIONING FUNCTION
- Neither is automatically a standalone commercial technology

#### Canonical Power-Generation System Positions

- Main Turbine Lube Oil Loop
- Bearing Supply / Return
- Seal Oil Loop
- EHC / Servo-Hydraulic Circuit
- Gearbox Lubrication Loop
- Compressor Lubrication Loop
- Offline Conditioning Loop
- Reservoir / Tank Conditioning
- Oil Transfer / Fill Loop
- Oil Flushing Loop

#### Technology-Core Relationship

Power Generation does not justify an independent core solely because of industry.

It consumes and combines existing Industrial & Process technical cores:

- TC-LUB-01 — Industrial Lubricant Cleanliness Control
- TC-HYD-01 — Industrial Hydraulic Contamination Control

Additional functional-core candidates identified by the external research:

TC-OIL-01 — Industrial Oil Water Removal / Dehydration
Status: FUNCTION CORE CANDIDATE / NOT A COMMERCIAL TECHNOLOGY NAME.

TC-OIL-02 — Industrial Oil Condition Remediation
Scope candidate:
- varnish reduction
- oil-degradation byproduct control
- electrostatic-risk mitigation where technically applicable
Status: FUNCTION CORE CANDIDATE / REQUIRES FURTHER SOURCE RESEARCH.

No commercial technology names are approved.

#### Minimum HERMES Inputs — Power Generation

- Plant type
- Turbine / equipment type
- Protected component
- Oil / fluid type
- Circuit position
- Required ISO cleanliness target
- Required beta ratio / micron(c)
- Flow
- Operating pressure
- System MAWP
- Element collapse requirement
- Clean and terminal ΔP
- Oil viscosity
- Operating / peak temperature
- Water content
- Water state: free / emulsified / dissolved
- Varnish potential / oil degradation indicators
- Electrostatic-risk condition
- Continuous-service requirement
- Duplex / changeover requirement
- Seal compatibility
- Housing interface
- OEM / competitor reference

Expected logic:
Power-Generation Application
→ Circuit / Protected Component
→ Contaminant Type
→ Required Filtration / Conditioning Function
→ Efficiency / Water-Removal Target
→ Element / System Configuration
→ Duplex / Offline Requirement
→ Material / Fluid Compatibility
→ Candidate System / Element
→ Validation State

#### External Benchmark Notes

Pall:
- Power-generation turbine management explicitly separates turbine bearing lube oil, turbine lube-oil flush, hydrogen seal oil, water removal, oil monitoring, and varnish remediation.

Eaton:
- Power-plant filtration literature identifies turbine hydraulic and lubrication oil filtration as a key protection area.
- Eaton also documents duplex filtration, offline filtration, water-absorption media, oil purification, and differential-pressure monitoring in power-generation service.

Parker:
- Power-generation portfolio includes hydraulic, lube, and transformer-oil filtration with in-line, in-tank, portable, and condition-monitoring options across combustion turbines, combined cycle, fossil plants, wind, and portable power.

Donaldson:
- Hydraulic contamination-control principles remain applicable to power-generation hydraulic circuits, with cleanliness and contaminant control treated as system-reliability requirements rather than a single filter type.

#### Closure State — Power Generation Filtration

- REIKE category existence: CONFIRMED
- REIKE technical product page: EMPTY / NO SPECIFICATION DATA
- External benchmark research: COMPLETE v1
- Canonical application architecture: COMPLETE v1
- Lubrication / hydraulic relationship: COMPLETE v1
- Duplex / continuous-service architecture: COMPLETE v1
- Water-removal architecture: COMPLETE v1
- Commercial technology naming: BLOCKED
- ELIMFILTERS product specification: OPEN
- OEM / competitor mapping: OPEN
- Canonical SKU mapping: OPEN

Next source family:
- OEM Replacement Filter Elements


### 14.10 OEM Replacement Filter Elements — External Benchmark Architecture v1

Status: REIKE SOURCE FAMILY CONFIRMED BUT PRODUCT PAGE EMPTY; REPLACEMENT-INTELLIGENCE ARCHITECTURE DEFINED FROM ESTABLISHED MANUFACTURER PROGRAMS.

Source condition:
- REIKE lists "OEM Replacement Filter Elements" under Hydraulic & Lubrication Filtration.
- The REIKE product page contains no technical specification content.
- Therefore no REIKE interchangeability, performance, or OEM-equivalence claim is accepted from this page.

External benchmark basis:
- Parker Par Fit™
- HYDAC Betterfit
- Donaldson hydraulic cross-reference / replacement programs
- Supporting market cross-reference practices from established replacement suppliers

#### Canonical Interpretation

OEM Replacement Filter Elements is NOT a filtration technology.

It is a commercial / engineering replacement-intelligence layer that maps an original element to a technically qualified alternative.

Canonical domain:
Industrial & Process
→ Replacement Intelligence
→ OEM / Competitor Interchange

This layer may serve hydraulic, lubrication, power-generation, gas, water, and other Industrial & Process families, but it must never override the engineering requirements of the underlying filtration function.

#### Established Market Evidence

Parker Par Fit™ demonstrates that industrial interchange is a formal product strategy rather than an informal dimensional lookup. Parker publishes replacement coverage for a very large multi-brand universe and states that its interchange elements are engineered to be fully interchangeable with original elements while conforming to applicable ISO manufacturing and testing standards.

HYDAC Betterfit publishes replacement-element families organized against competing manufacturers, including Pall, Parker, Eaton, Mahle, Schroeder, Donaldson, Internormen, and others.

Donaldson publishes hydraulic cross-reference tables that map its elements against Schroeder, HYDAC, Pall, Parker, and other competitor references.

Canonical conclusion:
A serious Industrial & Process cross-reference engine must be built as structured interchange intelligence, not a text alias table.

#### Minimum Qualification Dimensions

An OEM / competitor replacement candidate must be evaluated across three independent layers:

1. Form / Interface
- Overall length
- Outside diameter
- Inside diameter
- End-cap geometry
- Open / closed end configuration
- Thread or attachment type where applicable
- Seal location
- Seal dimensions
- Housing interface
- Flow direction

2. Filtration Performance
- Media type
- Micron(c) rating
- Beta ratio
- ISO 16889 test basis where applicable
- Dirt-holding capacity
- Clean pressure drop
- Terminal pressure drop
- Water-removal or special-media function where applicable
- Anti-static or other special capability where required

3. Mechanical / Chemical Duty
- Element collapse differential pressure
- Housing / system pressure compatibility
- Bypass compatibility
- Flow-fatigue requirement
- Operating temperature
- Fluid chemistry
- Seal material
- Adhesive / resin compatibility
- Core / support construction

Rule:
Dimensional similarity alone is NEVER sufficient for canonical OEM interchange approval.

#### Cross-Reference Evidence States

Required states for every Industrial & Process interchange record:

- CANDIDATE_MATCH
- DIMENSIONALLY_VALIDATED
- FUNCTIONALLY_VALIDATED
- PERFORMANCE_VALIDATED
- APPLICATION_VALIDATED
- ELIMFILTERS_APPROVED_INTERCHANGE

Optional negative states:
- REJECTED_DIMENSION
- REJECTED_MEDIA
- REJECTED_BETA
- REJECTED_COLLAPSE
- REJECTED_SEAL
- REJECTED_FLUID
- REJECTED_APPLICATION

#### Canonical Interchange Record

Minimum fields:

- Source Manufacturer
- Source Part Number
- Source Product Family
- Source Application
- Source Housing
- Candidate ELIMFILTERS Part Number
- Cross-Reference Status
- Evidence Source
- Evidence Date
- OD
- ID
- Length
- End-Cap Configuration
- Seal Dimensions
- Seal Material
- Media
- Micron(c)
- Beta Ratio
- Test Standard
- Dirt-Holding Capacity
- Clean ΔP
- Collapse Differential Pressure
- Bypass Requirement
- Flow Direction
- Rated Flow
- Operating Temperature
- Fluid Compatibility
- Special Capability
- Application Validation
- Notes / Exceptions
- Approval State

#### HERMES Replacement Logic

Input:
OEM / Competitor Part Number
→ Manufacturer
→ Product Family
→ Application / Housing

HERMES must then resolve:
Interface Match
→ Filtration Function Match
→ Beta / Efficiency Match
→ Pressure / Collapse Match
→ Fluid / Seal Match
→ Temperature Match
→ Special Capability Match
→ Application Match
→ Candidate Ranking by evidence completeness
→ ELIMFILTERS Approved Interchange or NO APPROVED MATCH

Critical rule:
HERMES must be allowed to return NO APPROVED MATCH.

The system must never force an interchange solely because dimensions or part-number aliases match.

#### Relationship to Industrial Technology

Replacement Intelligence is orthogonal to technology.

Examples:
- A TC-HYD-01 hydraulic element may have many OEM interchanges.
- A TC-LUB-01 lubrication element may have many OEM interchanges.
- A future gas-coalescence technology may also have OEM interchanges.

The interchange layer identifies equivalence / compatibility.
The technology layer identifies physical protection mechanism and performance.

They must remain separate.

#### Brand and Legal Handling

Competitor trademarks and part numbers may be stored for cross-reference and compatibility identification, but:
- competitor names remain attributed to their owners
- no implication of sponsorship or affiliation
- "replacement for" / "interchange for" language must be evidence-backed
- "equivalent" or "superior" performance claims require test evidence
- proprietary competitor technology names are not inherited into ELIMFILTERS taxonomy

#### Closure State — OEM Replacement Filter Elements

- REIKE family existence: CONFIRMED
- REIKE technical product page: EMPTY / NO SPECIFICATION DATA
- External benchmark research: COMPLETE v1
- Replacement-intelligence architecture: COMPLETE v1
- Cross-reference evidence states: COMPLETE v1
- HERMES interchange logic: COMPLETE v1
- Relationship to technology taxonomy: CLOSED v1
- Commercial technology naming: NOT APPLICABLE
- ELIMFILTERS interchange database population: OPEN
- Competitor/OEM source ingestion: OPEN
- Product-level approval: OPEN

Hydraulic & Lubrication Filtration family status:
- Lubrication Oil Filter Elements: DECOMPOSED v1
- Hydraulic Oil Filter Elements: ARCHITECTURE CLOSED v1
- High Temperature Hydraulic Filter Elements: DECOMPOSED v1
- Power Generation Filtration: ARCHITECTURE CLOSED v1
- OEM Replacement Filter Elements: ARCHITECTURE CLOSED v1
- Industrial Engine Oil Filter Elements: STILL OPEN


### 14.11 Industrial Engine Oil Filter Elements — External Benchmark Architecture v1

Status: REIKE SOURCE FAMILY CONFIRMED BUT PRODUCT PAGE EMPTY; EXTERNAL BENCHMARK ARCHITECTURE COMPLETE; COMMERCIAL TECHNOLOGY NAME NOT ASSIGNED.

Source condition:
- REIKE lists "Industrial Engine Oil Filter Elements" under Hydraulic & Lubrication Filtration.
- The REIKE product page currently contains no usable technical specification content.
- Therefore no REIKE efficiency, flow, pressure, media, or service-life claim is accepted for this family.

External benchmark basis:
- Donaldson Engine Lube Filtration
- MANN+HUMMEL engine oil filtration for stationary/mobile equipment
- Supporting heavy-duty engine filtration literature

#### Canonical Interpretation

Industrial Engine Oil Filtration is an APPLICATION / PRODUCT-FAMILY DOMAIN within Industrial & Process.

Canonical domain:
Industrial & Process
→ Industrial Engine Lubrication
→ Engine Oil Filtration

This family is intentionally separate from SYNTRAX™, which remains governed for On-Road and Off-Road only.

#### Canonical Filtration Architectures

Established engine-lube systems use three distinct architectures:

1. Full-Flow Filtration
- Receives nearly 100% of regulated engine oil flow.
- Primary objective: protect engine components while preserving required lubrication flow.
- Engineering balance: efficiency vs contaminant capacity vs restriction.

2. By-Pass / Secondary Filtration
- Diverts a small portion of total lube flow, typically around 5–10%, through a higher-efficiency path and returns it to the sump.
- Used for finer contamination control / oil polishing.
- Higher restriction than the full-flow path is acceptable because it does not carry the engine's total lubrication flow.

3. Two-Stage / Combination Filtration
- Combines full-flow and by-pass functions in one package.
- Must be evaluated carefully because added restriction can affect cold-flow behavior and service life.

Canonical rule:
"Bypass valve" inside a full-flow filter is NOT the same thing as a by-pass / secondary filtration circuit.

#### Primary Protection Functions

Canonical functions:
- Engine-Lubricant Particulate Contamination Control
- Soot / Carbonaceous Contaminant Management
- Wear-Particle Capture
- Lubricant Cleanliness Maintenance
- Optional Secondary Oil Polishing

Observed contamination sources:
- Metallic wear debris
- Carbonaceous combustion byproducts
- External dirt
- Oil degradation products
- Contaminants introduced during servicing or fill

#### Critical Engineering Balance

Industrial engine lube filtration must optimize three variables simultaneously:

- Efficiency
- Contaminant-holding capacity
- Restriction / pressure drop

External manufacturer guidance explicitly warns that excessive efficiency without sufficient flow capacity can increase restriction and cause premature bypass.

Canonical rule:
Industrial engine oil filters cannot be selected by micron value alone.

#### Cold-Start / High-Viscosity Behavior

Cold or highly viscous oil can sharply increase pressure drop across the element.

Required canonical attributes:
- Clean-element ΔP
- Cold-flow capability
- Oil viscosity
- Oil temperature
- Bypass-valve opening pressure
- Media type
- Rated flow

Selection must ensure lubrication flow is maintained during startup and transient viscosity conditions.

#### Media Architecture

External benchmark observations:
- Cellulose media remains common in standard-duty engine lube filtration.
- Synthetic / fine-fiber media can provide higher efficiency and contaminant capacity while maintaining lower restriction.
- Media choice is an engineering tradeoff and must not be treated as a technology name by itself.

Canonical attributes:
- Media composition
- Efficiency
- Dirt-holding capacity
- Clean ΔP
- Flow capacity
- Temperature compatibility
- Oil compatibility
- Structural support

#### Canonical Industrial Engine Applications

Industrial engine scope may include:
- Stationary diesel generator sets
- Gas-engine generator sets
- Industrial pump drives
- Compressor-drive engines
- Marine auxiliary stationary power units where classified under Industrial & Process
- Fixed process-engine installations
- Emergency / standby power engines
- Prime-power industrial engines

Application classification must be based on the installed industrial duty, not simply on engine manufacturer or displacement.

#### System / Product Configurations

Canonical product configurations:
- Spin-On Full-Flow Lube Filter
- Cartridge Full-Flow Lube Element
- By-Pass / Secondary Lube Filter
- Combination / Two-Stage Lube Filter
- Engine Lube Filter Assembly / Head
- Remote / Auxiliary Oil-Polishing Loop where used

These are PRODUCT / SYSTEM CONFIGURATIONS, not technologies.

#### Pressure and Valve Architecture

Industrial engine records must keep separate:
- Normal lube-system pressure
- Filter housing pressure rating
- Element differential pressure
- Internal bypass-valve opening pressure
- High-pressure relief-valve function

Canonical rule:
Do not confuse engine oil-system pressure with element collapse differential pressure or bypass-valve setpoint.

#### HERMES Inputs — Industrial Engine Oil

Minimum inputs:
- Engine manufacturer
- Engine model
- Industrial application
- Fuel type
- Rated power / duty class
- Lube system configuration
- Full-flow / by-pass / combination requirement
- Oil specification / viscosity grade
- Operating oil temperature
- Cold-start temperature
- Rated oil flow
- Normal lube pressure
- Bypass-valve requirement / setting
- Required filtration efficiency
- Contaminant-capacity target
- Service interval
- Housing / thread / cartridge interface
- OEM part number
- Competitor reference

Expected HERMES logic:
Engine / Application
→ Lube Circuit Architecture
→ Oil / Viscosity
→ Flow / Pressure
→ Efficiency-Capacity-Restriction Balance
→ Full-Flow / By-Pass Configuration
→ Physical Interface
→ OEM / Competitor Cross
→ Candidate Element
→ Validation State

#### Technology-Core Relationship

Parent Industrial & Process core:
TC-LUB-01 — Industrial Lubricant Cleanliness Control

Industrial-engine specialization:
ENG-LUB — Industrial Engine Lube Filtration Capability

Status:
APPLICATION CAPABILITY / NOT A COMMERCIAL TECHNOLOGY NAME.

This specialization is separate by governance from SYNTRAX™.

#### External Benchmark Notes

Donaldson:
- Defines full-flow, by-pass, and two-stage engine lube architectures.
- States that full-flow filtration handles nearly all regulated flow.
- States that by-pass filtration typically handles roughly 5–10% of system flow.
- Emphasizes the required balance among efficiency, capacity, and restriction.
- Highlights cold-flow and bypass behavior as critical engine-protection considerations.
- Offers full-flow and by-pass assemblies with application-specific flow and filtration-performance choices.

MANN+HUMMEL:
- Identifies engine oil filtration as removal of solid particles accumulated in the lubrication circuit from contamination and wear.
- Supplies engine oil filtration solutions in stationary as well as mobile equipment contexts.

#### Closure State — Industrial Engine Oil Filter Elements

- REIKE family existence: CONFIRMED
- REIKE product page: EMPTY / NO USABLE TECHNICAL DATA
- External benchmark research: COMPLETE v1
- Full-flow architecture: COMPLETE v1
- By-pass architecture: COMPLETE v1
- Combination architecture: COMPLETE v1
- Cold-flow / bypass governance: COMPLETE v1
- Technology-core relationship: CLOSED v1
- Commercial technology naming: BLOCKED
- ELIMFILTERS product specification: OPEN
- OEM / competitor mapping: OPEN
- Canonical SKU mapping: OPEN

#### Hydraulic & Lubrication Filtration — Family Closure v1

All six REIKE source families now have an Industrial & Process architecture:

- Lubrication Oil Filter Elements — DECOMPOSED v1
- Industrial Engine Oil Filter Elements — ARCHITECTURE CLOSED v1
- High Temperature Hydraulic Filter Elements — DECOMPOSED v1
- Hydraulic Oil Filter Elements — ARCHITECTURE CLOSED v1
- Power Generation Filtration — ARCHITECTURE CLOSED v1
- OEM Replacement Filter Elements — ARCHITECTURE CLOSED v1

Hydraulic & Lubrication Filtration v1:
- Source-family discovery: COMPLETE
- Canonical architecture: CLOSED v1
- Industrial technology-core discovery: CLOSED v1
- Commercial technology naming: intentionally OPEN / BLOCKED pending validation and portfolio design
- Product-level specification and SKU population: OPEN

Next Industrial & Process source family:
- Industrial Water Filtration Solutions


## 15. Industrial Water Filtration Solutions — External Benchmark Architecture v1

Status: REIKE SOURCE FAMILIES CONFIRMED; ALL SIX PRODUCT PAGES EMPTY; EXTERNAL BENCHMARK ARCHITECTURE COMPLETE; COMMERCIAL TECHNOLOGY NAMES NOT ASSIGNED.

Source condition:
- REIKE lists six families under Industrial Water Filtration Solutions:
  1. PP Melt Blown Filter Cartridges
  2. String Wound Filter Cartridges
  3. Pleated Filter Cartridges
  4. Activated Carbon Filter Cartridges
  5. Reverse Osmosis Membrane Elements
  6. Ultrafiltration Membrane Modules
- The REIKE family pages currently provide no usable technical specification content.
- Therefore no REIKE micron ratings, capacities, rejection rates, flow values, pressure ratings, membrane chemistry, or service-life claims are accepted from these empty pages.

External benchmark basis:
- Pall
- DuPont Water Solutions
- Established industrial cartridge-filtration practice

### 15.1 Canonical Water-Filtration Architecture

Industrial Water Filtration is not a single technology.

Canonical domain:
Industrial & Process
→ Industrial Water Filtration Solutions

Canonical functional layers:
- Depth Particulate Filtration
- Surface / Pleated Particulate Filtration
- Adsorptive Carbon Treatment
- Ultrafiltration
- Reverse Osmosis
- Pretreatment / Protection of Downstream Membranes

Canonical process logic:
Raw / Process Water
→ Coarse / Depth Pretreatment
→ Fine Cartridge Filtration
→ Adsorptive Treatment where required
→ Ultrafiltration where required
→ Reverse Osmosis where required
→ Final Process-Water Quality Target

Not every system uses every stage.

### 15.2 PP Melt Blown Filter Cartridges

Canonical family:
- Polypropylene Melt-Blown Depth Filter

Canonical function:
- Depth Particulate Filtration

Engineering interpretation:
- Graded-density polypropylene depth media captures particulate throughout the media thickness.
- Typical use is pretreatment / clarification rather than final dissolved-contaminant removal.
- Selection must distinguish nominal and absolute retention where available.

Canonical attributes:
- Media: polypropylene
- Depth architecture
- Nominal / absolute micron rating
- OD / ID / length
- Coreless or supported construction
- Flow
- Clean ΔP
- Change-out ΔP
- Dirt-holding capacity
- Temperature
- Chemical compatibility
- End configuration

Technology-core candidate:
TC-WAT-01 — Industrial Depth Particulate Filtration
Status: TECHNOLOGY CORE CANDIDATE / NOT A COMMERCIAL TECHNOLOGY NAME.

### 15.3 String Wound Filter Cartridges

Canonical family:
- String-Wound Depth Filter

Canonical function:
- Depth Particulate Filtration

Engineering interpretation:
- Fibrous yarn is wound around a core to create a controlled depth-filtration structure.
- Performance depends on yarn material, winding pattern, core material, micron grade, fluid compatibility, and differential pressure.
- String-wound cartridges share the same fundamental depth-filtration function as melt-blown elements but use a different construction method.

Canonical attributes:
- Yarn / fiber material
- Core material
- Winding geometry
- Micron rating
- Temperature
- Chemical compatibility
- Flow / ΔP
- Dimensions
- Dirt-holding capacity

Technology relationship:
- Same parent core TC-WAT-01.
- Construction subtype, not a separate technology by default.

### 15.4 Pleated Filter Cartridges

Canonical family:
- Pleated Particulate / Membrane Cartridge

Canonical functions:
- Surface Particulate Filtration
- Pleated Depth Filtration
- Final / membrane filtration depending media

External benchmark evidence from Pall:
- Pleated cartridges are used as prefilters for particulate removal and as membrane filters for final or microbial reduction applications.
- Common pleated media include polypropylene, polyester, glass fiber, polysulfone, PES, PTFE, PVDF, and nylon.
- Support / drainage layers and element cages are used to maintain performance under differential pressure.
- Pall pleated-depth families span approximately 0.8–100 μm, while specific pleated families can be substantially finer.

Canonical rule:
"Pleated" describes geometry / construction, not one universal filtration mechanism.

Technology-core candidates:
TC-WAT-02 — Industrial Pleated Particle Control
Status: TECHNOLOGY CORE CANDIDATE / NOT A COMMERCIAL TECHNOLOGY NAME.

Potential membrane-grade pleated products remain under membrane-specific cores when the media performs true membrane separation.

### 15.5 Activated Carbon Filter Cartridges

Canonical family:
- Activated Carbon Cartridge

Canonical function:
- Adsorptive Water Treatment

Primary target classes:
- Chlorine / oxidant reduction
- Taste / odor compounds where applicable
- Organic contaminant reduction where media and contact time support it
- Protection of downstream membranes from oxidants where applicable

Canonical engineering dimensions:
- Carbon type
- Carbon form: granular / block / composite
- Iodine number / adsorption properties where available
- Chlorine capacity
- Flow
- Empty-bed / contact-time equivalent
- Pressure drop
- Fines release control
- Binder / support materials
- Temperature
- Water chemistry
- Service capacity

Technology-core candidate:
TC-WAT-03 — Industrial Adsorptive Carbon Treatment
Status: TECHNOLOGY CORE CANDIDATE / NOT A COMMERCIAL TECHNOLOGY NAME.

Canonical rule:
Activated carbon treatment is adsorption, not particulate filtration alone.

### 15.6 Reverse Osmosis Membrane Elements

Canonical family:
- Spiral-Wound Reverse Osmosis Membrane Element

Canonical function:
- Dissolved Solids / Ionic Separation

External benchmark evidence from DuPont:
- FilmTec™ RO elements use spiral-wound thin-film composite polyamide membranes.
- Industrial RO is used for process-water treatment and removal / rejection of soluble salts and other dissolved species.
- DuPont publishes product families optimized for high rejection, low-energy operation, brackish water, seawater, and other feed conditions.

Canonical engineering dimensions:
- Membrane chemistry
- Element diameter / length
- Active area
- Feed spacer
- Permeate flow
- Salt rejection
- Test conditions
- Feed pressure
- Recovery
- Feed salinity
- Temperature
- pH range
- Chlorine / oxidant tolerance
- Fouling tendency
- Scaling tendency
- Pretreatment requirement
- Cleaning limits
- Pressure-drop limit

Technology-core candidate:
TC-WAT-04 — Reverse Osmosis Dissolved-Solids Separation
Status: TECHNOLOGY CORE CANDIDATE / NOT A COMMERCIAL TECHNOLOGY NAME.

Critical governance rule:
RO performance values are meaningless without their specified test conditions.

### 15.7 Ultrafiltration Membrane Modules

Canonical family:
- Ultrafiltration Module

Canonical function:
- Colloid / Particulate / Microbial Barrier

External benchmark evidence from DuPont:
- IntegraTec™ / IntegraFlux™ industrial UF modules use PVDF hollow fibers.
- A representative current module uses 0.03 μm nominal pore size.
- DuPont describes UF as separating particulate matter from soluble compounds.
- Key applications include industrial utility water, wastewater reuse, municipal wastewater filtration, and RO/NF pretreatment.
- Pressurized outside-in hollow-fiber designs are used with backwash / air-scour cleaning.

Canonical engineering dimensions:
- Membrane material
- Pore size
- Hollow-fiber or other geometry
- Inside-out / outside-in flow
- Active membrane area
- Design flux
- Transmembrane pressure
- Recovery
- Backwash flux
- Air-scour requirement
- Chemical cleaning protocol
- Temperature
- pH
- Chlorine tolerance
- Feed turbidity / solids tolerance
- Integrity-testing method
- Module dimensions / connection interface

Technology-core candidate:
TC-WAT-05 — Ultrafiltration Membrane Separation
Status: TECHNOLOGY CORE CANDIDATE / NOT A COMMERCIAL TECHNOLOGY NAME.

### 15.8 Canonical Separation Hierarchy

The six REIKE source families collapse into four real physical mechanism groups:

1. Depth Particulate Filtration
   - PP Melt Blown
   - String Wound

2. Pleated Particle / Membrane Filtration
   - Pleated Filter Cartridges

3. Adsorption
   - Activated Carbon

4. Membrane Separation
   - Ultrafiltration
   - Reverse Osmosis

Canonical rule:
Product construction names must not become technology names automatically.

### 15.9 HERMES Inputs — Industrial Water

Minimum input model:
- Water source
- Application
- Feed-water analysis
- Target product-water quality
- Suspended solids
- Turbidity
- Particle-size distribution
- SDI where relevant
- TDS / conductivity
- Hardness
- Silica
- Iron / manganese
- TOC / organics
- Free chlorine / oxidants
- Microbiological load
- Oil / hydrocarbon contamination where applicable
- pH
- Temperature
- Flow
- Operating pressure
- Required recovery
- Required rejection / removal
- Available pretreatment
- Cleaning / CIP constraints
- Housing / vessel interface
- Existing OEM / competitor reference

Expected logic:
Feed Water
→ Contaminant Class
→ Required Separation Mechanism
→ Pretreatment Need
→ Cartridge / Membrane Family
→ Micron / Pore / Rejection Requirement
→ Flow / Pressure / Compatibility
→ Housing / Module Interface
→ Candidate Product
→ Validation State

### 15.10 Canonical Water Product Record

Required fields:
- Canonical Product ID
- Source Manufacturer
- Source SKU
- Product Family
- Filtration Mechanism
- Application
- Feed-Water Type
- Target Contaminant
- Micron Rating
- Nominal / Absolute Rating
- Pore Size
- Removal / Rejection Efficiency
- Salt Rejection
- Permeate Flow
- Design Flux
- Recovery
- Active Area
- Media / Membrane Material
- Core / Support
- Seal Material
- Feed Pressure
- Maximum Differential Pressure
- Transmembrane Pressure
- Clean ΔP
- Change-Out ΔP
- Temperature Range
- pH Range
- Chlorine / Oxidant Tolerance
- Chemical Compatibility
- Dirt-Holding Capacity
- Adsorption Capacity
- Backwash Requirement
- Air-Scour Requirement
- CIP Protocol
- Integrity Test
- Housing / Vessel Interface
- OEM / Competitor Cross
- Source Evidence
- Validation Status
- Technology Core
- ELIMFILTERS Technology
- Canonical SKU

### 15.11 Evidence Governance

Required evidence states:
- SOURCE_ONLY
- EXTERNAL_BENCHMARK
- CROSS_VALIDATED
- TECHNICALLY_VALIDATED
- ELIMFILTERS_APPROVED

Rules:
- REIKE empty pages establish only family existence.
- Pall / DuPont evidence defines external engineering benchmarks, not REIKE specifications.
- No competitor performance value may be copied into an ELIMFILTERS product without product-specific validation.
- RO and UF claims must preserve exact test conditions.
- Activated-carbon performance must preserve water chemistry, flow, and capacity basis.
- Cartridge micron ratings must distinguish nominal, absolute, and beta-rated definitions where applicable.

### 15.12 Technology-Core Summary — Industrial Water

- TC-WAT-01 — Industrial Depth Particulate Filtration
- TC-WAT-02 — Industrial Pleated Particle Control
- TC-WAT-03 — Industrial Adsorptive Carbon Treatment
- TC-WAT-04 — Reverse Osmosis Dissolved-Solids Separation
- TC-WAT-05 — Ultrafiltration Membrane Separation

All five remain internal technology-core candidates.
No commercial ELIMFILTERS technology name is approved.

### 15.13 Industrial Water Filtration — Family Closure v1

- REIKE family discovery: COMPLETE
- REIKE technical product pages: EMPTY
- External benchmark research: COMPLETE v1
- Canonical function architecture: CLOSED v1
- Product-family architecture: CLOSED v1
- Membrane architecture: CLOSED v1
- HERMES selection model: CLOSED v1
- Technology-core discovery: CLOSED v1
- Commercial technology naming: intentionally OPEN / BLOCKED
- Product-level specification and SKU population: OPEN
- OEM / competitor mapping: OPEN

Next Industrial & Process source family:
- Filtration Equipment & Systems


## 16. Filtration Equipment & Systems — External Benchmark Architecture v1

Status: REIKE CATEGORY CONFIRMED BUT PRODUCT PAGE EMPTY; EXTERNAL BENCHMARK ARCHITECTURE COMPLETE; COMMERCIAL TECHNOLOGY NAMES NOT ASSIGNED.

Source condition:
- REIKE lists "Filtration Equipment & Systems" as a top-level Industrial & Process family.
- The REIKE category page currently contains no usable technical subfamily or specification content.
- Therefore no REIKE housing, skid, separator, pressure, flow, material, certification, or system-performance claim is accepted from this empty page.

External benchmark basis:
- Eaton industrial filtration systems and strainers
- Donaldson industrial / hydraulic / bulk-fluid system practice

### 16.1 Canonical Interpretation

Filtration Equipment & Systems is a SYSTEM / EQUIPMENT LAYER, not a filtration technology.

Canonical domain:
Industrial & Process
→ Filtration Equipment & Systems

Its role is to integrate one or more physical separation mechanisms into engineered equipment.

Canonical system families:
- Cartridge Filter Housings
- Bag Filter Housings
- Duplex / Changeover Filter Systems
- Multi-Housing / Manifold Filter Systems
- Hydraulic / Lubrication Filter Assemblies
- Automatic Self-Cleaning Filters
- Manual Pipeline Strainers
- Gas-Liquid Separators
- Oil Purification / Conditioning Systems
- Bulk Fuel / Lube Filtration Systems
- Filtration Skids / Packaged Systems
- Monitoring / Differential-Pressure Instrumentation

Canonical rule:
A housing, skid, separator, manifold, or duplex assembly is not itself a filtration technology. It is equipment that implements one or more filtration functions.

### 16.2 Cartridge Filter Housings

External benchmark evidence from Eaton shows single- and multi-cartridge housings in industrial service with stainless-steel construction, multiple cartridge lengths and connection arrangements, and application-specific pressure / temperature limits.

Canonical attributes:
- Number of cartridges
- Cartridge length
- Cartridge interface / end configuration
- Housing material
- Seal material
- Design pressure
- Maximum operating pressure
- Design / operating temperature
- Connection type
- Closure type
- Vent / drain
- Code / certification requirement
- Flow capacity
- Internal support / restrainer
- Corrosion allowance
- Surface finish where relevant

Canonical rule:
Housing pressure rating and element collapse differential pressure must remain separate fields.

### 16.3 Bag Filter Housings

External benchmark evidence from Eaton identifies:
- Single-bag housings
- Multi-bag housings
- High-flow industrial service
- Stainless steel and other materials
- Multiple closure and connection configurations

Canonical functions:
- Coarse / fine particulate filtration depending bag media
- High-flow industrial liquid filtration

Canonical equipment attributes:
- Bag size / count
- Basket geometry
- Housing material
- Closure design
- Inlet / outlet size
- Flow
- Pressure
- Temperature
- Seal material
- Differential-pressure monitoring
- Code stamp / certification where required

### 16.4 Duplex / Changeover Systems

Eaton's DUOLINE and hydraulic duplex products confirm the canonical architecture of two filter chambers connected through a changeover arrangement to permit continuous operation while one chamber is serviced.

Canonical system function:
- Continuous-Service Filtration

Canonical components:
- Duty housing
- Standby housing
- Changeover valve
- Common inlet / outlet
- Differential-pressure indication
- Isolation / drain / vent
- Service access

Critical rule:
"Duplex" is a SYSTEM CONFIGURATION, not a filtration mechanism.

### 16.5 Multi-Housing / Manifold Systems

External benchmark evidence from Eaton MODULINE shows multiple housings connected through a common manifold to increase total flow capacity.

Canonical function:
- Parallel Capacity Expansion

Canonical attributes:
- Housing count
- Manifold material
- Flow split
- Total system flow
- Pressure-drop distribution
- Expandability
- Isolation strategy
- Footprint
- Drain / vent
- Maintenance access

Critical rule:
Parallelization changes system capacity, not media filtration efficiency.

### 16.6 Hydraulic / Lubrication Filter Assemblies

Eaton's hydraulic and lubrication portfolio confirms system-level configurations including:
- Return-line filters
- Suction filters
- Pressure filters
- Tank-mounted filters
- Inline filters
- Flange-mounted filters
- Manifold-mounted pressure filters
- Air breathers
- Suction strainers
- Single and duplex versions

Canonical rule:
System position is part of equipment architecture and must be stored independently from element media / technology.

### 16.7 Automatic Self-Cleaning Filters

Canonical system function:
- Continuous or semi-continuous solids removal with reduced manual element replacement

Potential cleaning mechanisms:
- Mechanical scraping
- Backwashing
- Internal flushing
- Differential-pressure triggered cleaning

Canonical attributes:
- Cleaning mechanism
- Trigger logic
- Backwash / purge flow
- Waste volume
- Screen / element rating
- System flow
- Pressure loss
- Minimum operating pressure
- Solids loading
- Cleaning cycle
- Automation interface

No commercial ELIMFILTERS technology is assigned at this stage.

### 16.8 Manual Pipeline Strainers

Canonical function:
- Coarse Solids Protection

Typical configurations:
- Basket strainer
- Y-strainer
- Temporary / startup strainer

Canonical attributes:
- Screen opening
- Open-area ratio
- Body material
- Design pressure / temperature
- Connection class
- Blowdown / drain
- Clean / dirty ΔP
- Service fluid

Canonical rule:
A strainer is coarse mechanical protection and must not be conflated with fine cartridge filtration.

### 16.9 Gas-Liquid Separators

Eaton explicitly includes gas-liquid separators in its industrial filtration systems portfolio.

Canonical system function:
- Bulk Gas-Liquid Separation

Potential uses:
- Compressed gas
- Air
- Steam
- Natural gas / process gas depending certified design

Relationship to existing Industrial & Process cores:
- May precede or follow TC-NG-01 Gas-Liquid Coalescence
- May complement TC-NG-02 Gas-Liquid Separation

Canonical rule:
Bulk separator vessel performance and replaceable coalescing / separation element performance must remain separate.

### 16.10 Bulk Fuel / Lube Filtration Systems

Donaldson publishes packaged bulk fuel and lubrication filtration systems with defined:
- Fluid type
- Flow
- Target ISO cleanliness
- Filter efficiency
- Housing working pressure
- Element collapse rating

Canonical architecture:
Storage / Transfer Fluid
→ Pre-Filtration / Water Control as required
→ High-Efficiency Filtration
→ Clean Fluid Transfer
→ Target ISO Cleanliness

Potential applications:
- Bulk diesel
- Lubricants
- Hydraulic oils
- Transmission oils
- Coolants / thin oils where qualified

Relationship:
- Uses TC-LUB-01 / TC-HYD-01 or other fluid-specific cores
- Equipment system itself is not a technology core

### 16.11 Packaged Filtration Skids

Canonical definition:
An engineered skid integrates housings, pumps, valves, instrumentation, piping, controls, and one or more filtration / separation stages.

Minimum skid architecture:
- Inlet isolation
- Pump where required
- Prefilter where required
- Main filtration / separation stage
- Bypass / recirculation logic
- Differential-pressure instrumentation
- Pressure / temperature instrumentation
- Sampling ports
- Drain / vent
- Controls / alarms
- Outlet isolation
- Structural frame / skid

Optional:
- Duplex operation
- Heater
- Cooler
- Vacuum dehydration
- Coalescer / separator
- Water sensor
- Particle counter
- PLC / remote telemetry

Canonical rule:
Skid design is system engineering, not media technology.

### 16.12 Instrumentation / Monitoring

Canonical monitoring fields:
- Inlet pressure
- Outlet pressure
- Differential pressure
- Temperature
- Flow
- Particle count / ISO cleanliness where relevant
- Water content where relevant
- Conductivity / pressure / pH for water systems where relevant
- Alarm setpoints
- Change-out setpoints
- Remote signal type

HERMES should treat instrumentation as part of system qualification and maintenance logic.

### 16.13 Engineering / Code Governance

Industrial filtration equipment may require pressure-vessel, piping, electrical, sanitary, hazardous-area, or regional conformity depending application.

Canonical compliance fields:
- Design code
- Pressure-vessel code / stamp where applicable
- Connection standard
- Material certification
- Welding qualification
- NDE requirement
- Hazardous-area classification
- ATEX / IECEx / NEC requirement where applicable
- Food / sanitary requirement where applicable
- PED / CE / local pressure-equipment requirement where applicable

Rule:
No compliance claim is inherited from a benchmark manufacturer. ELIMFILTERS must validate the exact system design and jurisdiction.

### 16.14 HERMES Inputs — Equipment & Systems

Minimum input model:
- Industry
- Application
- Fluid / gas
- Contaminant
- Required filtration / separation mechanism
- Flow
- Operating pressure
- Design pressure
- Operating temperature
- Design temperature
- Viscosity / density
- Solids loading
- Required micron / beta / removal efficiency
- Continuous-service requirement
- Redundancy requirement
- Number of filtration stages
- Housing / element family
- Material compatibility
- Corrosion requirement
- Connection standard
- Code / certification requirement
- Footprint / installation constraints
- Power availability
- Automation requirement
- Monitoring requirement
- Drain / waste handling requirement

Expected logic:
Process Duty
→ Separation Function
→ Element / Media Technology
→ Housing Type
→ Single / Duplex / Parallel Architecture
→ Pressure / Temperature Class
→ Materials
→ Instrumentation
→ Code / Certification
→ Packaged System Configuration
→ Validation State

### 16.15 Canonical Equipment Record

Required fields:
- Canonical Equipment ID
- Equipment Family
- System Configuration
- Filtration Function
- Compatible Technology Core
- Housing / Vessel Material
- Number of Elements / Bags
- Element / Bag Size
- Rated Flow
- Design Pressure
- MAWP
- Test Pressure
- Operating Temperature
- Design Temperature
- Connection Type / Class
- Seal Material
- Closure Type
- Bypass / Changeover Arrangement
- Clean ΔP
- Terminal ΔP
- Instrumentation
- Alarm Setpoints
- Drain / Vent
- Code / Certification
- Hazardous-Area Classification
- Weight
- Footprint
- Service Access Requirement
- Source Evidence
- Validation Status

### 16.16 Technology-Core Relationship

Filtration Equipment & Systems does not create a new media technology core by itself.

It consumes previously discovered mechanism cores such as:
- TC-NG-01 — Gas-Liquid Coalescence
- TC-NG-02 — Gas-Liquid Separation
- TC-LUB-01 — Industrial Lubricant Cleanliness Control
- TC-HYD-01 — Industrial Hydraulic Contamination Control
- TC-WAT-01 — Industrial Depth Particulate Filtration
- TC-WAT-02 — Industrial Pleated Particle Control
- TC-WAT-03 — Industrial Adsorptive Carbon Treatment
- TC-WAT-04 — Reverse Osmosis Dissolved-Solids Separation
- TC-WAT-05 — Ultrafiltration Membrane Separation

System-level capability classes may later be branded, but only after portfolio and engineering validation.

### 16.17 Filtration Equipment & Systems — Family Closure v1

- REIKE category existence: CONFIRMED
- REIKE technical content: EMPTY
- External benchmark research: COMPLETE v1
- Housing architecture: CLOSED v1
- Duplex / continuous-service architecture: CLOSED v1
- Parallel / manifold architecture: CLOSED v1
- Strainer architecture: CLOSED v1
- Gas-liquid separator architecture: CLOSED v1
- Bulk-fluid system architecture: CLOSED v1
- Packaged skid architecture: CLOSED v1
- Instrumentation architecture: CLOSED v1
- Compliance / code governance: CLOSED v1
- Technology-core relationship: CLOSED v1
- Commercial technology naming: intentionally OPEN / BLOCKED
- Product-level specification and SKU population: OPEN
- OEM / competitor mapping: OPEN

Industrial & Process status after this closure:
- Natural Gas Filtration: CLOSED v1
- Hydraulic & Lubrication Filtration: CLOSED v1
- Industrial Water Filtration Solutions: CLOSED v1
- Filtration Equipment & Systems: CLOSED v1
- Air Filtration Solutions: OPEN
- Additive Manufacturing Filtration Solutions: OPEN


## 17. Air Filtration Solutions — Source Discovery v0.1

Status: SOURCE FAMILY DISCOVERY COMPLETE; TECHNICAL DECOMPOSITION PENDING.

Primary source:
- Xinxiang Filter / REIKE
- Source category: Air Filtration Solutions
- Source site: http://www.rkfilter.com/

### 17.1 Source Families Observed

REIKE currently exposes five source families under Air Filtration Solutions:

1. Cleanroom & HVAC Air Filtration
2. Semiconductor & Photovoltaic Manufacturing Filter
3. Aviation Air Filtration
4. Laser Cutting Dust Filtration
5. Welding Fume Extraction Filtration

Repeated supplier-level commercial attributes:
- Safe & Reliable
- Long-term Stable
- Custom Filter Manufacturer

These remain SOURCE / MANUFACTURER-DECLARED and are not canonical ELIMFILTERS performance claims.

### 17.2 Initial Canonical Interpretation

The REIKE source menu mixes application sectors, filtration environments, and dust/fume-control use cases.

Therefore the source family labels MUST NOT be converted one-to-one into ELIMFILTERS technology names.

Preliminary normalization:

- Cleanroom & HVAC Air Filtration
  - application / environment family
  - likely functions: particulate air filtration, high-efficiency air filtration, cleanroom contamination control
  - technical decomposition pending source or benchmark evidence

- Semiconductor & Photovoltaic Manufacturing Filter
  - industry / process application family
  - likely functions: high-purity air contamination control, process-environment particulate control
  - semiconductor and photovoltaic applications must remain separate application dimensions even if they share filter constructions

- Aviation Air Filtration
  - application family
  - exact scope must be verified before canonicalization
  - do not assume cabin, avionics, engine intake, ground support, or process-air duty without source evidence

- Laser Cutting Dust Filtration
  - application family
  - likely function: particulate / fume extraction from laser-cutting processes
  - likely system relationship: dust collector / extraction system
  - technical decomposition pending

- Welding Fume Extraction Filtration
  - application family
  - likely function: welding-fume and particulate extraction
  - technical decomposition pending

### 17.3 Taxonomy Rule

Air Filtration Solutions must separate:

Industry / Environment
→ Process / Application
→ Contaminant
→ Filtration Function
→ Product Configuration
→ Media / Mechanism
→ Performance
→ System Configuration

Examples:
- Cleanroom is an ENVIRONMENT / APPLICATION.
- Semiconductor manufacturing is an INDUSTRY / PROCESS APPLICATION.
- Laser cutting is a PROCESS APPLICATION.
- Welding fume is a CONTAMINANT / PROCESS-EMISSION context.
- HEPA, depth filtration, surface filtration, pulse-jet cleaning, antistatic media, flame-retardant media, or high-temperature media are technical mechanisms / capabilities only when supported by evidence.

### 17.4 Industrial Technology Separation

Existing ELIMFILTERS On-Road / Off-Road air technologies are not inherited automatically by Industrial & Process.

Industrial & Process Air Filtration starts with no assigned commercial ELIMFILTERS technology.

Any new industrial air technology must satisfy the existing Technology Naming Gate:
1. Distinct physical mechanism
2. Measurable technical benefit
3. Verifiable performance evidence
4. Repeatable use across a meaningful product/application family

### 17.5 Required Technical Extraction Sequence

Recommended order:

1. Cleanroom & HVAC Air Filtration
2. Semiconductor & Photovoltaic Manufacturing Filter
3. Laser Cutting Dust Filtration
4. Welding Fume Extraction Filtration
5. Aviation Air Filtration

For each family, capture:
- Source product name
- Application / industry
- Air stream type
- Contaminant type
- Particle-size range
- Filtration efficiency
- Filter class / rating
- Test standard
- Rated flow
- Face velocity
- Initial ΔP
- Final / terminal ΔP
- Media
- Support / frame
- Seal / gasket
- Temperature
- Humidity
- Chemical compatibility
- Antistatic capability
- Flame-retardant capability
- High-temperature capability
- Cleaning / pulse-jet compatibility
- Regenerable / disposable
- Housing / collector compatibility
- OEM / competitor cross
- Source claim status
- Validation status

### 17.6 Current Closure State

Air Filtration Solutions:
- Source category discovery: COMPLETE
- Five REIKE source families identified: COMPLETE
- Canonical technical architecture: OPEN
- Technology-core discovery: OPEN
- Commercial technology naming: BLOCKED pending technical evidence
- Product-level specification: OPEN
- OEM / competitor mapping: OPEN

Next source family:
- Cleanroom & HVAC Air Filtration


### 17.7 Cleanroom & HVAC Air Filtration — Architecture v1

Status: SOURCE FAMILY STRUCTURE CONFIRMED; TECHNICAL CLASSIFICATION BENCHMARKED; COMMERCIAL TECHNOLOGY NAMES NOT ASSIGNED.

Source condition:
- REIKE exposes the following subfamilies:
  1. Ultra-Low Penetration Air (ULPA) Filter
  2. HEPA Filter
  3. EPA Air Filters (E10–E12) for HVAC Systems
  4. Medium Efficiency Air Filters for HVAC Systems
  5. Pre-Filters (G3-G4) for HVAC Systems
- REIKE repeats supplier-level claims of safe/reliable, long-term stable, and custom filter manufacturing.
- No REIKE test reports, efficiencies, pressure-drop curves, media construction, dimensions, or standards evidence were supplied in the source text.

#### Canonical Interpretation

Cleanroom & HVAC Air Filtration spans two distinct technical regimes:

1. General Ventilation / HVAC Filtration
2. High-Efficiency / Cleanroom Filtration

These regimes MUST remain separate in ELIMFILTERS because they use different classification and test frameworks.

#### General Ventilation / HVAC

Canonical functions:
- Coarse Prefiltration
- General Ventilation Particle Filtration
- Fine HVAC Particle Filtration

Current international benchmark:
- ISO 16890 classification based on particulate-matter efficiency (ePM)
- ISO 16890-2 covers fractional efficiency and air-flow resistance
- ISO 16890-3 covers gravimetric efficiency and resistance versus captured dust mass
- ISO 16890-4 covers conditioning for minimum fractional efficiency

Governance:
- Legacy G3/G4 and other EN 779 labels may appear in source data or installed-base references.
- Legacy classes MUST be stored as source / legacy classification, not as the primary canonical modern classification.
- Canonical modern HVAC records should prefer ISO 16890 ePM classification when verified.

Important standards boundary:
ISO 16890 applies to general-ventilation particulate filters up to the scope limits defined by the standard. Higher-efficiency filters above that range are evaluated under high-efficiency filter standards such as ISO 29463.

#### High-Efficiency / Cleanroom

Canonical functions:
- EPA High-Efficiency Particle Filtration
- HEPA High-Efficiency Particle Filtration
- ULPA Ultra-High-Efficiency Particle Filtration

Primary international benchmark:
- ISO 29463-1:2024 — classification, performance, testing, and marking of high-efficiency air filters
- ISO 29463 classification is based on measured filter performance with the related ISO 29463 test methods
- The ISO 29463 series uses particle-counting methods and MPPS-based performance concepts for high-efficiency filters

Source mapping:
- REIKE "EPA E10–E12" → preserve as source classification pending exact standard / test evidence
- REIKE "HEPA Filter" → high-efficiency filter family; exact class must be verified
- REIKE "ULPA Filter" → ultra-high-efficiency family; exact class must be verified

Rule:
The words EPA, HEPA, and ULPA are insufficient by themselves for ELIMFILTERS approval. Each product must carry:
- exact class
- exact test standard / edition
- overall efficiency
- local efficiency / leak-test requirement where applicable
- MPPS test condition
- rated airflow
- initial pressure drop
- final / terminal pressure drop
- dimensions
- media / frame / seal construction

#### Provisional Technology Cores

TC-AIR-01 — Industrial General Ventilation Particle Control
Status: TECHNOLOGY CORE CANDIDATE / NOT A COMMERCIAL TECHNOLOGY NAME.

Scope:
- Prefilters
- Medium / fine HVAC filters
- ISO 16890 ePM-based classification

TC-AIR-02 — Industrial High-Efficiency Air Filtration
Status: TECHNOLOGY CORE CANDIDATE / NOT A COMMERCIAL TECHNOLOGY NAME.

Scope:
- EPA / HEPA / ULPA high-efficiency particulate filtration
- ISO 29463 / equivalent validated classification
- Cleanroom and critical-environment protection

These two cores are separate because general ventilation and cleanroom/high-efficiency filtration have materially different test standards, efficiency regimes, leakage requirements, and application consequences.

#### Cleanroom / HVAC Product Configurations

Canonical configurations may include:
- Panel Prefilter
- Pleated HVAC Filter
- Pocket / Bag Filter
- Compact / V-Bank Filter
- HEPA Panel Filter
- HEPA Terminal Filter
- ULPA Terminal Filter
- Fan Filter Unit (FFU) filter module where applicable
- High-temperature HEPA where independently qualified
- Gel-seal / gasket-seal terminal filters where applicable

Configuration labels are not technology names.

#### HERMES Inputs — Cleanroom & HVAC

Minimum inputs:
- Application / room type
- Required cleanliness objective
- Filter stage
- Existing classification system
- Required ISO 16890 ePM class OR high-efficiency class
- Rated airflow
- Face velocity
- Initial ΔP
- Terminal ΔP
- Available fan static pressure
- Temperature
- Relative humidity
- Chemical environment
- Frame material
- Seal / gasket type
- Fire / smoke requirement
- Installation interface
- Leak-test requirement
- Scan-test requirement
- OEM / competitor reference

Expected logic:
Application
→ Filtration Stage
→ General HVAC or High-Efficiency Regime
→ Required Standard / Class
→ Flow / ΔP Envelope
→ Media / Construction
→ Seal / Frame / Installation
→ Candidate Filter
→ Validation State

#### Evidence and Classification Governance

Required fields:
- Source Classification
- Canonical Classification
- Standard
- Standard Edition
- Efficiency Metric
- Overall Efficiency
- Local Efficiency
- MPPS
- Rated Airflow
- Initial ΔP
- Final ΔP
- Leak-Test Method
- Source Evidence
- Validation Status

Rules:
- Do not convert G3/G4 directly to ISO 16890 without evidence.
- Do not convert E10–E12, HEPA, or ULPA labels into exact ISO 29463 classes without product test data.
- Do not infer MERV, EN 779, ISO 16890, EN 1822, or ISO 29463 equivalence from a marketing label alone.
- A class conversion may only be stored when it is supported by the applicable test standard / product evidence.

#### Closure State — Cleanroom & HVAC Air Filtration

- REIKE family discovery: COMPLETE
- Five source subfamilies: COMPLETE
- General-HVAC architecture: CLOSED v1
- High-efficiency architecture: CLOSED v1
- Standards architecture: CLOSED v1
- Technology-core discovery: CLOSED v1
- REIKE product-level performance validation: OPEN
- Commercial technology naming: BLOCKED
- SKU / OEM mapping: OPEN

Next Air Filtration source family:
- Semiconductor & Photovoltaic Manufacturing Filter


### 17.8 Semiconductor & Photovoltaic Manufacturing Filter — Architecture v1

Status: SOURCE PRODUCT SET CONFIRMED; APPLICATION ARCHITECTURE BENCHMARKED; COMMERCIAL TECHNOLOGY NAMES NOT ASSIGNED.

Source condition:
REIKE exposes three products under Semiconductor & Photovoltaic Manufacturing Filter:
1. Alumina Powder Filter Cartridge
2. H13-H14 Grade HEPA Filters
3. F8-F9 Grade Medium Efficiency Air Filters

The source text provides product-family names but no test reports, pressure-drop curves, dimensions, media specifications, service-life data, or validated standards evidence.

#### Canonical Interpretation

Semiconductor & Photovoltaic Manufacturing is an INDUSTRY / PROCESS APPLICATION layer, not a filtration mechanism.

Canonical domain:
Industrial & Process
→ Air Filtration Solutions
→ Electronics / Semiconductor / Photovoltaic Manufacturing

This application can consume multiple technical mechanisms:
- General ventilation / prefiltration
- High-efficiency HEPA / ULPA filtration
- Process dust capture
- Airborne molecular contamination (AMC) control
- Process exhaust filtration
- Tool-level air filtration

The REIKE family itself confirms only the first three source products listed above. AMC and other process-control functions are external benchmark architecture and must not be represented as REIKE claims.

#### Cleanroom / Particle-Control Architecture

Primary cleanroom benchmark:
- ISO 14644-1:2015 classifies air cleanliness by airborne particle concentration.
- The standard covers cumulative particle populations in the 0.1 μm to 5 μm range for classification purposes.
- ISO 14644-2 governs monitoring plans for cleanroom performance related to airborne particle concentration.

External semiconductor benchmark:
- Established semiconductor cleanroom systems use prefilters, HEPA / ULPA filters, and tool-level filtration.
- Semiconductor fabs may require very high particle cleanliness levels, including ISO Class 1 in advanced applications.
- High-efficiency cleanroom filters are typically installed in terminal, recirculation, make-up air, or process-tool positions depending facility architecture.

Canonical rule:
The required cleanroom class belongs to the APPLICATION / ENVIRONMENT record.
The HEPA / ULPA class belongs to the FILTER PRODUCT record.
These two classifications must not be conflated.

#### High-Efficiency Filter Architecture

REIKE source:
- H13-H14 Grade HEPA Filters

Canonical function:
- High-Efficiency Particle Filtration

Parent core:
TC-AIR-02 — Industrial High-Efficiency Air Filtration

External benchmark:
- ISO 29463 provides the high-efficiency filter classification / testing framework.
- ISO 29463-5 specifies filter-element efficiency testing at MPPS.
- Semiconductor cleanroom panels commonly use mini-pleat glass-fiber or membrane media and require controlled sealing and leakage verification.

Required product attributes:
- Exact source class
- Canonical standard / class
- MPPS efficiency
- Overall efficiency
- Local efficiency / leak test
- Rated airflow
- Initial ΔP
- Final ΔP
- Face velocity
- Media
- Frame
- Separator
- Seal / gasket / gel
- Outgassing characteristics where relevant
- Temperature / humidity limits

Governance:
REIKE's "H13-H14" wording is preserved as SOURCE CLASSIFICATION until exact standard and test evidence are available.

#### Medium-Efficiency Prefiltration

REIKE source:
- F8-F9 Grade Medium Efficiency Air Filters

Canonical function:
- General Ventilation / Prefiltration

Parent core:
TC-AIR-01 — Industrial General Ventilation Particle Control

Canonical role:
- Protect downstream HEPA / ULPA stages
- Reduce particulate loading
- Extend final-filter service life
- Support make-up / recirculation air cleanliness

Governance:
F8-F9 is a legacy/source classification label. It must not be converted automatically to ISO 16890 ePM classes without verified test data.

#### Alumina Powder Filter Cartridge

REIKE source:
- Alumina Powder Filter Cartridge

Canonical interpretation:
- Process Dust Filtration
- Powder Capture / Dust Collector Cartridge

Application context:
- Powder-handling / material-processing environment associated by REIKE with semiconductor and photovoltaic manufacturing

Important boundary:
The source provides no technical data proving exact particle size, efficiency, antistatic design, flame resistance, media, cleaning method, or collector type.

Therefore the following remain OPEN:
- whether the cartridge is pulse-jet cleanable
- whether it uses conductive / antistatic media
- whether it is surface-loaded or depth-loaded
- exact micron / efficiency performance
- dust explosibility / hazardous-area requirements
- exact alumina process step

Canonical attributes required:
- Dust type
- Particle-size distribution
- Dust loading
- Abrasiveness
- Hygroscopicity
- Combustibility / explosibility
- Required efficiency
- Media
- Surface treatment
- Antistatic capability
- Flame-retardant capability
- Cleaning method
- Pulse pressure
- Face velocity / air-to-cloth ratio
- Initial / terminal ΔP
- Cartridge dimensions
- End-cap / mounting geometry
- Collector interface
- Temperature
- Humidity

#### Semiconductor-Specific Contamination Architecture

External benchmark evidence shows semiconductor filtration must distinguish two contamination classes:

1. Airborne Particulate Contamination
   - controlled by prefilters, HEPA / ULPA, tool filters, and cleanroom airflow systems

2. Airborne Molecular Contamination (AMC)
   - acids
   - bases
   - organics
   - dopants / molecular contaminants
   - requires molecular / adsorptive filtration, not HEPA alone

Canonical rule:
HEPA / ULPA filtration and AMC filtration are different mechanisms and MUST remain separate in the taxonomy.

Potential future technology core:
TC-AIR-03 — Industrial Molecular Air Contamination Control
Status: TECHNOLOGY CORE CANDIDATE / NOT A COMMERCIAL TECHNOLOGY NAME.

This core is introduced from external benchmark research, not from the current REIKE product list, and requires further dedicated source research before closure.

#### Photovoltaic Manufacturing

External electronics / optics benchmark includes solar-panel manufacturing within high-cleanliness electronics production.

Canonical application contexts may include:
- Clean manufacturing areas
- Make-up air
- Recirculation air
- Process equipment
- Exhaust air
- Powder / material handling

Canonical rule:
Photovoltaic manufacturing must remain a separate application dimension from semiconductor manufacturing even where filter technologies overlap.

#### Low-Outgassing / Material Compatibility

External semiconductor benchmark identifies low-outgassing filter construction as important because adhesives, media, and filter materials can themselves introduce molecular contamination.

Canonical capability attributes:
- Low-outgassing construction
- Boron-free / contaminant-controlled materials where application requires
- Seal integrity
- Particle shedding
- Chemical compatibility

These are CAPABILITIES, not standalone technologies.

#### HERMES Inputs — Semiconductor / Photovoltaic Air

Minimum inputs:
- Industry: semiconductor / photovoltaic
- Process step
- Cleanroom / process-tool location
- Required ISO 14644 cleanliness class
- Contaminant class: particle / molecular / process dust
- Particle-size distribution
- AMC target species where relevant
- Rated airflow
- Face velocity
- Initial / final ΔP
- Temperature
- Humidity
- Outgassing requirement
- Seal / leak-test requirement
- Filter stage
- Exhaust / recirculation / make-up-air position
- Dust loading where process dust is present
- Antistatic / flame-retardant requirement
- Collector / housing interface
- OEM / competitor reference

Expected logic:
Process Application
→ Contaminant Class
→ Cleanroom / Exhaust / Dust-Control Position
→ Required Filtration Mechanism
→ Standard / Class
→ Flow / ΔP
→ Media / Materials / Seal
→ Special Capability
→ Candidate Product
→ Validation State

#### Technology-Core Relationship

Confirmed parent cores:
- TC-AIR-01 — Industrial General Ventilation Particle Control
- TC-AIR-02 — Industrial High-Efficiency Air Filtration

New candidate from external benchmark:
- TC-AIR-03 — Industrial Molecular Air Contamination Control

Process-dust treatment for alumina powder remains under further evaluation before deciding whether it reuses a general Industrial Dust core discovered in Laser Cutting / Welding / Additive Manufacturing or requires a specialized branch.

#### Closure State — Semiconductor & Photovoltaic Manufacturing Filter

- REIKE source product discovery: COMPLETE
- Alumina Powder Filter Cartridge: SOURCE IDENTIFIED / TECHNICAL DATA OPEN
- H13-H14 HEPA family: ARCHITECTURE CLOSED v1 / PRODUCT VALIDATION OPEN
- F8-F9 medium-efficiency family: ARCHITECTURE CLOSED v1 / PRODUCT VALIDATION OPEN
- Semiconductor cleanroom architecture: CLOSED v1
- Photovoltaic application architecture: CLOSED v1
- AMC architecture: IDENTIFIED / FURTHER RESEARCH REQUIRED
- Technology-core relationship: CLOSED v1
- Commercial technology naming: BLOCKED
- OEM / SKU mapping: OPEN

Next Air Filtration source family:
- Laser Cutting Dust Filtration


### 17.9 Aviation Air Filtration — Architecture v1

Status: REIKE SOURCE PRODUCT SET CONFIRMED; EXTERNAL AEROSPACE BENCHMARK ARCHITECTURE COMPLETE; COMMERCIAL TECHNOLOGY NAMES NOT ASSIGNED.

Source condition:
REIKE exposes seven aviation-air products:
1. Avionics Bay Pre-filter
2. Cabin HEPA Filter
3. Cabin Panel HEPA Filter
4. Avionics Bay Water Removal Cartridge
5. NGS Filter Cartridge
6. NGS Ozone Removal Cartridge
7. NGS Water Removal Cartridge

Repeated supplier claims:
- Safe & Reliable
- Long-term Stable
- Custom Filter Manufacturer

No source-level technical performance, dimensions, certification, pressure-drop, service-life, or aircraft-eligibility evidence was provided in the extracted page text.

#### Canonical Interpretation

Aviation Air Filtration is an APPLICATION / SYSTEM domain and contains several physically distinct functions.

Canonical domain:
Industrial & Process
→ Air Filtration Solutions
→ Aviation Air Filtration

Canonical aerospace air-treatment functions:
- Cabin High-Efficiency Particle Filtration
- Avionics Cooling Air Particulate Filtration
- Avionics Cooling Air Water Removal
- NGS Particulate / Aerosol Pretreatment
- NGS Water Removal
- NGS Ozone Destruction
- Optional VOC / Molecular Contaminant Adsorption where validated

These functions MUST remain separate in the taxonomy.

#### Cabin Air Filtration

REIKE source products:
- Cabin HEPA Filter
- Cabin Panel HEPA Filter

Canonical function:
- Cabin Recirculation High-Efficiency Particle Filtration

External benchmark:
Pall Aerospace confirms that cabin-air filters are installed in recirculation ducting and that HEPA filtration is used in commercial-aircraft cabin systems.

Canonical attributes:
- Aircraft platform
- Cabin / cockpit location
- HEPA class / test basis
- Overall efficiency
- Local efficiency / leak test where applicable
- Rated airflow
- Initial / terminal ΔP
- Dirt-holding capacity
- Media
- Frame
- Seal / gasket
- Weight
- Service interval
- Fire / smoke requirement
- OEM approval / aircraft eligibility

Critical rule:
Aviation HEPA approval is application-specific. A generic HEPA class does not establish airworthiness or installation eligibility.

#### Avionics Bay Filtration

REIKE source products:
- Avionics Bay Pre-filter
- Avionics Bay Water Removal Cartridge

Canonical functions:
- Avionics Cooling Air Particulate Control
- Avionics Cooling Air Water Separation

External benchmark:
Pall Aerospace identifies avionics cooling as requiring dry, contamination-controlled cooling air and documents particulate filtration plus water separation for avionics / E-E cooling systems.

Canonical attributes:
- Aircraft platform
- Cooling-system location
- Particle filtration requirement
- Water-removal requirement
- Flow
- ΔP
- Moisture load
- Hydrophobic capability
- Separation mechanism
- Temperature
- Housing / panel interface
- Service / cleaning requirement
- OEM approval state

Technology-core relationship:
- Particulate stage may reuse TC-AIR-01 or TC-AIR-02 depending actual efficiency regime.
- Water removal is a separate physical function and must not be treated as HEPA filtration.

Potential internal function core:
TC-AIR-04 — Aviation Air Water Separation
Status: FUNCTION CORE CANDIDATE / NOT A COMMERCIAL TECHNOLOGY NAME.

#### Nitrogen Generation System (NGS)

REIKE source products:
- NGS Filter Cartridge
- NGS Ozone Removal Cartridge
- NGS Water Removal Cartridge

External benchmark confirms NGS means Nitrogen Generating System in commercial aircraft. Pall identifies NGS filtration as protecting the Air Separation Module (ASM) from particulate, oil / water mist, ozone, and in advanced configurations VOC contamination.

Canonical NGS process:
Bleed Air
→ Particulate / Aerosol Pretreatment
→ Water Removal
→ Ozone Destruction
→ Optional VOC Adsorption
→ Air Separation Module (ASM)

The exact sequence may vary by aircraft / system design.

Canonical NGS functions:
- Particulate Filtration
- Oil / Water Aerosol Control
- Bulk Water Removal
- Ozone Catalytic Destruction
- VOC Adsorption where required

#### NGS Ozone Removal

REIKE source:
- NGS Ozone Removal Cartridge

Canonical function:
- Ozone Destruction / Catalytic Gas Treatment

External benchmark:
Pall documents aircraft NGS prefiltration with an ozone-catalyst stage and states that ozone can damage ASM membrane performance.

Potential technology core:
TC-AIR-05 — Industrial / Aerospace Ozone Destruction
Status: TECHNOLOGY CORE CANDIDATE / NOT A COMMERCIAL TECHNOLOGY NAME.

Canonical attributes:
- Ozone inlet concentration
- Ozone removal / destruction efficiency
- Rated flow
- Pressure
- Temperature
- Catalyst media
- Pressure drop
- Life / exposure capacity
- Contaminant tolerance
- Aircraft qualification / approval

#### NGS Water Removal

REIKE source:
- NGS Water Removal Cartridge

Canonical function:
- Moisture / Liquid Water Removal from NGS feed air

Potential relationship:
- May reuse TC-AIR-04 if the physical separation mechanism is equivalent.
- Must remain unmerged until source data confirms whether the cartridge is coalescing, hydrophobic, inertial, or another mechanism.

#### NGS Filter Cartridge

REIKE source:
- NGS Filter Cartridge

Canonical provisional function:
- NGS Feed-Air Contamination Control

Technical scope remains OPEN because the source page name alone does not prove whether it performs particulate-only, coalescing, oil-mist, or multi-stage filtration.

Required evidence:
- contaminants removed
- filtration efficiency
- media
- flow
- pressure
- temperature
- ΔP
- separation mechanism
- aircraft / ASM interface

#### Molecular / VOC Treatment

External benchmark:
Pall documents advanced NGS prefiltration that adds carbon adsorption for VOC removal alongside ozone treatment.

Canonical rule:
VOC adsorption is MOLECULAR AIR TREATMENT and must remain separate from particulate filtration and ozone catalysis.

Potential relationship:
- may reuse TC-AIR-03 — Industrial Molecular Air Contamination Control
- exact aerospace specialization remains to be validated

#### Airworthiness / Approval Governance

Aviation products require a stricter governance layer than ordinary Industrial & Process products.

Canonical approval fields:
- Aircraft Manufacturer
- Aircraft Model
- ATA Chapter / System
- OEM Part Number
- Approved Replacement Part Number
- TSO / TSOA applicability where relevant
- PMA applicability where relevant
- STC applicability where relevant
- EASA approval / eligibility where relevant
- Form-Fit-Function evidence
- Airworthiness limitation
- Installation approval state

FAA governance note:
A TSO Authorization establishes that an article meets a minimum performance standard and authorizes manufacture; it does not by itself approve installation on a specific aircraft.

Critical rule:
No ELIMFILTERS aviation product may be represented as aircraft-approved solely from dimensional or filtration equivalence.

#### HERMES Inputs — Aviation Air

Minimum inputs:
- Aircraft manufacturer
- Aircraft model / series
- Aircraft system
- ATA chapter
- Application: cabin / avionics / NGS
- OEM part number
- Required filtration / separation function
- Contaminant type
- Rated airflow
- Operating pressure
- Temperature
- Initial / terminal ΔP
- Moisture load
- Ozone load
- VOC requirement
- HEPA / efficiency requirement
- Weight / envelope
- Housing / interface
- Certification / approval requirement
- Existing approval basis

Expected logic:
Aircraft Platform
→ System / ATA
→ Application
→ Contaminant
→ Required Physical Function
→ Performance / Flow / ΔP
→ Interface
→ Approval Basis
→ Candidate Product
→ Airworthiness Validation State

#### Technology-Core Summary — Aviation Air

Existing parent cores:
- TC-AIR-01 — Industrial General Ventilation Particle Control
- TC-AIR-02 — Industrial High-Efficiency Air Filtration
- TC-AIR-03 — Industrial Molecular Air Contamination Control

New candidates:
- TC-AIR-04 — Aviation Air Water Separation
- TC-AIR-05 — Industrial / Aerospace Ozone Destruction

All remain internal candidates.
No commercial ELIMFILTERS technology name is approved.

#### Closure State — Aviation Air Filtration

- REIKE source product discovery: COMPLETE
- Cabin HEPA architecture: CLOSED v1
- Avionics cooling filtration architecture: CLOSED v1
- Avionics water-removal architecture: CLOSED v1
- NGS architecture: CLOSED v1
- Ozone-destruction architecture: CLOSED v1
- Molecular / VOC relationship: IDENTIFIED
- Aviation approval governance: CLOSED v1
- Product-level REIKE validation: OPEN
- Aircraft eligibility / certification mapping: OPEN
- Commercial technology naming: BLOCKED

Next Air Filtration source family:
- Laser Cutting Dust Filtration


### 17.10 Laser Cutting Dust Filtration — Architecture v1

Status: REIKE SOURCE PRODUCT SET CONFIRMED; EXTERNAL DUST-COLLECTION BENCHMARK ARCHITECTURE COMPLETE; COMMERCIAL TECHNOLOGY NAMES NOT ASSIGNED.

Source condition:
REIKE exposes four source products:
1. High-Temp Filter Cartridge
2. Flame Retardant & Anti-Static Filter Cartridge
3. Cylindrical Filter Cartridge
4. Dust Filter Cartridge

Repeated supplier claims:
- Safe & Reliable
- Long-term Stable
- Custom Filter Manufacturer

The source page provides product-family names but no validated media composition, efficiency, airflow, pressure-drop, temperature, conductivity, flame-retardance, collector-interface, or safety-standard evidence.

#### Canonical Interpretation

Laser Cutting Dust Filtration is a PROCESS APPLICATION domain, not a filtration technology.

Canonical domain:
Industrial & Process
→ Air Filtration Solutions
→ Laser Cutting Dust Filtration

Primary physical function:
- Fine Dry Particulate / Fume Capture

System function:
- Source Capture
- Dust Collection
- Surface Filtration
- Pulse-Jet Cleaning where applicable
- Safe handling of thermally generated and potentially combustible particulate

#### Process Hazard / Particle Architecture

External benchmark from Donaldson and Camfil shows that laser and plasma cutting generate very fine thermally generated particulate and fumes, including sub-micron particles.

Canonical contaminant dimensions:
- Material being cut
- Alloy composition
- Particle-size distribution
- Fine / sub-micron fraction
- Dust loading
- Spark generation
- Combustibility / explosibility
- Toxic-metal content
- Hygroscopic / agglomerative behavior

Canonical rule:
Filter selection must be based on the actual cut material and process duty. Carbon steel, stainless steel, aluminum, ceramics, plastics, and other materials may create materially different dust, fume, fire, toxicity, and explosion hazards.

#### Surface-Loading Media

External benchmark:
Donaldson recommends high-efficiency cartridge collectors with surface-loading fine-fiber media for fine thermal-cutting particulate. Camfil similarly recommends nanofiber surface filtration for laser-cutting dust, noting that this helps keep fine dust near the media surface and improves pulse-cleaning behavior.

Canonical function:
- Surface-Loading Fine Particle Filtration

Potential technology core:
TC-DUST-01 — Industrial Surface-Loading Fine Dust Filtration
Status: TECHNOLOGY CORE CANDIDATE / NOT A COMMERCIAL TECHNOLOGY NAME.

Engineering attributes:
- Base substrate
- Fine-fiber / nanofiber layer
- Membrane / surface treatment
- Particle efficiency
- Dust release
- Pulse-cleaning compatibility
- Air permeability
- Initial ΔP
- Stable operating ΔP
- Dust-holding behavior
- Abrasion resistance
- Moisture resistance

#### Flame-Retardant / Anti-Static Cartridge

REIKE source:
- Flame Retardant & Anti-Static Filter Cartridge

Canonical capabilities:
- Flame-Retardant Media
- Static-Charge Dissipation

External benchmark:
Donaldson and Camfil publish conductive / anti-static and flame-retardant media for industrial dust collection, particularly where combustible dust and static buildup may create ignition risk.

Canonical rule:
Flame retardancy and antistatic behavior are CAPABILITIES, not standalone filtration mechanisms.

Required attributes:
- Media flame-retardant qualification
- Surface / volume resistivity
- Grounding path / bonding requirement
- Conductive treatment
- Collector grounding
- Dust explosibility data
- Hazardous-area classification
- Applicable fire / explosion protection standard

Critical safety rule:
An anti-static or flame-retardant cartridge does not by itself make a dust-collection system explosion-safe.

#### Combustible-Dust / Fire Governance

External benchmark:
Donaldson explicitly recommends hazard analysis for thermal cutting because sparks are normally present and collected metal dust may be combustible. Applicable NFPA requirements may include combustible-metal and explosion-protection standards depending material and system design.

Canonical safety inputs:
- Dust Kst / Pmax where applicable
- Minimum ignition energy
- Material explosibility
- Spark load
- Deflagration venting requirement
- Explosion isolation requirement
- Suppression requirement
- Grounding / bonding
- Collector indoor / outdoor location
- Air recirculation policy
- Authority Having Jurisdiction (AHJ)

Governance:
No ELIMFILTERS product or system may be represented as ATEX-, NFPA-, explosion-, or fire-compliant solely from media selection.

#### High-Temperature Filter Cartridge

REIKE source:
- High-Temp Filter Cartridge

Canonical capability:
- High-Temperature Dust Filtration

External benchmark:
Donaldson publishes cartridge media families selected by operating temperature and distinguishes standard polyester / fine-fiber options from higher-temperature materials.

Canonical attributes:
- Continuous operating temperature
- Peak temperature
- Exposure duration
- Base media
- Surface layer / membrane
- Adhesive / resin
- Gasket / seal material
- Metal hardware
- Thermal cycling
- Spark exposure

Capability code:
HT-DUST — High-Temperature Dust Filtration Capability
Status: CAPABILITY EXTENSION / NOT A COMMERCIAL TECHNOLOGY NAME.

#### Cylindrical / Dust Filter Cartridge

REIKE source:
- Cylindrical Filter Cartridge
- Dust Filter Cartridge

Canonical interpretation:
These are PRODUCT CONFIGURATION labels, not technologies.

Canonical attributes:
- Cylindrical / conical geometry
- OD
- ID
- Length
- Pleat count / depth
- Open / closed end
- Mounting geometry
- Gasket / seal
- Core
- End-cap material
- Collector compatibility
- Media area
- Cleaning direction
- Pulse-cleaning compatibility

#### Dust Collector System Architecture

External benchmark from Donaldson / Nederman:
Laser cutting commonly uses dedicated cartridge dust collectors with source capture at the cutting table, ducting, high-efficiency cartridges, pulse cleaning, fan / airflow control, differential-pressure monitoring, dust discharge, and safety provisions.

Canonical system path:
Cutting Table / Enclosure
→ Capture Airflow
→ Ducting / Spark-Control Strategy
→ Dust Collector
→ Cartridge Surface Filtration
→ Pulse Cleaning
→ Dust Discharge
→ Secondary / Safety Filtration where required
→ Exhaust or Recirculation

System attributes:
- Capture airflow
- Table size / zone control
- Duct velocity
- Fan static pressure
- Air-to-media ratio
- Cartridge count
- Cleaning pressure / sequence
- Differential pressure
- Hopper / dust discharge
- Spark mitigation
- Explosion protection
- Secondary filter
- Exhaust / recirculation mode
- Monitoring / alarms

#### HERMES Inputs — Laser Cutting Dust

Minimum inputs:
- Cutting process
- Laser type / power
- Material
- Material thickness
- Cutting rate / duty cycle
- Table size
- Dust / fume composition
- Particle-size distribution
- Dust loading
- Toxic-metal content
- Combustibility data
- Spark generation
- Required capture airflow
- Required filtration efficiency
- Air-to-media ratio
- Initial / terminal ΔP
- Operating temperature
- Moisture / agglomeration
- Antistatic requirement
- Flame-retardant requirement
- Collector model / cartridge interface
- Indoor / outdoor location
- Exhaust / recirculation strategy
- Safety / code requirement
- OEM / competitor reference

Expected logic:
Cutting Process
→ Material / Hazard
→ Dust Characteristics
→ Capture Requirement
→ Media / Surface Filtration
→ FR / Anti-Static / High-Temp Capability
→ Collector Interface
→ System Safety Architecture
→ Candidate Cartridge / System
→ Validation State

#### Technology-Core Relationship

New parent core:
- TC-DUST-01 — Industrial Surface-Loading Fine Dust Filtration

Capability overlays:
- AS-DUST — Anti-Static Dust Filtration Capability
- FR-DUST — Flame-Retardant Dust Filtration Capability
- HT-DUST — High-Temperature Dust Filtration Capability

Status:
INTERNAL CANDIDATES / NOT COMMERCIAL TECHNOLOGY NAMES.

These cores and capabilities are expected to be evaluated for reuse across Welding Fume Extraction and Additive Manufacturing rather than duplicated by application.

#### Closure State — Laser Cutting Dust Filtration

- REIKE source product discovery: COMPLETE
- Dust/fume architecture: CLOSED v1
- Surface-loading filtration architecture: CLOSED v1
- Anti-static / flame-retardant capability architecture: CLOSED v1
- High-temperature capability architecture: CLOSED v1
- Dust collector system architecture: CLOSED v1
- Safety / combustible-dust governance: CLOSED v1
- Product-level REIKE performance validation: OPEN
- Commercial technology naming: BLOCKED
- OEM / collector mapping: OPEN

Next Air Filtration source family:
- Welding Fume Extraction Filtration


### 17.11 Welding Fume Extraction Filtration — Architecture v1

Status: REIKE SOURCE PRODUCT SET CONFIRMED; EXTERNAL WELDING-FUME BENCHMARK ARCHITECTURE COMPLETE; COMMERCIAL TECHNOLOGY NAMES NOT ASSIGNED.

Source condition:
REIKE exposes five source products:
1. Composite Carbon Filter Cartridge
2. High-Temperature Dust Filter Cartridge
3. Flame Retardant Filter Cartridge
4. Antistatic Filter Cartridge
5. Polyester Filter Cartridge

Repeated supplier claims:
- Safe & Reliable
- Long-term Stable
- Custom Filter Manufacturer

The source page provides family names but no validated efficiency, media, airflow, pressure-drop, temperature, carbon capacity, conductivity, flame-retardance, or occupational-exposure performance evidence.

#### Canonical Interpretation

Welding Fume Extraction Filtration is a PROCESS APPLICATION domain.

Canonical domain:
Industrial & Process
→ Air Filtration Solutions
→ Welding Fume Extraction Filtration

Primary physical / process functions:
- Source Capture
- Fine Particulate / Fume Filtration
- Surface-Loading Cartridge Filtration
- Pulse-Jet Cleaning where applicable
- Molecular / Gas Adsorption where required
- High-Temperature / Spark-Risk Handling
- Static-Control / Flame-Retardant Capability where justified

#### Welding Fume Hazard Architecture

External benchmark:
OSHA identifies welding fumes as containing particulate matter and gases. Depending on base metal, filler, coatings, and process, fumes may include manganese, chromium compounds including hexavalent chromium, nickel, iron compounds, and other hazardous constituents. Gases such as ozone, nitrogen oxides, carbon monoxide, and shielding gases may also be relevant.

Canonical contaminant dimensions:
- Welding process
- Base metal
- Filler / wire / electrode
- Surface coating / plating
- Fume particle-size distribution
- Heavy-metal content
- Cr(VI) potential
- Manganese content
- Ozone / NOx / CO
- Oil / aerosol content
- Dust loading
- Spark / hot-particle load

Critical rule:
A welding-fume filter cannot be selected solely from a generic "welding" application label. Process and material composition determine the hazard and treatment requirement.

#### Source Capture

External benchmark from OSHA and Camfil:
Effective control should prioritize capturing fumes as close to the welding source as practicable before dispersion into the general workspace.

Canonical source-capture configurations:
- Extraction Arm
- On-Torch Extraction
- Extraction Hood
- Downdraft / Backdraft Table
- Enclosed Robotic Cell Extraction
- Central Ducted Extraction

Source capture is a SYSTEM CONFIGURATION, not a filter technology.

#### Particulate / Fume Filtration

REIKE source:
- Polyester Filter Cartridge

Canonical function:
- Fine Welding-Fume Particulate Filtration

Parent core:
TC-DUST-01 — Industrial Surface-Loading Fine Dust Filtration

External benchmark:
Donaldson cartridge media uses fine-fiber surface filtration to capture submicron particulate and improve cleanability. Welding fumes often contain very fine particles, so surface-loading behavior and stable ΔP under pulse cleaning are important.

Canonical attributes:
- Media substrate
- Fine-fiber / nanofiber layer
- Efficiency
- Particle-size performance
- Air permeability
- Initial ΔP
- Stable operating ΔP
- Dust / fume holding
- Pulse-cleaning behavior
- Moisture / oil tolerance
- Cartridge dimensions
- Collector interface

#### Composite Carbon Filter Cartridge

REIKE source:
- Composite Carbon Filter Cartridge

Canonical provisional functions:
- Fine Particulate Filtration
- Molecular / Gas Adsorption

External benchmark:
Activated carbon and activated-alumina molecular filters are used to adsorb VOCs, odors, ozone, nitrogen dioxide, sulfur dioxide, and other gas-phase contaminants depending media formulation.

Critical governance rule:
A carbon cartridge does not automatically remove all welding gases. Gas-removal performance must be tied to:
- target gas / vapor
- carbon / adsorbent chemistry
- bed mass
- residence time
- humidity
- temperature
- inlet concentration
- breakthrough / service capacity
- test method

Relationship:
- Particulate stage → TC-DUST-01
- Molecular stage → TC-AIR-03 Industrial Molecular Air Contamination Control

Potential specialized capability:
WGAS — Welding Fume Gas-Phase Adsorption Capability
Status: CAPABILITY CANDIDATE / NOT A COMMERCIAL TECHNOLOGY NAME.

#### High-Temperature Dust Filter Cartridge

REIKE source:
- High-Temperature Dust Filter Cartridge

Canonical capability:
HT-DUST — High-Temperature Dust Filtration Capability

This reuses the capability already identified under Laser Cutting.

Required attributes:
- Continuous / peak temperature
- Spark / hot-particle exposure
- Media
- Resin / adhesive
- Gasket / seal
- Metal hardware
- Thermal cycling
- Efficiency retention after heat exposure

No duplicate welding-specific high-temperature technology is created.

#### Flame-Retardant Filter Cartridge

REIKE source:
- Flame Retardant Filter Cartridge

Canonical capability:
FR-DUST — Flame-Retardant Dust Filtration Capability

No duplicate core is created.

Required evidence:
- exact flame / fire test standard
- media qualification
- application limit
- collector safety architecture

Critical rule:
Flame-retardant media does not make a collector fire-safe.

#### Antistatic Filter Cartridge

REIKE source:
- Antistatic Filter Cartridge

Canonical capability:
AS-DUST — Anti-Static Dust Filtration Capability

No duplicate core is created.

Required evidence:
- surface / volume resistivity
- grounding continuity
- conductive treatment
- collector bonding / grounding
- dust combustibility characteristics

Critical rule:
Antistatic media is one part of electrostatic-risk control, not a complete combustible-dust safety solution.

#### Oily Welding Fume

External benchmark from Camfil:
Some welding operations produce oily fumes / aerosols, requiring media and collector selection that tolerate sticky or oil-laden particulate.

Canonical capability:
- Oil / Aerosol Tolerance

Required attributes:
- Oil loading
- Agglomeration tendency
- Media oleophobic / hydrophobic properties where applicable
- Cleanability
- ΔP rise
- Drainage / pre-separation if required

This remains a capability, not a standalone technology.

#### Health / Exposure Governance

OSHA notes that welding fume hazards can include manganese and hexavalent chromium and that hot work on stainless steel or chromium-containing alloys can generate Cr(VI).

Canonical HERMES safety fields:
- Applicable occupational exposure limit
- Cr(VI) potential
- Manganese exposure concern
- Nickel / other metal concern
- Ventilation requirement
- Respiratory-protection dependency
- Exhaust / recirculation policy
- Local regulatory jurisdiction

Critical rule:
ELIMFILTERS filtration claims must not be presented as guaranteeing worker exposure compliance without a validated system-level industrial hygiene assessment.

#### Dust Collector System Architecture

Canonical path:
Welding Source
→ Source Capture
→ Ducting
→ Spark / Hot-Particle Management where required
→ Cartridge Collector
→ Pulse Cleaning
→ Secondary HEPA / Safety Stage where required
→ Gas-Phase Adsorption where required
→ Exhaust / Recirculation

System attributes:
- Capture velocity
- Airflow
- Duct velocity
- Collector airflow
- Cartridge count
- Air-to-media ratio
- Cleaning pressure / logic
- Initial / stable / terminal ΔP
- Dust discharge
- Spark management
- Secondary filtration
- Molecular filtration
- Exhaust / recirculation
- Monitoring / alarms

#### HERMES Inputs — Welding Fume

Minimum inputs:
- Welding process
- Base metal
- Filler / electrode
- Coating / plating
- Welding current / duty cycle
- Number of welding stations
- Manual / robotic operation
- Fume composition
- Cr(VI) potential
- Manganese / nickel / other metal concerns
- Ozone / NOx / VOC requirement
- Oil / aerosol content
- Spark / hot-particle load
- Required capture airflow
- Required particulate efficiency
- Molecular adsorption requirement
- Initial / terminal ΔP
- Temperature
- Flame-retardant requirement
- Antistatic requirement
- Collector model / cartridge interface
- Exhaust / recirculation mode
- Occupational exposure / regulatory requirement
- OEM / competitor reference

Expected logic:
Welding Process
→ Material / Fume Hazard
→ Source-Capture Method
→ Particulate vs Gas-Phase Treatment
→ Surface Filtration
→ FR / Anti-Static / High-Temp / Oil Capability
→ Secondary / Carbon Stage if required
→ Collector Interface
→ Safety / Exposure Validation
→ Candidate Cartridge / System
→ Validation State

#### Technology-Core Relationship

Reused existing Industrial & Process cores:
- TC-DUST-01 — Industrial Surface-Loading Fine Dust Filtration
- TC-AIR-03 — Industrial Molecular Air Contamination Control

Reused capabilities:
- AS-DUST — Anti-Static Dust Filtration Capability
- FR-DUST — Flame-Retardant Dust Filtration Capability
- HT-DUST — High-Temperature Dust Filtration Capability

New capability candidate:
- WGAS — Welding Fume Gas-Phase Adsorption Capability

No duplicate welding-specific particulate technology core is created.

#### Closure State — Welding Fume Extraction Filtration

- REIKE source product discovery: COMPLETE
- Welding-fume particulate architecture: CLOSED v1
- Source-capture architecture: CLOSED v1
- Carbon / molecular treatment architecture: CLOSED v1
- Anti-static / flame-retardant / high-temperature reuse: CLOSED v1
- Occupational-hazard governance: CLOSED v1
- Oily-fume capability: IDENTIFIED
- Product-level REIKE performance validation: OPEN
- Commercial technology naming: BLOCKED
- OEM / collector mapping: OPEN

#### Air Filtration Solutions — Remaining Open Family

Completed:
- Cleanroom & HVAC Air Filtration
- Semiconductor & Photovoltaic Manufacturing Filter
- Aviation Air Filtration
- Laser Cutting Dust Filtration
- Welding Fume Extraction Filtration

Air Filtration Solutions v1 is now ARCHITECTURALLY CLOSED, with product-level validation and commercial technology naming still open.

Next Industrial & Process source family:
- Additive Manufacturing Filtration Solutions


## 18. Additive Manufacturing Filtration Solutions — Architecture v1

Status: REIKE SOURCE PRODUCT SET CONFIRMED; EXTERNAL METAL-AM SAFETY / DUST-COLLECTION ARCHITECTURE COMPLETE; COMMERCIAL TECHNOLOGY NAMES NOT ASSIGNED.

Primary source:
- Xinxiang Filter / REIKE
- Source category: Additive Manufacturing Filtration Solutions

REIKE exposes seven source families:
1. SLM & DMLS Powder Recovery Filter Cartridges
2. HEPA Filters for Metal 3D Printing
3. Antistatic Filters
4. Flame-Retardant Antistatic Filters
5. High-Temperature Filters
6. Pulse Jet Dust Collectors
7. Customized Additive Manufacturing Filters

Repeated supplier claims:
- Safe & Reliable
- Long-term Stable
- Custom Filter Manufacturer

The source page provides family names but no validated efficiency, pressure-drop, dust-loading, electrical resistance, fire-performance, temperature, cleaning-cycle, collector, or alloy-specific safety evidence.

### 18.1 Canonical Interpretation

Additive Manufacturing Filtration is an INDUSTRY / PROCESS APPLICATION layer, not one filtration technology.

Canonical domain:
Industrial & Process
→ Additive Manufacturing Filtration Solutions

Primary process contexts:
- Metal Powder Handling
- Build-Chamber / Machine Exhaust
- Powder Recovery
- Post-Processing Dust Capture
- Local Extraction
- Central Dust Collection
- Secondary / Safety HEPA Filtration

Canonical functions:
- Fine Metal Powder Capture
- Surface-Loading Dust Filtration
- Powder Recovery
- High-Efficiency Final Filtration
- Pulse-Jet Cleaning
- Static-Charge Mitigation
- Flame-Retardant Capability
- High-Temperature Capability
- Combustible-Metal Dust Risk Control at system level

### 18.2 SLM / DMLS Powder Recovery

REIKE source:
- SLM & DMLS Powder Recovery Filter Cartridges

Canonical application:
- Powder Recovery / Metal AM Process Dust Control

Potential contaminants:
- Titanium alloy powder
- Aluminum alloy powder
- Nickel alloy powder
- Stainless-steel powder
- Cobalt-chrome and other metal powders
- Process fines / partially fused particles

Critical rule:
Powder composition MUST be an explicit selection input. Different alloy powders can have materially different combustibility, toxicity, electrical, handling, and recovery requirements.

Canonical product attributes:
- Alloy / powder type
- Particle-size distribution
- Bulk density
- Dust loading
- Fine-particle fraction
- Reusable-powder recovery requirement
- Media
- Surface treatment
- Conductivity / resistivity
- Filtration efficiency
- Initial / terminal ΔP
- Cleaning method
- Pulse pressure
- Cartridge geometry
- Collector / printer interface
- Temperature
- Inert-gas compatibility
- Grounding / bonding requirement

### 18.3 Metal Powder Combustible-Dust Governance

External benchmark:
OSHA explicitly identifies additive manufacturing / 3D printing with combustible metal powders as a combustible-dust hazard. OSHA's technical guidance notes that very fine metal powders can be highly reactive, and it specifically identifies 3D printing with combustible metals as a hazardous process.

OSHA enforcement history for metal AM has also documented hazards from:
- electrostatic ignition
- insufficient bonding / grounding
- inadequate inerting
- combustible titanium-alloy powder
- powder handling near printers / recovery equipment

Canonical safety dimensions:
- Metal / alloy
- Kst / Pmax where applicable
- Minimum ignition energy
- Minimum ignition temperature
- Dust explosibility
- Oxygen concentration
- Inert-gas type
- Inerting strategy
- Grounding / bonding
- Conductive components
- Ignition-source control
- Collector location
- Explosion isolation / venting / suppression requirement
- Wet vs dry collection strategy
- Authority Having Jurisdiction

Critical rule:
An antistatic or flame-retardant filter cartridge does NOT make a metal-powder collection system explosion-safe.

### 18.4 Antistatic Filters

REIKE source:
- Antistatic Filters

Canonical capability:
AS-DUST — Anti-Static Dust Filtration Capability

This capability is reused from Laser Cutting / Welding Fume and is especially important in metal powder handling.

Required attributes:
- Surface resistivity
- Volume resistivity
- Conductive-path continuity
- Grounding point
- Bonding requirement
- Media conductive treatment
- End-cap / core conductivity
- Collector grounding
- Verification method

External safety basis:
OSHA has cited lack of ESD bonding / grounding around metal additive-manufacturing operations using fine titanium alloy powders as an ignition hazard.

### 18.5 Flame-Retardant Antistatic Filters

REIKE source:
- Flame-Retardant Antistatic Filters

Canonical capabilities:
- FR-DUST — Flame-Retardant Dust Filtration Capability
- AS-DUST — Anti-Static Dust Filtration Capability

No new technology core is created.

Governance:
- Flame retardancy = media / material behavior
- Antistatic = electrostatic-control capability
- Explosion protection = system architecture

These three concepts MUST remain separate.

### 18.6 High-Temperature Filters

REIKE source:
- High-Temperature Filters

Canonical capability:
HT-DUST — High-Temperature Dust Filtration Capability

No additive-manufacturing-specific high-temperature technology is created.

Required attributes:
- Continuous temperature
- Peak temperature
- Thermal cycling
- Media
- Resin / adhesive
- Gasket / seal
- Metal hardware
- Spark / hot-particle exposure
- Efficiency retention after thermal exposure

### 18.7 HEPA Filters for Metal 3D Printing

REIKE source:
- HEPA Filters for Metal 3D Printing

Canonical function:
- High-Efficiency Final / Safety Particle Filtration

Parent core:
TC-AIR-02 — Industrial High-Efficiency Air Filtration

Potential system positions:
- Printer exhaust
- Local extraction final stage
- Dust collector secondary filter
- Room / enclosure final filtration

Required attributes:
- Exact HEPA class
- Test standard
- MPPS efficiency
- Overall / local efficiency
- Rated airflow
- Initial / final ΔP
- Media
- Frame / seal
- Leak test
- Metal-powder compatibility
- Safe-change requirement where applicable

Canonical rule:
HEPA is a final filtration function and does not replace upstream combustible-dust hazard controls.

### 18.8 Pulse Jet Dust Collectors

REIKE source:
- Pulse Jet Dust Collectors

Canonical system configuration:
- Pulse-Jet Cartridge Dust Collector

External benchmark:
Donaldson and Camfil industrial cartridge collectors use reverse-pulse / pulse-jet cleaning to remove surface-loaded dust and maintain airflow. Their systems also show that collector design, cartridge arrangement, cleaning energy, airflow management, and dust discharge are independent engineering variables.

Canonical attributes:
- Collector airflow
- Cartridge count
- Media area
- Air-to-media ratio
- Cleaning pressure
- Pulse duration
- Pulse sequence
- ΔP cleaning trigger
- Hopper / dust discharge
- Dust containment
- Inerting compatibility
- Explosion-protection architecture
- Secondary HEPA option
- Monitoring / alarms
- Collector location

Technology relationship:
- Collector system consumes TC-DUST-01.
- Pulse jet is a CLEANING / SYSTEM MECHANISM, not a filtration technology.

### 18.9 Customized Additive Manufacturing Filters

REIKE source:
- Customized Additive Manufacturing Filters

Canonical interpretation:
Customization is a MANUFACTURING / APPLICATION-ENGINEERING capability, not a technology.

Required custom-design inputs:
- Printer OEM
- Printer model
- Build volume
- Powder alloy
- Powder particle distribution
- Process gas
- Filter envelope
- Mounting interface
- Airflow
- ΔP limit
- Cleaning method
- Grounding requirement
- Temperature
- Recovery / disposal strategy
- Safety architecture
- Changeout method

### 18.10 Core Reuse and New-Core Decision

Additive Manufacturing does NOT require a duplicate dust-filtration core.

Reused:
- TC-DUST-01 — Industrial Surface-Loading Fine Dust Filtration
- TC-AIR-02 — Industrial High-Efficiency Air Filtration

Reused capabilities:
- AS-DUST — Anti-Static Dust Filtration Capability
- FR-DUST — Flame-Retardant Dust Filtration Capability
- HT-DUST — High-Temperature Dust Filtration Capability

New application-layer concept:
AM-POWDER — Additive Manufacturing Powder Recovery / Containment Architecture
Status: APPLICATION / SYSTEM ARCHITECTURE, NOT A COMMERCIAL TECHNOLOGY NAME.

Reason:
The distinct value in Additive Manufacturing is the integration of powder recovery, containment, inerting, static control, final filtration, and collector safety around combustible metal powders — not a new fundamental particle-capture mechanism.

### 18.11 HERMES Inputs — Additive Manufacturing

Minimum inputs:
- Printer manufacturer
- Printer model
- AM process
- Alloy / powder chemistry
- Particle-size distribution
- Powder combustibility data
- Powder toxicity / exposure data
- Build / powder-handling stage
- Reuse / recovery requirement
- Process gas
- Oxygen concentration
- Inerting requirement
- Required filtration efficiency
- HEPA requirement
- Airflow
- ΔP
- Temperature
- Cleaning / pulse requirement
- Antistatic requirement
- Flame-retardant requirement
- Grounding / bonding architecture
- Collector type
- Explosion / fire protection requirement
- Safe-change / containment requirement
- OEM / competitor reference

Expected logic:
AM Process
→ Powder / Alloy Hazard
→ Recovery vs Disposal
→ Dust-Capture Function
→ Surface Filtration
→ Static / FR / HT Capability
→ Pulse-Jet / Collector Architecture
→ HEPA Final Stage
→ Inerting / Explosion-Protection Requirement
→ OEM Interface
→ Candidate Filter / System
→ Validation State

### 18.12 Canonical Product / System Record Additions

Additive Manufacturing records require:
- AM Process
- Powder Alloy
- Particle-Size Distribution
- Powder Recovery Required
- Powder Reuse Allowed
- Process Gas
- Oxygen Limit
- Antistatic Requirement
- Surface Resistivity
- Grounding Method
- Flame-Retardant Requirement
- High-Temperature Requirement
- HEPA Final Stage
- Pulse-Cleaning Requirement
- Collector Type
- Collector Location
- Explosion Protection
- Inerting Strategy
- Safe-Change Requirement
- Disposal / Recovery Method

### 18.13 Evidence Governance

Required evidence states:
- SOURCE_ONLY
- EXTERNAL_BENCHMARK
- HAZARD_VALIDATED
- TECHNICALLY_VALIDATED
- APPLICATION_VALIDATED
- ELIMFILTERS_APPROVED

Rules:
- REIKE source pages establish product-family existence only.
- No REIKE safety or performance claim is accepted without product evidence.
- OSHA / external benchmark evidence defines process hazards and engineering requirements, not product approval.
- Filter media capability and explosion safety must remain separate.
- Powder handling, filtration, recovery, grounding, inerting, and explosion protection must be evaluated as one system.

### 18.14 Additive Manufacturing Filtration — Family Closure v1

- REIKE source-family discovery: COMPLETE
- SLM / DMLS powder-recovery architecture: CLOSED v1
- HEPA final-filtration architecture: CLOSED v1
- Anti-static architecture: CLOSED v1
- Flame-retardant architecture: CLOSED v1
- High-temperature architecture: CLOSED v1
- Pulse-jet collector architecture: CLOSED v1
- Custom-filter engineering architecture: CLOSED v1
- Combustible-metal powder safety governance: CLOSED v1
- Technology-core reuse decision: CLOSED v1
- Commercial technology naming: BLOCKED
- Product-level specification: OPEN
- OEM / printer mapping: OPEN

## 19. Industrial & Process — Architecture Closure v1

All six primary REIKE source domains now have a canonical ELIMFILTERS architecture:

- Air Filtration Solutions — CLOSED v1
- Additive Manufacturing Filtration Solutions — CLOSED v1
- Gas & Natural Gas Filtration — CLOSED v1
- Hydraulic & Lubrication Filtration — CLOSED v1
- Industrial Water Filtration Solutions — CLOSED v1
- Filtration Equipment & Systems — CLOSED v1

Global status:
- Source-family discovery: COMPLETE v1
- Canonical function architecture: COMPLETE v1
- Application / industry separation: COMPLETE v1
- Technology-core discovery: COMPLETE v1
- Existing On-Road / Off-Road technology separation: CLOSED
- HERMES selection dimensions: DEFINED v1
- Evidence governance: DEFINED v1
- Commercial Industrial & Process technology naming: OPEN / BLOCKED
- Product-level technical validation: OPEN
- OEM / competitor / printer / housing mapping: OPEN
- Canonical SKU population: OPEN

Next governance phase:
- Review all discovered technology cores together.
- Consolidate duplicates.
- Decide which cores justify commercial ELIMFILTERS Industrial & Process technology names.
- Keep system configurations, capabilities, applications, and technologies as separate layers.
