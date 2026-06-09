# PHASE 5 GAP ANALYSIS
# Problem Node Expansion — Pre-Implementation Evaluation

**Date:** 2026-06-03
**Branch:** claude/dazzling-franklin-ALGY1
**Type:** Gap analysis only — no implementation

---

## Current State Baseline

The knowledge graph has **1 Problem node** (DUST_INGESTION) out of approximately 20 defined in the Phase 3A scope. This single node connects to MINING via `industry_frequency` and produces 3 Type A traversal paths (all ending at AIRFILTER_PRIMARY). Ten of eleven industry nodes have `common_problems: []` — empty arrays representing the most significant structural gap in the current graph.

The four contamination mode nodes (PARTICLE_WEAR, DIESEL_WATER, HYDRAULIC_CONTAMINATION, CABIN_AIR_CONTAMINATION) are fully populated. Five product families are live. Seven technologies are indexed. The graph has everything except the user-facing entry layer: the **Problem nodes** that represent how buyers actually describe their situation.

---

## 1. How Many Problem Nodes Are Required for Production-Ready Graph

### Definition of production-ready

A production-ready Problem layer satisfies two conditions:
1. Every contamination mode in the vault is reachable from at least one Problem node (contamination coverage)
2. Every industry in the vault has at least one Problem node associated with it (industry coverage)

### Minimum viable count: 5

The four contamination modes define the natural Problem groupings. At minimum, one Problem node per contamination mode per primary domain creates the traversal skeleton:

| Contamination mode | Problem node(s) required | Industries served |
|---|---|---|
| PARTICLE_WEAR | DUST_INGESTION (exists) | MINING, CONSTRUCTION, AGRICULTURE, AUTOMOTIVE, TRUCKS_FLEETS, POWER_GENERATION, RAILWAY, WASTE_MUNICIPAL |
| PARTICLE_WEAR (lube) | ENGINE_OIL_CONTAMINATION | All engine-operating industries |
| DIESEL_WATER | FUEL_FILTER_PLUGGING | AGRICULTURE, MARINE, MINING, OIL_GAS, POWER_GENERATION, TRUCKS_FLEETS |
| HYDRAULIC_CONTAMINATION | HYDRAULIC_VALVE_FAILURE | CONSTRUCTION, MINING, AGRICULTURE, MARINE, OIL_GAS, POWER_GENERATION |
| CABIN_AIR_CONTAMINATION | OPERATOR_DUST_EXPOSURE | CONSTRUCTION, MINING, AGRICULTURE, BUS_COACH, RAILWAY, TRUCKS_FLEETS, WASTE_MUNICIPAL |

Five nodes (including the existing DUST_INGESTION) cover all four contamination modes. Every industry node connects to at least one Problem via its `relevant_contamination` relationships.

### Full-coverage count: 12

To give every industry at least two distinct Problem entry points (one per its top two contamination modes), and to cover the component-level failure problems referenced in TURBOCHARGER_BEARING, PISTON_RING_ASSEMBLY, and ENGINE_BEARING_JOURNAL:

| Problem node | Domain | Contamination | Key industries |
|---|---|---|---|
| DUST_INGESTION (exists) | Air intake | PARTICLE_WEAR | MINING, CONSTRUCTION, AGRICULTURE |
| ENGINE_OIL_CONTAMINATION | Lube oil | PARTICLE_WEAR | All 11 |
| FUEL_FILTER_PLUGGING | Fuel | DIESEL_WATER | AGRICULTURE, MARINE, MINING, OIL_GAS, POWER_GENERATION, TRUCKS_FLEETS |
| HYDRAULIC_VALVE_FAILURE | Hydraulic | HYDRAULIC_CONTAMINATION | CONSTRUCTION, MINING, AGRICULTURE, MARINE, OIL_GAS |
| OPERATOR_DUST_EXPOSURE | Cabin | CABIN_AIR_CONTAMINATION | CONSTRUCTION, MINING, AGRICULTURE, BUS_COACH, RAILWAY, TRUCKS_FLEETS, WASTE_MUNICIPAL |
| BEARING_PREMATURE_FAILURE | Lube oil | PARTICLE_WEAR | MINING, CONSTRUCTION, POWER_GENERATION, MARINE |
| TURBOCHARGER_FAILURE | Air intake | PARTICLE_WEAR | MINING, CONSTRUCTION, AGRICULTURE, TRUCKS_FLEETS |
| FUEL_INJECTOR_WEAR | Fuel | DIESEL_WATER | AGRICULTURE, MARINE, POWER_GENERATION |
| HYDRAULIC_PUMP_WEAR | Hydraulic | HYDRAULIC_CONTAMINATION | CONSTRUCTION, MINING, AGRICULTURE, OIL_GAS |
| CABIN_CHEMICAL_EXPOSURE | Cabin | CABIN_AIR_CONTAMINATION | AGRICULTURE, WASTE_MUNICIPAL, RAILWAY |
| MARINE_ENGINE_CORROSION | Air intake | PARTICLE_WEAR | MARINE |
| COMPRESSED_AIR_MOISTURE | Compressed air | (new contamination mode) | OIL_GAS, POWER_GENERATION, MANUFACTURING |

Twelve nodes provide complete coverage with no orphaned contamination mode and no industry with fewer than 2 Problem entry points.

### Comprehensive count: 20

The Phase 3A plan defined approximately 20 Problem nodes, adding equipment-specific problems (hydraulic cylinder scoring, fuel pump cavitation, valve sticktion, rail contamination), fleet-level problems (fleet downtime from filtration failure), and cross-domain problems (marine diesel degradation). These extend coverage to the Compare and Fleet pages, completing the citation layer for all 30 Knowledge System pages.

---

## 2. Problem Nodes Creating Highest Traversal Value

Traversal value = number of new valid Type A/B paths created × number of industries served × number of technologies reached.

### Tier 1 — Maximum traversal expansion

**ENGINE_OIL_CONTAMINATION**
- Root contamination: PARTICLE_WEAR
- Resolved by: SYNTRAX (→ LUBE_PRIMARY), NANOFORCE (→ HYDRAULIC_PRIMARY)
- Industry frequency: all 11 industries (every diesel engine has lube oil)
- New Type A paths: 2 (PARTICLE_WEAR → SYNTRAX → LUBE_PRIMARY; PARTICLE_WEAR → NANOFORCE → HYDRAULIC_PRIMARY)
- New Type B paths: 22 (11 industries × 2 technologies)
- **Total new valid paths: 24**
- Unique value: the only Problem that connects to LUBE_PRIMARY. Currently LUBE_PRIMARY is reachable only via Type C (Technology→PF) paths. This node makes it reachable from real user symptoms.

**HYDRAULIC_VALVE_FAILURE**
- Root contamination: HYDRAULIC_CONTAMINATION
- Resolved by: NANOFORCE (→ HYDRAULIC_PRIMARY), SYNTRAX (→ LUBE_PRIMARY)
- Industry frequency: CONSTRUCTION, MINING, AGRICULTURE, MARINE, OIL_GAS, POWER_GENERATION (6 industries)
- New Type A paths: 2
- New Type B paths: 12
- **Total new valid paths: 14**
- Unique value: the only Problem that creates an entry path to HYDRAULIC_PRIMARY from a symptom. Currently HYDRAULIC_PRIMARY is reachable only via Type C paths.

**FUEL_FILTER_PLUGGING**
- Root contamination: DIESEL_WATER
- Resolved by: HYDROCORE (→ FUEL_PRIMARY)
- Industry frequency: AGRICULTURE, MARINE, MINING, OIL_GAS, POWER_GENERATION, TRUCKS_FLEETS (6 industries)
- New Type A paths: 1
- New Type B paths: 6
- **Total new valid paths: 7**
- Unique value: the only Problem that creates an entry path to FUEL_PRIMARY. Currently FUEL_PRIMARY is reachable only via Type C paths.

**OPERATOR_DUST_EXPOSURE**
- Root contamination: CABIN_AIR_CONTAMINATION
- Resolved by: MICROKAPPA (→ CABIN_PRIMARY)
- Industry frequency: CONSTRUCTION, MINING, AGRICULTURE, BUS_COACH, RAILWAY, TRUCKS_FLEETS, WASTE_MUNICIPAL (7 industries)
- New Type A paths: 1
- New Type B paths: 7
- **Total new valid paths: 8**
- Unique value: the only Problem that creates an entry path to CABIN_PRIMARY. Also the only Problem addressing occupational health/regulatory compliance, a distinct search intent from mechanical failure.

### Tier 2 — Component-level expansion

**BEARING_PREMATURE_FAILURE** and **TURBOCHARGER_FAILURE**
- Both route through PARTICLE_WEAR → MACROCORE/SYNTRAX → AIRFILTER_PRIMARY/LUBE_PRIMARY
- These create no new ProductFamily connections but add symptom-level entry points for searches like "turbocharger failing early" and "engine bearing seizure"
- Value: citation chain completeness and search intent breadth, not new traversal paths
- Each creates 2–4 additional Type A paths (duplicate technology endpoints, different problem entry)

### Traversal value ranking

| Problem node | New valid paths | New PF access | All 4 domains covered by |
|---|---|---|---|
| ENGINE_OIL_CONTAMINATION | +24 | LUBE_PRIMARY | — |
| HYDRAULIC_VALVE_FAILURE | +14 | HYDRAULIC_PRIMARY | — |
| OPERATOR_DUST_EXPOSURE | +8 | CABIN_PRIMARY | — |
| FUEL_FILTER_PLUGGING | +7 | FUEL_PRIMARY | ← this node closes all 4 |
| BEARING_PREMATURE_FAILURE | +4 | None (duplicate) | — |
| TURBOCHARGER_FAILURE | +3 | None (duplicate) | — |

The first four Problem nodes together add 53 valid traversal paths and unlock all 4 currently unreachable ProductFamilies (LUBE_PRIMARY, HYDRAULIC_PRIMARY, CABIN_PRIMARY, FUEL_PRIMARY). DUST_INGESTION already covers AIRFILTER_PRIMARY. After these 4 nodes, all 5 ProductFamilies are reachable from Problem entry points.

---

## 3. Problem Nodes Required by Existing Industries

Current state: 10 of 11 industries have `common_problems: []`. MINING has DUST_INGESTION.

### Industry problem coverage gap

| Industry | Primary contamination | Minimum problem node needed | Exists? |
|---|---|---|---|
| MINING | PARTICLE_WEAR, HYDRAULIC_CONTAMINATION, DIESEL_WATER | DUST_INGESTION (air), HYDRAULIC_VALVE_FAILURE (hydraulic), FUEL_FILTER_PLUGGING (fuel) | 1/3 |
| CONSTRUCTION | PARTICLE_WEAR, HYDRAULIC_CONTAMINATION, DIESEL_WATER, CABIN_AIR_CONTAMINATION | DUST_INGESTION, HYDRAULIC_VALVE_FAILURE, FUEL_FILTER_PLUGGING, OPERATOR_DUST_EXPOSURE | 1/4 |
| AGRICULTURE | PARTICLE_WEAR, DIESEL_WATER | DUST_INGESTION, FUEL_FILTER_PLUGGING | 1/2 |
| TRUCKS_FLEETS | PARTICLE_WEAR, DIESEL_WATER, CABIN_AIR_CONTAMINATION | DUST_INGESTION, FUEL_FILTER_PLUGGING, OPERATOR_DUST_EXPOSURE | 1/3 |
| POWER_GENERATION | PARTICLE_WEAR, DIESEL_WATER, HYDRAULIC_CONTAMINATION | DUST_INGESTION, FUEL_FILTER_PLUGGING, HYDRAULIC_VALVE_FAILURE | 1/3 |
| MARINE | PARTICLE_WEAR, DIESEL_WATER, HYDRAULIC_CONTAMINATION | DUST_INGESTION, FUEL_FILTER_PLUGGING, HYDRAULIC_VALVE_FAILURE | 1/3 |
| OIL_GAS | PARTICLE_WEAR, HYDRAULIC_CONTAMINATION, DIESEL_WATER | DUST_INGESTION, HYDRAULIC_VALVE_FAILURE, FUEL_FILTER_PLUGGING | 1/3 |
| RAILWAY | PARTICLE_WEAR, DIESEL_WATER, CABIN_AIR_CONTAMINATION | DUST_INGESTION, FUEL_FILTER_PLUGGING, OPERATOR_DUST_EXPOSURE | 1/3 |
| BUS_COACH | PARTICLE_WEAR, DIESEL_WATER, CABIN_AIR_CONTAMINATION | DUST_INGESTION, FUEL_FILTER_PLUGGING, OPERATOR_DUST_EXPOSURE | 1/3 |
| WASTE_MUNICIPAL | PARTICLE_WEAR, DIESEL_WATER, CABIN_AIR_CONTAMINATION | DUST_INGESTION, FUEL_FILTER_PLUGGING, OPERATOR_DUST_EXPOSURE | 1/3 |
| AUTOMOTIVE | PARTICLE_WEAR, DIESEL_WATER | DUST_INGESTION, ENGINE_OIL_CONTAMINATION | 1/2 |

**Critical finding**: Every industry node's `relevant_contamination` array points to contamination modes that have no corresponding Problem node. The CONSTRUCTION industry, for example, has HYDRAULIC_CONTAMINATION and DIESEL_WATER in its contamination list, but no Problem node routes through these contamination modes. The Part Search map's Type B paths (Industry → PF) currently reach only AIRFILTER_PRIMARY, HYDRAULIC_PRIMARY, and LUBE_PRIMARY — via MINING, CONSTRUCTION, and AGRICULTURE only — because those are the 3 industries with existing Problem node coverage via DUST_INGESTION.

All 11 industries need at minimum 2 Problem nodes for adequate citation coverage. The 4 new Tier 1 Problem nodes partially satisfy this: ENGINE_OIL_CONTAMINATION serves all 11 industries; HYDRAULIC_VALVE_FAILURE serves 6; FUEL_FILTER_PLUGGING serves 6; OPERATOR_DUST_EXPOSURE serves 7.

After the 4 Tier 1 additions: MINING, CONSTRUCTION, AGRICULTURE, MARINE, POWER_GENERATION, OIL_GAS, RAILWAY, BUS_COACH, TRUCKS_FLEETS, WASTE_MUNICIPAL all have 2–4 Problem nodes. AUTOMOTIVE remains underserved (only DUST_INGESTION + ENGINE_OIL_CONTAMINATION, no fuel or cabin coverage).

---

## 4. Problem Nodes Required by Existing Technologies

Each technology in the vault addresses a contamination mode. For the technology's citation chain to be reachable from a Problem entry point, at least one Problem node must route through its contamination mode.

| Technology | Addresses | Currently reachable from Problem? | Problem needed |
|---|---|---|---|
| MACROCORE | PARTICLE_WEAR | YES — via DUST_INGESTION | — |
| INTEKCORE | PARTICLE_WEAR | YES — via DUST_INGESTION | — |
| SYNTEPORE | PARTICLE_WEAR | YES — via DUST_INGESTION | — |
| SYNTRAX | PARTICLE_WEAR | YES — via DUST_INGESTION | LUBE path needs ENGINE_OIL_CONTAMINATION |
| NANOFORCE | PARTICLE_WEAR, HYDRAULIC_CONTAMINATION | Partial — PARTICLE_WEAR only | HYDRAULIC_VALVE_FAILURE needed |
| HYDROCORE | DIESEL_WATER | **NO** — DIESEL_WATER has no Problem node | FUEL_FILTER_PLUGGING needed |
| MICROKAPPA | CABIN_AIR_CONTAMINATION | **NO** — no cabin Problem node | OPERATOR_DUST_EXPOSURE needed |

**Critical finding**: HYDROCORE and MICROKAPPA — two of the seven technologies — are completely unreachable from any Problem entry point in the current graph. A buyer searching for "water in fuel" or "dust in cab" cannot reach HYDROCORE or MICROKAPPA via the Part Search citation chain. Their Type C (Technology→PF) paths exist, but only if the buyer already knows to search by technology name rather than symptom.

The four Tier 1 Problem nodes resolve this completely: after adding ENGINE_OIL_CONTAMINATION, HYDRAULIC_VALVE_FAILURE, FUEL_FILTER_PLUGGING, and OPERATOR_DUST_EXPOSURE, all 7 technologies are reachable from Problem entry points.

SYNTRAX deserves special note: it is reachable via DUST_INGESTION (PARTICLE_WEAR route) but only as a secondary technology. ENGINE_OIL_CONTAMINATION creates the direct SYNTRAX → LUBE_PRIMARY citation path, which is the commercially correct route for lube oil filtration queries.

---

## 5. Ecosystem Maturity Estimates

### Scenario A: 5 nodes added (4 new + existing DUST_INGESTION)

Adding ENGINE_OIL_CONTAMINATION, HYDRAULIC_VALVE_FAILURE, FUEL_FILTER_PLUGGING, OPERATOR_DUST_EXPOSURE.

| Metric | Current | After 5 nodes | Change |
|---|---|---|---|
| Problem nodes | 1 | 5 | +4 |
| Valid traversal paths | 17 | ~70 | +53 |
| Technologies reachable from Problems | 5/7 | **7/7** | +2 |
| Industries with ≥2 Problem nodes | 1/11 | 10/11 | +9 |
| ProductFamilies reachable from Problems | 1/5 | **5/5** | +4 |
| Citation API problem entry endpoints | 1 | 5 | +4 |
| Knowledge System pages with citation coverage | 11/30 | 15/30 | +4 |
| Estimated maturity score | 82/100 | **90/100** | +8 |

At 5 nodes, the graph achieves what the Phase 4 final review called the "capability unlock threshold": all 7 technologies reachable, all 5 ProductFamilies reachable, 10/11 industries covered. The commercial plan's AI citation layer becomes fully functional for all five filtration domains. AUTOMOTIVE remains the only industry with limited Problem coverage (2 nodes vs. 3+ for others).

### Scenario B: 10 nodes added (9 new + existing DUST_INGESTION)

Adds the 4 Tier 1 nodes plus: BEARING_PREMATURE_FAILURE, TURBOCHARGER_FAILURE, FUEL_INJECTOR_WEAR, HYDRAULIC_PUMP_WEAR, OPERATOR_CHEMICAL_EXPOSURE.

| Metric | Current | After 10 nodes | Change |
|---|---|---|---|
| Problem nodes | 1 | 10 | +9 |
| Valid traversal paths | 17 | ~110 | +93 |
| Technologies reachable from Problems | 5/7 | 7/7 | — (same as 5-node) |
| Industries with ≥3 Problem nodes | 1/11 | 8/11 | +7 |
| Component nodes with Problem entry | 1/3 | 3/3 | +2 |
| Citation API problem entry endpoints | 1 | 10 | +9 |
| Knowledge System pages with citation coverage | 11/30 | 20/30 | +9 |
| Estimated maturity score | 82/100 | **93/100** | +11 |

At 10 nodes, the component layer becomes fully traversable — all three component nodes (TURBOCHARGER_BEARING, PISTON_RING_ASSEMBLY, ENGINE_BEARING_JOURNAL) have at least one Problem node referencing them. The Knowledge System's Compare and Fleet pages begin to have vault backing. The graph achieves sufficient breadth for a real AI integration to produce useful citation chains for the majority of industrial filtration queries without falling back to a general response.

### Scenario C: 20 nodes added (19 new + existing DUST_INGESTION)

Complete Phase 3A scope: adds all planned nodes including equipment-specific failure modes, fleet-level problems, and cross-domain problems.

| Metric | Current | After 20 nodes | Change |
|---|---|---|---|
| Problem nodes | 1 | 20 | +19 |
| Valid traversal paths | 17 | ~200+ | +183+ |
| Industries with ≥4 Problem nodes | 0/11 | 8/11 | +8 |
| All 30 KS pages with citation coverage | 11/30 | ~28/30 | +17 |
| Estimated maturity score | 82/100 | **96/100** | +14 |

At 20 nodes, the graph is effectively complete for citation purposes. Every major industrial filtration search intent has a Problem entry point. The citation layer supports the full AI engine architecture defined in Phase 4. The two points below 100 reflect the INTEKCORE and SYNTEPORE ProductFamily gaps (structural, not critical) and the ongoing UD re-verification debt.

### Scenario comparison

| | 5 nodes | 10 nodes | 20 nodes |
|---|---|---|---|
| Maturity score | 90/100 | 93/100 | 96/100 |
| All PF reachable | ✅ | ✅ | ✅ |
| All tech reachable | ✅ | ✅ | ✅ |
| All industries ≥2 problems | 10/11 | 11/11 | 11/11 |
| KS pages covered | 15/30 | 20/30 | 28/30 |
| Effort | LOW | MEDIUM | HIGH |
| Incremental gain (5→10) | — | +3 pts | — |
| Incremental gain (10→20) | — | — | +3 pts |

The maturity curve flattens sharply after 5 nodes (+8 pts) and produces diminishing returns thereafter (+3 pts for next 5, +3 pts for next 10). The 5-node scenario delivers 57% of the total available maturity gain at approximately 20% of the total effort.

---

## Recommendation: B — Add 5 Critical Problem Nodes and Close Ecosystem

### Rationale

The 5-node scenario achieves the single most important structural outcome — all 7 technologies and all 5 ProductFamilies reachable from Problem entry points — at the lowest effort. The graph reaches 90/100 maturity, which satisfies the production-ready definition established in Section 1.

The marginal gain from scenarios B→C and C→full (6 combined maturity points across 15 additional nodes) does not justify the content creation overhead before the commercial plan begins executing. Problem nodes beyond the core 5 add path breadth but no new capability. The five core nodes unlock HYDROCORE, MICROKAPPA, LUBE_PRIMARY, HYDRAULIC_PRIMARY, CABIN_PRIMARY, and FUEL_PRIMARY — the currently unreachable assets — and connect all 11 industries to at least 2 Problem entry points.

Specifically, add these 4 new Problem nodes (DUST_INGESTION already exists):

1. **ENGINE_OIL_CONTAMINATION** — highest path multiplier (+24 paths), serves all 11 industries, unlocks LUBE_PRIMARY and SYNTRAX's primary citation route
2. **HYDRAULIC_VALVE_FAILURE** — unlocks HYDRAULIC_PRIMARY and NANOFORCE's hydraulic citation route
3. **FUEL_FILTER_PLUGGING** — unlocks FUEL_PRIMARY and HYDROCORE (currently unreachable from any Problem)
4. **OPERATOR_DUST_EXPOSURE** — unlocks CABIN_PRIMARY and MICROKAPPA (currently unreachable from any Problem); addresses a distinct occupational health search intent with no current citation coverage

After these 4 nodes, close the Phase 5 vault scope. Do not proceed to 10 or 20 nodes before the commercial plan has produced real-world queries to validate which Problem entry points are actually being searched. Building 15 more Problem nodes before knowing which queries are driving traffic is speculative content creation. The commercial plan's lead generation programme, once active, will identify the highest-search-volume Problem concepts within 60–90 days of deployment — those data points should drive Phase 6 Problem node selection, not the Phase 3A scope list.

### Closure criteria

Phase 5 is complete when:
1. Four new Problem notes exist and compile without errors
2. `PART_SEARCH_MAP.json` is rebuilt — valid paths ≥ 60
3. All 5 ProductFamilies are reachable from at least one Problem entry
4. All 7 technologies are reachable from at least one Problem entry
5. All 11 industries have `common_problems` populated with ≥2 entries
6. `CITATION_INDEX.json` contains 45 records at 0 errors

After closure, proceed directly to the commercial execution plan. The technical platform at 90/100 maturity is sufficient. The limiting factor on revenue is not graph completeness.

---

*Analysis based on CITATION_INDEX.json (41 entities, 385 edges) and PART_SEARCH_MAP.json (19 paths, 17 valid) as of commit `657a79d5`.*
