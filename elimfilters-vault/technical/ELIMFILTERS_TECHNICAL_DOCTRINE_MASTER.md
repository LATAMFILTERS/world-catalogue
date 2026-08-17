# ELIMFILTERS® TECHNICAL DOCTRINE
## Master Engineering Reference — Permanent Documentation
### Version 1.0 | Effective: 2026-06-28 | Status: MASTER

---

> This document is the authoritative technical doctrine of ELIMFILTERS®.
> It defines engineering principles, contamination control standards, technology specifications, and system design requirements.
> Cross-reference: ELIMFILTERS_COMMERCIAL_ARCHITECTURE_MASTER v2.0 (elimfilters-vault/commercial/)

---

## Document Control

| Field | Value |
|---|---|
| Document | ELIMFILTERS_TECHNICAL_DOCTRINE_MASTER |
| Version | 1.0 |
| Status | Master — Permanent Doctrine |
| Effective Date | 2026-06-28 |
| Location | elimfilters-vault/technical/ |
| Commercial Reference | ELIMFILTERS_COMMERCIAL_ARCHITECTURE_MASTER v2.0 |
| Authority | ELIMFILTERS® Engineering Leadership |
| Amendment Rule | Requires formal change request, engineering review, and version increment |

---

## 1. Executive Summary

This document defines the engineering doctrine of ELIMFILTERS®.

It establishes the principles, methods, standards, and specifications that govern how the company designs, validates, classifies, and deploys contamination control technologies across all protection domains.

The commercial doctrine defines what markets we serve and why. This technical doctrine defines how we serve those markets — the engineering basis for every technology platform, product specification, system design, and performance claim made under the ELIMFILTERS® name.

Engineering decisions at ELIMFILTERS® follow a single hierarchy:

```
Contamination Source
    ↓
Asset Degradation Mechanism
    ↓
Measurement Standard (ISO / ASTM / SAE / NAS)
    ↓
Protection Technology Selection
    ↓
Product Implementation & Specification
    ↓
Validation Against Standard
    ↓
Field Performance Monitoring
```

Every product, every technology, every system design must trace its engineering rationale through this hierarchy. A product that cannot be traced to a contamination mechanism it controls has no engineering justification.

---

## 2. Engineering Philosophy

### 2.1 Asset Protection Engineering

Asset Protection Engineering is the governing discipline of ELIMFILTERS®.

It is not the discipline of selecting filter products. It is the discipline of designing contamination control systems that prevent specific failure mechanisms in specific asset classes.

The fundamental question of Asset Protection Engineering is:

*What contamination mechanism threatens this asset, in this operating environment, at this stage of its service life — and what engineered system controls that mechanism to the required measurement target?*

This question defines the starting point of every engineering decision. It requires the engineer to know:

- The asset: type, operating hours, load profile, criticality
- The environment: dust concentration, particle size distribution, moisture, temperature, chemical exposure
- The system: air intake, fuel, lubrication, hydraulic, coolant, cabin, compressed air
- The contamination target: particle size, particle count, water content, ISO cleanliness code, Beta ratio requirement
- The measurement standard: which ISO, ASTM, or SAE standard defines the acceptance criterion
- The control technology: which technology platform achieves the required performance

Asset Protection Engineering rejects the commodity substitution model. Dimensional compatibility and pressure rating are necessary conditions, not sufficient ones.

### 2.2 Contamination Control

Contamination control is the applied science of identifying, measuring, and preventing the ingestion, generation, and transmission of contaminants in mechanical systems.

**Contamination classification:**

| Class | Examples | Primary Measurement |
|---|---|---|
| Particulate | Silica, metal wear debris, carbon | ISO 4406, NAS 1638, particle count per mL |
| Moisture | Free water, dissolved water, emulsified water | Karl Fischer (ppm), BS&W, Dean-Stark |
| Chemical | Fuel dilution, acid formation, oxidation products | TAN (acid number), TBN (base number), viscosity |
| Biological | Microorganisms in diesel, jet fuel | ASTM D6974, viable colony counts |
| Thermal | Heat-oxidized oil, varnish formation | Viscosity index, RULER test, MPC |

**Contamination ingress mechanisms:**

1. **Built-in contamination** — residual particles from manufacturing, assembly, or maintenance. Controlled by clean assembly protocols and pre-flushing.
2. **Ingested contamination** — external particles entering through air intake, fuel fill, breather vents. Controlled by inlet filtration efficiency.
3. **Generated contamination** — particles created by wear, cavitation, adhesive failure, or corrosion within the system. Controlled by fluid conditioning and filter capacity.
4. **Cross-contamination** — fluid mixing (coolant into oil, water into fuel). Controlled by seal integrity and system design.

### 2.3 Reliability Engineering

Reliability engineering at ELIMFILTERS® applies contamination control as the primary lever for extending Mean Time Between Failure (MTBF) in critical mechanical systems.

**Reliability fundamentals applied to filtration:**

**MTBF = f(cleanliness class, operating load, particle hardness, surface finish, clearance tolerance)**

The relationship between ISO cleanliness code and bearing life is well-documented in bearing fatigue literature (Loewenthal, Zaretsky). A system operating at ISO 16/14/11 achieves approximately 3-5× the bearing life of the same system at ISO 19/17/14 — for the same bearing specification, same load, same operating temperature.

**Failure Mode and Effects Analysis (FMEA) applied to filtration systems:**

| Failure Mode | Effect | Severity | Cause | Prevention |
|---|---|---|---|---|
| Filter bypass at ΔP limit | Unfiltered flow | Critical | Over-service interval | Condition-based replacement, restriction monitoring |
| Media collapse | No filtration | Critical | Extreme ΔP, structural failure | Correct media specification, collapse pressure rating |
| Seal extrusion | Contamination bypass | Critical | Over-torque, wrong seal material | Torque specification, seal material compatibility |
| Incorrect installation | Full bypass | Critical | Human error | Installation verification procedures |
| Media pinhole | Particle bypass | Major | Chemical attack, pressure spike | Media chemical compatibility validation |
| Water accumulation | Microbial growth, injector damage | Major | No water removal provision | Water separator specification, drain maintenance |

---

## 3. Airflow Engineering

Airflow engineering governs the design and performance of air intake filtration systems. It operates at the intersection of fluid mechanics, particulate science, and engine performance.

### 3.1 Governing Equations

**Volumetric flow rate** through filter media:

```
Q = A × v
```

Where Q = flow rate (m³/s), A = effective filtration area (m²), v = face velocity (m/s).

**Darcy-Weisbach pressure drop** for porous media:

```
ΔP = (μ × v × L) / k
```

Where μ = dynamic viscosity (Pa·s), v = face velocity (m/s), L = media thickness (m), k = media permeability (m²).

Face velocity is the primary design variable. Higher face velocity increases pressure drop non-linearly and can reduce filtration efficiency by increasing particle penetration through media fibers. Optimum design face velocity for pleated cellulose/synthetic air media is typically 0.05–0.15 m/s.

**Pleat geometry design:**

Effective filtration area (EFA) depends on pleat height, pleat count, and pleat spacing:

```
EFA = 2 × H × N × L
```

Where H = pleat height (m), N = number of pleats, L = filter length (m). EFA should be maximized subject to structural constraints (pleat collapse at operating ΔP).

### 3.2 Efficiency Mechanisms

Air filter efficiency is determined by five particle capture mechanisms:

| Mechanism | Dominant Particle Size | Physics |
|---|---|---|
| Inertial impaction | > 1 µm | Particle momentum carries it into fiber |
| Diffusion (Brownian motion) | < 0.3 µm | Random thermal motion drives contact |
| Interception | 0.3–1 µm | Particle contacts fiber as it follows streamline |
| Electrostatic attraction | All sizes (charged media) | Coulombic attraction between particle and fiber |
| Gravitational settling | > 10 µm (horizontal flow) | Particle weight causes trajectory deviation |

The minimum efficiency point (most penetrating particle size, MPPS) occurs at approximately 0.1–0.3 µm, where neither impaction nor diffusion is dominant. HEPA-class filters (ISO 29463 H10-H14) specify performance at this particle size.

### 3.3 ISO 5011 Performance Parameters

Four parameters define air filter performance under ISO 5011:

1. **Initial restriction (ΔP₀)** — measured at rated airflow on clean filter. Expressed in Pa or kPa.
2. **Filtration efficiency (η)** — gravimetric: mass captured / mass challenged × 100%. Also expressed as MPPS efficiency for fine filters.
3. **Dust holding capacity (DHC)** — total mass of ISO Fine Test Dust captured to terminal restriction. Expressed in grams or g/m² of media area.
4. **Terminal restriction (ΔP_T)** — restriction at end of dust loading test. Defines service end-point for test conditions.

### 3.4 Restriction Limits

Service restriction limits for air filters by application:

| Application | Service Limit | Monitoring Method |
|---|---|---|
| On-highway diesel engines | 635 mm H₂O (6.25 kPa) | Restriction indicator (vacuum gauge) |
| Off-road heavy equipment | 750 mm H₂O (7.35 kPa) | Restriction indicator, telematics |
| Marine diesel | 500 mm H₂O (4.90 kPa) | Differential pressure gauge |
| Industrial compressors | Per OEM specification | Online monitoring |
| Cabin air (HVAC) | 100–250 Pa (application dependent) | Timer-based or differential pressure |

---

## 4. Seal Integrity

Seal integrity is the most critical quality attribute of any filter element. A filter with 99.9% media efficiency and a failed seal provides 0% protection.

### 4.1 Seal Geometry Types

**Radial seal (donut seal):**
- Seal compresses radially against housing bore
- Self-centering geometry
- Preferred for high-vibration applications
- Compression: 15–25% of free seal cross-section
- Housing bore tolerance: ±0.25 mm for reliable sealing

**Axial seal (flat seal, pancake seal):**
- Seal compresses axially by tightening the filter against a flat seating surface
- Dependent on installation torque
- Risk: overtorque causing seal damage; undertorque causing bypass
- Recommended torque: hand-tight + ¾ turn (spin-on filters); per OEM specification for cartridge

**Combination seal (radial + axial):**
- Used in high-pressure applications
- Dual contact provides redundancy
- More tolerant of installation variation

### 4.2 Seal Material Selection

| Material | Common Name | Temp. Range | Oil Resistance | Fuel Resistance | Applications |
|---|---|---|---|---|---|
| Acrylonitrile-butadiene | NBR / Nitrile | -40°C to +120°C | Excellent | Good | Engine oil, hydraulic |
| Ethylene-propylene-diene | EPDM | -50°C to +150°C | Poor | Poor | Coolant, compressed air |
| Fluorocarbon | FKM / Viton® | -20°C to +200°C | Excellent | Excellent | High temp, aggressive fuels |
| Silicone | VMQ | -60°C to +200°C | Poor | Poor | Cabin air, high temp air |
| Polyurethane | PU / AU | -30°C to +100°C | Good | Good | Air intake end caps |

Material selection must match system fluid chemistry. EPDM seals in contact with oil will swell, extrude, and fail. NBR seals in phosphate-ester hydraulic fluid will also degrade.

### 4.3 Seal Failure Modes

1. **Extrusion** — seal material forced into gap between filter and housing. Caused by excessive pressure differential, undersized seal groove, or wrong material hardness. Hardness specification: Shore A 50–70 for most applications.
2. **Compression set** — permanent deformation of elastomer under sustained compression. Seal fails to recover when housing is removed and reinstalled. Prevented by using low compression-set elastomers (EPDM, FKM).
3. **Chemical attack** — incompatible fluid dissolves or swells seal material. Results in loss of sealing force and physical degradation.
4. **Rolled seal** — seal rolls out of groove during installation. Caused by insufficient lubrication, incorrect seal diameter, or high installation speed.
5. **Pinched seal** — seal caught between filter body and housing shoulder. Results in immediate bypass.

---

## 5. Filter Media Science

### 5.1 Cellulose Media

Cellulose media is manufactured from wood pulp fibers with typical diameters of 20–50 µm and lengths of 1–3 mm.

**Characteristics:**
- Fiber diameter: 20–50 µm
- Porosity: 70–80%
- Basis weight: 80–150 g/m²
- Efficiency at 10 µm (c): typically 30–70% (ISO 4548-12 multi-pass)
- Beta ratio at 10 µm(c): β₁₀ = 2–7 (typical for engine oil applications)
- Service life: standard intervals (500–1,000 hours for engine lube)
- Temperature limit: 120°C continuous (dry air), 100°C (oil service)
- Moisture sensitivity: cellulose absorbs moisture, reducing structural integrity in wet environments

**Applications:** Standard service engine oil filters, standard air filters, water separator elements (pre-treated grades)

**Limitations:** Not suited for extended drain intervals, high-efficiency hydraulic, or sub-micron fuel HPCR applications.

### 5.2 Synthetic Media

Synthetic media uses man-made fibers — glass fiber, polyester, polypropylene — produced at controlled diameters (1–15 µm).

**Glass fiber synthetic:**
- Fiber diameter: 0.5–15 µm (application-dependent grades)
- Porosity: 85–95%
- Efficiency at 10 µm(c): 90–99.5% achievable
- Beta ratio at 10 µm(c): β₁₀ ≥ 200 for high-efficiency hydraulic grades
- Service life: 2–3× cellulose standard intervals
- Temperature limit: 150°C continuous
- Moisture insensitivity: no absorption, stable in wet environments

**Polyester spunbond:**
- Used as pre-filter and outer wrap layers
- High dirt capacity, mechanical strength
- Temperature limit: 130°C

**Applications:** Extended drain lube oil, high-efficiency hydraulic, precision fuel filtration, multi-pass multi-layer constructions.

### 5.3 Nanofiber Media

Nanofiber media applies electrospun polymer layers (fiber diameter <1 µm) onto a substrate carrier. The nanoscale fiber layer performs surface-loading filtration rather than depth-loading.

**Characteristics:**
- Fiber diameter: 100–500 nm (0.1–0.5 µm)
- Basis weight of nanofiber layer: 0.5–3 g/m²
- Efficiency at MPPS (0.1–0.3 µm): >99.5% achievable without HEPA classification requirements
- Pressure drop advantage: lower ΔP than equivalent-efficiency glass fiber at same face velocity
- Dust release: surface-loaded particles detach more readily during pulse cleaning (for industrial filter applications)
- Service life: equal to or greater than standard synthetic in non-pulsing applications

**Surface loading vs. depth loading:**
Conventional media captures particles throughout the depth of the fiber matrix (depth loading). Nanofiber captures particles on the surface of the first fiber layer (surface loading). Surface loading produces a sharper filtration cut-off (steeper efficiency curve vs. particle size) and lower terminal pressure drop.

**Applications:** High-efficiency air intake (surface-loading cake formation), cabin air fine particulate (PM₁₀, PM₂.₅), specialized industrial compressed air.

**Polymer types used:** PAN (polyacrylonitrile), PA (polyamide/nylon), PVA (polyvinyl alcohol), PES (polyethersulfone) depending on chemical resistance requirements.

### 5.4 Activated Carbon Media

Activated carbon operates by adsorption rather than mechanical filtration. Gas-phase contaminants (volatile organic compounds, odors, reactive gases) are captured on the internal surface of activated carbon particles.

**Characteristics:**
- BET surface area: 800–1,200 m²/g (microporous carbon)
- Pore diameter distribution: 2–50 nm (mesopores) for liquid-phase; <2 nm (micropores) for gas-phase
- Adsorption capacity: dependent on contaminant molecular weight and boiling point
- Desorption: partial desorption possible at elevated temperatures (>80°C for VOCs)
- Service life: capacity-limited, not pressure-drop limited; replacement when breakthrough detected

**Adsorption selectivity:** Higher molecular weight compounds are preferentially adsorbed over lighter compounds. Water vapor competes with VOC adsorption (pre-humidification degrades capacity). Impregnated carbon grades (KOH, KMnO₄, H₃PO₄) extend specific contaminant removal capability.

**Applications:** Cabin air filtration for traffic tunnel environments, NO₂ removal, SO₂ removal, odor control in HVAC systems.

**Integration in multi-layer media:** Activated carbon granules or carbon-loaded fiber layers combined with particulate media provide dual-function protection (ISO 11155-2 chemical filter performance test).

### 5.5 Multi-Layer Media Construction

Multi-layer media constructions achieve performance that no single media layer can provide.

**Typical construction for extended-drain engine lube oil element:**

| Layer | Material | Function | Specification |
|---|---|---|---|
| Outer wrap | Polyester spunbond | Pre-filtration, structural protection | >200 µm particles |
| Pre-filter layer | Coarse glass fiber | Coarse particle capture, media protection | 20–50 µm particles |
| Main filtration layer | Fine glass fiber | Rated efficiency at service particle size | β₁₀ ≥ 75 |
| Final layer | Melt-blown synthetic | Anti-drain-back, structural | Gasket-forming capability |
| Inner liner | Perforated steel | Collapse resistance at bypass ΔP | Min. collapse pressure = 3× bypass ΔP |

**Design principle:** Each layer serves a defined function. The outer layers protect the main filtration layer by capturing large particles that would rapidly blind the fine media. The fine media achieves the rated efficiency. The inner liner prevents collapse under maximum differential pressure.

---

## 6. Fluid Cleanliness

Fluid cleanliness classification quantifies the particulate contamination level in hydraulic, lubrication, and fuel systems. It is the primary measurement tool for determining whether a contamination control system is performing to specification.

### 6.1 ISO 4406:2021 Cleanliness Codes

ISO 4406 classifies fluid cleanliness using three scale numbers representing particle counts per milliliter at three size thresholds:

| Scale Number | Range (particles/mL) |
|---|---|
| 1 | 0.5 to 1 |
| 2 | 1 to 2 |
| 3 | 2 to 4 |
| ... | ... |
| 14 | 4,000 to 8,000 |
| 15 | 8,000 to 16,000 |
| 16 | 16,000 to 32,000 |
| 17 | 32,000 to 64,000 |
| 18 | 64,000 to 130,000 |
| 19 | 130,000 to 250,000 |

**Three-number code format: XX/YY/ZZ**
- XX = scale number for particles ≥4 µm(c)
- YY = scale number for particles ≥6 µm(c)
- ZZ = scale number for particles ≥14 µm(c)

**Target cleanliness codes by application:**

| System | Target ISO Code | Rationale |
|---|---|---|
| HPCR diesel fuel injectors | 12/10/8 | Injector clearance 0.5–2 µm; particles >6 µm damage needles |
| Hydraulic proportional valves | 16/14/11 | Spool clearance 5–15 µm; particles >14 µm cause stiction |
| Hydraulic servo valves | 14/12/9 | Tighter clearance than proportional; more sensitive |
| Fixed-displacement hydraulic | 18/16/13 | Gear pump tolerant of higher contamination |
| Engine lube (passenger car) | 19/17/14 | Full-flow filter standard interval |
| Engine lube (heavy duty) | 17/15/12 | Extended drain synthetic media |
| Engine lube (system approach) | 16/14/11 | ELIMFILTERS® system target |
| Marine diesel lube | 17/15/12 | Per ISO 8217 fuel quality requirements |

### 6.2 NAS 1638 Classification

Originally developed for aerospace hydraulics (National Aerospace Standard). Classifies contamination by particle size ranges rather than cumulative counts.

**NAS 1638 particle size ranges:**
- Range 1: 5–15 µm
- Range 2: 15–25 µm
- Range 3: 25–50 µm
- Range 4: 50–100 µm
- Range 5: >100 µm

NAS classes 1 through 12 correspond to particle count limits per 100 mL. Class 00 and 0 are ultra-clean for precision aerospace applications.

Conversion to ISO 4406 is approximate. NAS 7 ≈ ISO 18/15/12; NAS 9 ≈ ISO 20/17/14.

### 6.3 Particle Counting Methods

**Automatic Particle Counter (APC) — light extinction:**
Fluid passes through laser beam. Each particle >threshold diameter blocks beam momentarily, generating a pulse. Pulse amplitude correlates to particle size. Calibrated per ISO 11171 using reference NIST-traceable spheres.

**Ferrographic analysis:**
Wear particle separation on magnetic substrate. Particle morphology analysis identifies failure mode (cutting wear vs. fatigue spalling vs. sliding wear). Not a size-distribution method; a complementary failure mode identification method.

**Millipore patch test:**
Gravimetric method. Fluid filtered through membrane; membrane mass delta = contamination mass. Cannot discriminate particle size. ISO 4405 method.

---

## 7. Air Restriction

Air restriction (inlet restriction) is the pressure drop across an air filtration system at rated airflow conditions. It is the primary service indicator for air filter elements.

### 7.1 Physics of Restriction

Air restriction is a function of:
- Media permeability (k) and area (A)
- Air density (ρ) and viscosity (μ) at operating temperature
- Face velocity (v) — determined by airflow and effective filtration area
- Particle loading on media surface

As dust loads onto filter media, k decreases and ΔP increases. The rate of restriction rise depends on inlet dust concentration, particle size distribution, media DHC, and face velocity.

### 7.2 Service Interval Calculation

Theoretical service interval based on dust loading:

```
t_service = DHC / (C_in × Q_air × (1 - η_pre))
```

Where:
- DHC = dust holding capacity (g)
- C_in = inlet dust concentration (g/m³)
- Q_air = volumetric airflow (m³/h)
- η_pre = pre-cleaner efficiency (0 if no pre-cleaner)

**Example:** Filter with DHC = 500 g, inlet concentration = 0.5 g/m³, airflow = 300 m³/h, no pre-cleaner:
```
t_service = 500 / (0.5 × 300 × 1.0) = 3.33 hours
```
Under extreme dust conditions (construction, mining), filter intervals can be measured in hours, not months.

### 7.3 Pre-Cleaners and Cyclonic Separators

Pre-cleaners reduce the dust burden on the primary filter element, extending service life proportionally to pre-cleaner efficiency.

**Cyclonic pre-cleaner:** Uses centrifugal force to separate large particles (>20 µm) from the airstream. Efficiency typically 70–90% on coarse road dust; lower on fine silica. No element; continuous self-cleaning.

**Vortex tube pre-cleaner:** Array of small-diameter cyclone tubes in parallel. Higher efficiency than single-body cyclone; suitable for high-dust environments (mining, quarry).

**Effect on primary filter service life:** Pre-cleaner with 85% efficiency on inlet concentration extends primary filter life by approximately 6.7× (1/(1–0.85)) — subject to particle size distribution of the specific site.

### 7.4 Restriction Monitoring

**Mechanical restriction indicator:** Spring-loaded piston with visual flag. Latches at set restriction. Typical set point: 25 in H₂O (6.25 kPa). Reset requires manual action after filter service.

**Electronic differential pressure sensor:** Continuous monitoring. Can be integrated with telematics and fleet management systems. Enables condition-based replacement rather than interval-based.

**Recommended set points:**

| Engine Type | Warning Set Point | Critical Set Point |
|---|---|---|
| On-highway diesel | 500 mm H₂O | 635 mm H₂O |
| Off-road heavy equipment | 600 mm H₂O | 750 mm H₂O |
| Marine diesel | 400 mm H₂O | 500 mm H₂O |
| Industrial compressor | Per OEM | Per OEM |

---

## 8. Dust Holding Capacity

Dust holding capacity (DHC) is the total mass of standardized test dust captured by a filter element from initial restriction to terminal restriction, measured under ISO 5011 conditions.

### 8.1 ISO Fine Test Dust (IFTD)

ISO 5011 specifies ISO Fine Test Dust (formerly AC Fine, now IFTD per ISO 12103-A2) as the standard challenge aerosol.

**IFTD particle size distribution:**
- 0–5 µm: ~39% by mass
- 5–10 µm: ~18% by mass
- 10–20 µm: ~16% by mass
- 20–40 µm: ~18% by mass
- 40–80 µm: ~9% by mass

The distribution is bimodal, with significant fine-particle (<5 µm) content that is most challenging for standard cellulose media.

### 8.2 Gravimetric Test Protocol

Under ISO 5011:
1. Pre-clean and weigh sample filter element (m₁)
2. Mount in test housing at rated airflow
3. Introduce IFTD at standardized feed rate
4. Monitor downstream restriction
5. Stop test at terminal restriction (typically 3.75 kPa for light duty; 6.25 kPa for heavy duty)
6. Remove filter; dry and weigh (m₂)
7. Collect downstream pass-through on membrane filter; weigh (m₃)

```
DHC (g) = m₂ - m₁
Gravimetric efficiency (%) = DHC / (DHC + m₃) × 100
```

### 8.3 Specific Holding Capacity

To compare elements of different sizes, use specific holding capacity:

```
Specific DHC (g/m²) = DHC / EFA
```

Where EFA = effective filtration area (m²). This normalizes performance across element sizes and enables media quality comparison independent of element geometry.

Typical specific DHC values:
- Standard cellulose: 150–300 g/m²
- High-capacity synthetic: 300–600 g/m²
- Nanofiber enhanced: 400–800 g/m² (surface-loading advantage)

---

## 9. Pressure Drop

Pressure drop (ΔP) management is central to filtration system design. Insufficient ΔP means insufficient filtration. Excessive ΔP means reduced system performance, filter collapse risk, and forced bypass.

### 9.1 System ΔP Budget

Every filtration system has a ΔP budget defined by the maximum acceptable restriction before system performance degrades or bypass occurs.

**Lube oil filtration:**
- New filter ΔP at cold start (high viscosity): typically 50–150 kPa
- New filter ΔP at operating temperature: typically 10–40 kPa
- Bypass valve opening: typically 70–200 kPa (model-dependent)
- Cold start bypass is normal and expected — designed-in behavior
- Operating bypass = filter should have been changed

**Hydraulic filtration:**
- New filter ΔP at rated flow: typically 10–50 kPa
- Bypass indicator set point: typically 100–350 kPa
- Bypass valve opening: typically 210–700 kPa depending on circuit
- Pressure spikes (switching transients): can exceed 3× steady-state; media must withstand without structural damage

**Fuel filtration:**
- Initial restriction (diesel): <10 kPa at rated fuel flow
- Service limit: typically 30–60 kPa (fuel pump starvation threshold)
- Vacuum (suction-side filter): limited to -50 kPa before fuel vapor formation

### 9.2 Bypass Valve Engineering

A bypass valve is a spring-loaded check valve that opens when filter ΔP exceeds a set threshold, allowing unfiltered fluid flow rather than starving the downstream system.

**Bypass is a safety mechanism, not a design target.**

When bypass occurs:
- System receives unfiltered fluid
- Contamination load increases
- Component wear accelerates
- No indication to operator in most systems

**Bypass valve specifications:**
- Cracking pressure: pressure at which valve begins to open
- Full-open pressure: typically 25–50% above cracking pressure
- Flow capacity at full open: must meet system demand
- Re-seat pressure: must reseat cleanly to prevent constant bypass

**Anti-drain-back valve (ADV):** Separate from bypass. Prevents oil from draining from filter cavity on engine shutdown. Maintains oil prime for cold start. Typically a rubber flap or spring-loaded ball valve in filter base.

### 9.3 Pressure Spike Protection

Hydraulic systems generate pressure spikes (transients) from valve switching, actuator end-of-stroke, and pump start/stop. Filter elements must withstand these spikes without media damage.

Media collapse pressure specification must exceed maximum expected spike pressure with a safety margin:

```
ΔP_collapse_rating ≥ 3 × ΔP_spike_max
```

Typical hydraulic filter element collapse ratings: 2,000–4,000 kPa (200–400 bar).

---

## 10. Failure Analysis

### 10.1 Collapse

**Definition:** Structural failure of filter element under differential pressure. Media and/or support structure deforms irreversibly, reducing or eliminating filtration.

**Mechanism:** When ΔP across element exceeds the collapse pressure rating of the media-end-cap-liner assembly, the structure buckles inward. Outer pleat tips contact inner liner or core; effective filtration area collapses to near zero. Downstream contamination spikes to unfiltered levels.

**Root causes:**
- Filter not serviced at required interval (excessive ΔP from dust/particle loading)
- Cold-start bypass valve failure (full cold-viscosity pressure applied to element)
- Undersized element for application flow rate
- Pressure spike without adequate bypass valve or pressure spike protection
- Counterfeit element with incorrect collapse pressure specification

**Diagnostic indicators:** Permanently deformed element on removal. Visual evidence of concentric rings or accordion collapse. Particle count spike in fluid samples post-event.

**Prevention:** Correct collapse pressure specification. Restriction monitoring with service response. OEM-specified or equivalent replacement intervals.

### 10.2 Bypass

**Definition:** Fluid flows around filter media rather than through it, avoiding filtration entirely.

**Intended bypass (bypass valve operation):** Normal design response to ΔP exceeding bypass threshold. Protects downstream components from starvation. Results in unfiltered fluid but preserves system operation.

**Unintended bypass (seal failure, housing defect):** Fluid flows around element due to seal failure, cracked housing, misaligned element, or missing seal. Filter element may be structurally intact while providing zero filtration.

**Unintended bypass detection:** Downstream particle count does not decrease below inlet count. Oil analysis shows no improvement in cleanliness code despite filter replacement. Visual inspection reveals absent or damaged seal.

### 10.3 Improper Installation

**Cross-threading:** Filter spin-on thread damaged during installation. Results in leakage or immediate bypass. Prevention: hand-thread until seated before applying torque.

**Incorrect torque:** Under-torque results in seal bypass. Over-torque results in seal damage, housing distortion, or thread stripping. Follow torque specification. Spin-on filters: hand-tight + ¾ turn unless otherwise specified.

**Inverted installation:** Element installed upside-down (axially reversed). Anti-drain-back valve on wrong side; flow path incorrect. Prevention: keyed elements, directional indicators.

**Wrong part application:** Dimensionally compatible element with incorrect bypass pressure, collapse rating, or seal material. Results in specification failure without visible installation defect. Prevention: cross-reference validation against OEM specification, not only dimensional compatibility.

**Double-gasket installation:** Previous seal not removed from housing before new filter installed. Dual-seal stack causes improper compression and seal bypass. Prevention: visual inspection of housing seating surface before installation.

### 10.4 Seal Failure

Seals fail by extrusion, rolling, compression-set, or chemical attack (see Section 4.3). Seal failure results in contaminated bypass at the seal interface.

**Field detection:** Oil or fluid weeping from filter base. Oil on filter exterior below seal land. Drop in system fluid level without visible leak from lines or fittings.

**Prevention:** Correct seal material for application. Lubricate seal lightly with clean system fluid before installation. Inspect seal for damage before installation. Remove old seal before installing new filter.

### 10.5 Media Failure

**Pinhole formation:** Localized failure of media fibers. Caused by:
- Pressure spike exceeding media burst pressure (no liner protection)
- Chemical attack from incompatible fluid (e.g., biodiesel with high free fatty acid content degrading certain glues)
- Mechanical damage from mishandling

**Delamination:** Separation of media layers in multi-layer construction. Caused by adhesive failure at high temperature or chemical exposure. Results in reduced filtration efficiency.

**Detection:** Downstream particle count spike at specific particle sizes. Membrane patch shows high particle density. Element inspection shows discrete hole or separated layers.

**Prevention:** Chemical compatibility validation at design stage. Correct storage and handling procedures. Media burst pressure specification with safety margin.

### 10.6 Water Ingress

**Sources:**
- Condensation in air filter housing (temperature cycling in humid environments)
- Rain water entry from improper air intake routing or damaged housing seals
- Karl Fischer water in diesel fuel (dissolved and free water)
- Coolant leak into crankcase oil (failed head gasket, cracked liner)
- Hydraulic system reservoir condensation breather failure

**Effects of water in each system:**

| System | Effect of Water Ingress |
|---|---|
| Air intake | Filter media structural weakening; restricted airflow if filter becomes saturated |
| Diesel fuel | Microbial growth (Hormoconis resinae, Pseudomonas); emulsification; injector corrosion; HPCR stiction |
| Engine lube oil | Oil emulsification; additive depletion; bearing corrosion; viscosity breakdown |
| Hydraulic | Cavitation (dissolved air release on pressure drop); rust; additive depletion; micro-pitting |
| Coolant | Not applicable as contamination source; coolant intrusion indicates head gasket failure |

**Detection and prevention:**
- Fuel: Karl Fischer titration (ASTM D6304) — target <200 ppm dissolved, 0 ppm free water
- Oil: Crackle test for gross water contamination; FTIR spectrometry for dissolved water
- Prevention: water separator elements in fuel systems; moisture-excluding breathers on reservoirs; drainage sumps in air housing; regular condensate drain maintenance

---

## 11. Materials Engineering

### 11.1 Polyurethane

Polyurethane is the primary material for filter end caps, potting compounds, and structural seal elements in ELIMFILTERS® products.

**Chemistry:** Reaction product of polyol and diisocyanate. Properties controlled by:
- Polyol type: Polyether (hydrolysis-resistant, preferred for water exposure) vs. polyester (better mechanical properties, susceptible to hydrolysis)
- NCO:OH ratio (index): determines crosslink density and hardness
- Catalyst and processing temperature: affect cure time and foam structure

**Mechanical properties:**
- Hardness range achievable: Shore A 10 (foam) to Shore D 80 (rigid)
- Tensile strength: 10–50 MPa (elastomeric grades)
- Elongation at break: 200–600%
- Temperature range: -40°C to +120°C (polyether); -30°C to +100°C (polyester)
- Chemical resistance: good resistance to aliphatic hydrocarbons (diesel, lube oil); susceptible to aromatic solvents, strong acids/bases, ketones

**End cap application:** Open-pore foam (15–40 ppi) for depth-sealing end caps; rigid closed-pore for structural end caps. Foam compression against housing seating surface provides gasket-seal functionality.

### 11.2 Elastomers

**Nitrile rubber (NBR/Acrylonitrile-Butadiene):**
- Standard material for oil-service seals and O-rings
- Acrylonitrile content 18–50% (higher content = better oil resistance, lower flexibility at cold temperature)
- Temperature range: -40°C to +120°C
- Oil swell (ASTM No. 3 oil, 100°C, 70h): <15% for standard grades
- Compression set (70h, 100°C): <25%

**EPDM (Ethylene-Propylene-Diene Monomer):**
- Preferred for coolant, steam, and compressed air applications
- Excellent ozone and UV resistance
- NOT suitable for petroleum oil contact (swells excessively)
- Temperature range: -50°C to +150°C
- Compression set: excellent (< NBR at elevated temperature)

**FKM (Fluorocarbon / Viton®):**
- Premium seal material for high temperature and aggressive chemical environments
- Chemical resistance: excellent against fuels, lubricants, hydraulic fluids, aromatic solvents
- Temperature range: -20°C to +200°C (up to +250°C short-term)
- Compression set (200°C, 70h): <20%
- Cost: 5–15× premium over NBR; justified for critical high-temperature applications

### 11.3 Adhesives

**Hot-melt adhesives (HMA):**
- Thermoplastic base: EVA (ethylene vinyl acetate), polyolefin, or polyamide
- Applied molten (130–200°C); sets on cooling
- Used for: media pleat gluing (edge bonds), seam sealing
- Temperature performance: polyamide HMA up to 120°C; EVA HMA limited to 80°C
- Chemical resistance: must be validated for system fluid

**Two-part structural epoxy:**
- Used for: end cap bonding, housing potting
- Cure time: 24h at 23°C; accelerated at elevated temperature
- Lap shear strength: 15–30 MPa (aluminum substrate)
- Temperature range: -55°C to +130°C (post-cure)

**Phenolic or melamine resin (media impregnation):**
- Applied to wet-laid cellulose or glass fiber web
- Provides wet strength, stiffness for pleating, chemical resistance
- Cure by elevated temperature (120–180°C)
- Resin content: 15–25% by weight for air filter media

### 11.4 Steel

**Filter media liner (perforated steel):**
- Material: Cold-rolled steel (SPCC) per JIS G3141; alternative: SECC zinc-coated
- Hole pattern: typically round, 2–6 mm diameter, 40–60% open area
- Thickness: 0.5–0.8 mm for support liners
- Minimum collapse pressure contribution: must support element to 3× bypass ΔP
- Coating: zinc plate minimum; electrophoretic coating for corrosion-critical applications

**Spin-on filter housing (steel canister):**
- Material: Low-carbon steel (SPCC equivalent)
- Thread specification: SAE and ISO standard threads depending on market
- Wall thickness: 0.8–1.2 mm typical
- Burst pressure: must exceed 4× maximum operating pressure (safety factor)
- Seam construction: drawn and ironed seamless or welded and rolled

### 11.5 Plastics

**Polypropylene (PP):**
- Filter housings, end caps for air and cabin filters, outlet tubes
- Chemical resistance: excellent to hydrocarbons, acids, bases; poor to aromatic solvents, ketones
- Temperature limit: 120°C continuous; 130°C short-term
- Glass-filled grades (PP-GF30): 30% glass content; HDT (heat deflection temperature) 150°C; significantly improved stiffness

**ABS (Acrylonitrile-Butadiene-Styrene):**
- Housings requiring impact resistance and dimensional stability
- Temperature limit: 80°C continuous
- Surface finish: superior to PP for visible components

**Nylon (PA6, PA6.6):**
- High-temperature structural components, bypass valve bodies
- PA6.6: HDT 220°C (dry); 80°C (conditioned, 50% RH)
- Glass-filled PA (PA-GF30): HDT 250°C; excellent structural properties
- Moisture absorption: PA absorbs moisture, changing dimensions; design must account for swelling

---

## 12. Service Life Engineering

### 12.1 Service Life Determination Methods

Service life can be determined by three methods, in order of engineering accuracy:

**1. Condition-based replacement (most accurate):**
Replace when a measurable parameter reaches a defined limit.
- Air filters: replace at terminal restriction (measurement by differential pressure gauge or indicator)
- Lube oil filters: replace when oil analysis indicates contamination level exceeds ISO target, or at restriction limit
- Hydraulic filters: replace when bypass indicator trips, or at particle count threshold
- Fuel filters: replace when fuel pressure differential exceeds limit (fuel starvation threshold)

**2. Usage-based replacement (practical):**
Replace at defined operating hours or mileage/kilometers.
- Based on statistical dust concentration data for the application environment
- Conservative: targets 80th-percentile operating environment
- Must be validated against local conditions; high-dust environments require shorter intervals

**3. Calendar-based replacement (minimum standard):**
Replace at defined calendar interval regardless of usage.
- Applicable for low-utilization equipment or standby systems
- Prevents degradation from long static exposure, moisture absorption, UV, ozone, chemical aging
- Maximum calendar interval for standard service: 12 months for lube/fuel; 24 months for air

### 12.2 Extended Drain Engineering

Extended drain intervals require validation of four conditions:

1. **Media capacity:** Synthetic or nanofiber media with sufficient DHC or fluid holding capacity for the extended interval
2. **Media chemical stability:** Media, adhesives, and seals rated for extended fluid contact at operating temperature
3. **Fluid analysis support:** Oil or fluid analysis program confirms contamination levels remain within target ISO code throughout extended interval
4. **Operating environment validation:** Site-specific dust/contamination load within design assumptions

**Extended drain is an engineered decision, not a marketing claim.** It requires fluid analysis data from the specific fleet at the specific site conditions.

### 12.3 Safety Factor Philosophy

Service intervals specified by ELIMFILTERS® include a minimum 20% safety factor against the calculated DHC-limited interval under average operating conditions.

Where operating conditions are unknown, the service interval defaults to OEM specification or the conservative estimate for the industry category.

---

## 13. Total Cost of Ownership

### 13.1 TCO Components

Total Cost of Ownership (TCO) for filtration-sensitive assets includes:

| Component | Typical Share of Total TCO | Filtration Impact |
|---|---|---|
| Equipment acquisition | 30–40% | Amortized; not affected by filtration |
| Scheduled maintenance | 15–25% | Extended intervals reduce; contamination failure increases |
| Unscheduled downtime | 10–30% | Primary filtration savings lever |
| Component premature replacement | 10–20% | Second primary filtration savings lever |
| Fuel consumption | 10–15% | Air restriction affects engine efficiency |
| Operator costs | 10–15% | Downtime-dependent |
| Filter consumables | 0.5–2% | Filter cost alone is a poor TCO metric |

**Key insight:** Filter consumables represent 0.5–2% of asset TCO. Decisions optimized on filter unit cost cannot produce meaningful TCO savings. Decisions optimized on contamination control effectiveness can address 20–50% of asset TCO.

### 13.2 Downtime Cost Modeling

**Unscheduled downtime cost:**

```
C_downtime = t_repair × (R_production + C_labor + C_expedite)
```

Where:
- t_repair = repair duration (hours)
- R_production = revenue or production value per hour
- C_labor = maintenance labor cost per hour × crew size
- C_expedite = expedite freight, crane, specialist costs

**Mining equipment example:**
- Production value lost: $4,000–$12,000/hour
- Maintenance crew: 3 technicians × $85/hour
- Expedite parts/crane: $500–$2,000 per event
- Total unscheduled breakdown cost: $5,000–$15,000 per event
- Hydraulic pump rebuild triggered by contamination failure: $40,000–$120,000 parts + labor

**Bearing premature failure (contamination-induced) vs. scheduled:**
- Scheduled replacement at EOL: $800–$2,500 parts + 4 hours labor
- Unscheduled failure mid-shift: $3,000–$8,000 parts + 16–24 hours downtime + $4,000–$12,000/hour production loss

**Filtration ROI calculation:**

```
ROI = (ΔC_downtime + ΔC_components) / ΔC_filtration × 100%
```

A properly documented system approach with ISO cleanliness target compliance consistently demonstrates ROI > 500% on a 3-year horizon for heavy equipment.

### 13.3 Asset Life Extension

Contamination-controlled assets extend service life 30–50% relative to commodity filtration approach in documented field studies. Life extension is defined as operating hours to first major overhaul.

**Engine overhaul timing (ISO 16/14/11 target vs. typical 19/17/14):**
- Typical: 10,000–15,000 hours to first overhaul
- System approach: 15,000–25,000 hours to first overhaul
- Delta: 5,000–10,000 operating hours
- Value of delta at $4,000/hour: $20,000,000–$40,000,000 per major asset

These figures are order-of-magnitude estimates requiring validation against specific equipment models, duty cycles, and site conditions.

---

## 14. Testing & Validation

### 14.1 ISO 16889 — Hydraulic Filter Multi-Pass Test

**Scope:** Determines Beta ratio (filtration ratio) for hydraulic filter elements.

**Method:** Fluid circulates continuously through element. ISO Fine Test Dust added at upstream injection point. Automatic particle counters count particles upstream and downstream continuously. Test runs until filter reaches terminal bypass condition or defined test duration.

**Beta ratio formula:**
```
β_x(c) = (N_upstream ≥ x µm) / (N_downstream ≥ x µm)
```

Where x = particle size threshold (µm(c), indicating calibration per ISO 11171).

**Beta ratio interpretation:**

| β Value | Efficiency | Filter Grade |
|---|---|---|
| β₁₀ = 2 | 50% | Standard cellulose engine oil |
| β₁₀ = 10 | 90% | High-capacity lube |
| β₁₀ = 75 | 98.7% | Hydraulic standard |
| β₁₀ = 200 | 99.5% | Hydraulic high-efficiency |
| β₄ = 1000 | 99.9% | HPCR fuel filtration |

**Test fluid:** ISO VG 32 mineral oil at 53°C ±1°C.

**Test dust:** ISO Medium Test Dust (ISO 12103-A3).

### 14.2 ISO 5011 — Air Intake Filter Performance

**Scope:** Measures four performance parameters: initial restriction, filtration efficiency, dust holding capacity, and terminal restriction.

**Test rig:** Sealed test housing at rated airflow velocity. Upstream dust feed via Venturi injection. Downstream measurement by gravimetric collection on membrane filter.

**Test dust:** ISO Fine Test Dust (ISO 12103-A2).

**Key outputs:**
- Initial restriction (ΔP₀, Pa or kPa)
- Gravimetric efficiency (%)
- Dust holding capacity (g)
- Terminal restriction (ΔP_T)

### 14.3 SAE J1858 — Cabin Air Filter Test

**Scope:** Performance of cabin air filters in vehicle HVAC systems.

**Method:** Filter mounted in standardized test housing. Three challenge aerosols applied sequentially:
1. ASHRAE 52.2 Test Dust — coarse particulate
2. KCl aerosol — fine particulate (MPPS range)
3. Biological challenge (optional per variant)

**Key outputs:**
- Arrestance (% by mass) for coarse particles
- Efficiency (%) at specific particle size for fine particles
- Initial resistance (Pa)
- Dust holding capacity to defined restriction increase

**ISO 11155-1 (particulate)** and **ISO 11155-2 (gaseous):** The international equivalent standards, widely used outside North America. ISO 11155-2 specifically addresses chemical filtration (activated carbon) performance.

### 14.4 ISO 4406 — Fluid Cleanliness Coding

**Scope:** Provides a method for coding the level of particulate contamination in hydraulic and lubricating fluids.

**Method:** Fluid sampled per ISO 4021 (in-service sampling). Particles counted per ISO 11171 automatic particle counter method. Three cumulative counts (≥4, ≥6, ≥14 µm(c)) converted to scale numbers using ISO 4406 table.

**Critical requirement:** Samples collected under representative operating conditions. Freshly changed fluid is not representative of operating cleanliness. Sample after at least one complete system recirculation.

### 14.5 NAS 1638 — Cleanliness Classification

**Scope:** Contamination classification system developed for aerospace hydraulics. Specifies limits in five particle size ranges per 100 mL.

**Application in industrial filtration:** NAS 1638 persists in specifications for older industrial hydraulic systems, military equipment, and some OEM documentation. Modern standards reference ISO 4406, but field engineers frequently encounter both.

**Conversion guidance (approximate):**

| NAS Class | Approximate ISO 4406 Equivalent |
|---|---|
| NAS 6 | ISO 17/14/12 |
| NAS 7 | ISO 18/15/12 |
| NAS 8 | ISO 19/16/13 |
| NAS 9 | ISO 20/17/14 |
| NAS 10 | ISO 21/18/15 |

### 14.6 ISO 29463 — High Efficiency Particulate Air Filters

**Scope:** Classification and performance testing of HEPA and ULPA filters.

**Filter classes:**

| Class | Minimum Efficiency | Test Method |
|---|---|---|
| E10 | 85% | Sodium flame / MPPS |
| E11 | 95% | Sodium flame / MPPS |
| E12 | 99.5% | Sodium flame / MPPS |
| H13 | 99.95% | Scan test |
| H14 | 99.995% | Scan test |
| U15 | 99.9995% | Scan test |
| U16 | 99.99995% | Scan test |
| U17 | 99.999995% | Scan test |

Sodium flame test measures efficiency at MPPS (typically 0.1–0.3 µm for charged particles in air).

HEPA filtration (H13+) in cabin air applications provides protection against submicron particulate (PM₁.₀, PM₀.₁) and biological aerosols (virus-bearing particles, bacteria).

### 14.7 ISO 11171 — Particle Counter Calibration

**Scope:** Calibration of automatic particle counters (APCs) for liquid contamination analysis.

**Principle:** APCs are calibrated against NIST-traceable reference materials (NIST SRM 2806 or BCR 67X series) using calibration protocol defined in ISO 11171.

**Critical distinction:** ISO 11171-calibrated particle sizes are denoted µm(c) — calibrated. Pre-ISO 11171 sizes denoted µm(b) — unqualified. Approximately µm(c) = µm(b) / 1.56 for the same physical particle size. This distinction is significant in converting legacy specifications to modern ISO 4406 targets.

---

## 15. Systems Engineering

### 15.1 Air Intake Protection

**Contamination target:** Airborne particulate entering the engine air intake system.

**Critical particle sizes:** >5 µm cause accelerated cylinder liner and piston ring wear. Silica particles (hardness ~7 Mohs) cause abrasive wear at rates 10–100× that of soft particles.

**Design requirements:**
- Minimum gravimetric efficiency: 99.5% (ISO 5011)
- Dust holding capacity: sized for site-specific interval
- Restriction limit: application-specific (see Section 7.2)
- Structural integrity: collapse pressure > 3× maximum restriction
- Seal integrity: zero bypass under operating vibration and thermal cycling

**Technologies:** MACROCORE™ (primary filtration), INTEKCORE™ (housing systems)

**Standards:** ISO 5011, SAE J726 (air cleaner test code)

**Contamination consequence:** Each gram of silica dust ingested causes measurable cylinder liner wear. At 0.01% dust passage (99.99% efficiency), 1 g/m³ inlet concentration at 300 m³/h airflow = 0.3 g/hour passing the filter. Over 1,000 operating hours: 300 g of silica ingested = accelerated overhaul requirement.

### 15.2 Fuel Cleanliness Protection

**Contamination targets:** Water (dissolved and free), particulate (hard particles threatening HPCR injectors), microbial contamination.

**HPCR injector protection:**
- Injector needle clearance: 0.5–2 µm
- Target cleanliness: ISO 12/10/8
- Hard particles >6 µm cause needle seat wear, sticking, and flow variation
- Water >200 ppm causes injector corrosion, microbe-facilitated degradation

**Three-stage protection strategy:**
1. Primary particulate filtration: >10 µm particles removed (SYNTAPORE™)
2. Water separation: coalescing element (TURBOCORE™)
3. Final HPCR stage: <4 µm particle removal (TURBOCORE™)

**Standards:** ASTM D6304 (water content, Karl Fischer), ISO 12937, ISO 16332 (fuel filter test)

**Microbial detection:** ASTM D6974 (IP 613), ATP bioluminescence, dip slide culture — quarterly monitoring for marine, inland waterway, and stored fuel applications.

### 15.3 Lubrication Protection

**Contamination target:** Particulate in engine crankcase oil affecting bearing journals, piston rings, and valve train components.

**Target cleanliness code:** ISO 16/14/11 (system approach); standard industry typical: ISO 19/17/14.

**Critical particle sizes:**
- 5–15 µm: accelerate bearing fatigue (sub-surface spalling mechanism)
- 15–40 µm: direct abrasive cutting of bearing surfaces
- >40 µm: macro-wear and debris generation

**Filter efficiency requirement:** β₁₀(c) ≥ 75 for standard heavy-duty service. β₁₀(c) ≥ 200 for extended drain synthetic program.

**Technologies:** SYNTRAX™ (synthetic multi-layer lube oil media)

**Standards:** ISO 4406, ISO 16889, SAE J1858, ISO 13357 (lubricant filterability)

**Oil analysis program integration:** System approach requires periodic oil analysis (every 250–500 hours depending on equipment) to confirm ISO code compliance and detect early failure modes (iron, copper, silicon trending).

### 15.4 Hydraulic Protection

**Contamination target:** Particulate in hydraulic fluid affecting proportional valves, servo valves, pumps, and actuators.

**Target cleanliness codes by component sensitivity:**
- Gear pumps, cylinders: ISO 20/18/15
- Fixed-displacement vane/piston: ISO 18/16/13
- Proportional valves: ISO 16/14/11
- Servo valves: ISO 14/12/9
- High-speed piston pumps, new-generation electronics: ISO 15/13/10

**Multi-stage hydraulic filtration:**
1. Return line filter: primary system protection; highest dirt load
2. Pressure line filter: protects sensitive directional/servo valves
3. Off-line (kidney loop) filter: continuous recirculation polishing; most efficient method for achieving target cleanliness
4. Case drain filter: protects low-pressure return from pump casing

**Technologies:** NANOFORCE™ (hydraulic system filtration)

**Standards:** ISO 16889, ISO 4406, ISO 11171, NFPA T2.14 (hydraulic filter integrity test), DIN 51524 (hydraulic fluid specification), ISO 4021 (in-service fluid sampling)

### 15.5 Cooling System Protection

**Contamination targets:** Silicate scale deposits, cavitation erosion debris, biological growth, electrolytic corrosion products, and glycol degradation products.

**Contamination mechanisms:**
- Silicate depletion → scale formation on hot surfaces → hot spots → head gasket failure
- Cavitation in wet-liner engines → pitting erosion → liner perforation
- OAT/HOAT coolant depleted of corrosion inhibitors → copper and iron corrosion
- pH drop below 6.5 → aggressive attack on aluminum and copper alloys

**SCA (Supplemental Coolant Additive) management:**
- SCA concentration maintained by direct measurement (refractometer, titration) or timed replacement
- Filter-based SCA delivery: cooling filter with SCA charge releases additive progressively into coolant flow
- Cavitation inhibitor: nitrite concentration maintained at 1,500–2,500 ppm for wet-liner protection

**Technologies:** THERMACORE™ (cooling system SCA and filtration)

**Standards:** ASTM D6210 (heavy-duty coolant specification), ASTM D3306 (light-duty), ASTM D1177 (freeze point), ASTM E1177 (SCA nitrite content)

### 15.6 Cabin Air Protection

**Contamination targets:** Airborne particulate (PM₁₀, PM₂.₅, PM₁.₀), biological aerosols, and chemical pollutants affecting operator health.

**Occupational exposure limits (OEL) for relevant particles:**
- Respirable silica (crystalline): 0.025 mg/m³ (OSHA PEL)
- Respirable coal dust: 1.5 mg/m³ (MSHA)
- Respirable inhalable dust: 5 mg/m³ (ACGIH TLV)

**Cabin overpressure requirement:** Pressurized cabs maintain positive pressure differential (25–50 Pa) relative to external environment to prevent unfiltered infiltration. Regular door seal inspection required.

**Filter efficiency vs. threat:**
- PM₁₀ protection (coarse dust): G4-F5 class (ISO 16890) sufficient
- Mining/construction PM₂.₅: F7-F9 class required
- HEPA-adjacent protection (virus, fine silica): H13 class
- Combined chemical + particulate: carbon + H11 multi-layer

**Technologies:** MICROKAPPA™ (cabin air filtration system)

**Standards:** ISO 11155-1 (particulate), ISO 11155-2 (chemical), DIN 71220 (cabin air test), ISO 16890 (general air filter classification)

### 15.7 Pneumatic Brake System Air Protection

**Contamination target:** Moisture (water vapor and condensation) in pneumatic brake-system compressed-air circuits on heavy-duty commercial transport, construction, and mining equipment.

**Engineering approach:** Air-dryer capacity, purge behavior, airflow, and replacement interval are matched to compressor duty and ambient moisture exposure for the approved application. Applicable compressed-air and vehicle-system requirements must be selected for the approved application; no universal purity class or certification claim is implied by the technology name alone.

**Technologies:** DRYCORE™ (pneumatic brake-system air-dryer filtration)

---

## 16. Technology Registry

### MACROCORE™

**Domain:** Air Intake Protection

**Engineering principle:** Multi-layer synthetic media construction optimizing the balance between dust holding capacity, filtration efficiency, and pressure drop at industrial airflow rates.

**Target contamination:** Airborne particulate — silica, carbon black, grain dust, coal dust, construction debris. Primary particle size threat: 5–40 µm abrasive particles.

**Performance targets:**
- Gravimetric efficiency: ≥99.5% (ISO 5011)
- Initial restriction: ≤2.5 kPa at rated flow
- Specific DHC: ≥400 g/m²
- Collapse pressure: ≥10 kPa

**Applicable standards:** ISO 5011, SAE J726

**Systems covered:** Air Intake Protection

---

### MICROKAPPA™

**Domain:** Cabin Air Protection — Operator Health

**Engineering principle:** Multi-function media combining mechanical particulate filtration (HEPA-adjacent for fine particles) with activated carbon adsorption for chemical pollutants. Designed to meet occupational exposure limits for mining and construction dust environments.

**Target contamination:** PM₁₀, PM₂.₅, PM₁.₀ particulate; crystalline silica; coal dust; biological aerosols; VOCs; NO₂ in traffic tunnel environments.

**Performance targets:**
- PM2.5 efficiency, initial resistance, and chemical filtration performance are selected per the ISO 11155-1/ISO 11155-2 targets specified for the approved application; no universal certification or efficiency claim is implied by the MICROKAPPA™ name alone.

**Applicable standards:** ISO 11155-1, ISO 11155-2, DIN 71220, ISO 16890

**Systems covered:** Cabin Air Protection

---

### SYNTAPORE™

**Domain:** Fuel Cleanliness — HPCR Injector Protection

**Engineering principle:** Electrospun nanofiber or ultra-fine glass fiber media achieving high Beta ratio at 4 µm(c) for HPCR fuel system protection. Surface-loading mechanism provides stable efficiency throughout service life.

**Target contamination:** Hard particles >4 µm threatening HPCR injector needles, seats, and solenoid actuators. Compatibility with biodiesel blends (EN 14214) and ultra-low sulfur diesel.

**Performance targets:**
- β₄(c) ≥ 200 (ISO 16889 equivalent, fuel test rig)
- Compatible with B20 biodiesel blend
- Water tolerance: no media degradation to 500 ppm water in fuel

**Applicable standards:** ASTM D6304, ISO 12937, ISO 16332

**Systems covered:** Fuel Cleanliness Protection

---

### SYNTRAX™

**Domain:** Engine Lubrication — Lube Oil Filtration

**Engineering principle:** Synthetic multi-layer construction combining coarse glass fiber pre-layer (particle capacity), fine glass fiber main layer (rated efficiency), and melt-blown final layer (dirt retention/anti-migration). Optimized for extended drain interval programs.

**Target contamination:** Metallic wear particles (iron, copper, lead), silica ingress particles, carbon soot agglomerates, oxidation products in engine lube oil.

**Performance targets:**
- Beta ratio, dirt-holding capacity, and rated service interval are selected per the ISO 16889/ISO 4406/ISO 4548-12 targets specified for the approved application; no universal cleanliness code, Beta ratio, or service-life multiplier is implied by the SYNTRAX™ name alone.

**Applicable standards:** ISO 16889, ISO 4406, ISO 4548-12

**Systems covered:** Lubrication Protection

---

### NANOFORCE™

**Domain:** Hydraulic System Filtration

**Engineering principle:** High-efficiency hydraulic filter element with glass fiber synthetic media achieving sub-15 µm rated efficiency. Designed for proportional valve protection in mobile and industrial hydraulic circuits.

**Target contamination:** Hard particles (silica, metallic wear, hose cuttings) in hydraulic fluid. Primary threat: particles 5–15 µm causing proportional valve spool wear and stiction.

**Performance targets:**
- Beta ratio, collapse pressure rating, and bypass valve cracking pressure are selected per the ISO 16889/NFPA T2.14/ISO 4406 targets specified for the approved application; no universal Beta ratio or cleanliness code is implied by the NANOFORCE™ name alone.

**Applicable standards:** ISO 16889, NFPA T2.14, ISO 4406

**Systems covered:** Hydraulic Protection

---

### THERMACORE™

**Domain:** Cooling System SCA Management

**Engineering principle:** Combination filter element with SCA-impregnated charge bead section and coolant particulate filter media. Delivers supplemental coolant additive at controlled rate proportional to coolant flow.

**Target contamination:** Silicate scale, corrosion products, biological growth in heavy-duty engine cooling systems. Maintains nitrite concentration for wet-liner cavitation protection.

**SCA delivery rate:** Designed for OEM-specified cooling circuit flow rate. SCA charge sized for rated change interval.

**Performance targets:**
- SCA release rate and particulate removal efficiency are selected per the ASTM D6210/ASTM D3306 targets specified for the approved application; no universal cleanliness code or removal efficiency is implied by the THERMACORE™ name alone.
- Compatible with OAT, HOAT, and conventional coolant formulations

**Applicable standards:** ASTM D6210, ASTM D3306

**Systems covered:** Cooling System Protection

---

### TURBOCORE™

**Domain:** Fuel Water Separation

**Engineering principle:** Coalescing filter element for water separation from diesel and biodiesel fuel. Hydrophobic media surface causes water droplets to coalesce and settle to sump.

**Target contamination:** Free water and emulsified water in diesel fuel. Secondary particulate removal.

**Performance targets:**
- Water separation efficiency: ≥96% free water (ISO 16332)
- Particulate removal: ≥90% at 10 µm
- Sump drain interval: application-specific (monitor via water-in-fuel sensor)

**Applicable standards:** ASTM D6304, ISO 12937, ISO 16332

**Systems covered:** Fuel Cleanliness Protection

---

### DRYCORE™

**Domain:** Pneumatic Brake System Air Protection

**Engineering principle:** Air-dryer filtration for moisture control in pneumatic brake-system compressed-air circuits on heavy-duty commercial transport, construction, and mining equipment. Capacity, purge behavior, airflow, and replacement interval are matched to compressor duty and ambient moisture exposure for the approved application.

**Target contamination:** Moisture (water vapor and condensation) in pneumatic brake-system compressed air.

**Performance targets:**
- Moisture-control capacity and purge behavior are selected per the approved pneumatic brake-system application; no universal purity class or certification claim is implied by the DRYCORE™ name alone.

**Applicable standards:** Applicable compressed-air and vehicle-system requirements must be selected for the approved application.

**Systems covered:** Air Intake & Airflow Protection

---

### INTEKCORE™

**Domain:** Air Intake Housing Systems

**Engineering principle:** Housing and pre-cleaner systems designed to optimize air intake filtration performance by controlling upstream conditions (pre-cleaning, airflow distribution, restriction monitoring provision).

**Target function:** System integration — positions primary MACROCORE™ element for optimum service life and performance; provisions for restriction indicator; rain and dust exclusion geometry.

**Applicable standards:** ISO 5011, SAE J1042 (air cleaner housing)

**Systems covered:** Air Intake Protection

---

## 17. Industry Engineering

### 17.1 Mining

**Asset profile:** Rotary drilling rigs, electric rope shovels, hydraulic excavators, haul trucks (150–400 ton), ancillary fleet (dozers, graders, loaders, water trucks).

**Contamination environment — EXTREME:**
- Silica dust concentration: 1–10 g/m³ (surface mining); up to 50 g/m³ (underground development)
- Particle distribution: bimodal — coarse blasted rock >100 µm; fine respirable silica <10 µm
- Diesel fuel quality: ISO 8217 DMX/DMA grade; variable water content (storage conditions)
- Hydraulic duty: high-cycle, high-pressure (280–420 bar operating), extreme ambient temperature variation

**Primary filtration failures in mining:**
- Air intake collapse from excessive restriction interval (overburden blast dust events)
- HPCR injector wear from fuel water contamination (tropical climate condensation in above-ground storage)
- Hydraulic proportional valve stiction from silica ingress via breather failure
- Cabin operator silicosis exposure from failed cabin pressurization seals

**ELIMFILTERS® engineering response:**
- Air: MACROCORE™ with INTEKCORE™ pre-cleaner; restriction monitoring mandatory; 2–4× standard interval reduction in extreme dust
- Fuel: SYNTAPORE™ particulate filtration + TURBOCORE™ water separation with water-in-fuel alarm
- Hydraulic: NANOFORCE™ with offline kidney loop to ISO 15/13/10; bypass indicator monitoring
- Cabin: MICROKAPPA™ H13-class; pressurization system inspection quarterly

**Critical service intervals (guideline — validate against site conditions):**

| System | Standard | Mining Extreme |
|---|---|---|
| Air intake | OEM specification | 250–500 hours or on indicator |
| Fuel primary | 500 hours | 250 hours |
| Lube oil | OEM specification | OEM or oil analysis |
| Hydraulic | 2,000 hours | 1,000 hours or on bypass |
| Cabin air | 6 months | 3 months |

### 17.2 Construction

**Asset profile:** Crawler excavators (20–100 ton), wheel loaders, articulated dump trucks, motor graders, pipelayers, compactors.

**Contamination environment — HIGH:**
- Dust: mixed silica, calcium carbonate (limestone quarry), soil dust; lower than mining in most applications
- Road dust on highway construction: fine material with high silica content
- Diesel fuel: high variation in storage quality; tank condensation common
- Hydraulic: moderate cycle rate; ambient temperature variation significant (seasonal extremes)

**Priority systems:** Air intake (construction dust) + Hydraulic (attachment changeout contamination ingress) + Lube oil (extended drain pressure from fleet economics).

**Key contamination risk:** Attachment (bucket, hammer, grapple) changeout without hydraulic line protection. Each unprotected quick-coupler connection can introduce particles directly into hydraulic circuit.

**ELIMFILTERS® engineering response:** Hydraulic quick-coupler contamination prevention procedures in addition to filtration; NANOFORCE™ return line filtration; offline system for long-term cleanliness maintenance.

### 17.3 Agriculture

**Asset profile:** Combines, tractors (100–600 HP), planters, sprayers, grain carts, cotton pickers.

**Contamination environment — HIGH, SEASONAL:**
- Peak contamination during harvest: grain dust, chaff, cotton lint, soil dust
- Air intake challenge: unique in agriculture — high volumetric flow (combines) + high chaff-specific dust (lower silica content than mining, but high mass concentration)
- Cabin: operator health in herbicide/pesticide environments requires chemical filtration
- Hydraulic: attachment contamination from implement changes (similar to construction)

**Seasonal factor:** Agriculture has very high contamination intensity for 60–90 day periods (harvest) followed by low-use periods. Filter replacement should be timed to contamination events, not calendar.

**Special consideration — pre-cleaner requirement:** Combine air intakes typically require centrifugal pre-cleaners due to chaff concentration exceeding standard filter DHC at rated intervals. Pre-cleaner maintenance (fan operation, chaff ejector) is a primary service point.

**Cabin chemical filtration:** MICROKAPPA™ with activated carbon stage for herbicide and pesticide environments (ISO 11155-2). Operator absorption of organophosphates through unfiltered cabin air is a documented occupational health risk.

### 17.4 Manufacturing

**Asset profile:** CNC machining centers, stamping presses, injection molding machines, industrial compressors, hydraulic power units, conveyor systems, air handling units.

**Contamination environment — LOW to MEDIUM:**
- Industrial: coolant mist, metalworking fluid, grinding dust, heat-treated steel particulate
- Compressed air: critical quality parameter; most manufacturing lines specify ISO 8573-1 Class 1:4:1 or tighter
- Hydraulic: precision machine tools require ISO 15/13/10 or tighter

**Priority systems:** Compressed air (critical for pneumatic controls, blow-off, spray finishing) + Hydraulic (precision axis control) + Industrial HVAC (clean room environments).

### 17.5 Marine

**Asset profile:** Offshore supply vessels, tugs, ferries, fishing vessels, inland barges, port service vessels, small commercial craft.

**Contamination environment — MEDIUM-HIGH, UNIQUE:**
- Saltwater intrusion: corrosion-accelerating environment; Cl⁻ ions in engine oil indicate coolant or seawater entry
- Diesel fuel: high risk of microbiological growth in tropical climate tanks (Hormoconis resinae); high water-in-fuel events from condensation
- Hydraulic: winch, crane, and steering hydraulics exposed to seawater wash-down
- Cabin: salt aerosol + diesel exhaust on working decks; VOC exposure in engine rooms

**IMO and classification society requirements:** SOLAS compliance for passenger vessels; classification society survey requirements (DNV, Lloyd's, ABS) mandate filtration inspection and record-keeping.

**MARINECLEAN™ ecosystem:** Marine-specific product package addressing multi-system contamination control with salt-resistant materials and IMO-compatible certifications.

**Critical service point — tank microbiological management:** Diesel fuel biocide treatment (Biobor JF or equivalent) + TURBOCORE™ water separation addresses microbial contamination before it reaches injector systems.

### 17.6 Truck Fleets

**Asset profile:** Long-haul semi-trucks, regional delivery trucks, vocational trucks (concrete mixers, dump trucks, refuse trucks).

**Contamination environment — HIGH (vocational); MEDIUM (highway long-haul):**
- Highway long-haul: lower dust exposure; higher fuel consumption; oil oxidation at extended temperature
- Vocational (concrete, refuse, dump): high dust, short cycles, extended idling
- Emissions regulation: Euro VI / EPA 2010+ engines with EGR + DPF + SCR require ultra-low sulfur diesel and high-quality engine oil to prevent aftertreatment degradation

**Emissions aftertreatment integration:**
- EGR cooler soot deposition: high soot load in crankcase oil; requires β₁₀(c) ≥ 200 for soot-resistant extended drain
- DPF (Diesel Particulate Filter): not a lube oil filter; but DPF regeneration causes oil dilution from post-injection fuel
- Oil dilution by fuel: reduces viscosity; increases fire risk; conventional cellulose filter insufficient for fuel-diluted oil filtration efficiency targets

**SYNTRAX™ extended drain program:** Synthetic media combined with an oil analysis program can support an extended oil change interval on modern Euro VI long-haul platforms beyond the standard OEM interval; the specific interval must be validated for the approved application and confirmed by oil analysis at mid-interval.

### 17.7 Oil & Gas

**Asset profile:** Upstream: drilling rigs (rotary drill, top drive), mud pumps, shale shakers; Midstream: gas compressor stations, pipeline pumping; Downstream: refinery process equipment, catalytic cracker.

**Contamination environment — HIGH:**
- Upstream: abrasive drilling fluid (barite, silica); H₂S in sour-gas environments; high-temperature wellbore conditions
- Midstream: natural gas liquids (NGL) contamination in compressor lube oil; pipeline cleaning pig debris
- Compressed air: critical for pneumatic valve actuation in process control; failure can cause HAZOP event

**Seal material specification:** FKM (Viton®) seals mandatory for aromatic solvent contact, H₂S environments, and high-temperature service. NBR inadequate for sour-gas application.

**Hydraulic jack-up rig equipment:** Offshore jack-up rigs operate hydraulic systems in marine environment with active corrosion threat. NANOFORCE™ with corrosion-resistant housing materials and FKM seals.

### 17.8 Power Generation

**Asset profile:** Gas turbines (peaking and base-load), diesel generator sets (standby and primary), combined-cycle plants, coal-fired steam plants (boiler feed pumps, turbine oil systems).

**Contamination environment — HIGH:**
- Gas turbine air intake: critical — silica, salt aerosol in coastal locations, industrial contamination near urban plants
- Gas turbine compressor wash: periodic water washing removes bound deposits; filtration controls re-entrainment
- Diesel genset: standby sets face periodic operation challenges — water condensation in long-term stored fuel, bearing corrosion from stationary storage
- Turbine oil: cleanliness critical for governor valve response; servo valve sensitivity in speed regulation

**Availability requirement:** Power generation equipment has availability targets of 99.5–99.95% (annualized). Unscheduled outage cost: $50,000–$500,000/hour for base-load generation.

**Gas turbine air filtration stages:**
1. Pre-filter (coarse): removes particles >10 µm, insects, leaves — F5/F7 class
2. Final filter: glass fiber HEPA-adjacent — H11 to H13 for salt-sensitive compressors
3. Inlet fogging system (in some plants) — interaction with filter design

**Standby diesel fuel management:** Fuel polishing system (combination water removal + particulate filtration + biocide) for standby gensets with >6 months storage. Quarterly fuel analysis.

---

## 18. Knowledge Center Mapping

This section maps each technical domain to the corresponding ELIMFILTERS® Knowledge Center resources.

| Technical Domain | KC Engineering Articles | KC Standards | KC Systems | KC Industries | Technologies |
|---|---|---|---|---|---|
| Airflow Engineering | Airflow Engineering, Air Restriction | ISO 5011 | Air Intake Protection | Mining, Construction, Agriculture | MACROCORE™, INTEKCORE™ |
| Seal Integrity | Seal Integrity, Failure Analysis | — | All systems | All | All |
| Filter Media Science | Filter Media Science, Materials Engineering | ISO 16889, ISO 5011, ISO 29463 | Air Intake, Lube Oil, Hydraulic | All | SYNTRAX™, NANOFORCE™, MICROKAPPA™ |
| Fluid Cleanliness | Fluid Cleanliness | ISO 4406, NAS 1638, ISO 11171 | Hydraulic, Lube Oil, Fuel | Mining, O&G, Power Gen | NANOFORCE™, SYNTRAX™, SYNTAPORE™ |
| Air Restriction | Air Restriction, Airflow Engineering | ISO 5011 | Air Intake Protection | Mining, Agriculture, Construction | MACROCORE™ |
| Dust Holding Capacity | Airflow Engineering, Service Intervals | ISO 5011 | Air Intake Protection | Mining, Agriculture, Construction | MACROCORE™ |
| Pressure Drop | Airflow Engineering, Air Restriction | ISO 5011, ISO 16889 | All systems | All | All |
| Failure Analysis | Failure Analysis | All applicable | All systems | All | All |
| Materials Engineering | Materials Engineering | — | All systems | All | All |
| Service Life Engineering | Service Intervals, TCO | All applicable | All systems | All | SYNTRAX™, NANOFORCE™ |
| Total Cost of Ownership | Total Cost of Ownership | — | All systems | Mining, Truck Fleets | All |
| Testing & Validation | Testing & Validation | ISO 16889, ISO 5011, ISO 4406, SAE J1858, NAS 1638, ISO 29463, ISO 11171 | All systems | All | All |
| Systems Engineering | All articles | All standards | Air, Fuel, Lube, Hydraulic, Cooling, Cabin, Compressed Air | All | All technologies |
| Technology Registry | All articles | Varies by technology | Varies by technology | Varies by application | All 9 technologies |
| Industry Engineering | Varies | Varies | All systems | Mining, Construction, Agriculture, Manufacturing, Marine, Truck Fleets, O&G, Power Generation | All |

**AI Search integration:** All section titles, technology names, standard codes, and industry names in this document are indexed in the Knowledge Center AI search. Cross-reference queries (e.g., "hydraulic proportional valve ISO cleanliness") should return: Section 15.4, NANOFORCE™ technology entry, ISO 4406 standard page, and relevant engineering articles.

---

## 19. Governance

### 19.1 Engineering Doctrine Change Process

This document defines engineering principles. Changes to established engineering principles require rigorous review to ensure consistency across all ELIMFILTERS® product lines, customer documentation, and Knowledge Center content.

**Change triggers:**

1. New international standard publication or revision (ISO, ASTM, SAE, NAS)
2. New technology platform introduction or existing platform performance update
3. New industry or application with unique contamination characteristics not covered by existing content
4. Correction of technical error identified in field data, lab data, or external review
5. New contamination mechanism identified through failure analysis or scientific literature

**Change request process:**

| Step | Action | Responsibility |
|---|---|---|
| 1 | Change Request Submission — describe the specific section, current text, proposed revision, and technical justification | Any ELIMFILTERS® engineer |
| 2 | Technical Review — independent review of proposed change against cited standards and field data | Senior engineering reviewer |
| 3 | Cross-reference audit — identify all KC pages, technology pages, industry pages, and product specifications affected by the change | KC engineering team |
| 4 | Impact assessment — evaluate effect on existing product specifications, customer programs, and warranty claims | Engineering + Commercial |
| 5 | Authorization — formal approval by Engineering Leadership | Engineering Director |
| 6 | Version increment — document updated, version number incremented | Documentation controller |
| 7 | Distribution — updated document distributed to all stakeholders; Knowledge Center updated within 30 days | KC engineering team |

**Version control:**
- Major revision (new sections, significant technical change): increment major version (1.0 → 2.0)
- Minor revision (correction, clarification, standard code update): increment minor version (1.0 → 1.1)
- All versions retained in vault with supersession notation

### 19.2 Technical Doctrine vs. Product Specifications

This document defines engineering principles that govern product design, selection, and performance claims. It does not specify individual product dimensions, weights, thread sizes, or part numbers.

Product specifications are maintained in:
- ELIMFILTERS® Product Master Catalog (separate document)
- Knowledge Center product pages
- SKU architecture documentation (elimfilters-vault/11-sku-architecture/)

Where a product specification diverges from the principles in this doctrine, the doctrine takes precedence. The divergence must be documented, justified, and authorized per the change process above.

### 19.3 Relationship to Commercial Architecture Master

This Technical Doctrine governs engineering decisions.

ELIMFILTERS_COMMERCIAL_ARCHITECTURE_MASTER v2.0 governs commercial decisions.

Where engineering constraints affect commercial viability (e.g., a technology cannot achieve the claimed performance in a specific application), the engineering constraint is communicated through the change process and the commercial claim is updated accordingly.

The company does not make engineering claims that exceed validated technical capability.

---

*ELIMFILTERS® — Asset Protection Through Contamination Control*

*This Technical Doctrine is the governing engineering reference. All product specifications, technology descriptions, and Knowledge Center technical content shall be consistent with the principles defined herein.*
