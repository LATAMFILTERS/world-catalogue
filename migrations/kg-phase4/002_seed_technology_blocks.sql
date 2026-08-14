-- =============================================================================
-- KG PHASE 4 — SEED TECHNOLOGY CANONICAL BLOCKS
-- File: 002_seed_technology_blocks.sql
-- Purpose: Insert canonical definitions for all 13 ELIMFILTERS technologies
-- Safe to run: YES (ON CONFLICT DO UPDATE — idempotent, increments version)
-- Depends on: 001_schema.sql (kg_canonical_blocks must exist)
-- Affects elimfilters_catalog: NO
--
-- CRITICAL CORRECTIONS APPLIED (from SEMANTIC_MODEL_REPORT.md):
--   MICROKAPPA  → cabin air filtration, NOT coolant/specialty
--   SYNTRAX     → lube / engine oil filtration, NOT hydraulic
--   NANOFORCE   → hydraulic filtration, NOT lube oil
--
-- Language rules enforced (SEMANTIC_RULES_REPORT.md §5):
--   ✅ ISO codes cited explicitly
--   ✅ Micron ratings and Beta ratios included
--   ✅ Quantified operational metrics (hours, %, frequency)
--   ✅ Neutral functional language ("X controls Y by Z")
--   ✅ Failure root cause chains
--   ❌ No marketing language (premium, innovative, leading, superior, etc.)
-- =============================================================================

-- ─── 1. MACROCORE™ ───────────────────────────────────────────────────────────
-- Air intake filtration — primary technology for heavy-duty air filtration
-- DB product count: 1,366 products

INSERT INTO kg_canonical_blocks (
  concept_slug, concept_type, display_name,
  definition,
  system_context,
  failure_mechanism,
  industrial_impact,
  related_standards,
  related_technologies,
  industrial_role,
  citation_url
) VALUES (
  'macrocore', 'technology', 'MACROCORE™',

  'MACROCORE™ air filtration media captures particulate contamination at 18µm absolute efficiency
through a multi-layer cellulose-synthetic composite structure, maintaining intake air cleanliness
to SAE J1539 and ISO 5011 test standards for heavy-duty engine air intake systems.',

  'Applied to primary air intake filters on diesel engines in agriculture (combines, tractors),
construction (excavators, bulldozers), mining (haul trucks, drill rigs), power generation
(diesel generators), and marine propulsion. Effective in high dust-load environments with
ambient particulate concentrations from 0.1 g/m³ to 5+ g/m³.',

  'Unfiltered or under-filtered air intake introduces silica particles (0.5–80µm) directly into
combustion chambers → micro-cutting wear on piston rings and cylinder bores → compression
ring groove wear → blow-by gas increase → oil contamination acceleration → accelerated
bearing wear. Air filter bypass or collapse introduces bulk particulate → catastrophic abrasive
wear within 50–200 operating hours.',

  'Effective air intake filtration extends engine rebuild intervals from 3,000–5,000 hours
(uncontrolled) to 10,000–15,000+ hours. Oil consumption increase attributable to poor air
filtration: +15–40% (SEMANTIC_MODEL_REPORT.md particle-wear metrics). Engine blow-by increase
without air filtration control: +5–10%. Equipment availability impact of particle wear
without control: -15–25%.',

  '[
    {"code": "SAE J1539", "scope": "Air cleaner element test for highway engines — particulate efficiency and restriction measurement"},
    {"code": "ISO 5011", "scope": "Inlet air cleaning equipment for internal combustion engines — performance testing including efficiency and dust capacity"},
    {"code": "SAE J726", "scope": "Air cleaner test code for off-highway engines — applicable to agricultural and construction equipment"}
  ]'::jsonb,

  '[
    {"slug": "intekcore", "mechanism": "Pre-cleaner stage removes bulk particulate before MACROCORE primary filter — extends MACROCORE service intervals 2–3x"},
    {"slug": "duratech", "mechanism": "Lube oil filtration downstream — captures engine-generated wear debris not prevented at air intake stage"}
  ]'::jsonb,

  'Air intake filtration is the primary barrier against silica and atmospheric particulate
entering combustion systems; failure of this barrier is the leading cause of premature
engine wear in off-highway equipment operating in dust-laden environments.',

  '/knowledge-system/technologies/macrocore'
)
ON CONFLICT (concept_slug, concept_type) DO UPDATE SET
  definition           = EXCLUDED.definition,
  system_context       = EXCLUDED.system_context,
  failure_mechanism    = EXCLUDED.failure_mechanism,
  industrial_impact    = EXCLUDED.industrial_impact,
  related_standards    = EXCLUDED.related_standards,
  related_technologies = EXCLUDED.related_technologies,
  industrial_role      = EXCLUDED.industrial_role,
  citation_url         = EXCLUDED.citation_url,
  version              = kg_canonical_blocks.version + 1,
  last_updated         = CURRENT_DATE,
  updated_at           = NOW();


-- ─── 2. INTEKCORE™ ────────────────────────────────────────────────────────────
-- Air intake pre-cleaner / housing — upstream stage before primary filter
-- DB product count: 243 products (DB name: INTAKCORE™ → corrected to INTEKCORE)

INSERT INTO kg_canonical_blocks (
  concept_slug, concept_type, display_name,
  definition,
  system_context,
  failure_mechanism,
  industrial_impact,
  related_standards,
  related_technologies,
  industrial_role,
  citation_url
) VALUES (
  'intekcore', 'technology', 'INTEKCORE™',

  'INTEKCORE™ pre-cleaner and air housing technology removes bulk atmospheric particulate
from intake air before the primary filter stage using centrifugal separation and pre-separation
chambers, reducing primary filter dust loading by 60–80% in high-dust operating conditions.',

  'Applied as the upstream stage in two-stage air filtration systems on heavy-duty off-highway
equipment: agricultural combines (field dust 1–5 g/m³), mining haul trucks (road dust
2–10 g/m³), construction equipment (demolition dust 0.5–3 g/m³). Operates ahead of
MACROCORE™ primary filter elements to extend service intervals.',

  'Without pre-cleaner stage, primary filter elements reach maximum dust capacity in
200–500 hours (high-dust environments) instead of 500–1,000+ hours → filter restriction
exceeds engine manufacturer limits → intake manifold vacuum spike → reduced volumetric
efficiency → fuel economy degradation → power loss. Frequent primary filter replacement
without pre-cleaner protection: 3–5× higher replacement frequency.',

  'Pre-cleaner installation extends primary filter service intervals 2–3× in high-dust
conditions, reducing air filtration maintenance labor by 50–65%. Primary filter element
cost reduction through extended service life: proportional to 2–3× interval extension.
In mining operations with continuous dust exposure, pre-cleaner reduces annual air filter
consumption from 12–18 elements/year to 4–6 elements/year per vehicle.',

  '[
    {"code": "SAE J1539", "scope": "Air cleaner element testing — efficiency measured after pre-cleaner stage for two-stage systems"},
    {"code": "ISO 5011", "scope": "Pre-cleaner efficiency evaluation as part of complete inlet air cleaning system test"}
  ]'::jsonb,

  '[
    {"slug": "macrocore", "mechanism": "Primary filter downstream — receives pre-cleaned air with 60–80% reduced dust load, enabling extended service intervals"}
  ]'::jsonb,

  'Pre-cleaner technology is the primary determinant of primary air filter service interval
in high-dust environments; without pre-separation, filter maintenance becomes the limiting
operational constraint in agricultural and mining equipment.',

  '/knowledge-system/technologies/intekcore'
)
ON CONFLICT (concept_slug, concept_type) DO UPDATE SET
  definition           = EXCLUDED.definition,
  system_context       = EXCLUDED.system_context,
  failure_mechanism    = EXCLUDED.failure_mechanism,
  industrial_impact    = EXCLUDED.industrial_impact,
  related_standards    = EXCLUDED.related_standards,
  related_technologies = EXCLUDED.related_technologies,
  industrial_role      = EXCLUDED.industrial_role,
  citation_url         = EXCLUDED.citation_url,
  version              = kg_canonical_blocks.version + 1,
  last_updated         = CURRENT_DATE,
  updated_at           = NOW();


-- ─── 3. NANOFORCE™ ────────────────────────────────────────────────────────────
-- Hydraulic filtration — sub-micron precision filtration
-- CORRECTED: primary system = hydraulic (was incorrectly labeled lube in TS)
-- DB product count: 1,962 products

INSERT INTO kg_canonical_blocks (
  concept_slug, concept_type, display_name,
  definition,
  system_context,
  failure_mechanism,
  industrial_impact,
  related_standards,
  related_technologies,
  industrial_role,
  citation_url
) VALUES (
  'nanoforce', 'technology', 'NANOFORCE™',

  'NANOFORCE™ hydraulic filtration media achieves Beta(x)[c] ≥ 200 efficiency ratings at
3µm and 6µm absolute, targeting sub-micron to fine particle contamination in hydraulic
circuits to maintain ISO 4406 cleanliness codes at 16/14/11 or tighter for proportional
valve and servo-valve protection.',

  'Applied to hydraulic return-line, pressure-line, and off-line (kidney-loop) filtration in
hydraulic systems on construction equipment, industrial machinery, mobile equipment, and
fixed plant installations. Critical in systems with proportional valves (spool clearances
2–8µm), servo valves (spool clearances 1–3µm), and variable-displacement pumps.
Operating pressures: 50–350+ bar. Fluid temperatures: 40–80°C continuous operation.',

  'Particle contamination in hydraulic fluid at ISO code 18/16/13 (vs. target 16/14/11)
→ abrasive wear on proportional valve spool surfaces (hardened steel, 2–8µm clearance)
→ spool surface scoring → internal leakage increase → reduced valve response accuracy
→ system pressure variations +10–30% → heat generation +5–15 kW → fluid temperature
increase +20–30°C → accelerated seal degradation → system failure. Valve spool
stiction occurs when clearance fill with wear debris at ISO codes above 19/17/14.',

  'Hydraulic system contamination causes equipment availability loss of -15–30% and
unplanned maintenance frequency of 1–2 events per 500 operating hours when cleanliness
targets are not maintained. Proportional valve replacement cost: €800–€4,000 per valve.
Maintaining ISO 16/14/11 cleanliness extends proportional valve life 3–5× versus
uncontrolled operation at ISO 19/17/14. System pressure increase from contamination
(+10–30%) increases heat generation and reduces pump volumetric efficiency -5–15%.',

  '[
    {"code": "ISO 16889", "scope": "Multi-pass method for evaluating filtration performance of a filter element — Beta ratio determination at specific micron sizes"},
    {"code": "ISO 4406", "scope": "Method for coding cleanliness level of liquids — particle count codes for 4µm, 6µm, 14µm channels"},
    {"code": "NFPA T2.14", "scope": "Hydraulic fluid power system cleanliness requirements for mobile equipment"},
    {"code": "DIN 51524", "scope": "Hydraulic fluid minimum requirements — Part 1 (HL), Part 2 (HLP), Part 3 (HVLP)"}
  ]'::jsonb,

  '[
    {"slug": "TURBOCORE", "mechanism": "Water removal from hydraulic fluid — water contamination accelerates fluid oxidation and reduces film strength"},
    {"slug": "syntrax", "mechanism": "Lube oil system filtration — particle wear overlap between lube and hydraulic systems on combined equipment"}
  ]'::jsonb,

  'Hydraulic contamination control via sub-micron filtration is the single largest controllable
factor in proportional valve and servo-valve service life, directly determining whether
equipment operates at designed accuracy or requires valve replacement every 2,000–3,000 hours.',

  '/knowledge-system/technologies/nanoforce'
)
ON CONFLICT (concept_slug, concept_type) DO UPDATE SET
  definition           = EXCLUDED.definition,
  system_context       = EXCLUDED.system_context,
  failure_mechanism    = EXCLUDED.failure_mechanism,
  industrial_impact    = EXCLUDED.industrial_impact,
  related_standards    = EXCLUDED.related_standards,
  related_technologies = EXCLUDED.related_technologies,
  industrial_role      = EXCLUDED.industrial_role,
  citation_url         = EXCLUDED.citation_url,
  version              = kg_canonical_blocks.version + 1,
  last_updated         = CURRENT_DATE,
  updated_at           = NOW();


-- ─── 4. SYNTRAX™ ─────────────────────────────────────────────────────────────
-- Lube / engine oil filtration — synthetic media for extended drain intervals
-- CORRECTED: primary system = lube-oil (was incorrectly labeled hydraulic in TS)
-- DB product count: 351 products (also known as SINTRAX — alias)

INSERT INTO kg_canonical_blocks (
  concept_slug, concept_type, display_name,
  definition,
  system_context,
  failure_mechanism,
  industrial_impact,
  related_standards,
  related_technologies,
  industrial_role,
  citation_url
) VALUES (
  'syntrax', 'technology', 'SYNTRAX™',

  'SYNTRAX™ synthetic lube oil filtration media maintains engine oil cleanliness at
ISO 4406 target codes through high-efficiency synthetic fiber construction with
extended dirt-holding capacity, enabling oil drain interval extension in diesel
engine crankcase and transmission lube circuits.',

  'Applied to engine lube oil circuits in diesel engines used in mining (SYNTRAX primary
application), construction, marine propulsion, and power generation. Operates in
full-flow and bypass configurations. Effective with SAE 15W-40, SAE 10W-30, and
synthetic-blend engine oils. Oil temperatures: 80–120°C operating range.
Oil change intervals: 250–500 hours standard, 500–1,000+ hours extended with
SYNTRAX synthetic media.',

  'Degraded lube oil filtration allows combustion-generated particles and metallic wear
debris (iron, aluminum, lead 1–50µm) to accumulate in oil film → abrasive wear on
bearing journal surfaces → bearing clearance increase → oil film breakdown under load
→ bearing surface metal-to-metal contact → bearing seizure. Oil viscosity increase
from particulate loading increases pumping losses and reduces oil circulation in
cold-start conditions. Lacquer and varnish deposition on valve train components
occurs above 90°C sustained oil temperature.',

  'Optimal lube oil cleanliness at ISO 16/14/11 extends engine bearing life from
5,000 hours (commodity approach) to 15,000–25,000 hours (system-optimized). Oil
consumption increase from particle wear: +15–40%. Fuel economy degradation from
increased friction: -5–12%. Engine blow-by increase from ring wear: +5–10%.
Equipment availability impact without lube contamination control: -15–25%.
Extended drain intervals enabled by synthetic media reduce oil consumption volume
30–50% over equipment lifecycle.',

  '[
    {"code": "ISO 16889", "scope": "Filter element performance — Beta ratio at 10µm, 12µm absolute for lube oil applications"},
    {"code": "ISO 4406", "scope": "Particle cleanliness codes for lube oil systems — target 16/14/11 for typical diesel engines"},
    {"code": "SAE J1211", "scope": "Crankcase ventilation — oil carryover and blowby measurement standards"}
  ]'::jsonb,

  '[
    {"slug": "duratech", "mechanism": "Extended-life lube oil filtration complementary technology — different oil viscosity ranges"},
    {"slug": "thermacore", "mechanism": "Coolant filtration for engines using SYNTRAX lube filtration — addresses separate fluid circuit"},
    {"slug": "nanoforce", "mechanism": "Hydraulic filtration on combined equipment with shared engine/hydraulic system maintenance"}
  ]'::jsonb,

  'Lube oil contamination control is the primary determinant of engine bearing lifespan
in diesel equipment; the choice between ISO 16/14/11 and ISO 19/17/14 cleanliness
targets represents a 3–5× difference in bearing service life and determines engine
overhaul frequency over a 10,000–25,000 hour equipment lifecycle.',

  '/knowledge-system/technologies/syntrax'
)
ON CONFLICT (concept_slug, concept_type) DO UPDATE SET
  definition           = EXCLUDED.definition,
  system_context       = EXCLUDED.system_context,
  failure_mechanism    = EXCLUDED.failure_mechanism,
  industrial_impact    = EXCLUDED.industrial_impact,
  related_standards    = EXCLUDED.related_standards,
  related_technologies = EXCLUDED.related_technologies,
  industrial_role      = EXCLUDED.industrial_role,
  citation_url         = EXCLUDED.citation_url,
  version              = kg_canonical_blocks.version + 1,
  last_updated         = CURRENT_DATE,
  updated_at           = NOW();


-- ─── 5. DURATECH™ ─────────────────────────────────────────────────────────────
-- Lube / engine oil filtration — extended lifecycle synthetic media
-- DB product count: 0 (defined in architecture, not yet in product catalog)

INSERT INTO kg_canonical_blocks (
  concept_slug, concept_type, display_name,
  definition,
  system_context,
  failure_mechanism,
  industrial_impact,
  related_standards,
  related_technologies,
  industrial_role,
  citation_url
) VALUES (
  'duratech', 'technology', 'DURATECH™',

  'DURATECH™ extended-lifecycle engine oil filtration media uses multi-layer synthetic
construction to maintain ISO 4406 oil cleanliness codes over drain intervals up to
1,000 hours, targeting particle contamination in diesel engine crankcase lube circuits
across agriculture, construction, automotive, and marine applications.',

  'Applied to engine oil full-flow filtration on heavy-duty diesel engines where extended
drain interval operation is specified. Used in agriculture (tractors, combines operating
seasonal programs), construction (fleet maintenance optimization), automotive (heavy
trucks, coaches), and marine (long-voyage vessels). Compatible with SAE 15W-40,
SAE 5W-40 full-synthetic, and synthetic-blend diesel engine oils.',

  'Insufficient filter dirt-holding capacity at extended drain intervals causes filter
bypass valve opening → unfiltered oil circulates → particle accumulation in oil
exceeds ISO 4406 target code → abrasive wear accelerates on bearing surfaces →
bearing clearances open → oil film breakdown → bearing damage. Cellulose-only media
at extended drain intervals typically fails at 400–600 hours due to media collapse
or dirt capacity exhaustion.',

  'Extended drain interval operation at 1,000 hours versus 500 hours reduces oil filter
element consumption 50%, maintenance labor 40–50%, and oil volume consumption 30–40%
per operating hour. Equipment availability improvement from reduced scheduled
maintenance events: +3–8% annual uptime. Bearing life extension through maintained
ISO 16/14/11 cleanliness over extended intervals: consistent with 15,000–25,000 hour
engine life versus 5,000–8,000 hours at ISO 18/16/13.',

  '[
    {"code": "ISO 16889", "scope": "Filter performance at extended service intervals — dirt capacity and Beta ratio stability over filter life"},
    {"code": "ISO 4406", "scope": "Cleanliness code verification at end of extended drain interval"},
    {"code": "SAE J1211", "scope": "Engine crankcase ventilation and oil circuit standards applicable to extended-drain systems"}
  ]'::jsonb,

  '[
    {"slug": "syntrax", "mechanism": "Complementary lube oil filtration technology — SYNTRAX for mining/power-gen, DURATECH for agriculture/automotive"},
    {"slug": "macrocore", "mechanism": "Air intake filtration — reduced air-borne particle ingestion reduces lube oil particle burden"}
  ]'::jsonb,

  'Extended-drain lube oil filtration is the operational mechanism by which total
maintenance cost per operating hour is reduced; media that cannot maintain Beta
ratio performance over the full drain interval undermines the economic case for
extended drain programs.',

  '/knowledge-system/technologies/duratech'
)
ON CONFLICT (concept_slug, concept_type) DO UPDATE SET
  definition           = EXCLUDED.definition,
  system_context       = EXCLUDED.system_context,
  failure_mechanism    = EXCLUDED.failure_mechanism,
  industrial_impact    = EXCLUDED.industrial_impact,
  related_standards    = EXCLUDED.related_standards,
  related_technologies = EXCLUDED.related_technologies,
  industrial_role      = EXCLUDED.industrial_role,
  citation_url         = EXCLUDED.citation_url,
  version              = kg_canonical_blocks.version + 1,
  last_updated         = CURRENT_DATE,
  updated_at           = NOW();


-- ─── 6. THERMACORE™ ───────────────────────────────────────────────────────────
-- Lube / coolant filtration — engine coolant circuit filtration
-- DB product count: 59 products (stored as THERMACORE™ in elimfilters_catalog)
-- STRATEGIC RENAME: THERMACORE™ → THERMACORE™ (effective before Phase 1 execution)

INSERT INTO kg_canonical_blocks (
  concept_slug, concept_type, display_name,
  definition,
  system_context,
  failure_mechanism,
  industrial_impact,
  related_standards,
  related_technologies,
  industrial_role,
  citation_url
) VALUES (
  'thermacore', 'technology', 'THERMACORE™',

  'THERMACORE™ coolant filtration media removes silicate gel precipitates, rust particles,
and cavitation erosion debris from diesel engine coolant circuits, maintaining coolant
cleanliness and supplemental coolant additive (SCA) concentration to prevent liner
pitting and heat exchanger scaling.',

  'Applied to engine coolant circuits on heavy-duty diesel engines requiring supplemental
coolant additive (SCA) maintenance. Addresses coolant degradation in systems running
ethylene glycol or propylene glycol antifreeze solutions. Critical on large-bore diesel
engines (mining haul trucks, marine engines, stationary power generation) where cylinder
liner cavitation erosion causes significant damage. Coolant temperatures: 75–95°C.',

  'Coolant particulate accumulation (silicate gel, rust, scale 10–500µm) restricts
heat exchanger flow paths → cooling capacity reduction → engine operating temperature
increase → thermal stress cycling on gaskets and seals → coolant leak paths → coolant
contamination of lube oil → bearing damage. Cavitation erosion debris from wet liners
(iron particles 5–50µm) circulates in coolant → radiator core blockage → localized
overheating → thermal fatigue cracking of cylinder heads.',

  'Coolant contamination leading to liner pitting can cause cylinder liner replacement
costs of $500–$5,000 per liner on large-bore engines. Heat exchanger scaling reduces
cooling efficiency 10–30%, increasing operating temperatures 5–15°C above design range.
Coolant filtration with SCA maintenance extends coolant service life from 500 hours
(standard) to 2,000–4,000 hours (with filtration), reducing coolant volume
consumption 75–80% over equipment lifecycle.',

  '[
    {"code": "ASTM D6210", "scope": "Fully formulated glycol base engine coolant for heavy-duty engines — chemical requirements"},
    {"code": "ASTM D3306", "scope": "Ethylene glycol base engine coolant — applicable to light and medium duty applications"}
  ]'::jsonb,

  '[
    {"slug": "syntrax", "mechanism": "Engine lube oil filtration on same engine platform — coolant and lube oil system maintenance coordinated"},
    {"slug": "duratech", "mechanism": "Engine lube oil filtration complementary to coolant circuit filtration on combined service intervals"}
  ]'::jsonb,

  'Coolant circuit filtration prevents cylinder liner cavitation erosion, which is
irreversible and requires expensive engine-out repair; maintaining SCA concentration
and particle cleanliness through filtration is significantly more cost-effective than
cylinder liner replacement.',

  '/knowledge-system/technologies/thermacore'
)
ON CONFLICT (concept_slug, concept_type) DO UPDATE SET
  definition           = EXCLUDED.definition,
  system_context       = EXCLUDED.system_context,
  failure_mechanism    = EXCLUDED.failure_mechanism,
  industrial_impact    = EXCLUDED.industrial_impact,
  related_standards    = EXCLUDED.related_standards,
  related_technologies = EXCLUDED.related_technologies,
  industrial_role      = EXCLUDED.industrial_role,
  citation_url         = EXCLUDED.citation_url,
  version              = kg_canonical_blocks.version + 1,
  last_updated         = CURRENT_DATE,
  updated_at           = NOW();


-- ─── 7. MARINECLEAN™ ──────────────────────────────────────────────────────────
-- Lube / marine engine oil filtration — marine-specific lube filtration
-- DB product count: 0 (architecture technology, product catalog expansion needed)

INSERT INTO kg_canonical_blocks (
  concept_slug, concept_type, display_name,
  definition,
  system_context,
  failure_mechanism,
  industrial_impact,
  related_standards,
  related_technologies,
  industrial_role,
  citation_url
) VALUES (
  'marineclean', 'technology', 'MARINECLEAN™',

  'MARINECLEAN™ marine engine oil filtration media maintains ISO 4406 lube oil cleanliness
in marine diesel and gas turbine propulsion engines operating in high-humidity, salt-air
environments, where atmospheric moisture ingestion and combustion byproduct accumulation
accelerate oil degradation and bearing wear.',

  'Applied to lube oil circuits in marine propulsion diesel engines, marine gensets, and
marine gas turbines on fishing vessels, cargo ships, offshore supply vessels, and naval
craft. Addresses the specific contamination profile of marine engine rooms: salt water
ingestion via crankcase ventilation, diesel exhaust condensate in oil, and accelerated
corrosive wear from acidic combustion products. Operating temperatures: 85–105°C.',

  'Salt water contamination in marine engine lube oil (even 0.05% water concentration)
disrupts oil film on bearing surfaces → hydrogen embrittlement of bearing metal alloys
→ bearing surface pitting → accelerated abrasive wear cycle. Acidic combustion products
(sulfuric acid from high-sulfur marine fuel) not neutralized by lube oil alkalinity reserves
→ corrosive attack on bearing surfaces → bearing metal removal → bearing failure.
Salt crystallization in oil passages → flow restriction → localized oil starvation.',

  'Marine engine bearing failures attributable to water/salt contamination average
$15,000–$80,000 per incident in replacement parts and labor, excluding vessel downtime.
Marine diesel engine overhaul intervals with uncontrolled lube contamination: 3,000–5,000
hours. With systematic lube filtration in marine environment: 8,000–12,000 hours.
Equipment availability impact of marine lube contamination events: -12–18% annually
for affected vessels.',

  '[
    {"code": "ISO 16889", "scope": "Filter element performance testing applicable to marine lube oil filtration systems"},
    {"code": "ISO 4406", "scope": "Cleanliness code targets for marine engine lube oil circuits"},
    {"code": "ISO 14540", "scope": "Lubricants for marine cylinder applications — specifications and test methods"}
  ]'::jsonb,

  '[
    {"slug": "TURBOCORE", "mechanism": "Water separation from marine fuel — complementary to lube circuit water control"},
    {"slug": "nanoforce", "mechanism": "Hydraulic filtration on marine steering and deck machinery systems"},
    {"slug": "syntrax", "mechanism": "Non-marine lube oil filtration reference technology for land-based equivalent applications"}
  ]'::jsonb,

  'Marine lube oil filtration operates under the combined stress of humidity, salt air,
and acidic combustion products that accelerate bearing wear at 2–3× the rate of
equivalent land-based engines; filtration systems must account for the marine
contamination profile to achieve comparable equipment life.',

  '/knowledge-system/technologies/marineclean'
)
ON CONFLICT (concept_slug, concept_type) DO UPDATE SET
  definition           = EXCLUDED.definition,
  system_context       = EXCLUDED.system_context,
  failure_mechanism    = EXCLUDED.failure_mechanism,
  industrial_impact    = EXCLUDED.industrial_impact,
  related_standards    = EXCLUDED.related_standards,
  related_technologies = EXCLUDED.related_technologies,
  industrial_role      = EXCLUDED.industrial_role,
  citation_url         = EXCLUDED.citation_url,
  version              = kg_canonical_blocks.version + 1,
  last_updated         = CURRENT_DATE,
  updated_at           = NOW();


-- ─── 8. BLUECLEAN™ ────────────────────────────────────────────────────────────
-- Lube / specialty fluid filtration — transmission and specialty fluid filtration
-- DB product count: 0 (architecture technology)

INSERT INTO kg_canonical_blocks (
  concept_slug, concept_type, display_name,
  definition,
  system_context,
  failure_mechanism,
  industrial_impact,
  related_standards,
  related_technologies,
  industrial_role,
  citation_url
) VALUES (
  'blueclean', 'technology', 'BLUECLEAN™',

  'BLUECLEAN™ specialty fluid filtration media maintains cleanliness in automatic transmission
fluid (ATF), power steering fluid, and specialty lubricant circuits, targeting fine metallic
wear particles (1–15µm) and oxidation byproducts that degrade friction material performance
and gear-shifting accuracy.',

  'Applied to automatic transmission fluid circuits, torque converter circuits, and power
steering systems in heavy-duty trucks, construction equipment with power-shift transmissions,
and industrial equipment. ATF cleanliness is critical for clutch pack friction material
life and torque converter efficiency. Operating temperature range: 80–130°C for ATF
under heavy-duty cycling conditions.',

  'ATF particle contamination (clutch plate friction material debris 5–50µm, gear wear
particles 1–20µm) accumulates in transmission valve body → proportional solenoid valve
spool wear (0.5–3µm clearances) → shift quality degradation → torque converter
stall speed variation → clutch engagement shock → friction material accelerated wear
→ transmission failure. Oxidation byproducts (varnish precursors) deposit on clutch
plates → reduced clutch engagement friction coefficient → clutch slip → excess heat
generation → ATF thermal breakdown cycle.',

  'Automatic transmission overhaul intervals without ATF filtration: 50,000–100,000 km.
With systematic ATF filtration: 150,000–200,000+ km. Clutch pack replacement cost
per event: $800–$4,000 for heavy-duty transmission. Shift quality degradation from
ATF contamination measurable at ISO codes above 18/16/13: torque converter efficiency
reduction 3–8%, clutch slip events increase 200–400% in final 20% of component life.',

  '[
    {"code": "ISO 16889", "scope": "Filter performance testing applicable to specialty fluid filtration at fine particle sizes"},
    {"code": "ISO 4406", "scope": "Cleanliness codes applicable to specialty fluid circuits including ATF and power steering fluid"}
  ]'::jsonb,

  '[
    {"slug": "syntrax", "mechanism": "Engine lube oil filtration on same powertrain platform — integrated filtration strategy for engine and transmission"},
    {"slug": "nanoforce", "mechanism": "Hydraulic system filtration — complementary to specialty fluid filtration on equipment with integrated circuits"}
  ]'::jsonb,

  'Specialty fluid filtration for automatic transmissions prevents the progressive degradation
of shift quality and clutch friction material that is difficult to detect until late-stage
failure; proactive ATF cleanliness control extends transmission life 2–3× compared to
time-only fluid change intervals.',

  '/knowledge-system/technologies/blueclean'
)
ON CONFLICT (concept_slug, concept_type) DO UPDATE SET
  definition           = EXCLUDED.definition,
  system_context       = EXCLUDED.system_context,
  failure_mechanism    = EXCLUDED.failure_mechanism,
  industrial_impact    = EXCLUDED.industrial_impact,
  related_standards    = EXCLUDED.related_standards,
  related_technologies = EXCLUDED.related_technologies,
  industrial_role      = EXCLUDED.industrial_role,
  citation_url         = EXCLUDED.citation_url,
  version              = kg_canonical_blocks.version + 1,
  last_updated         = CURRENT_DATE,
  updated_at           = NOW();


-- ─── 9. TURBOCORE™ ────────────────────────────────────────────────────────────
-- Fuel / water separation — water removal from diesel and hydraulic fluid
-- DB product count: 16 products (stored as AQUAGUARD™ in elimfilters_catalog)
-- STRATEGIC RENAME: AQUAGUARD™ → TURBOCORE™ (effective before Phase 1 execution)

INSERT INTO kg_canonical_blocks (
  concept_slug, concept_type, display_name,
  definition,
  system_context,
  failure_mechanism,
  industrial_impact,
  related_standards,
  related_technologies,
  industrial_role,
  citation_url
) VALUES (
  'TURBOCORE', 'technology', 'TURBOCORE™',

  'TURBOCORE™ water separation technology removes free and emulsified water from diesel
fuel and hydraulic fluid using coalescing media to aggregate water droplets to
drainable size, maintaining water concentration below 200 ppm (Karl Fischer method,
ASTM D6304) to prevent injector stiction, corrosion, and microbial growth.',

  'Applied to fuel pre-filtration on diesel engines in marine vessels, agriculture,
outdoor power generation, and construction equipment operating in high-humidity
environments where fuel tank condensation is significant. Also applied to hydraulic
fluid circuits where water ingression from atmospheric breathing or seal leakage
degrades fluid film strength. Critical in marine environments with constant humidity
exposure. Target water concentration: < 200 ppm in diesel fuel, < 500 ppm in hydraulic fluid.',

  'Water in diesel fuel (>200 ppm free water) accumulates in injection system → injector
nozzle orifice corrosion (chromium-molybdenum steel, pH sensitive) → nozzle orifice
enlargement → spray pattern degradation → incomplete combustion → carbon deposit
accumulation → injector stiction (needle valve sticking) → rough running and power
loss. Microbial contamination above 1,000 ppm water → biofilm formation on tank walls
and filter media → fuel degradation → filter plugging. Corrosion products (iron oxide,
copper salts) from water contamination accelerate injector wear.',

  'Injector stiction from water contamination increases hard starting by +5–15 seconds
in cold conditions. Fuel consumption increase from degraded injection spray pattern:
+3–8%. Injector cleaning interval reduction to 2,000–3,000 hours vs. 5,000–8,000
hours without water contamination. Equipment availability reduction: -12–18% for
water-contaminated fuel systems. Injector replacement cost: $200–$800 per injector
on common-rail systems; full set replacement on 6-cylinder engine: $1,200–$4,800.',

  '[
    {"code": "ASTM D6304", "scope": "Karl Fischer titration — determination of water in petroleum products, measurement range 10–25,000 ppm"},
    {"code": "ISO 12937", "scope": "Petroleum products — determination of water by coulometric Karl Fischer titration"},
    {"code": "ISO 4406", "scope": "Applicable to water-contaminated hydraulic fluid cleanliness coding"}
  ]'::jsonb,

  '[
    {"slug": "SYNTAPORE", "mechanism": "Fuel filtration downstream of TURBOCORE — particle removal after water separation stage"},
    {"slug": "nanoforce", "mechanism": "Hydraulic filtration — TURBOCORE water removal from hydraulic fluid upstream of NANOFORCE fine filtration"}
  ]'::jsonb,

  'Water removal from fuel and hydraulic systems is the foundational contamination control
measure for preventing the accelerated corrosion, microbial growth, and injector wear
that water contamination causes; even 500 ppm free water in diesel fuel initiates
corrosion and microbial growth mechanisms within 2–4 weeks.',

  '/knowledge-system/technologies/TURBOCORE'
)
ON CONFLICT (concept_slug, concept_type) DO UPDATE SET
  definition           = EXCLUDED.definition,
  system_context       = EXCLUDED.system_context,
  failure_mechanism    = EXCLUDED.failure_mechanism,
  industrial_impact    = EXCLUDED.industrial_impact,
  related_standards    = EXCLUDED.related_standards,
  related_technologies = EXCLUDED.related_technologies,
  industrial_role      = EXCLUDED.industrial_role,
  citation_url         = EXCLUDED.citation_url,
  version              = kg_canonical_blocks.version + 1,
  last_updated         = CURRENT_DATE,
  updated_at           = NOW();


-- ─── 10. SYNTAPORE™ ────────────────────────────────────────────────────────────
-- Fuel filtration media — particle removal from diesel fuel
-- DB name: SYNTAPORE™ → corrected canonical name: SYNTAPORE™
-- DB product count: 500 products

INSERT INTO kg_canonical_blocks (
  concept_slug, concept_type, display_name,
  definition,
  system_context,
  failure_mechanism,
  industrial_impact,
  related_standards,
  related_technologies,
  industrial_role,
  citation_url
) VALUES (
  'SYNTAPORE', 'technology', 'SYNTAPORE™',

  'SYNTAPORE™ fuel filtration media removes particulate contamination from diesel fuel
at 4–10µm absolute efficiency, protecting common-rail injection system components
(high-pressure pumps, injector nozzles) that operate with clearances of 1–3µm and
require fuel cleanliness at ISO 12/9/6 or tighter.',

  'Applied to primary and secondary fuel filtration on diesel engines with common-rail
injection systems operating at 1,600–2,200 bar injection pressure. Used in agriculture
(diesel tractors, combines), construction (excavators, wheel loaders), power generation
(diesel gensets, prime power units), and automotive (heavy trucks, coaches). Critical
for Tier 4 / Stage V emissions-compliant engines where injection precision is essential
for particulate emissions compliance.',

  'Abrasive particle contamination in diesel fuel at ISO code above 14/12/9 (vs. target
12/9/6 for common-rail systems) → plunger-barrel wear in high-pressure fuel pump
(1–3µm clearances) → pump volumetric efficiency loss → injection pressure shortfall
→ injector spray pattern degradation → incomplete fuel atomization → increased particulate
emissions → emissions non-compliance. Particle wear in fuel pump plunger progresses
from 100 hours (severe contamination) to 2,000 hours (controlled cleanliness).',

  'Common-rail fuel pump replacement cost: $600–$2,500. Injector set replacement on
6-cylinder engine: $1,200–$5,000. Fuel system contamination-related failures account
for 30–40% of unplanned engine maintenance events in field populations without
systematic fuel filtration. Equipment availability reduction from fuel system failures:
-8–15%. Hard start frequency increase from fuel contamination: proportional to injector
spray angle degradation (+3–8% fuel consumption from spray degradation).',

  '[
    {"code": "ISO 12937", "scope": "Diesel fuel water content measurement — applicable to combined water/particle contamination assessment"},
    {"code": "ASTM D6304", "scope": "Karl Fischer water measurement in fuel — used alongside SYNTAPORE particle control"},
    {"code": "ISO 16889", "scope": "Filter element performance testing — Beta ratio at 4µm, 6µm, 10µm for fuel filter applications"}
  ]'::jsonb,

  '[
    {"slug": "TURBOCORE", "mechanism": "Water separation upstream of SYNTAPORE — water contamination degrades fuel filter media efficiency"},
    {"slug": "macrocore", "mechanism": "Air intake filtration on same engine platform — reduces particle ingestion from combustion air side"}
  ]'::jsonb,

  'Fuel filtration media efficiency at sub-10µm is the primary determinant of common-rail
injection system service life; modern high-pressure injection systems with 1–3µm
component clearances require fuel cleanliness levels that cannot be achieved without
multi-stage filtration including particle removal at the 4–10µm range.',

  '/knowledge-system/technologies/SYNTAPORE'
)
ON CONFLICT (concept_slug, concept_type) DO UPDATE SET
  definition           = EXCLUDED.definition,
  system_context       = EXCLUDED.system_context,
  failure_mechanism    = EXCLUDED.failure_mechanism,
  industrial_impact    = EXCLUDED.industrial_impact,
  related_standards    = EXCLUDED.related_standards,
  related_technologies = EXCLUDED.related_technologies,
  industrial_role      = EXCLUDED.industrial_role,
  citation_url         = EXCLUDED.citation_url,
  version              = kg_canonical_blocks.version + 1,
  last_updated         = CURRENT_DATE,
  updated_at           = NOW();


-- ─── 11. MICROKAPPA™ ──────────────────────────────────────────────────────────
-- Cabin air filtration — HEPA-class + carbon adsorption
-- CORRECTED: primary system = cabin (was incorrectly labeled coolant in TS)
-- DB product count: 122 products

INSERT INTO kg_canonical_blocks (
  concept_slug, concept_type, display_name,
  definition,
  system_context,
  failure_mechanism,
  industrial_impact,
  related_standards,
  related_technologies,
  industrial_role,
  citation_url
) VALUES (
  'microkappa', 'technology', 'MICROKAPPA™',

  'MICROKAPPA™ cabin air filtration technology combines electrostatic particulate attraction,
HEPA-class mechanical filtration (≥99.97% efficiency at 0.3µm), and activated carbon
adsorption to remove PM10, PM2.5, and gaseous contaminants from operator cab intake
air, maintaining ISO 11155 and DIN 71220 compliance for operator health protection.',

  'Applied to cab air filtration systems on heavy-duty construction equipment (excavators,
wheel loaders), agricultural equipment (tractors, combines), mining vehicles, and
forestry machines operating in environments with PM10 concentrations >50 µg/m³.
Addresses particulate (silica dust, carbon soot, pollen), chemical (agricultural
pesticides, diesel exhaust NOx, VOCs from fuel and hydraulic fluid), and biological
(mold spores, bacteria) contamination in operator cabin air. Cabin ventilation flow
rates: 100–400 m³/h.',

  'Unfiltered or under-filtered cab air with PM2.5 above WHO guideline 15 µg/m³ → operator
respiratory exposure to respirable silica (crystalline SiO2 <10µm) → cumulative lung
deposition → silicosis risk with extended occupational exposure (10,000+ hours). Diesel
exhaust particulate (PM2.5, PM10) → cardiovascular and respiratory disease risk. Carbon
monoxide ingestion from engine exhaust → acute exposure symptoms above 35 ppm. Pesticide
vapors in agricultural cab environments → chemical exposure above PEL thresholds without
activated carbon adsorption stage.',

  'Respirable silica exposure above OSHA PEL 50 µg/m³ (8h TWA) requires medical
monitoring and regulatory compliance programs at $500–$2,000 per worker annually.
Equipment cabin air without HEPA-class filtration in dusty environments can expose
operators to PM2.5 levels 5–20× higher than outdoor ambient. ISO 11155 compliance
requires ≥95% filtration efficiency for particles above 1µm. Activated carbon stage
captures diesel exhaust gases (NOx, VOCs) above minimum threshold concentration.
Operator cognitive performance in high-CO environments (above 35 ppm): measurable
reaction time increase within 2–4 hours of exposure.',

  '[
    {"code": "ISO 11155", "scope": "Road vehicles — air filters for passenger compartments — Part 1 particle test, Part 2 gaseous contaminant test"},
    {"code": "DIN 71220", "scope": "Cabin air filtration for off-highway equipment — particulate and gaseous filtration efficiency requirements"}
  ]'::jsonb,

  '[
    {"slug": "macrocore", "mechanism": "Air intake filtration on same equipment platform — controls ambient particulate concentration that cab system must also address"},
    {"slug": "drycore", "mechanism": "Compressed air drying on equipment with pneumatic cab pressurization systems"}
  ]'::jsonb,

  'Cabin air filtration is the primary occupational health control for operator exposure
to respirable silica, diesel particulate matter, and agricultural chemicals in enclosed
heavy equipment cabs; ISO 11155 compliance is a legal requirement in multiple
jurisdictions and a measurable risk mitigation against silicosis and chemical
exposure liability.',

  '/knowledge-system/technologies/microkappa'
)
ON CONFLICT (concept_slug, concept_type) DO UPDATE SET
  definition           = EXCLUDED.definition,
  system_context       = EXCLUDED.system_context,
  failure_mechanism    = EXCLUDED.failure_mechanism,
  industrial_impact    = EXCLUDED.industrial_impact,
  related_standards    = EXCLUDED.related_standards,
  related_technologies = EXCLUDED.related_technologies,
  industrial_role      = EXCLUDED.industrial_role,
  citation_url         = EXCLUDED.citation_url,
  version              = kg_canonical_blocks.version + 1,
  last_updated         = CURRENT_DATE,
  updated_at           = NOW();


-- ─── 12. DRYCORE™ ─────────────────────────────────────────────────────────────
-- Compressed air drying — desiccant air dryer technology
-- DB product count: 3 products

INSERT INTO kg_canonical_blocks (
  concept_slug, concept_type, display_name,
  definition,
  system_context,
  failure_mechanism,
  industrial_impact,
  related_standards,
  related_technologies,
  industrial_role,
  citation_url
) VALUES (
  'drycore', 'technology', 'DRYCORE™',

  'DRYCORE™ desiccant air dryer technology reduces compressed air moisture to pressure
dew points between -20°C and -40°C, meeting ISO 8573-1 Class 4 to Class 1 moisture
specifications for pneumatic systems, instrument air, and process applications where
liquid water formation would cause component damage or process contamination.',

  'Applied to compressed air supply systems in industrial manufacturing (pneumatic control
systems, spray painting, food processing), vehicle air brake systems (trucks, buses,
heavy equipment), and instrument air systems in process plants. Effective in environments
where compressed air relative humidity exceeds 50% at delivery pressure. Desiccant
types: silica gel, activated alumina, molecular sieve. Regeneration: heated purge, heatless
bleed, or external heat. Flow range: 10–10,000 Nm³/h.',

  'Wet compressed air (dew point > 10°C) in pneumatic distribution systems → water
condensation in cold sections of piping → ice formation in freezing environments
→ valve and actuator freeze-up → process stoppage. Liquid water in air lines corrodes
ferrous pipe internals → rust particles enter pneumatic valves → valve spool wear and
stiction → inaccurate or failed pneumatic actuation. In vehicle air brake systems,
liquid water accumulation in brake chambers → ice formation → brake failure.',

  'ISO 8573-1 Class 1 moisture specification (dew point ≤ -70°C at line pressure) required
for instrument air in critical process applications. Vehicle air brake moisture
accumulation leading to brake failure: regulatory non-compliance and liability.
Pneumatic valve replacement from moisture-induced corrosion: $100–$800 per valve
in industrial systems. Compressed air dryer installation payback period versus
valve replacement and downtime costs: typically 6–18 months in high-humidity environments.
Process contamination from water ingression in food-grade compressed air applications:
regulatory shutdown costs in excess of production losses.',

  '[
    {"code": "ISO 8573-1", "scope": "Compressed air purity classes — specifies maximum concentrations for particles, water (dew point), and oil"},
    {"code": "ISO 8573-2", "scope": "Compressed air test methods for aerosol oil content"},
    {"code": "ISO 8573-3", "scope": "Test methods for measurement of humidity in compressed air"}
  ]'::jsonb,

  '[
    {"slug": "gasultra", "mechanism": "Compressed air coalescing filtration — removes liquid water and oil aerosol upstream or downstream of DRYCORE desiccant stage"}
  ]'::jsonb,

  'Compressed air moisture control via desiccant drying is required for ISO 8573-1 Class 1–4
compliance in instrument and process air applications; liquid water in compressed air
systems causes valve failures and process contamination that cannot be remediated
without complete system drying and component inspection.',

  '/knowledge-system/technologies/drycore'
)
ON CONFLICT (concept_slug, concept_type) DO UPDATE SET
  definition           = EXCLUDED.definition,
  system_context       = EXCLUDED.system_context,
  failure_mechanism    = EXCLUDED.failure_mechanism,
  industrial_impact    = EXCLUDED.industrial_impact,
  related_standards    = EXCLUDED.related_standards,
  related_technologies = EXCLUDED.related_technologies,
  industrial_role      = EXCLUDED.industrial_role,
  citation_url         = EXCLUDED.citation_url,
  version              = kg_canonical_blocks.version + 1,
  last_updated         = CURRENT_DATE,
  updated_at           = NOW();


-- ─── 13. GASULTRA™ ────────────────────────────────────────────────────────────
-- Compressed air coalescing — oil aerosol and water droplet removal
-- DB product count: 0 (architecture technology)

INSERT INTO kg_canonical_blocks (
  concept_slug, concept_type, display_name,
  definition,
  system_context,
  failure_mechanism,
  industrial_impact,
  related_standards,
  related_technologies,
  industrial_role,
  citation_url
) VALUES (
  'gasultra', 'technology', 'GASULTRA™',

  'GASULTRA™ compressed air coalescing filtration removes liquid water droplets and oil
aerosol from compressed air to ISO 8573-1 Class 1 oil purity (≤0.01 mg/m³) and
Class 1 liquid water requirements, protecting downstream pneumatic equipment from
fluid contamination and ensuring process air purity in manufacturing and food
processing applications.',

  'Applied to compressed air treatment systems downstream of compressors in industrial
manufacturing, food and beverage processing, pharmaceutical production, spray coating
operations, and pneumatic control systems. Coalescing filter stages are installed
after aftercoolers to remove bulk liquid, followed by fine coalescing for aerosol
removal. Operating pressures: 4–16 bar. Typical installation: pre-dryer coalescer
+ post-dryer oil coalescer for comprehensive treatment.',

  'Compressor oil carryover (0.5–10 mg/m³ without filtration) in compressed air
→ oil film deposition on pneumatic valve seats → valve flow coefficient reduction
→ actuator response degradation → process control inaccuracy. Oil contamination
in spray applications → finish defects → product rejection. Oil in food-grade air
→ product contamination → regulatory violation. Water droplets in pneumatic tools
→ internal corrosion → tool failure → production stoppage.',

  'ISO 8573-1 Class 1 oil purity requirement (≤0.01 mg/m³) in food-grade applications
is a statutory requirement under EU Regulation 1935/2004 and equivalent food safety
standards. Typical oil carryover from unfiltered compressed air: 2–5 mg/m³ → requires
99.8% removal efficiency to reach Class 1. Pneumatic valve replacement interval from
oil fouling in unfiltered systems: 6–18 months versus 3–7 years with ISO Class 1 air.
Spray finish rejection rates from oil contamination in paint shop applications: 0.5–3%
of production output without oil-free air certification.',

  '[
    {"code": "ISO 8573-1", "scope": "Compressed air purity classes — oil, water, and particle content specifications"},
    {"code": "ISO 8573-2", "scope": "Test methods for aerosol oil content measurement in compressed air"}
  ]'::jsonb,

  '[
    {"slug": "drycore", "mechanism": "Compressed air desiccant drying — combined with GASULTRA coalescing for complete ISO 8573-1 compliance"}
  ]'::jsonb,

  'Compressed air oil removal is the prerequisite for ISO 8573-1 Class 1 purity compliance
in food, pharmaceutical, and precision manufacturing applications; oil contamination
in process air causes product recalls and regulatory actions that far exceed the cost
of coalescing filtration installation and maintenance.',

  '/knowledge-system/technologies/gasultra'
)
ON CONFLICT (concept_slug, concept_type) DO UPDATE SET
  definition           = EXCLUDED.definition,
  system_context       = EXCLUDED.system_context,
  failure_mechanism    = EXCLUDED.failure_mechanism,
  industrial_impact    = EXCLUDED.industrial_impact,
  related_standards    = EXCLUDED.related_standards,
  related_technologies = EXCLUDED.related_technologies,
  industrial_role      = EXCLUDED.industrial_role,
  citation_url         = EXCLUDED.citation_url,
  version              = kg_canonical_blocks.version + 1,
  last_updated         = CURRENT_DATE,
  updated_at           = NOW();

-- =============================================================================
-- Expected after successful run:
--   INSERT 0 13 (first run — 13 technology rows inserted)
--   OR UPDATE 13 (subsequent runs — versions incremented)
--
-- Verify with:
--   SELECT concept_slug, concept_type, version, last_updated
--   FROM kg_canonical_blocks WHERE concept_type = 'technology'
--   ORDER BY concept_slug;
--   -- Expected: 13 rows
--
-- Critical correctness check:
--   SELECT concept_slug, LEFT(definition, 80)
--   FROM kg_canonical_blocks
--   WHERE concept_slug IN ('microkappa', 'syntrax', 'nanoforce')
--     AND concept_type = 'technology';
--   -- microkappa: must contain 'HEPA' or 'cabin' — NOT 'coolant'
--   -- syntrax: must contain 'lube' or 'engine oil' — NOT 'hydraulic'
--   -- nanoforce: must contain 'hydraulic' — NOT 'lube oil'
-- =============================================================================
