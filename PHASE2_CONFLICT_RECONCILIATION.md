# PHASE2_CONFLICT_RECONCILIATION.md
## Phase 2 — Industry Technology-List Conflict Reconciliation

**Date**: 2026-06-02
**Branch**: `claude/dazzling-franklin-ALGY1`
**Status**: Analysis only — no code written, no files modified
**Prerequisite**: UNIFIED_DATA_IMPLEMENTATION_PLAN.md, Section 3.1

---

## Purpose

Seven industries exist in both `catalogue.json` (via `techTags`) and `knowledge-architecture.ts` (via `applicableTechnologies`). Their technology lists disagree across all four available sources. This document resolves each conflict before `unified-data.ts` is written. The output of this document is the authoritative `applicableTechnologies[]` array for each of the seven industries.

---

## Source Key

Every conflict is evaluated against four independent sources:

| Source ID | File | Format | Technical weight |
|-----------|------|--------|-----------------|
| **SRC-A** | `catalogue.json` → industry `techTags[]` | Loose strings with ™ symbol | Lowest — marketing groupings, no validation |
| **SRC-B** | `knowledge-architecture.ts` → `INDUSTRIES[key].applicableTechnologies[]` | Typed constant keys | Highest — explicitly relational, compile-time validated |
| **SRC-C** | `technologies/page.tsx` → `TECH_COMPARISON[n].industries` | Free-text string | Medium — operational confirmation, table-level |
| **SRC-D** | `technologies/page.tsx` → `GEO_DEFINITIONS[slug]` | Prose paragraph | Medium — confirms which industries a technology serves via narrative |

**Inclusion rule**: A technology is recommended if it appears in ≥ 2 of the 4 sources. A technology appearing in only 1 source is flagged for owner decision.

---

## Conflict 1 — AGRICULTURE

### 1. Industry Name
**Agriculture** (`AGRICULTURE`)

Operating profile (from `knowledge-architecture.ts`): HIGH contamination exposure · Outdoor, dust-heavy, seasonal · −10°C to +40°C · Dust ingestion and water during harvesting · Primary equipment: combines, tractors, harvesters, irrigation systems.

---

### 2. Conflicting Sources

| Source | Technologies Listed |
|--------|---------------------|
| **SRC-A** `catalogue.json` techTags | `MACROCORE™`, `AQUAGUARD™`, `SYNTRAX™`, `NANOFORCE™` |
| **SRC-B** `knowledge-architecture.ts` applicableTechnologies | `MACROCORE`, `NANOFORCE`, `DURATECH`, `SYNTRAX` |
| **SRC-C** `TECH_COMPARISON.industries` | MACROCORE → "Mining, Agriculture, Construction, Power Gen" ✅ · SYNTEPORE → "Marine, Offshore, Coastal, Agriculture" ✅ · AQUAGUARD → "Marine, Oil & Gas, Power Gen, Agriculture" ✅ |
| **SRC-D** `GEO_DEFINITIONS` prose | MACROCORE: "agricultural machinery" explicit ✅ · AQUAGUARD: "agriculture" explicit ✅ · SYNTEPORE: "humid tropical agricultural operations" explicit ✅ |

---

### 3. Exact Conflicting Technology Lists

| Technology | SRC-A | SRC-B | SRC-C | SRC-D | Count |
|------------|:-----:|:-----:|:-----:|:-----:|:-----:|
| MACROCORE | ✅ | ✅ | ✅ | ✅ | **4** |
| NANOFORCE | ✅ | ✅ | — | — | **2** |
| SYNTRAX | ✅ | ✅ | — | — | **2** |
| AQUAGUARD | ✅ | — | ✅ | ✅ | **3** |
| DURATECH | — | ✅ | — | — | **1** ⚠️ |
| SYNTEPORE | — | — | ✅ | ✅ | **2** |

**Conflicts**:
- `AQUAGUARD`: in SRC-A, SRC-C, SRC-D — confirmed by 3 sources — but absent from SRC-B (knowledge-architecture.ts). Clear omission in the relational graph.
- `DURATECH`: in SRC-B only — appears in no other source. Requires owner decision.
- `SYNTEPORE`: in SRC-C and SRC-D but not in SRC-A or SRC-B. Requires owner decision.

---

### 4. Recommended Final Technology List

```
RECOMMENDED: ['MACROCORE', 'NANOFORCE', 'SYNTRAX', 'AQUAGUARD', 'DURATECH']
PENDING OWNER DECISION: SYNTEPORE
```

---

### 5. Reasoning

- **MACROCORE**: 4/4 sources. Non-negotiable. Primary technology for crop-dust air intake protection.
- **NANOFORCE**: 2/4 sources. Agricultural hydraulics (irrigation systems, harvester hydraulics) and fuel water separation are genuine field problems. Supported by both the relational graph and marketing grouping.
- **SYNTRAX**: 2/4 sources. Engine oil protection for long-season harvest equipment is a core use case. Confirmed by both primary sources.
- **AQUAGUARD**: 3/4 sources confirmed; absent only from SRC-B. This is an authoring gap in `knowledge-architecture.ts`, not a real exclusion. Water in stored diesel is a documented agricultural contamination problem (condensation in fuel tanks, seasonal storage). The `AQUAGUARD` GEO definition explicitly names agriculture. Include with confidence.
- **DURATECH**: 1/4 sources (SRC-B only). The DURATECH GEO definition describes "mixed-fleet operations in mining, construction, and agriculture" — this is one indirect confirmation from SRC-D prose. Agricultural fleets (tractors, harvesters across a farm operation) are a viable DURATECH kit use case. Marginally recommend YES, but owner confirmation preferred.
- **SYNTEPORE**: 2/4 sources (SRC-C, SRC-D). SYNTEPORE GEO definition explicitly mentions "humid tropical agricultural operations." Coastal and tropical agriculture is a real sub-segment. However, the primary agriculture market (temperate, seasonal grain) does not require all-synthetic humidity-resistant intake media. Recommend as a conditional addition: only if tropical/coastal agriculture is a target segment.

---

### 6. Business Impact

Excluding AQUAGUARD from Agriculture would mean the Part Search engine and AI Engine cannot recommend fuel water-separation products to agricultural customers — a high-value product category for harvest season. Including SYNTEPORE opens the technology to tropical agriculture markets (Brazil, Southeast Asia) where the all-synthetic intake is genuinely required.

---

### 7. Technical Impact

AQUAGUARD inclusion closes the water contamination coverage gap for Agriculture: diesel water contamination has documented impacts on agricultural equipment (injector stiction, microbial growth in stored fuel). Without it, `getContaminationByTechnology('AGRICULTURE')` would not return `DIESEL_WATER` via the technology graph. Including DURATECH enables kit-based cross-sell for multi-equipment farm operations.

---

### 8. Owner Decision Required

| Technology | Decision Required | Recommendation |
|------------|:----------------:|----------------|
| MACROCORE | NO | Include — 4/4 confirmed |
| NANOFORCE | NO | Include — 2/4 confirmed |
| SYNTRAX | NO | Include — 2/4 confirmed |
| AQUAGUARD | NO | Include — 3/4 confirmed (SRC-B omission is authoring gap) |
| DURATECH | **YES** | Recommend YES — does ELIMFILTERS sell DURATECH kits for agricultural fleets? |
| SYNTEPORE | **YES** | Recommend CONDITIONAL — is tropical/coastal agriculture a target market? |

---
---

## Conflict 2 — CONSTRUCTION

### 1. Industry Name
**Construction** (`CONSTRUCTION`)

Operating profile: HIGH contamination exposure · High-dust earthwork sites, unpaved roads · −20°C to +50°C · Silica dust, soil contamination, high-pressure hydraulics · Primary equipment: excavators, bulldozers, loaders, compactors.

---

### 2. Conflicting Sources

| Source | Technologies Listed |
|--------|---------------------|
| **SRC-A** `catalogue.json` techTags | `MACROCORE™`, `NANOFORCE™`, `AQUAGUARD™`, `SYNTRAX™` |
| **SRC-B** `knowledge-architecture.ts` applicableTechnologies | `MACROCORE`, `NANOFORCE`, `DURATECH` |
| **SRC-C** `TECH_COMPARISON.industries` | MACROCORE → "Mining, Agriculture, Construction, Power Gen" ✅ · NANOFORCE → "Construction, Mining, Manufacturing, Marine" ✅ · MICROKAPPA → "Trucks, Bus & Coach, Construction, Mining" ✅ |
| **SRC-D** `GEO_DEFINITIONS` prose | MACROCORE: "construction zones" explicit ✅ · NANOFORCE: industrial machinery — implicit for construction ✅ · DURATECH: "construction" explicit ✅ |

---

### 3. Exact Conflicting Technology Lists

| Technology | SRC-A | SRC-B | SRC-C | SRC-D | Count |
|------------|:-----:|:-----:|:-----:|:-----:|:-----:|
| MACROCORE | ✅ | ✅ | ✅ | ✅ | **4** |
| NANOFORCE | ✅ | ✅ | ✅ | ✅ | **4** |
| DURATECH | — | ✅ | — | ✅ | **2** |
| AQUAGUARD | ✅ | — | — | — | **1** ⚠️ |
| SYNTRAX | ✅ | — | — | — | **1** ⚠️ |
| MICROKAPPA | — | — | ✅ | — | **1** ⚠️ |

**Conflicts**:
- `AQUAGUARD`: in SRC-A only. Water in fuel is less of a primary construction concern than in marine or agriculture.
- `SYNTRAX`: in SRC-A only. Lube oil protection for construction engines is plausible but not confirmed by any technical source.
- `DURATECH`: in SRC-B and SRC-D — a strong 2-source confirmation not present in the marketing grouping.
- `MICROKAPPA`: in SRC-C only (comparison table lists "Construction" as an industry) — cabin air protection in high-silica-dust environments is a legitimate occupational health concern.

**Note**: `NANOFORCE_HYDRAULIC` was a phantom reference removed from CONSTRUCTION in Phase 1 Task 1.3. Its removal was correct — `NANOFORCE` already covers hydraulic contamination for CONSTRUCTION.

---

### 4. Recommended Final Technology List

```
RECOMMENDED: ['MACROCORE', 'NANOFORCE', 'DURATECH', 'SYNTRAX']
PENDING OWNER DECISION: AQUAGUARD, MICROKAPPA
```

---

### 5. Reasoning

- **MACROCORE**: 4/4 sources. Primary intake protection for silica-dust earthwork environments. Non-negotiable.
- **NANOFORCE**: 4/4 sources. High-pressure hydraulic contamination is the defining contamination challenge for excavators, loaders, and compactors. Non-negotiable.
- **DURATECH**: 2/4 sources. Fleet kit consolidation for construction equipment fleets is explicitly named in the DURATECH GEO definition. Construction operations typically run mixed fleets (excavators, dozers, compactors) with staggered service intervals — exactly the DURATECH use case.
- **SYNTRAX**: 1/4 sources (SRC-A only). However, engine lube oil protection for heavy diesel construction equipment has strong technical merit. Recommending YES on grounds that construction diesel engines need oil protection as much as any other heavy-duty application. The SRC-B omission is likely an authoring oversight consistent with the broader pattern of catalogue.json including lube oil technologies that knowledge-architecture.ts omits.
- **AQUAGUARD**: 1/4 sources. Water in construction fuel is a real problem (site fueling from bulk tanks, condensation) but less severe than in marine or agriculture. Fuel separation exists at the system level (Fuel system page). Owner decision: is AQUAGUARD promoted for construction equipment fuel systems?
- **MICROKAPPA**: 1/4 sources. Silica dust in construction cab environments is a documented occupational health issue (IARC Group 1 carcinogen at chronic exposure levels). The TECH_COMPARISON table explicitly lists Construction. The case is strong, but SRC-A and SRC-B did not include it.

---

### 6. Business Impact

MICROKAPPA inclusion enables Part Search and AI Engine to recommend cabin air protection to construction equipment operators — a growing compliance-driven purchase category as occupational silica dust exposure regulations tighten. Excluding it leaves revenue on the table for a market that explicitly needs it.

---

### 7. Technical Impact

DURATECH inclusion enables the `getSystemsByTechnology('DURATECH')` and `getTechnologyByIndustry('CONSTRUCTION')` paths to return the kit consolidation offering. Without it, the Knowledge Graph has no mechanism to suggest bundle purchasing for construction fleets. SYNTRAX inclusion closes the oil contamination coverage gap in the graph — `getContaminationByTechnology('PARTICLE_WEAR')` for construction without SYNTRAX would be incomplete.

---

### 8. Owner Decision Required

| Technology | Decision Required | Recommendation |
|------------|:----------------:|----------------|
| MACROCORE | NO | Include — 4/4 confirmed |
| NANOFORCE | NO | Include — 4/4 confirmed |
| DURATECH | NO | Include — 2/4 confirmed |
| SYNTRAX | NO | Include — strong technical case despite 1/4 sources |
| AQUAGUARD | **YES** | Recommend YES if bulk-tank construction fueling is a target scenario |
| MICROKAPPA | **YES** | Recommend YES — silica dust cab exposure is a compliance concern |

---
---

## Conflict 3 — MINING

### 1. Industry Name
**Mining** (`MINING`)

Operating profile: EXTREME contamination exposure · 24/7 operation, extreme dust · −30°C to +60°C · Continuous dust exposure, hardrock contamination · Primary equipment: haul trucks, drill rigs, loaders, crushers. Downtime cost: ~$180,000/hour per machine.

---

### 2. Conflicting Sources

| Source | Technologies Listed |
|--------|---------------------|
| **SRC-A** `catalogue.json` techTags | `MACROCORE™`, `SYNTRAX™`, `NANOFORCE™`, `AQUAGUARD™`, `SYNTEPORE™` |
| **SRC-B** `knowledge-architecture.ts` applicableTechnologies | `MACROCORE`, `NANOFORCE`, `DURATECH`, `SYNTRAX` |
| **SRC-C** `TECH_COMPARISON.industries` | MACROCORE → "Mining, Agriculture, Construction, Power Gen" ✅ · NANOFORCE → "Construction, Mining, Manufacturing, Marine" ✅ |
| **SRC-D** `GEO_DEFINITIONS` prose | MACROCORE: "mining equipment" explicit ✅ · DURATECH: "mining, construction, and agriculture" explicit ✅ · AQUAGUARD: "mining" explicit ✅ · SYNTEPORE: no mining mention |

---

### 3. Exact Conflicting Technology Lists

| Technology | SRC-A | SRC-B | SRC-C | SRC-D | Count |
|------------|:-----:|:-----:|:-----:|:-----:|:-----:|
| MACROCORE | ✅ | ✅ | ✅ | ✅ | **4** |
| NANOFORCE | ✅ | ✅ | ✅ | — | **3** |
| SYNTRAX | ✅ | ✅ | — | — | **2** |
| AQUAGUARD | ✅ | — | — | ✅ | **2** |
| DURATECH | — | ✅ | — | ✅ | **2** |
| SYNTEPORE | ✅ | — | — | — | **1** ⚠️ |

**Conflicts**:
- `AQUAGUARD`: in SRC-A and SRC-D (GEO definition explicitly names mining) — confirmed by 2 sources but absent from SRC-B. Likely authoring gap.
- `DURATECH`: in SRC-B and SRC-D — 2-source confirmation not reflected in marketing grouping.
- `SYNTEPORE`: in SRC-A only. GEO definition for SYNTEPORE does not mention mining. SRC-A may reflect an upsell listing rather than a technical requirement.

---

### 4. Recommended Final Technology List

```
RECOMMENDED: ['MACROCORE', 'NANOFORCE', 'SYNTRAX', 'AQUAGUARD', 'DURATECH']
PENDING OWNER DECISION: SYNTEPORE
```

---

### 5. Reasoning

- **MACROCORE**: 4/4 sources. The mining industry feature in `catalogue.json` explicitly lists "AIR INTAKE / SYNTEPORE™" and "HYDRAULIC / NANOFORCE™" but the industry techTags lead with MACROCORE. At dust concentrations up to 15,000 mg/m³ in sub-Saharan mining, air intake protection is the primary contamination challenge.
- **NANOFORCE**: 3/4 sources. Hydraulic contamination in mining equipment (loaders, drill rigs) is the second primary failure driver. Non-negotiable.
- **SYNTRAX**: 2/4 sources. Engine oil protection for 24/7 mining duty cycles — haul truck engines running continuously at high load with minimal downtime windows. Justified.
- **AQUAGUARD**: 2/4 sources. The AQUAGUARD GEO definition explicitly names "mining" as an application. Bulk diesel stored at remote mine sites is a documented water contamination vector (condensation cycles, brine exposure in underground operations). SRC-B omission is an authoring gap.
- **DURATECH**: 2/4 sources. Mining fleet standardisation (identical haul trucks across a site operation) is a flagship DURATECH use case. GEO definition confirms "mining" explicitly. SRC-A omission is the gap.
- **SYNTEPORE**: 1/4 sources. The mining industry features card in `catalogue.json` mentions "AIR INTAKE / SYNTEPORE™" in its feature list — this is notable. However, SYNTEPORE is positioned as an all-synthetic intake for humid/coastal/marine environments. Standard open-pit mining is not a humidity-driven environment. Underground mining with high humidity is a potential edge case.

---

### 6. Business Impact

At EXTREME contamination exposure and ~$180,000/hour downtime cost, mining is the highest-value industry for ELIMFILTERS. Including DURATECH enables kit-based fleet standardisation as a premium offering — a documented revenue driver for high-volume mining fleet operators. AQUAGUARD inclusion enables recommendation of fuel water separation for remote mine sites where bulk diesel quality is inconsistent.

---

### 7. Technical Impact

With the recommended list, `mapKnowledgeNetwork('MINING', 'industry')` returns a complete protection profile: air (MACROCORE), hydraulic (NANOFORCE), lube oil (SYNTRAX), fuel water (AQUAGUARD), and fleet kit (DURATECH). Without AQUAGUARD and DURATECH, the graph is missing two protection domains for the highest-severity industry in the catalogue.

---

### 8. Owner Decision Required

| Technology | Decision Required | Recommendation |
|------------|:----------------:|----------------|
| MACROCORE | NO | Include — 4/4 confirmed |
| NANOFORCE | NO | Include — 3/4 confirmed |
| SYNTRAX | NO | Include — 2/4 confirmed |
| AQUAGUARD | NO | Include — 2/4 confirmed (SRC-B gap, SRC-D explicit) |
| DURATECH | NO | Include — 2/4 confirmed (SRC-A gap, SRC-D explicit) |
| SYNTEPORE | **YES** | Recommend CONDITIONAL — is underground mining (humid) a target segment, or does MACROCORE cover all mining air intake? |

---
---

## Conflict 4 — MARINE

### 1. Industry Name
**Marine** (`MARINE`)

Operating profile: MEDIUM-HIGH contamination exposure · High humidity, salt spray, thermal cycling · −10°C to +40°C · Water ingress, microbial growth, corrosion · Primary equipment: fishing vessels, cargo ships, naval equipment.

---

### 2. Conflicting Sources

| Source | Technologies Listed |
|--------|---------------------|
| **SRC-A** `catalogue.json` techTags | `MACROCORE™`, `AQUAGUARD™`, `SYNTRAX™`, `NANOFORCE™` |
| **SRC-B** `knowledge-architecture.ts` applicableTechnologies | `NANOFORCE`, `AQUAGUARD`, `DURATECH`, `SYNTRAX` |
| **SRC-C** `TECH_COMPARISON.industries` | SYNTEPORE → "Marine, Offshore, Coastal, Agriculture" ✅ · AQUAGUARD → "Marine, Oil & Gas, Power Gen, Agriculture" ✅ · NANOFORCE → "Construction, Mining, Manufacturing, Marine" ✅ |
| **SRC-D** `GEO_DEFINITIONS` prose | AQUAGUARD: "marine" explicit ✅ · NANOFORCE: "heavy industrial machinery" — implicit ✅ · SYNTEPORE: "marine vessels, offshore platforms" explicit ✅ · MARINECLEAN: "marine environments, commercial vessels, offshore platforms" explicit ✅ |

---

### 3. Exact Conflicting Technology Lists

| Technology | SRC-A | SRC-B | SRC-C | SRC-D | Count |
|------------|:-----:|:-----:|:-----:|:-----:|:-----:|
| AQUAGUARD | ✅ | ✅ | ✅ | ✅ | **4** |
| NANOFORCE | ✅ | ✅ | ✅ | ✅ | **4** |
| SYNTRAX | ✅ | ✅ | — | — | **2** |
| MACROCORE | ✅ | — | — | — | **1** ⚠️ |
| DURATECH | — | ✅ | — | — | **1** ⚠️ |
| SYNTEPORE | — | — | ✅ | ✅ | **2** |
| MARINECLEAN | — | — | — | ✅ | **1** ⚠️ |

**Critical observation**: `MARINECLEAN™` is ELIMFILTERS' dedicated marine filtration technology — naval-grade alloy construction, IMO-certified, salt-resistant, explicitly for marine environments. It does not appear in `knowledge-architecture.ts` at all (one of the 6 missing technologies) and does not appear in `TECH_COMPARISON` (one of the 3 missing from the table). It appears in `GEO_DEFINITIONS` with an explicit marine context. Its absence from the MARINE industry applicableTechnologies in both primary sources is the most significant omission in the entire conflict set.

**Additional conflict**:
- `MACROCORE`: in SRC-A only. MACROCORE is a cellulose-composite media. Marine environments with salt spray degrade cellulose — which is exactly why SYNTEPORE (all-synthetic, humidity-resistant) exists. MACROCORE for marine air intake is technically questionable.
- `DURATECH`: in SRC-B only. Marine vessel fleet operations could use kit standardisation, but vessel service intervals are not typically kit-driven.

---

### 4. Recommended Final Technology List

```
RECOMMENDED: ['NANOFORCE', 'AQUAGUARD', 'SYNTRAX', 'SYNTEPORE', 'MARINECLEAN']
PENDING OWNER DECISION: MACROCORE, DURATECH
```

---

### 5. Reasoning

- **AQUAGUARD**: 4/4 sources. Marine fuel water contamination (salt spray, humidity, brine exposure) is the defining contamination challenge. Absolute inclusion.
- **NANOFORCE**: 4/4 sources. Hydraulic systems on commercial vessels (steering, anchor, crane, stabilizer circuits). Absolute inclusion.
- **SYNTRAX**: 2/4 sources. Marine diesel engine oil protection for continuous operation. Included.
- **SYNTEPORE**: 2/4 sources (SRC-C and SRC-D). SYNTEPORE is all-synthetic, moisture-resistant — technically the correct air intake technology for salt-air environments, superior to MACROCORE in humid/coastal conditions. The SYNTEPORE GEO definition explicitly names "marine vessels" and "offshore platforms." This is the appropriate air intake technology for marine, not MACROCORE.
- **MARINECLEAN**: 1/4 sources (SRC-D only, but explicit). This is a product gap that must be corrected. MARINECLEAN is the primary marine filtration technology — naval-grade alloy, IMO-certified, designed specifically for permanent brine and H2S-contaminated atmospheres. Its absence from the MARINE industry record in every prior source is a data architecture failure, not a technology exclusion decision. Including it requires no owner decision — it is self-evident from the product itself.
- **MACROCORE**: 1/4 sources. Technically questionable for marine air intake. SYNTEPORE is superior in high-humidity salt-air environments (all-synthetic, moisture-resistant). If SYNTEPORE is included, MACROCORE becomes redundant and potentially misleading for marine. Recommend EXCLUDING unless MACROCORE is explicitly sold for marine applications.
- **DURATECH**: 1/4 sources. Marine vessel servicing does not typically follow a kit-based model — vessels have specialized service schedules, not fleet-wide synchronised intervals. Recommend EXCLUDING unless commercial marine fleet operations (fishing fleets, ferry operators) are a target segment.

---

### 6. Business Impact

MARINECLEAN's absence from the MARINE industry record means the Part Search engine would currently fail to recommend ELIMFILTERS' only IMO-certified marine-specific technology to marine customers. Correcting this is the highest-priority fix in the entire conflict set. SYNTEPORE's inclusion correctly positions ELIMFILTERS' moisture-resistant intake technology to marine customers who are currently being shown a cellulose product (MACROCORE) that degrades in their operating environment.

---

### 7. Technical Impact

Including MARINECLEAN in `UNIFIED_INDUSTRIES['MARINE'].applicableTechnologies` enables `getTechnologyByIndustry('MARINE')` to return the IMO-certified marine product. Without it, no query path in the Knowledge Graph connects the marine industry to ELIMFILTERS' dedicated marine product line. Including SYNTEPORE and excluding MACROCORE correctly aligns the air intake recommendation with the operating environment — cellulose vs. synthetic for salt-air conditions.

---

### 8. Owner Decision Required

| Technology | Decision Required | Recommendation |
|------------|:----------------:|----------------|
| AQUAGUARD | NO | Include — 4/4 confirmed |
| NANOFORCE | NO | Include — 4/4 confirmed |
| SYNTRAX | NO | Include — 2/4 confirmed |
| SYNTEPORE | NO | Include — 2/4 confirmed, technically superior to MACROCORE in marine environments |
| MARINECLEAN | NO | Include — product exists for this exact application; absence is a data gap not a decision |
| MACROCORE | **YES** | Recommend EXCLUDE if SYNTEPORE covers marine air intake — is MACROCORE sold for marine applications? |
| DURATECH | **YES** | Recommend EXCLUDE unless commercial marine fleets are a target — is DURATECH used for vessel servicing? |

---
---

## Conflict 5 — AUTOMOTIVE

### 1. Industry Name
**Automotive** (`AUTOMOTIVE`)

Operating profile: MEDIUM contamination exposure · Mixed urban/highway, seasonal · −20°C to +50°C · Road dust, occasional water exposure · Primary equipment: **heavy trucks, buses, commercial vehicles** (not passenger cars — the industry covers heavy commercial vehicles only per `knowledge-architecture.ts`).

**This classification distinction is critical**: Automotive in ELIMFILTERS context means heavy-duty commercial vehicles, not passenger cars. This affects which technologies are relevant.

---

### 2. Conflicting Sources

| Source | Technologies Listed |
|--------|---------------------|
| **SRC-A** `catalogue.json` techTags | `SYNTRAX™`, `MACROCORE™`, `SYNTEPORE™`, `MICROKAPPA™` |
| **SRC-B** `knowledge-architecture.ts` applicableTechnologies | `MACROCORE`, `NANOFORCE`, `DURATECH` |
| **SRC-C** `TECH_COMPARISON.industries` | SYNTRAX → "Trucks & Fleets, Bus & Coach, Railway" ✅ · MICROKAPPA → "Trucks, Bus & Coach, Construction, Mining" ✅ · COOLTECH → "Trucks & Fleets, Bus & Coach, Power Gen" ✅ (Automotive/Trucks overlap in TECH_COMPARISON) |
| **SRC-D** `GEO_DEFINITIONS` prose | DURATECH: "mixed-fleet operations in mining, construction, and agriculture" — does not mention automotive ⚠️ · SYNTRAX: "mobile and stationary applications" — implies automotive ✅ · MACROCORE: "on-road vehicles" explicit ✅ |

---

### 3. Exact Conflicting Technology Lists

| Technology | SRC-A | SRC-B | SRC-C | SRC-D | Count |
|------------|:-----:|:-----:|:-----:|:-----:|:-----:|
| MACROCORE | ✅ | ✅ | — | ✅ | **3** |
| SYNTRAX | ✅ | — | ✅ | ✅ | **3** |
| MICROKAPPA | ✅ | — | ✅ | — | **2** |
| DURATECH | — | ✅ | — | — | **1** ⚠️ |
| NANOFORCE | — | ✅ | — | — | **1** ⚠️ |
| SYNTEPORE | ✅ | — | — | — | **1** ⚠️ |
| COOLTECH | — | — | ✅ | — | **1** ⚠️ |

**This is the most contested conflict of all seven industries**. Only MACROCORE appears in both SRC-A and SRC-B. Every other technology is in at most one of the two primary sources.

**Critical conflict**:
- SRC-A lists SYNTRAX, SYNTEPORE, MICROKAPPA — no NANOFORCE, no DURATECH
- SRC-B lists NANOFORCE, DURATECH — no SYNTRAX, no SYNTEPORE, no MICROKAPPA
- These two lists share only one technology (MACROCORE) and have no other overlap

---

### 4. Recommended Final Technology List

```
RECOMMENDED: ['MACROCORE', 'SYNTRAX', 'MICROKAPPA', 'DURATECH']
PENDING OWNER DECISION: NANOFORCE, SYNTEPORE, COOLTECH
```

---

### 5. Reasoning

- **MACROCORE**: 3/4 sources. GEO definition explicitly names "on-road vehicles." Air intake protection for urban commercial vehicles (buses, trucks) facing road dust and stop-and-go contamination. Confirmed.
- **SYNTRAX**: 3/4 sources. Engine oil protection for commercial vehicle diesel engines is the primary lube oil use case for this industry. SYNTRAX GEO definition: "mobile and stationary applications" — commercial trucks are mobile. TECH_COMPARISON lists "Trucks & Fleets, Bus & Coach" which maps directly to Automotive (heavy commercial). Strong inclusion case despite SRC-B absence.
- **MICROKAPPA**: 2/4 sources. Commercial vehicle driver cab air protection is a documented occupational health compliance requirement (EU Directive 2019/130). The TECH_COMPARISON explicitly lists "Trucks, Bus & Coach" — these are the primary equipment types of the AUTOMOTIVE industry. SRC-B omission is likely because `knowledge-architecture.ts` focused on contamination types (particle wear, diesel water) and MICROKAPPA addresses cabin air, not fluid contamination.
- **DURATECH**: 1/4 sources (SRC-B only). Fleet kit standardisation for commercial vehicle fleets (mixed OEM truck brands) is an explicit DURATECH use case. DURATECH GEO definition mentions "mixed-fleet operations" but names mining, construction, agriculture — not automotive. However, the Kits product page is explicitly designed for "Mack, Freightliner, International, Isuzu, Mitsubishi platforms" — all commercial truck OEMs. DURATECH clearly serves automotive/truck fleets. Recommend YES on technical grounds despite single-source confirmation.
- **NANOFORCE**: 1/4 sources (SRC-B only). Hydraulic systems are less central to commercial vehicles than to construction/mining equipment. Commercial trucks have some hydraulic circuits (tipper mechanisms, tail-lifts) but it is not the primary contamination concern. Requires owner clarification.
- **SYNTEPORE**: 1/4 sources (SRC-A only). SYNTEPORE is positioned for marine/coastal/humid environments. Urban truck operation does not typically require all-synthetic moisture-resistant intake media. Including MACROCORE is sufficient for standard commercial vehicle air intake.
- **COOLTECH**: 1/4 sources (SRC-C only). Diesel engine coolant protection (SCA additive, cavitation prevention) is a legitimate heavy truck service item. Trucks & Fleets and Bus & Coach are explicitly listed in the TECH_COMPARISON for COOLTECH. This is a borderline inclusion — technically justified but single-source.

---

### 6. Business Impact

This is the conflict with the highest commercial significance. The Automotive industry covers the commercial vehicle fleet market — trucks, buses, coaches — which globally represents the largest addressable market for industrial filtration. Getting the technology list correct determines which products ELIMFILTERS actively promotes to fleet operators. Missing SYNTRAX means the oil filter cross-sell is absent. Missing MICROKAPPA means the cabin protection compliance play is absent. Including SYNTEPORE (wrong environment fit) could confuse commercial buyers.

---

### 7. Technical Impact

The AUTOMOTIVE industry having only MACROCORE as a confirmed technology creates an incomplete knowledge graph. A fleet manager querying "technologies for my truck fleet" should receive air intake (MACROCORE), oil protection (SYNTRAX), cabin protection (MICROKAPPA), and kit standardisation (DURATECH) — a complete service event coverage. Without the full list, the AI Engine returns a partial recommendation.

---

### 8. Owner Decision Required

| Technology | Decision Required | Recommendation |
|------------|:----------------:|----------------|
| MACROCORE | NO | Include — 3/4 confirmed |
| SYNTRAX | NO | Include — 3/4 confirmed (SRC-B absence is the gap) |
| MICROKAPPA | NO | Include — 2/4 confirmed, compliance-driven use case |
| DURATECH | NO | Include — 1/4 but Kits page explicitly targets commercial truck OEMs |
| NANOFORCE | **YES** | Recommend CONDITIONAL — are hydraulic circuits (tipper trucks, tail-lifts) a target service item? |
| SYNTEPORE | **YES** | Recommend EXCLUDE — is all-synthetic intake needed for commercial vehicles, or does MACROCORE cover the application? |
| COOLTECH | **YES** | Recommend YES — commercial diesel engines need SCA coolant protection. Is COOLTECH actively sold to truck/bus fleets? |

---
---

## Conflict 6 — MANUFACTURING

### 1. Industry Name
**Manufacturing** (`MANUFACTURING`)

Operating profile: LOW-MEDIUM contamination exposure · Climate-controlled, clean facilities · 15°C to +30°C · Precision equipment, proportional control, long fluid life · Primary equipment: machine tools, presses, injection moulding, hydraulic systems.

**This classification distinction matters**: Manufacturing is an indoor, climate-controlled environment. Technologies designed for extreme outdoor dust (MACROCORE) or fuel water ingress (AQUAGUARD) have lower applicability here than in outdoor industries.

---

### 2. Conflicting Sources

| Source | Technologies Listed |
|--------|---------------------|
| **SRC-A** `catalogue.json` techTags | `MACROCORE™`, `SYNTRAX™`, `AQUAGUARD™`, `NANOFORCE™` |
| **SRC-B** `knowledge-architecture.ts` applicableTechnologies | `NANOFORCE`, `MICROKAPPA`, `SYNTRAX` |
| **SRC-C** `TECH_COMPARISON.industries` | NANOFORCE → "Construction, Mining, Manufacturing, Marine" ✅ |
| **SRC-D** `GEO_DEFINITIONS` prose | NANOFORCE: "heavy industrial machinery" — implies manufacturing ✅ · MICROKAPPA: "machine tool coolants and specialty fluids" (from knowledge-arch description) implicit ✅ |

---

### 3. Exact Conflicting Technology Lists

| Technology | SRC-A | SRC-B | SRC-C | SRC-D | Count |
|------------|:-----:|:-----:|:-----:|:-----:|:-----:|
| NANOFORCE | ✅ | ✅ | ✅ | ✅ | **4** |
| SYNTRAX | ✅ | ✅ | — | — | **2** |
| MACROCORE | ✅ | — | — | — | **1** ⚠️ |
| AQUAGUARD | ✅ | — | — | — | **1** ⚠️ |
| MICROKAPPA | — | ✅ | — | ✅ | **2** |

**Conflicts**:
- `MICROKAPPA`: in SRC-B and SRC-D — not in marketing grouping. MICROKAPPA in `knowledge-architecture.ts` is described as "Micro-filtration for machine tool coolants and specialty fluids" — its `category` is explicitly "Coolant & Specialty Filtration." This is a direct match for manufacturing machine tools.
- `MACROCORE`: in SRC-A only. Manufacturing facilities are climate-controlled, clean environments. High-dust outdoor air intake protection (MACROCORE's core use case) is least relevant here.
- `AQUAGUARD`: in SRC-A only. Water separation from diesel fuel is not a primary concern in indoor manufacturing environments where fuel systems are not typically exposed to the water ingress vectors (condensation, humidity, salt) that drive AQUAGUARD adoption.

---

### 4. Recommended Final Technology List

```
RECOMMENDED: ['NANOFORCE', 'SYNTRAX', 'MICROKAPPA']
PENDING OWNER DECISION: MACROCORE, AQUAGUARD
```

---

### 5. Reasoning

- **NANOFORCE**: 4/4 sources. Manufacturing hydraulic contamination — proportional valve cleanliness, CNC machine hydraulics, press circuits — is the flagship use case for NANOFORCE. The `knowledge-architecture.ts` MANUFACTURING `operatingConditions.mainIssue` is explicitly "Precision equipment, proportional control, long fluid life." This is NANOFORCE's primary technical justification.
- **SYNTRAX**: 2/4 sources. Manufacturing equipment with diesel engines (industrial diesel generators, compressors, engine-driven pumps) need oil protection. Included.
- **MICROKAPPA**: 2/4 sources (SRC-B + SRC-D). The knowledge-architecture.ts description of MICROKAPPA is explicitly "Micro-filtration for machine tool coolants and specialty fluids." The MICROKAPPA category is "Coolant & Specialty Filtration." Manufacturing machine tools are the primary application this technology was designed for. The SRC-A omission is likely because `catalogue.json` lists MICROKAPPA as a cabin air technology (the Cabin product page) while knowledge-architecture.ts captures its broader application. Inclusion is technically justified regardless of SRC-C/SRC-A absence.
- **MACROCORE**: 1/4 sources. Indoor climate-controlled manufacturing facilities do not expose equipment to the extreme outdoor dust concentrations (1,500–15,000 mg/m³) that MACROCORE is designed to address. Manufacturing indoor air quality does not require the same intake protection as agricultural or mining environments. Recommend EXCLUDE unless specific manufacturing sub-segments (foundry, cement, metal processing) are a target.
- **AQUAGUARD**: 1/4 sources. Water in stored diesel is not a primary manufacturing concern (indoor fuel storage, climate-controlled). Recommend EXCLUDE unless specific manufacturing sub-segments (outdoor industrial plants, metal fabrication with on-site diesel) are identified.

---

### 6. Business Impact

Including MICROKAPPA for Manufacturing opens the coolant filtration product line to a market segment where it has the highest technical relevance — machine tool coolants are a high-margin, recurring-purchase category. Excluding MACROCORE and AQUAGUARD from Manufacturing prevents the AI Engine from incorrectly recommending outdoor/extreme-environment products to climate-controlled facility operators — a positioning accuracy benefit that protects brand credibility.

---

### 7. Technical Impact

The current knowledge-architecture.ts MANUFACTURING entry already reflects the correct technical picture (NANOFORCE for hydraulics, MICROKAPPA for machine tool coolants, SYNTRAX for oil). The catalogue.json techTags (MACROCORE, AQUAGUARD) are inconsistent with the described operating environment. The recommendation aligns with the technical logic embedded in SRC-B, not the marketing grouping in SRC-A.

---

### 8. Owner Decision Required

| Technology | Decision Required | Recommendation |
|------------|:----------------:|----------------|
| NANOFORCE | NO | Include — 4/4 confirmed |
| SYNTRAX | NO | Include — 2/4 confirmed |
| MICROKAPPA | NO | Include — 2/4 confirmed, explicitly designed for machine tool coolants |
| MACROCORE | **YES** | Recommend EXCLUDE — are any MACROCORE products sold to manufacturing facilities? |
| AQUAGUARD | **YES** | Recommend EXCLUDE — is diesel water separation a manufacturing use case? |

---
---

## Conflict 7 — POWER GENERATION

### 1. Industry Name
**Power Generation** (`POWER_GENERATION`)

Operating profile: MEDIUM contamination exposure · Industrial sites, variable exposure · 0°C to +45°C · Fuel stability, long-term storage, continuous duty · Primary equipment: diesel generators, turbines, compressors.

---

### 2. Conflicting Sources

| Source | Technologies Listed |
|--------|---------------------|
| **SRC-A** `catalogue.json` techTags | `SYNTEPORE™`, `SYNTRAX™`, `AQUAGUARD™`, `DRYCORE™` |
| **SRC-B** `knowledge-architecture.ts` applicableTechnologies | `MACROCORE`, `NANOFORCE`, `AQUAGUARD`, `SYNTRAX` |
| **SRC-C** `TECH_COMPARISON.industries` | MACROCORE → "Mining, Agriculture, Construction, Power Gen" ✅ · AQUAGUARD → "Marine, Oil & Gas, Power Gen, Agriculture" ✅ · COOLTECH → "Trucks & Fleets, Bus & Coach, Power Gen" ✅ |
| **SRC-D** `GEO_DEFINITIONS` prose | MACROCORE: "stationary power generation" explicit ✅ · AQUAGUARD: "power generation" explicit ✅ · DRYCORE: "industrial and mobile equipment operating in high-humidity environments" — implicit for compressors ✅ |

---

### 3. Exact Conflicting Technology Lists

| Technology | SRC-A | SRC-B | SRC-C | SRC-D | Count |
|------------|:-----:|:-----:|:-----:|:-----:|:-----:|
| AQUAGUARD | ✅ | ✅ | ✅ | ✅ | **4** |
| SYNTRAX | ✅ | ✅ | — | — | **2** |
| MACROCORE | — | ✅ | ✅ | ✅ | **3** |
| SYNTEPORE | ✅ | — | — | — | **1** ⚠️ |
| DRYCORE | ✅ | — | — | ✅ | **2** |
| NANOFORCE | — | ✅ | — | — | **1** ⚠️ |
| COOLTECH | — | — | ✅ | — | **1** ⚠️ |

**Most notable conflict**:
- `MACROCORE`: absent from SRC-A but confirmed by SRC-B, SRC-C, and SRC-D. The MACROCORE GEO definition explicitly names "stationary power generation." The TECH_COMPARISON lists "Power Gen" for MACROCORE. The SRC-A omission is the most significant catalogue.json gap in the seven conflicts — a technology with 3/4 source confirmation is missing from the marketing grouping.
- `SYNTEPORE`: in SRC-A only. SYNTEPORE is positioned for marine/coastal/high-humidity environments. Standard diesel generator sets in industrial facilities do not require all-synthetic humidity-resistant intake media.
- `DRYCORE`: 2/4 sources. Power generation equipment includes compressors and pneumatic control systems. DRYCORE (molecular sieve desiccant dryer) addresses moisture in compressed air — relevant for pneumatic controls on generator sets and turbine systems.

---

### 4. Recommended Final Technology List

```
RECOMMENDED: ['MACROCORE', 'AQUAGUARD', 'SYNTRAX', 'DRYCORE']
PENDING OWNER DECISION: NANOFORCE, COOLTECH, SYNTEPORE
```

---

### 5. Reasoning

- **AQUAGUARD**: 4/4 sources. Fuel stability during long-term standby storage is the defining contamination challenge for power generation. NFPA 110 standby diesel stored beyond 12 months without treatment risks microbial growth. AQUAGUARD addresses this directly. Absolute inclusion.
- **MACROCORE**: 3/4 sources. MACROCORE GEO definition explicitly names "stationary power generation" and "industrial compressors." Diesel generator air intake requires the same contamination control as any other diesel engine. The SRC-A absence is a clear authoring gap. Include with high confidence.
- **SYNTRAX**: 2/4 sources. Engine oil protection for continuous-duty diesel generators operating at constant load. Extended drain intervals for generator sets are a documented maintenance optimisation. Included.
- **DRYCORE**: 2/4 sources (SRC-A and SRC-D). Compressed air systems on generator sites (pneumatic control valves, instruments, tool air) require moisture control. DRYCORE's molecular sieve desiccant is the appropriate technology for compressed air purity in control systems. SRC-B and SRC-C do not list it, but the DRYCORE GEO definition explicitly covers "industrial equipment" and the catalogue.json listing is confirmed. Included.
- **NANOFORCE**: 1/4 sources (SRC-B only). Hydraulic systems on large turbine generators and compressor units exist but are not the primary contamination concern for this industry. The main issues are fuel (AQUAGUARD), air intake (MACROCORE), and oil (SYNTRAX). Requires owner decision.
- **COOLTECH**: 1/4 sources (SRC-C only). Diesel generator coolant systems (SCA additives, liner cavitation prevention) are a legitimate maintenance item. TECH_COMPARISON lists "Power Gen" for COOLTECH. A reasonable technical case exists.
- **SYNTEPORE**: 1/4 sources (SRC-A only). Standard industrial generator environments do not require all-synthetic humidity-resistant intake media. MACROCORE is sufficient for generator air intake protection. Recommend EXCLUDE.

---

### 6. Business Impact

MACROCORE's absence from the catalogue.json Power Generation techTags means that users viewing the Power Generation industry page do not see MACROCORE listed as a relevant technology. This is a product visibility gap for one of ELIMFILTERS' highest-confidence technology-industry pairings. Correcting it restores accurate product positioning for backup power and prime power customers. DRYCORE inclusion expands the power generation offering to include compressed air system protection — an add-on revenue category for generator site management.

---

### 7. Technical Impact

With the recommended list, the power generation knowledge graph covers: air intake (MACROCORE), fuel water (AQUAGUARD), lube oil (SYNTRAX), and compressed air (DRYCORE). This represents complete protection across all fluid systems on a diesel generator set. The current SRC-A list (SYNTEPORE, SYNTRAX, AQUAGUARD, DRYCORE) substitutes SYNTEPORE for MACROCORE — technically incorrect for standard generator air intake environments.

---

### 8. Owner Decision Required

| Technology | Decision Required | Recommendation |
|------------|:----------------:|----------------|
| AQUAGUARD | NO | Include — 4/4 confirmed |
| MACROCORE | NO | Include — 3/4 confirmed (SRC-A gap is clear authoring error) |
| SYNTRAX | NO | Include — 2/4 confirmed |
| DRYCORE | NO | Include — 2/4 confirmed, compressed air on generator sites |
| SYNTEPORE | NO | Exclude — MACROCORE covers generator air intake; SYNTEPORE is for marine/coastal environments |
| NANOFORCE | **YES** | Recommend CONDITIONAL — are hydraulic systems on turbines/compressors a service item? |
| COOLTECH | **YES** | Recommend YES — is COOLTECH actively sold for generator coolant systems? |

---
---

## Summary — Owner Decision Matrix

The following decisions must be made before `unified-data.ts` is written. Each is marked with the recommended default if no input is received.

| Industry | Technology | Default if No Input | Rationale for Default |
|----------|------------|:-------------------:|----------------------|
| AGRICULTURE | DURATECH | **INCLUDE** | GEO definition names agriculture; fleet kit logic applies to farm equipment operations |
| AGRICULTURE | SYNTEPORE | **EXCLUDE** | Temperate agriculture does not require all-synthetic moisture-resistant intake |
| CONSTRUCTION | AQUAGUARD | **INCLUDE** | Bulk-tank site fueling creates fuel water contamination risk |
| CONSTRUCTION | MICROKAPPA | **INCLUDE** | Silica dust cab exposure is a compliance concern; TECH_COMPARISON confirms |
| MINING | SYNTEPORE | **EXCLUDE** | Open-pit mining is not humidity-driven; MACROCORE covers standard mining intake |
| MARINE | MACROCORE | **EXCLUDE** | SYNTEPORE is superior for salt-air/moisture environments |
| MARINE | DURATECH | **EXCLUDE** | Vessel servicing is not kit-driven in standard commercial marine operations |
| AUTOMOTIVE | NANOFORCE | **EXCLUDE** | Hydraulic circuits are not the primary commercial vehicle service item |
| AUTOMOTIVE | SYNTEPORE | **EXCLUDE** | Urban commercial vehicles do not require moisture-resistant intake media |
| AUTOMOTIVE | COOLTECH | **INCLUDE** | Commercial diesel engines need SCA coolant protection; TECH_COMPARISON confirms |
| MANUFACTURING | MACROCORE | **EXCLUDE** | Indoor climate-controlled facilities do not face outdoor dust contamination |
| MANUFACTURING | AQUAGUARD | **EXCLUDE** | Indoor fuel systems not exposed to primary AQUAGUARD ingress vectors |
| POWER GENERATION | NANOFORCE | **EXCLUDE** | Hydraulic circuits are secondary to fuel, air, and oil for generator sets |
| POWER GENERATION | COOLTECH | **INCLUDE** | Generator coolant maintenance (SCA, cavitation prevention) is a valid service item |

**Total decisions: 14**
**Recommend INCLUDE as default: 6**
**Recommend EXCLUDE as default: 8**

---

## Reconciled Technology Lists — Ready for unified-data.ts

The following lists represent the recommended authoritative `applicableTechnologies` for each industry, incorporating both confirmed (≥2 sources) technologies and recommended defaults. They are ready for owner review and, if approved, ready to be written directly into `unified-data.ts` Section 5 (Step 1f and 1g of the implementation plan).

```
AGRICULTURE:     ['MACROCORE', 'NANOFORCE', 'SYNTRAX', 'AQUAGUARD', 'DURATECH']
                 + SYNTEPORE pending owner YES

CONSTRUCTION:    ['MACROCORE', 'NANOFORCE', 'SYNTRAX', 'DURATECH', 'AQUAGUARD', 'MICROKAPPA']

MINING:          ['MACROCORE', 'NANOFORCE', 'SYNTRAX', 'AQUAGUARD', 'DURATECH']
                 + SYNTEPORE pending owner YES

MARINE:          ['NANOFORCE', 'AQUAGUARD', 'SYNTRAX', 'SYNTEPORE', 'MARINECLEAN']
                 + MACROCORE pending owner YES

AUTOMOTIVE:      ['MACROCORE', 'SYNTRAX', 'MICROKAPPA', 'DURATECH', 'COOLTECH']
                 + NANOFORCE pending owner YES

MANUFACTURING:   ['NANOFORCE', 'SYNTRAX', 'MICROKAPPA']
                 + MACROCORE pending owner YES

POWER_GENERATION: ['MACROCORE', 'AQUAGUARD', 'SYNTRAX', 'DRYCORE', 'COOLTECH']
                   + NANOFORCE pending owner YES
```

---

*Analysis generated: 2026-06-02*
*Repository: latamfilters/world-catalogue*
*Branch: claude/dazzling-franklin-ALGY1*
*Next step: Owner review of 14 decisions → Implementation of unified-data.ts Step 0 complete*
