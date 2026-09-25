# Isuzu USA Diesel Closure, Model Years 2000-2026

**Phase ID:** `ISUZU_US_DIESEL_THREE_PHASE_CLOSURE`
**Manifest:** `config/vehicle-platform-closure/isuzu-us-phase2-oem.json` (existing, unchanged)
**Phase 1 initial pass:** 2026-09-22
**Phase 1 closure pass:** 2026-09-23
**Phase 1 technical-qualifier pass:** 2026-09-23
**Phase 2 closure pass:** 2026-09-23
**Phase 3 closure pass:** 2026-09-23
**Phase 3 exception closure pass:** 2026-09-23
**Phase 3 single-case microinvestigation:** 2026-09-24
**Phase 3 BLOCKED_DONALDSON closure micro-phase:** 2026-09-24
**P848076 ELIMFILTERS SKU closure:** 2026-09-24
**Scope:** USA market, Isuzu, diesel only, model years 2000-2026 inclusive.

This is the research output for the three gated phases the manifest already defines. It
does not introduce a pipeline, a rule or a table. It fills the manifest's stages with
evidence and states, for every model year, what is closed and what is not.

## PHASE 1 — OFFICIALLY CLOSED

**`"phase_status": "CLOSED"`** in `config/vehicle-platform-closure/isuzu-us-diesel-phase1-universe.json`.

A dedicated closure pass (2026-09-23) resolved every case the initial 2026-09-22 pass had
left open: 7 year-blocks at `PARTIAL` / `UNRESOLVED` / `CONFLICTING`, plus the `H-SERIES`
and `FBR` discovery items and the outstanding NQR MY2000-2001 gap. Phase 2 and Phase 3 were
**not** touched — this pass is Phase 1 only, no filter or aftermarket research.

| | Count |
|---|---|
| Year/model combinations (was 169) | **181** |
| VERIFIED | **181** |
| VERIFIED_ABSENT | (6 model years, F-Series 2011-2016, counted within VERIFIED above) |
| PARTIAL | **0** |
| UNRESOLVED | **0** |
| CONFLICTING | **0** |
| Discovery items, terminal | **3 of 3** (H-SERIES VERIFIED, FBR CLOSED_NOT_FOUND, NQR MY2000-2001 VERIFIED) |

### The 10 cases, resolved

| # | Case | Was | Now | Closing evidence |
|---|---|---|---|---|
| 1 | NPR / NPR-HD MY2001 | PARTIAL | VERIFIED | `nprdspecs.htm` captured 2001-03-31 (was resting on the Oct-2000 page alone) |
| 2 | NQR MY2000 | UNRESOLVED | VERIFIED | `nqrdspecs.htm` captured 2000-09-02 (the original CDX row pointed to a malformed 404 URL) |
| 3 | NQR MY2001 | UNRESOLVED | VERIFIED | `nqrdspecs.htm` captured 2001-02-05 |
| 4 | NRR MY2004 (`CONF-NRR-2004`) | CONFLICTING | VERIFIED | Isuzu's own `n_specs.html` nav shows NRR added between the 2003-12-09 and 2004-04-11 captures; NHTSA is corroboration-only and does not override an existing Isuzu primary source |
| 5 | NPR-HD/NQR/NRR MY2014 | PARTIAL | VERIFIED | `pdfs/nseries_specs.pdf` captured 2014-01-14, prints `Isuzu 4HK1-TC turbocharged intercooled diesel` |
| 6 | NPR ECO-MAX MY2014 | PARTIAL | VERIFIED | Same 2014-01-14 PDF, prints `Isuzu 4JJ1-TC turbocharged intercooled diesel`, 3.0L |
| 7 | NPR-HD/NPR-XD/NQR/NRR MY2021 | PARTIAL | VERIFIED | `npr-xd_crew_specs.pdf`, `nqr_crew_specs.pdf` and (as of the technical-qualifier pass) `nrr_crew_specs.pdf` all print `Isuzu 4HK1-TC` directly; NPR-HD alone closes on sibling evidence plus a documented technical blocker (below) |
| 8 | FTR MY2018 | PARTIAL | VERIFIED | `en/fseries/specs` captured 2018-01-31, prints `Isuzu 4HK1-TC turbocharged intercooled diesel` |
| 9 | H-SERIES (critical) | open discovery item | **VERIFIED, incorporated** | Full Isuzu H-Series microsite, `isuzucv.com/hseries/*`, 2005-03-18 through 2009-06-16 |
| 10 | FBR | open discovery item | CLOSED_NOT_FOUND | Zero hits across isuzucv.com (all-time URL search), NHTSA's full Isuzu model list, and general web search |

### A documented technical blocker, since reduced to one model (NPR-HD MY2021)

The initial closure pass (2026-09-22/23) found that two of the four MY2021 N-Series
documents (`npr-hd_diesel_crew_specs.pdf`, `nrr_crew_specs.pdf`) existed on Wayback — real
Isuzu USA URLs, real 200 status — but every retrieval attempt truncated at exactly
1,048,576 bytes, and closed both models on same-batch sibling evidence instead.

## PHASE 1 TECHNICAL QUALIFIER PASS — 2026-09-23

A dedicated follow-up eliminated the residual qualifier on **NRR MY2021** and made the
**NPR-HD MY2021** and **NRR MY2004** qualifiers explicit and auditable rather than implicit.
Phase 1's own status counts (181/181 VERIFIED, 0 PARTIAL/UNRESOLVED/CONFLICTING) are
**unchanged** — this pass only adds or resolves the qualifier layer underneath the existing
VERIFIED status. No filters, no aftermarket, Phase 2/3 untouched.

**NRR MY2021 — RESOLVED to VERIFIED_DIRECT.** HTTP response headers from the truncated
capture revealed Wayback's own diagnostic: `warning: 299 wayback content truncated by
"length"`, with `x-archive-orig-x-crawler-content-length: 1601457` against a served
`Content-Length: 1048576` — proof the truncation happened inside Wayback's own storage at
crawl time, not in any client. The same file's `Last-Modified` header (`Tue, 02 Apr 2019
20:12:04 GMT`) is identical across every capture from 2019-06-06 through the 2020-11-27
MY2021 capture, proving Isuzu never touched the file across that whole span. The
**2019-06-06 memento of the same URL is not truncated** (1,601,457 bytes, no warning) and
shares that exact Last-Modified fingerprint — it is the byte-identical file. Downloaded in
full, it reads directly: `GVWR/GCWR 19,500/25,500 lbs.`, `ENGINE Isuzu 4HK1-TC
turbocharged`, `215 hp @ 2,500 rpm`, `452 lb.-ft. @ 1,850 rpm` — an exact match to this
closure's existing NRR MY2021 GVWR/GCWR. NRR now closes on its **own** document, not on its
NPR-XD/NQR siblings.

**NPR-HD MY2021 — remains QUALIFIED_CLOSED.** The identical recovery technique does not
work for `npr-hd_diesel_crew_specs.pdf`: its file version (also `Last-Modified` 2019-04-02)
has **no untruncated memento anywhere in Wayback's history of the URL**. Five mementos were
checked via HTTP header forensics — 2016-03-28 and 2024-06-29 are real, complete files but
are *different, later-modified* versions (proven by a different Last-Modified), so using
them would silently substitute a different document rather than recover this one; the
three mementos of the correct 2019-04-02 version (2019-10-16, 2020-11-27, 2021-04-20, plus
2021-06-21) are all truncated at the identical byte count. Confirmed independently across
four HTTP clients: curl (`id_`/`if_`/default replay), PowerShell `Invoke-WebRequest`, a
curl range-resume attempt, and Python `urllib.request` (used to read the diagnostic
headers directly). NPR-HD MY2021 remains closed on its own standard-cab sheet (model,
GVWR, 5.2L confirmed) plus the `4HK1-TC` code now confirmed directly for all three of its
NPR-XD/NQR/NRR platform siblings from the same 2020-11-27 batch.

**NRR MY2004 — remains QUALIFIED_CLOSED.** A relevant California Air Resources Board
Executive Order was located: **A-020-0218**, "ISUZU MOTORS LIMITED — New On-Road
Heavy-Duty Engines," executed 2003-12-22, certifying engine family `4SZXH05.23AA` —
model code `4HK1TC/523AA-1`, 190 hp — explicitly for **"MODEL YEAR 2004"**, for on-road
vehicles over 14,000 lbs GVWR (the class NRR's 19,500 lbs falls into). The 190 hp rating
matches Isuzu's own mid-2004 NRR literature (`n_specs.pdf`, captured 2004-07-25: "190 HP @
2,600 RPM") exactly. This is genuine, relevant, government-certified evidence — but it
certifies the **engine family's** model-year basis, not the **NRR vehicle's** model year by
name, and no distinct MY2005 Executive Order for the same weight class was found
superseding it (the next one located is A-020-0242, dated 2008), meaning a MY2005-launched
NRR could equally have shipped on the carried-forward 2004-based certification without a
new EO being required. NHTSA's recalls API returned zero campaigns for NRR at either model
year, so no recall notice exists to check either. No isuzucv.com brochure, owner's manual,
service manual or press release with a printed model year was found for this era (Wayback's
entire PDF index for isuzucv.com 2003-2006 holds exactly two files, neither dated). The
qualifier is preserved rather than resolved; the block's VERIFIED status stands on the
site-navigation/continuous-publication evidence from the prior closure pass, not on an
explicit model-year label.

**PHASE 1 TECHNICAL AUDIT = CLOSED WITH QUALIFIER.** Of the two qualifiers scoped for this
pass, one (NRR MY2021) is fully resolved; the other two flagged points (NPR-HD MY2021,
NRR MY2004) remain honestly reported as `QUALIFIED_CLOSED` — real, relevant evidence was
found for both, in neither case did that evidence rise to the "explicit model-year label"
or "direct recoverable document" bar the task set. See `technical_qualifier` objects on
blocks `N-2004-NRR` and `N-2019-2021` in the Phase 1 artefact for the complete, structured
record of every source checked, every timestamp tried and every method used.

## Artefacts

| File | Contents |
|---|---|
| `config/vehicle-platform-closure/isuzu-us-diesel-sources.json` | Every source read, with the exact capture used and what each one supports |
| `config/vehicle-platform-closure/isuzu-us-diesel-phase1-universe.json` | Phase 1 vehicle universe, conflicts, exclusions, open discovery items |
| `config/vehicle-platform-closure/isuzu-us-diesel-phase2-oen.json` | Phase 2 position universe and Isuzu OE/OEN rows |
| `config/vehicle-platform-closure/isuzu-us-diesel-phase3-aftermarket.json` | Phase 3 resolution rows (one per eligible Phase 2 OEN row), BLOCKED_OEM rows, access blockers and unpublished ELIMFILTERS base decisions |
| `config/isuzu-n-series-us-oem-matrix.json` | Extended from 2022-2026 to 2000-2026 so the existing bot resolver answers the whole range |
| `lib/isuzu-us-diesel-closure.js` | Reader, validator and the canonical filter-set answer |
| `tests/isuzu-us-diesel-closure.test.js` | 145 tests: the 10 Phase 1 closure-pass validations, 6 Phase 1 technical-qualifier validations, 15 Phase 2 OEM/OEN closure validations, 19 Phase 3 aftermarket-resolution validations, 16 Phase 3 exception-closure-pass validations, 13 single-case microinvestigation validations (`P2-N-LUBE-1998-2010`), 18 BLOCKED_DONALDSON closure micro-phase validations, and 26 P848076 ELIMFILTERS SKU closure validations (`SKUCASE 1`-`25` plus `SKUCASE FINAL`) |
| `tests/p552564-canonical-mapping.test.js` | 3 tests guarding the P552564/EF50953 canonical-mapping fix from PR #737 |

## Phase 1 — diesel vehicle universe

Every model year 2000-2026 has an explicit answer. **181** year-and-model combinations
(169 original + 12 from the newly-incorporated H-Series block, 3 models × 4 years).

| | Count |
|---|---|
| VERIFIED (incl. VERIFIED_ABSENT) | **181** |
| PARTIAL | **0** |
| UNRESOLVED | **0** |
| CONFLICTING | **0** |

`VERIFIED_ABSENT` is used for the six model years in which Isuzu USA published no
F-Series diesel truck at all. That is a closed answer, not a gap.

See **PHASE 1 — OFFICIALLY CLOSED** above for the case-by-case closure of the 7
year-blocks and 3 discovery items this section originally left open. Everything below
this point is the unchanged narrative from the 2026-09-22 initial pass except where
marked `CLOSURE PASS 2026-09-23`.

### N-Series

| Model years | Models | Engine | Displacement |
|---|---|---|---|
| 2000-2004 | NPR, NPR-HD, NQR (NQR from 2002) | 4HE1-TC | 4.75 L (290 CID) |
| 2005-2010 | NPR, NPR-HD, NQR, NRR | 4HK1-TC | 5.2 L (317 cu.in) |
| 2011-2014 | NPR-HD, NQR, NRR | 4HK1-TC | 5.2 L |
| 2011-2018 | NPR (ECO-MAX) | 4JJ1-TC | 3.0 L |
| 2015-2018 | NPR-HD, NPR-XD, NQR, NRR | 4HK1-TC | 5.2 L |
| 2019-2021 | NPR-HD, NPR-XD, NQR, NRR | 4HK1-TC | 5.2 L |
| 2022-2024 | NPR-HD, NPR-XD, NQR, NRR | 4HK1-TC | 5.2 L |
| 2025-2026 | NPR-HD, NPR-XD, NRR Derate, NRR | 4HK1-TC | 5.2 L |

### H-Series (`CLOSURE PASS 2026-09-23`, new)

| Model years | Models | Engine | Displacement | GVWR |
|---|---|---|---|---|
| 2005-2008 | HTR, HVR, HXR | 6HK1-TC | 7.8 L | 25,950 - 54,600 lbs (Class 6-8) |

A full Isuzu Commercial Truck of America microsite at `isuzucv.com/hseries/`, listed in
the site's own top-level navigation alongside N-SERIES and F-SERIES, first captured
2005-03-18 and unchanged through 2009-06-16. Benchmarked in Isuzu's own competitive-review
page against Ford, Freightliner, Hino, International and Sterling — genuine Class 6-8
heavy-truck positioning, not an F-Series duplicate. NHTSA vPIC independently corroborates
an Isuzu "H-Series" for MY2005-2008; its own manufacturer codenames T6F/T7F/T8F for the
same years never appear anywhere on isuzucv.com. See `block_id: H-2005-2008` in the Phase 1
artefact for the full per-model evidence (HTR/HVR/HXR each have their own dedicated
Isuzu specification page).

### F-Series

| Model years | Models | Engine | Displacement |
|---|---|---|---|
| 2000-2003 | FRR, FSR, FTR, FVR | 6HK1-TC | 7.8 L (475 CID) |
| 2004-2005 | FRR, FSR, FTR, FVR, FXR | 6HK1-TC | 7.8 L |
| 2006-2010 | FTR, FVR, FXR | 6HK1-TC | 7.8 L |
| 2011-2016 | none published | — | — |
| 2017-2021 | FTR | 4HK1-TC | 5.2 L |
| 2022-2026 | FTR, FVR Derate, FVR | Cummins B6.7 | 6.7 L |

### Findings that the candidate list did not predict

- **FXR** and **FRR** are real USA F-Series models and are not in the manifest's
  `candidate_model_names`. They were found in Isuzu's own published F-Series line and
  are in the universe. FRR runs 2000-2005, FXR 2004-2010.
- **FSR** exists only 2000-2005 in the USA, not across the period.
- The F-Series is **absent from the USA for model years 2011-2016**. Every `/fseries/`
  specification page captured in 2011 and 2012 returns the Isuzu error page and the site
  navigation of those captures has no F-SERIES entry.
- The FTR that returns for **MY2017** is a 5.2 L four-cylinder, not the 7.8 L six of the
  earlier FTR. A pre-2011 FTR filter set must never be applied to a post-2016 FTR.
- **FBR** appears in no Isuzu USA source read in this closure (confirmed by an exhaustive
  closing search, `CLOSURE PASS 2026-09-23`; formally `CLOSED_NOT_FOUND`).
- **H-Series** (HTR/HVR/HXR, Class 6-8, `CLOSURE PASS 2026-09-23`) is a genuine third Isuzu
  USA diesel product line that was not in the manifest's candidate list at all and was not
  in the original Phase 1 artefact.

### Technical generations

| Cut | Model year | What changed |
|---|---|---|
| 6HE1-TC to 6HK1-TC | before 2000 | F-Series engine change, dated to calendar 1999 by consecutive captures of the same FRR page |
| 4HE1-TC to 4HK1-TC | 2005 | N-Series engine change; 4.75 L to 5.2 L |
| FRR and FSR retired | after 2005 | F-Series line reduced to FTR, FVR, FXR |
| FXR introduced | 2004 | Heaviest USA F-Series, 33,001 lbs GVWR |
| EPA 2007 | 2007 | Diesel Particulate Filter added to both the 4H and the 6H engines |
| F-Series withdrawn | 2011 | No USA F-Series through MY2016 |
| NPR ECO-MAX | 2011 | First use of the 4J engine family in the USA; 3.0 L alongside the 5.2 L |
| NPR-XD introduced | 2015 | 16,000 lbs GVWR Class 4 |
| FTR returns | 2017 | Class 6 LCF on the 5.2 L 4HK1-TC with air brakes |
| ECO-MAX retired | after 2018 | 4HK1-TC becomes the only N-Series diesel |
| Cummins transition | 2022 | F-Series moves to the Cummins B6.7; FVR and FVR Derate introduced; Isuzu enters Class 7 |
| NRR Derate | 2025 | 17,950 lbs GVWR PIO option replaces NQR in the published line |

### Conflicts

**CONF-NRR-2004** — **resolved** (`CLOSURE PASS 2026-09-23`). Isuzu published an NRR Diesel
page with 4HK1-TC 5.2 L on 2004-03-22, one month after its own NPR and NQR pages still
published 4HE1-TC. NHTSA vPIC does not list an NRR before MY2005. Resolved using Isuzu's
own site-navigation evidence rather than intuition: `n_specs.html`, Isuzu's N-Series nav
page, lists "NPR Gas / NPR Diesel / NQR Diesel" with no NRR and footer "Copyright 2003" on
2003-12-09, then "NPR Gas / NPR Diesel / NQR Diesel / NRR Diesel" with footer "Copyright
2004" on 2004-04-11 — a genuine addition to Isuzu's own site structure, matching the NRR
page's own first-capture date and its continuous, unchanged republication through six
further 2004 captures. Per the task's source hierarchy, NHTSA is corroboration-only and
does not override an existing Isuzu primary source. **MY2004 NRR is now VERIFIED.**

**CONF-FVR-2020** — resolved in favour of Isuzu. NHTSA vPIC lists an FVR for MY2020 and
MY2021, but no Isuzu document read publishes one, and the MY2021 F-Series brochure
publishes FTR alone. The 2022 specification brochure introduces FVR. FVR starts at MY2022.

### Formerly open in Phase 1 — now closed (`CLOSURE PASS 2026-09-23`)

- **NQR MY2000 and MY2001** — was UNRESOLVED, now **VERIFIED**. Two direct, independently
  dated Isuzu captures of `nqrdspecs.htm` were located (2000-09-02 and 2001-02-05); the
  original source list for this URL had pointed to a malformed double-domain 404 artifact.
- **H-Series** — was an open discovery item, now **VERIFIED and incorporated** as
  `block_id: H-2005-2008`. See the H-Series subsection above.
- **FBR** — was `NOT_FOUND_IN_US_SOURCES`, now formally **CLOSED_NOT_FOUND** after one
  final exhaustive search across isuzucv.com, NHTSA's complete Isuzu model list and general
  web search, all with zero hits.

## PHASE 2 — OFFICIALLY CLOSED

**`"phase2_status": "CLOSED"`** in `config/vehicle-platform-closure/isuzu-us-diesel-phase2-oen.json`.

"Closed" here means what the task that requested this pass defined it to mean: **every
Phase 1 vehicle x position cell carries a real, non-missing, terminal state** -- VERIFIED,
NOT_APPLICABLE, or an honestly documented PARTIAL/UNRESOLVED/CONFLICTING. It does **not**
mean every position has a confirmed Isuzu part number; Isuzu's own public-facing literature
genuinely does not cover most of this matrix, and this pass reports that plainly rather
than inventing coverage to reach a higher number.

### Coverage (from `lib/isuzu-us-diesel-closure.js`'s `phase2CoverageSummary()`)

| | Count |
|---|---|
| Phase 1 vehicle/year combinations represented | **181 of 181** |
| Total position cells | **1,942** |
| VERIFIED | **142** |
| PARTIAL | **281** |
| NOT_APPLICABLE | **505** |
| UNRESOLVED | **1,014** |
| CONFLICTING | **0** |

Every cell in that 1,942 comes from `phase2CoverageMatrix()`, which is built entirely on
top of the existing `modelsFor()` / `answerFilterSetQuery()` machinery -- it adds no new
matching logic, only aggregation, so it cannot silently diverge from what a single-vehicle
query already returns.

### H-Series -- the new mandatory addition

H-Series (`HTR`, `HVR`, `HXR`, MY2005-2008, `6HK1-TC` 7.8L, Class 6-8) is now fully
represented in Phase 2's `position_universe`, independently of both N-Series and F-Series,
per the task's own rule that H-Series may not inherit from F-Series merely because both
share the 6HK1-TC. An exhaustive search (isuzucv.com's complete archived history for any
H-Series manual, service document or parts catalogue; general web search for HTR/HVR/HXR
filter part numbers) found **zero Isuzu-published filter part numbers for any H-Series
position** -- the only Isuzu documents that exist for this product line are the marketing
microsite pages already used to close Phase 1 (engine, GVWR, transmission, brake
configuration), never a maintenance schedule or parts listing.

One genuine, Isuzu-sourced finding did come out of re-reading those pages: **H-Series brake
configuration is per-model, not uniform**, which changes how `AIR_DRYER` must be
represented --

| Model | Standard brakes | Optional brakes |
|---|---|---|
| HTR | Hydraulic 4-piston | ABS Full Air |
| HVR | Hydraulic 4-piston | Air brake |
| HXR | Air brake | Air brake |

`AIR_DRYER` is recorded as `CONDITIONAL_BY_MODEL`: applicable only on the optional full-air
configuration for HTR/HVR, applicable as standard for HXR -- and UNRESOLVED for a part
number in every case, since Isuzu never published one.

A retailer listing was found associating the F-Series/H-Series-shared engine's lube filter
number (`1132004872`) with HTR specifically by engine family. This is exactly the kind of
model-to-model inheritance this closure prohibits (H-Series may not inherit from F-Series
merely by sharing `6HK1-TC`), so it is recorded only as a research lead in
`unresolved_positions`, never applied.

### Cummins B6.7 F-Series (MY2022-2026)

Confirmed from Phase 1's own Isuzu brochures that MY2022-2026 F-Series uses the Cummins
B6.7. A targeted search for Cummins-official filter part numbers tied explicitly to the
Isuzu chassis application -- the bar this closure's own rules set before Cummins literature
may serve as OEM evidence -- did not locate a qualifying document. General Cummins B6.7
filter listings exist but none establishes the Isuzu-chassis linkage; using them without it
would violate the same no-inheritance principle applied everywhere else in this closure.
**Fleetguard is explicitly excluded from Phase 2** even though Cummins-owned, per the
task's own instruction; it belongs to Phase 3. Remains UNRESOLVED.

### The two anomalous OEN numbers -- confirmed, not resolved

`2906542701`, `2906548000`, `2906548100` and `2906544040` were re-examined this pass. The
source PDF was re-extracted with `pdftotext` in both `-table` and `-raw` mode, which agree
on these exact numbers in these exact cells, and the adjacent RADIATOR block on the same
page carries its own, completely different genuine numbers with zero overlap -- ruling out
a column-bleed extraction error as the explanation. The anomaly is confirmed present in
Isuzu's own document as printed. It remains flagged, not normalized: no second Isuzu source
confirming these numbers was located in this pass.

## Phase 2 — Isuzu OE/OEN filter sets

21 rows, all from Isuzu sources. 6 VERIFIED, 13 PARTIAL, 2 NOT_APPLICABLE. 8 groups of
positions are recorded as UNRESOLVED. (These per-row counts are unchanged from the initial
2026-09-22 pass -- no new `oen_rows` were added this pass, only the H-Series
`position_universe`, governance notes, and the coverage matrix built on top of the existing
rows. See **PHASE 2 — OFFICIALLY CLOSED** above for the full coverage-matrix numbers across
all three series.)

The position universe was **derived, not assumed**. It comes from the maintenance
schedules in the 2006 and 2007 NPR diesel owner's manuals and from the F-Series Priority
Service Maintenance Program text, rather than from the manifest's position list.

### What that produced

- **N-Series `AIR_DRYER` is NOT_APPLICABLE** for the whole period. N-Series service brakes
  are vacuum/hydraulic or hydraulic-boosted with 4-channel ABS from 2000 to 2026. There is
  no air brake system and therefore no dryer.
- **N-Series `AIR_SECONDARY`, `LUBE_SECONDARY` and `HYDRAULIC_FILTER` are NOT_APPLICABLE.**
  None appears anywhere in the Isuzu maintenance schedule.
- **F-Series `AIR_DRYER` is applicable but UNRESOLVED.** Isuzu publishes air brakes on the
  F-Series across the whole period, so the position exists, but no Isuzu dryer cartridge
  part number was found.
- **`FUEL_SECONDARY` exists on the F-Series.** The Isuzu maintenance text says the plan
  covers "replacing engine and chassis fuel filters" — two distinct serviced positions.
- **`CABIN` is applicable but UNRESOLVED on the N-Series.** Isuzu schedules the Air
  Conditioner Blower Filter for monthly *cleaning* and publishes no replacement part
  number. That makes it an unresolved position, not a non-existent one.
- **DPF is recorded and excluded.** Isuzu schedules it for cleaning every 100,000 miles.
  It is an emissions device, not a maintenance filter in the ELIMFILTERS sense, so the
  answer reports it separately instead of counting it as a filter-set position.

### The model-line rule

Isuzu heads its parts sections with model **lines**: "N-SERIES NPR / NRR / NQR" and
"F-SERIES FTR / FVR / FSR". A suffix variant belongs to its line — NPR-HD and NPR-XD to
NPR, NRR Derate to NRR, FVR Derate to FVR — so those resolve. A model line Isuzu does not
name is not covered.

That is what keeps **FRR and FXR empty**: they sit in the same Phase 1 block as FTR and FVR
and run the same 6HK1-TC, and a block-level binding would have handed them the FTR's lube
filter. They are separate model lines, Isuzu does not name them, and they come back
UNRESOLVED. This is asserted by test, because it is exactly the kind of inheritance that
looks harmless and is not.

### Closed numbers

| Position | Isuzu genuine | Published scope |
|---|---|---|
| N-Series air | 8944302500, 2906469100 | 1986-2005, Diesel/GAS |
| N-Series air | 8970622940, 8981772710, 29007N0000 | 2006-, Diesel/GAS |
| N-Series lube | 8980188580 | 2010-, Diesel / 4JJ |
| N-Series lube | 2906544040, 8982984040 | 2011-, Diesel |
| N-Series fuel | 1132400791, 1132400740 | 1998-, Diesel / 4HE |
| N-Series fuel/water separator | 8982373410 | 2022i-, Diesel |
| N-Series transmission | 8971822820 | 1998-, Diesel |
| F-Series lube element | 8943924750, 1132004872 | 1987-2008, Diesel |
| F-Series lube element | 8982984040 | 2018-2021, Diesel / 4HK |
| F-Series fuel element | 8943924740, 1132400791 | 1994-2004, Diesel |

Every row reproduces Isuzu's own YEAR and ENGINE columns and is bound only to the Phase 1
vehicles that fall inside them.

### What Phase 2 could not close

- No Isuzu diesel fuel filter number is published for the **4HK1-TC N-Series between
  MY2005 and MY2012**. The cross reference jumps from the 4HE-scoped row to rows scoped
  2013-2021.
- The **NPR ECO-MAX has a 4JJ-scoped lube filter but no 4JJ-scoped fuel or air filter.**
  The `2006-` air row is not engine-scoped and was not assumed to cover the 4JJ1-TC.
- **N-Series MY2022-2026 fuel** is not covered; the published fuel rows stop at 2021.
- **FRR and FXR carry no Isuzu filter row at all.** Isuzu's F-Series parts section is
  headed "FTR / FVR / FSR". Inheriting from those three is prohibited, so both models stay
  unresolved for every position.
- **F-Series air, cabin, air dryer, water separator and transmission** are unresolved for
  all years; no F-Series owner's manual or parts listing was retrieved.
- **The Cummins B6.7 F-Series (MY2022-2026) has no Isuzu-published filter number at all.**
- **H-Series has no Isuzu-published filter number for any position, in any of its three
  models.** See **PHASE 2 — OFFICIALLY CLOSED** above for the full H-Series findings,
  including the per-model brake configuration that shapes `AIR_DRYER`.

Two format anomalies are flagged rather than silently accepted: the lube rows carrying
`2906542701 / 2906548000 / 2906548100` and `2906544040` do not follow the usual Isuzu
genuine pattern. They were re-confirmed against a second extraction algorithm this pass
(see above) and remain reproduced exactly as published, marked for confirmation against a
second Isuzu source before any downstream use.

## PHASE 3 — CLOSED (aftermarket resolution and ELIMFILTERS base decision)

**Status: `CLOSED`. Exception audit status: `CLOSED_WITH_BLOCKERS` (`EXCEPTION CLOSURE PASS
2026-09-23`, refined by the `MICROCASE PASS`, `BLOCKEDCASE PASS` and `SKU CLOSURE PASS`, all
2026-09-24).** All 19 eligible Phase 2 OEN rows have an explicit decision, `CONFLICTING` is
**0**, and `NO_ELIMFILTERS_SKU_YET` is **0**. CLOSED does **not** mean every base is resolved:
17 of 19 rows now carry a Donaldson base, 2 do not, and each of those 2 says exactly why. The
tables below are the current, post-SKU-closure state; see **EXCEPTION CLOSURE PASS —
2026-09-23** and the later dated subsections further down for what changed and why.

### How Donaldson was reached

The live Donaldson routes are still blocked from the research environment (see *First
attempt* below). The OE cross-reference was taken instead from the repository's own
authenticated capture of `shop.donaldson.com`, registered as source
`DONALDSON_SHOP_CROSSREF_CAPTURE_2026_07` (`scripts/donaldson_{air,fuel,lube}_results.json`,
`scripts/donaldson_lube_crossref_progress.json`, captured 2026-07-11, see
`scripts/MATRIX.md`). That capture holds three Donaldson-published channels per part: the
product's own OEM list, its *Primary Application* attribute and its cross-reference list.
It proves **Isuzu OE/OEN ↔ Donaldson part** only. It never proves USA fitment. Year, model,
engine and configuration come from Phase 1 and Phase 2 unchanged, and a test compares every
resolution row's scope with its Phase 2 row.

A number missing from the capture is recorded as `DONALDSON_NOT_FOUND`, never as
`DONALDSON_NOT_MANUFACTURED_VERIFIED`. No row reached `NOT_MANUFACTURED_VERIFIED`, so
**Fleetguard defines no base**. Fleetguard, MANN-FILTER, Baldwin, WIX and FRAM numbers
appear only as `CORROBORATION_ONLY` entries copied from Donaldson's own cross-reference list,
marked `UNVERIFIED` because no competitor catalogue was reached.

### Coverage

| Measure | Count |
|---|---|
| Eligible Phase 2 OEN rows | 19 (2 NOT_APPLICABLE Phase 2 rows excluded: 6BG and 4BD, which bind to no vehicle) |
| Donaldson verified | 15 |
| Donaldson not-manufactured verified | 0 |
| Donaldson not found (live routes blocked) | 0 |
| Donaldson ambiguous | 2 |
| Fleetguard verified as base | 0 |
| `VERIFIED_BASE` | 5 |
| `PARTIAL` | 12 |
| `CONFLICTING` | **0** |
| `NO_ELIMFILTERS_SKU_YET` | **0** |
| `BLOCKED_DONALDSON` | 2 |
| `BLOCKED_OEM` | 9 groups (no Isuzu OEN in Phase 2) |

### Decisions

| Phase 2 row | Isuzu OE/OEN | Donaldson | Decision | ELIMFILTERS |
|---|---|---|---|---|
| P2-N-AIR-1986-2005 | 8944302500, 2906469100 | P636773 (OEM list + Primary Application) | VERIFIED_BASE | EA16773 (reuse) |
| P2-N-AIR-2006-ON | 8970622940 (+8981772710, 29007N0000 not in Donaldson data) | P543614 | VERIFIED_BASE | EA13614 (reuse) |
| P2-N-LUBE-4JJ | 8980188580 | P502597 cartridge | VERIFIED_BASE | EL82597 (reuse) |
| P2-N-FUEL-4HE | 1132400791, 1132400740 | P552564 (cross-reference list) | VERIFIED_BASE, medium confidence | EF92564 (reuse) |
| P2-N-FUEL-2013-2021-A | 8975425390, 8981475250 | P502599 | PARTIAL (Phase 2 row PARTIAL) | EF92599 (reuse) |
| P2-N-FUEL-2013-2021-C | 8980370110, 8982035990, 8981628970 | P502427 cartridge | PARTIAL (Phase 2 row PARTIAL) | EF92427 (reuse) |
| P2-F-FUEL-1994-2004 | 8943924740, 1132400791 | P552564 spin-on vs Isuzu "ELEMENT" | PARTIAL | EF92564 (reuse) |
| P2-F-FUEL-2018-2020-C | 8975425390, 8981475250 | P502599, Isuzu "ELEMENT KIT" | PARTIAL, `KIT_CROSS` | EF92599 (reuse) |
| P2-F-FUEL-2018-2020-D | 8980370110 | P502427, Isuzu "ELEMENT KIT" | PARTIAL, `KIT_CROSS` | EF92427 (reuse) |
| P2-N-FUEL-2013-2021-B | 8943692993, 8980374810, 5873109370 | P550390, via 8980374810 (CROSSREF tier) | PARTIAL (`EXCEPTION PASS`) | EF90390 (reuse) |
| P2-N-FUEL-HIGHCAP-2013-2021 | 8980374810, 5873109370, 8980318470 | P550390, same shared number as the standard row | PARTIAL (`EXCEPTION PASS`) | EF90390 (reuse) |
| P2-F-LUBE-1987-2008 | 8943924750, 1132004872 | P550420, OEM-tier for 1132004872 (P551263/P559128 rejected: CROSSREF-tier only) | PARTIAL (`EXCEPTION PASS`) | EL80420 (reuse) |
| P2-F-FUEL-2018-2020-A | 8943692993, 8980374810, 8943691993 | P550390, identical OEN list to the high-capacity row | PARTIAL (`EXCEPTION PASS`) | EF90390 (reuse) |
| P2-F-FUEL-2018-2020-B | same as A | same as A | PARTIAL (`EXCEPTION PASS`) | EF90390 (reuse) |
| P2-N-LUBE-1998-2010 | 2906542701, 2906548000, 2906548100 | P502042 -- equipment-application match to 4HE1-TC/4HK1-TC (P550973 rejected: serves only 4BD1/4BD2/4BB1) | PARTIAL (`MICROCASE PASS 2026-09-24`) | EL82042 (reuse) |
| P2-N-LUBE-2011-ON | 2906544040, 8982984040 | P848076, via Donaldson's own product title + 2 independent distributor pages (not in first-party capture) | PARTIAL (Phase 2 row PARTIAL; `SKU CLOSURE PASS 2026-09-24`) | EL88076 (new, `CREATE_GOVERNED_SKU`) |
| P2-F-LUBE-2018-2021 | 8982984040 (identical Phase-2 number to the row above) | same P848076 identity, same evidence | VERIFIED_BASE (Phase 2 row VERIFIED, `DIRECT_OE_CROSS`; `SKU CLOSURE PASS`) | EL88076 (new, `CREATE_GOVERNED_SKU`) |
| P2-N-TRANS | 8971822820 | P550008, exact Donaldson first-party Isuzu cross; Fleetguard LF551A independently corroborates the same OEN as a transmission filter and confirms matching spin-on geometry | PARTIAL (Phase 2 ceiling; `TRANSMISSION SINGLE-ROW CLOSURE 2026-09-24`) | EL80008 (reuse) |
| P2-N-FWS-2022i-ON | 8982373410 | P550736 candidate found and rejected (genuine Davco/Volvo/Mercedes-Benz part, no real Isuzu tie) | BLOCKED_DONALDSON, root_cause `B_ONLY_FALSE_POSITIVE_CROSS` | none |

**Base decisions:** 18 Donaldson-based, 0 Fleetguard-based, 1 with no base yet.
**ELIMFILTERS:** 10 existing SKUs reused (EA16773, EA13614, EL82597, EF92564, EF92599,
EF92427, EF90390, EL80420, EL82042, EL80008), plus one new governed candidate SKU minted this pass
(EL88076, for Donaldson P848076 -- see **P848076 ELIMFILTERS SKU CLOSURE — 2026-09-24**
below). Each Donaldson base maps to exactly one SKU, so no duplicates were created among the
bases actually used. SKU existence was checked against the repository catalogue export
(`data/dims.csv`), including a physical-dimension cross-check (OD/length) for every SKU
touched, plus an exhaustive repository-and-live-Postgres duplicate audit for P848076 specifically
(classification `E_NEW_PRODUCT_CONFIRMED` -- nothing to reuse exists). `NO_ELIMFILTERS_SKU_YET`
is now **0**. Live PostgreSQL was queried this pass (Render workspace `elimfilters`) and found to
hold no product-catalog tables reachable from this session, so EL88076 remains a governed
candidate (`READY_FOR_REVIEW`, `published: false`) pending a reviewer with access to the real
catalog database.

**Governance:** every decision is `CANDIDATE_INTELLIGENCE` in `READY_FOR_REVIEW`,
`published: false`. Nothing was written to the catalogue. Any later write must go through
`lib/catalog-write-gateway.js`.

### BLOCKED_OEM (no Isuzu OEN, so no aftermarket resolution)

H-Series HTR/HVR/HXR (all positions). FRR and FXR (all positions; FTR cross-references are
not borrowed). The F-Series Cummins B6.7 MY2022-2026 (all positions; no Isuzu or Cummins
document ties a genuine filter to the chassis, and Fleetguard B6.7 listings were not used).
F-Series gap years 2009-2010/2017/2021. F-Series air, cabin, air dryer, water separator and
transmission. N-Series cabin. N-Series 4HK1-TC fuel MY2005-2012. ECO-MAX fuel and air.
N-Series MY2022-2026 fuel and lube.

### Anomalous Isuzu numbers

- `2906548000`: Donaldson prints it as `2-90654-800-0` in the cross-reference of both
  P502042 and P550973, both at CROSSREF (third-party aggregated) tier -- evidence tier alone
  cannot break this specific tie. The `MICROCASE PASS 2026-09-24` broke it instead with
  Donaldson's own equipment-application records (`scripts/donaldson_lube_results.json`):
  P502042 explicitly serves 4HE1-TC- and 4HK1-TC-engined NPR/NQR/NPS trucks -- the exact two
  engines Phase 1 assigns to every block this row binds to -- while P550973 explicitly
  serves only the older, unrelated 4BB1/4BD1/4BD2 engine family, which Phase 1 never assigns
  to any block in this closure. P502042 (ELIMFILTERS `EL82042`, reused) is the base; the
  number is still not treated as fully closed (Phase 2's own row stays `PARTIAL`), and the
  Phase 2 row was not normalised.
- `2906542701`, `2906548100`, `2906544040`, `8982373410`: none is recognised anywhere in
  Donaldson's first-party capture (flat cross-reference export, lube/fuel/air results,
  competitor matrix, OEM matrix, import-ready and homologation matrix -- all checked, zero
  hits). In the 2011- lube row the other Isuzu number, `8982984040`, is not recognised
  either, so the row is blocked rather than resolved through its sibling number.

### Known historical candidates

| Candidate | Outcome |
|---|---|
| AF27693 ↔ P543614 → EA13614 | Linked to Isuzu 8970622940 (VERIFIED_BASE) |
| FF5877 ↔ P502599 → EF92599 | Linked to 8975425390 / 8981475250 (PARTIAL) |
| FF5165 ↔ P550390 → EF90390 | `EXCEPTION PASS`: LINKED_PARTIAL to 8980374810 across 4 rows (CROSSREF tier, no Donaldson OEM-tier row exists for this part) |
| P502042 → EL82042 | `MICROCASE PASS 2026-09-24`: RECONFIRMED CANONICAL on equipment-application grounds (see below) -- reverses the `EXCEPTION PASS`'s NOT_CANONICAL_CONFLICTING finding |
| P551855 → ES91855 | Not linked: engine-level Australasia evidence only, no Isuzu OEN |

### SINGLE-CASE MICROINVESTIGATION — 2026-09-24: P2-N-LUBE-1998-2010 / 2906548000

The `EXCEPTION CLOSURE PASS` (below) had correctly found that the disputed Isuzu number
`2906548000` is CROSSREF-tier on both `P502042` and `P550973`, with no OEM-tier row on
either side, and had explicitly declined to use a family-level OEM-tie signal (favouring
`P550973`) as a substitute for direct evidence. This pass pulled the full Donaldson
equipment-application record for each candidate from `scripts/donaldson_lube_results.json`:

| | P502042 (existing `EL82042`) | P550973 (existing `EL80973`) |
|---|---|---|
| Type / style | Combination, Spin-On | Combination, Spin-On |
| Dimensions | 124 mm OD × 120 mm | 123 mm OD × 149 mm (29 mm longer) |
| Bypass valve | Yes | No |
| Efficiency | 16 micron @ 50% | 50 micron @ 99% (coarser) |
| Donaldson "Primary Application" | ISUZU 8970967770 | ISUZU 8970492820 |
| Equipment matching this row's engines | NPR70/4HE1, NQR70/4HE1-TC, NPR75/NQR75/NPS75 on 4HK1-TCN/TCC/XS | **none** |
| Equipment NOT matching | -- | NPR/W4 on 4BD1T, 4BD2T, 4BD2TC, 4BB1T |
| Donaldson `alternatives` field | empty | empty |

Phase 1 assigns exactly `4HE1-TC` (blocks `N-2000-2001`, `N-2002-2004`) and `4HK1-TC` (block
`N-2005-2010`) to this row's three bound blocks -- never `4BD1`/`4BD2`/`4BB1`. P502042's own
equipment list names those two engines directly, in the correct model lines (NPR, NQR, NPS);
P550973's equipment list names only the unrelated older engine family and is rejected.
Neither part's `alternatives` field names the other, so Donaldson itself does not treat them
as a supersession or alternate pair -- they are two distinct, dimensionally different
products (a 149 mm long, no-bypass, coarse-media filter versus a 120 mm, bypass-valved,
fine-media filter) that happen to share a thread size and both absorbed the same
third-party-aggregated Isuzu number in Donaldson's CROSSREF layer.

**Decision: `PARTIAL`** (capped by Phase 2's own `PARTIAL` evidence_status for this row, the
same convention every other row in this file follows). **Base: Donaldson `P502042`.**
**ELIMFILTERS: `EL82042`, reused** -- the exact SKU the very first historical-candidates pass
proposed and the second (`EXCEPTION`) pass rejected for lack of a tie-breaker; the
tie-breaker was equipment application, not evidence tier or crossref count. `2906542701` and
`2906548100` remain unconfirmed by any source, so the row is not fully closed. `CONFLICTING`
is now **0** across the entire Phase 3 file.

### EXCEPTION CLOSURE PASS — 2026-09-23

**Starting counts:** VERIFIED_BASE 4, PARTIAL 5, CONFLICTING 7, BLOCKED_DONALDSON 3.
**Final counts:** VERIFIED_BASE 4, PARTIAL 10, CONFLICTING 1, BLOCKED_DONALDSON 4.
**`exception_audit_status`: `CLOSED_WITH_BLOCKERS`** (a new field alongside `phase3_status`,
which stays `CLOSED` — this pass is a cleanup layered on the existing closure, not a
reopening of it).

The prior pass correctly found the ambiguity in each `CONFLICTING` row but had not applied
one distinction available in its own evidence: `scripts/donaldson_crossref_flat.csv` tags
every row `OEM` (Donaldson's own direct assertion) or `CROSSREF` (an aggregated third-party
match). An `OEM`-tier row outranks a `CROSSREF`-tier one. Re-running every disputed row
through that lens, cross-checked against `data/dims.csv` physical dimensions (OD/length) to
confirm each candidate SKU is a real, distinct, currently-catalogued product rather than
database noise, resolved 6 of the 7 `CONFLICTING` rows:

- **P550390 group** (`P2-N-FUEL-2013-2021-B`, `-HIGHCAP`, `P2-F-FUEL-2018-2020-A/B`): all
  four rows share the confirmed Isuzu number `8980374810` (CROSSREF tier, no OEM-tier row
  exists for P550390 at all). Isuzu's own numbers do not distinguish the standard filter
  from the high-capacity one — for the F-Series pair they are the *identical* OEN list — so
  the same Donaldson answer (`P550390` → `EF90390`, reused) is assigned to all four rather
  than inventing a split Isuzu itself never published.
- **P2-F-LUBE-1987-2008**: of the three CROSSREF-tier candidates the prior pass found
  (P550420, P551263, P559128), only `P550420` carries a Donaldson **OEM-tier** row for
  `1132004872`. P551263's OEM-tier rows are all non-Isuzu (Case/IH, Kubota, Volvo); P559128's
  are all non-Isuzu (AC Delco, AGCO, agricultural brands). `P550420` → `EL80420` (reused) is
  the base; the other two are demoted to documented, rejected alternates.
- **P2-N-TRANS**: reclassified `CONFLICTING` → `BLOCKED_DONALDSON`. Its one Donaldson hit,
  `P550008`, is a full-flow **engine**-oil spin-on (per `data/dims.csv`, 95 mm × 136 mm)
  cross-referenced (CROSSREF tier only) against an Isuzu number Isuzu itself publishes as
  `OIL FILTER; TRANS (CARTRIDGE)` — a transmission element, wrong fluid system and wrong
  physical form. This is a false-positive string match, not a genuine competing candidate,
  so there is nothing left to be conflicted between: no base is taken and the row is
  correctly `BLOCKED_DONALDSON`, not `CONFLICTING`.

**Remaining `CONFLICTING` (1 of 19): `P2-N-LUBE-1998-2010`.** The disputed number
`2906548000` is CROSSREF-tier on *both* `P502042` and `P550973` — neither carries a
Donaldson OEM-tier row for this exact number, so the OEM-vs-CROSSREF distinction cannot
break this specific tie. A family-level signal was found and recorded (P550973 has direct
OEM-tier ties to a whole cluster of adjacent N-Series Isuzu numbers; P502042 has none) but is
disclosed as suggestive, not proof, and no base was taken from it. This is the one case in
the file where the manifest's own standard — leave it `CONFLICTING` if it cannot be resolved
defensibly — was judged to still apply.

**Duplicate canonical-mapping audit.** Every Donaldson part touched by Isuzu Phase 3 (13
parts, including the three rejected P2-F-LUBE-1987-2008 candidates and the rejected
`P550008`) was checked against the legacy `competitor_cross_references_ld.csv` /
`external_cross_reference_master_ld.csv` / `sku_competitor_matrix_ld.csv` exports for a
second, conflicting ELIMFILTERS SKU. One finding: `P550008` carries three legacy SKUs
(`EL50936`, `EL50940`, `EL59363`, all from an older MANN-sourced import) none of which is
`EL80008`, the `data/dims.csv`-verified current SKU. Classified `LEGACY_STALE_CROSSREF`, not
corrected here because `P550008` is rejected as a base for every Isuzu row it touches (see
`P2-N-TRANS` above) — flagged for a general, non-Isuzu-scoped legacy-CSV governance pass
instead. No other part touched by Isuzu Phase 3 has more than one SKU anywhere in the
repository.

**P552564 regression check.** Re-verified the fix already merged in PR #737
(`b93cc8b72d`): `scripts/donaldson_crossref_flat.csv` ties `P552564` only to `EF92564`;
`P502155` (the correct owner of `EF50953`) does not appear anywhere in the first-party
capture, so the legacy CSVs' inclusion of Isuzu `1132400740` under the `EF50953`/`P502155`
grouping is legacy `CROSSREF` noise, not corroboration — the first-party capture prevails per
this manifest's own priority rule. No script that writes the legacy CSVs
(`phase3cde_build_ld_enrichment_master.js` and related phase3/phase4 scripts) hardcodes
either mapping, so the root cause was bad one-time scrape data, not a live generator defect;
no generator code change was needed beyond the CSV fix and `tests/p552564-canonical-mapping.test.js`
already merged in PR #737. This pass adds a companion assertion inside
`tests/isuzu-us-diesel-closure.test.js` (`EXCEPTION 2/3/15`) checking the same invariant
against this JSON file directly, so a regression in either the CSVs or this file trips a
test independently of the other.

### BLOCKED_DONALDSON CLOSURE MICRO-PHASE — 2026-09-24

**Starting counts:** VERIFIED_BASE 4, PARTIAL 11, CONFLICTING 0, BLOCKED_DONALDSON 4.
**Final counts:** VERIFIED_BASE 4, PARTIAL 11, CONFLICTING 0, BLOCKED_DONALDSON 2 (+2
`NO_ELIMFILTERS_SKU_YET`).

Investigated the 4 rows still `BLOCKED_DONALDSON` after both prior passes:
`P2-N-LUBE-2011-ON`, `P2-N-FWS-2022i-ON`, `P2-F-LUBE-2018-2021`, `P2-N-TRANS`. All four
Isuzu OE numbers (`2906544040`, `8982984040`, `8982373410`, `8971822820`) were searched
across every first-party Donaldson capture file (`scripts/donaldson_crossref_flat.csv`,
`donaldson_{lube,fuel,fuel_final_results_20260917,air}_results.json`,
`donaldson_competitor_matrix.json`, `donaldson_oem_matrix.json`, `donaldson_import_ready.jsonl`,
`homologation_matrix.json`) and all 3 legacy CSVs, in both plain and Isuzu-dashed formats.
Zero hits for any of the four numbers in any of these 12 files — genuinely exhausted, not a
single-file check.

**Resolved (2 of 4), escalated to source priority 3 (Donaldson official public/archived
docs) since the first-party capture is silent on this part:**

- **`P2-N-LUBE-2011-ON`** (`2906544040`, `8982984040`) and **`P2-F-LUBE-2018-2021`**
  (`8982984040`, the identical Phase-2 number) both identify **Donaldson `P848076`**
  (LUBE FILTER, SPIN-ON COMBINATION). Confirmed via `shop.donaldson.com`'s own indexed
  product title plus two independently fetched distributor pages (`allprodiesel.net`,
  `spareto.com`, fetched directly rather than taken from a blended search summary), both
  reproducing the identical 4-number Isuzu OE set (`2906544040`, `2946542000`, `8982984040`,
  `8983282070`) against `P848076` in a structured cross-reference table. The F-Series row is
  **not** resolved by shared-engine inheritance — it shares the identical, Phase-2-established
  OE number `8982984040` with the N-Series row, and the Donaldson identity is anchored to that
  number, not to the 4HK1 engine both chassis happen to use. No existing ELIMFILTERS SKU was
  found for `P848076` anywhere (`data/dims.csv`, all 3 legacy CSVs, the full first-party
  capture — all checked, zero hits), so both rows are `NO_ELIMFILTERS_SKU_YET`, not `PARTIAL`
  or `VERIFIED_BASE`: no new SKU is minted without a governance pass with live catalogue
  access. A new source, `DONALDSON_OFFICIAL_PRODUCT_TITLE_AND_DISTRIBUTOR_CORROBORATION_2026_09_24`,
  was registered in `isuzu-us-diesel-sources.json` (`authority_level: secondary`, weaker than
  the first-party capture) to keep this evidence traceable and distinct from
  `DONALDSON_SHOP_CROSSREF_CAPTURE_2026_07`.

**Stay `BLOCKED_DONALDSON` (2 of 4), each with a precise, non-generic root cause:**

- **`P2-N-FWS-2022i-ON`** (`8982373410`), root_cause
  `B_NO_VALID_DONALDSON_CROSS_AFTER_FALSE_POSITIVE_REJECTION`: the earlier `P550736` lead was
  rechecked against Donaldson's current official product page. Donaldson publishes `P550736` as a
  **fuel-filter / water-separator cartridge** in the **DAVCO Fuel Pro** family, with no official
  Donaldson tie to Isuzu `8982373410`. The single lower-tier aggregator pairing is therefore a
  platform-mismatch false positive and is rejected. After that rejection there is no valid
  Donaldson candidate, so the row is refined from `DONALDSON_AMBIGUOUS` to
  `DONALDSON_NOT_FOUND`. This is explicitly **not** `DONALDSON_NOT_MANUFACTURED_VERIFIED`;
  Fleetguard remains ineligible.
- **`P2-N-TRANS`** (`8971822820`) was still `BLOCKED_DONALDSON` at this historical pass because
  `P550008` had been rejected on a presumed cartridge-vs-spin-on mismatch. **Superseded later on
  2026-09-24:** the single-row transmission closure established that Isuzu's `CARTRIDGE` wording
  does not prove an internal non-spin-on element; Donaldson's exact OEN cross plus independent
  Fleetguard transmission-application and physical-form corroboration resolved the row to
  `P550008 → EL80008` at `PARTIAL`.

**Zero Fleetguard bases.** No row in this micro-phase — or anywhere else in the file — has
ever reached `DONALDSON_NOT_MANUFACTURED_VERIFIED`.

**Untouched by design at that historical pass:** Phase 1, Phase 2, the 9 `BLOCKED_OEM` rows,
the other 15 Phase 3 resolution rows, and the earlier exception-audit findings were unchanged.
The later single-row transmission closure subsequently activated `P550008` and therefore also
closed its stale legacy-CSV mapping debt.

### P848076 ELIMFILTERS SKU CLOSURE — 2026-09-24

**Starting counts:** VERIFIED_BASE 4, PARTIAL 11, CONFLICTING 0, `NO_ELIMFILTERS_SKU_YET` 2,
BLOCKED_DONALDSON 2.
**Final counts:** VERIFIED_BASE 5, PARTIAL 12, CONFLICTING 0, `NO_ELIMFILTERS_SKU_YET` **0**,
BLOCKED_DONALDSON 2 (unchanged).

Closed the 2 rows the prior micro-phase left at `NO_ELIMFILTERS_SKU_YET`
(`P2-N-LUBE-2011-ON`, `P2-F-LUBE-2018-2021`), both anchored to Donaldson `P848076`. Task rule
was explicit: **do not invent a SKU blindly.** Every step below was derived from the
repository's own governed sources, not assumed.

**Duplicate/collision audit (done before anything else).** Searched every first-party
Donaldson capture file, all 3 legacy CSVs, `data/dims.csv`, the entire repository (GitHub
code search across `LATAMFILTERS/world-catalogue`), and live PostgreSQL (see below) for
`P848076`, `848076`, `DNP848076`, `EL88076`, and both Isuzu OE numbers. Also compared physical
dimensions (122.03mm length x 121mm OD, 98.9mm gasket ID, Combination/Spin-On) against every
already-closed Donaldson lube SKU in this file (`P502042`/`EL82042`, `P550973`/`EL80973`,
`P550420`/`EL80420`) — no dimensional or identity match to any existing SKU. Classification:
**`E_NEW_PRODUCT_CONFIRMED`** — P848076 has no existing ELIMFILTERS SKU, no legacy-CSV entry,
no orphaned reference, and no duplicate anywhere. Reuse was not possible because nothing to
reuse exists.

**Nomenclature — derived, not guessed.** Read the repository's own live-enforced governance:
`lib/catalog-codigo-base-policy.js`, `lib/catalog-codigo-base-governance.js`, and the SQL
trigger that enforces them in production,
`scripts/migrations/run_073_catalog_codigo_base_governance_v31.js`
(`enforce_elimfilters_codigo_base_policy()`). For a `HEAVY_DUTY` SKU with a verified Donaldson
base, the trigger's own rule is `expected_suffix := right(code_digits, 4)` — the SKU's last 4
numeric digits must equal the Donaldson part's last 4 numeric digits. `P848076` → digits
`848076` → last 4 = `8076`. The prefix's leading digit was verified empirically, not
memorized from the 3 examples in the task prompt: queried `data/dims.csv` directly and found
all 351 existing `EL`-prefixed (lube) SKUs use leading digit `8` with zero exceptions
(`EF`-prefixed/fuel: all 500 use `9`; `EA`-prefixed/air splits 1366×`1` / 243×`2`). `EL8` +
`8076` = **`EL88076`**.

**Technology — read, not assigned aesthetically.** `docs/brand/TECHNOLOGY_REGISTRY.md` and
`docs/brand/PRODUCT_REGISTRY.md` both list `SYNTRAX™` under "LUBRICATION PROTECTION > Lube
Filters" (governed scope: On-Road and Off-Road only). Corroborated independently against
`scripts/donaldson_lube_results.json`, where the two other already-closed Donaldson Lube
spin-on combination filters in this same closure (`P502042`/`EL82042`,
`P550973`/`EL80973`) both carry `SYNTRAX™` in their own Donaldson capture records — same
family, same filter type, same technology.

**Product identity.** `source_brand: DONALDSON`, `source_part: P848076`,
`canonical_source_brand: DONALDSON`, `canonical_source_part: P848076`. Isuzu OE numbers
`2906544040` and `8982984040` registered as OE/application references; Isuzu never overwrote
Donaldson as canonical source. Product type `LUBE_FILTER` (Spin-On Combination) — no fuel,
hydraulic, transmission, or coolant classification. Applications limited exactly to the two
governed rows above; not expanded to any other 4HK1-engined row, NPR/FTR configuration, or
market.

**Decision status per row:** `P2-N-LUBE-2011-ON` reaches `PARTIAL` (capped — its own Phase 2
row is `PARTIAL`). `P2-F-LUBE-2018-2021` reaches `VERIFIED_BASE` (its own Phase 2 row is
`VERIFIED` with `donaldson_relationship_type: DIRECT_OE_CROSS` already established), the same
standard already applied to `P2-N-FUEL-4HE` elsewhere in this file.

**Live PostgreSQL — checked, found unreachable for the catalog.** Queried the Render
workspace `elimfilters` (`tea-d56p89ggjchc7396ch4g`) directly via the account's Postgres
tooling. The only Postgres instance visible to this account, `elimfilters-crm-db`
(`dpg-dajhiqnqj5pc73dlksu0-a`), was confirmed to hold **zero tables** in any non-system
schema — it backs `elimfilters-crm-api` / `elimfilters-sales-app-staging` (a CRM database),
not the product catalog. The real catalog Postgres that
`lib/catalog-codigo-base-governance.js` and the live `elimfilters-search-pro` (Part Search)
service read (via `pg.Pool`/`DATABASE_URL` in `server-protocol.js`) is not hosted on any
Render Postgres instance visible to this account, so it could not be read or written in this
pass. This is a documented fact, established by direct tool use, not an assumption.

**Publication.** `EL88076` was **not** written to any live catalog — there is no reachable
write target this pass. Recorded on both rows as `elimfilters_base_decision.action:
CREATE_GOVERNED_SKU`, `review_state: READY_FOR_REVIEW`, `published: false`, exactly the
"leave candidate pending" outcome the task's own governance rules require when the live write
path is unreachable (no bypass was created). No direct SQL was run, and
`lib/catalog-write-gateway.js` / `lib/catalog-application-write-service.js` were not invoked,
since there was nothing live to write.

**Architecture reuse.** REUSED: `lib/catalog-codigo-base-policy.js`,
`lib/catalog-codigo-base-governance.js`, and the `run_073` trigger logic (nomenclature
derivation); `docs/brand/TECHNOLOGY_REGISTRY.md` / `PRODUCT_REGISTRY.md` (technology
assignment); `data/dims.csv` (duplicate audit + leading-digit empirical check);
`lib/isuzu-us-diesel-closure.js`'s `validatePhase3()` / `phase3CoverageMatrix()` (structural
validation, unchanged). CREATED: nothing new architecturally — only data (the two Phase 3
resolution rows' `product_identity` / `duplicate_mapping_check` fields, new this pass but
following the existing `elimfilters_base_decision` shape already used by every other row) and
one new top-level governance record, `governance.live_postgres_check_2026_09_24`, documenting
the Postgres audit for future passes.

**Untouched by design:** Phase 1, Phase 2, the 2 `BLOCKED_DONALDSON` rows, the 9
`BLOCKED_OEM` rows, the other 15 Phase 3 resolution rows not named above, and the `P550008`
legacy-CSV cleanup item are all unchanged.

**Tests:** `tests/isuzu-us-diesel-closure.test.js` grew from 119 to 145 tests (26 new
`SKUCASE` tests covering the task's own 25 numbered requirements, plus 10 pre-existing tests
updated for the new decision statuses and SKU fields). All 145 pass; combined regression with
the 5 sibling Isuzu/catalog test files remains 171/171.

### First attempt (2026-09-22): blocked at source 1

The first pass could not reach Donaldson's OE cross-reference:

- `shop.donaldson.com` returns HTTP 403 from the Akamai edge on every request, including
  with full browser headers. Its `sitemap.xml` and its cross-reference REST endpoint
  return 403 as well.
- `www.donaldson.com/en-us/engine/filters/products/{PART}/` returns 200 but serves the
  generic products page; the product record is not in the HTML.
- Wayback holds `shop.donaldson.com` product pages, but the cross-reference table is
  loaded by XHR and is absent from the archived HTML.
- Web search restricted to donaldson.com returns product titles but no cross-reference rows.

In the 2026-09-23 pass the same live routes were refused at the network proxy
(`CONNECT 403`) for Donaldson, Fleetguard, MANN-FILTER and WIX. These blockers stay recorded
in `access_blockers`.

The Australasia *Fuel and Oil Truck Service Kits* catalogue is still recorded as
`RECORDED_BUT_NOT_USABLE_FOR_A_BASE_DECISION`, because it maps Donaldson parts to Isuzu
**engines**, not to Isuzu OE/OENs, and because its model column lists Australian and New
Zealand designations.

## Evidence that the rules were kept

**Gasoline was excluded.** Every Phase 1 block is `DIESEL` and no block carries a gasoline
engine code or displacement. The gasoline line — NPR and NPR-HD with the GM Vortec 6000
6.0 L V8 and later the GM L8T 6.6 L V8 — was encountered in the same sources, is named once
in the exclusion record as proof it was seen and left out, and is asserted absent by test.

**Aftermarket did not define the OEM universe.** Phase 1 and Phase 2 cite only sources
published by Isuzu Commercial Truck of America; a test fails the build if any Phase 2 row
cites another publisher. NHTSA vPIC is marked `authority_level: secondary` and is used only
to corroborate or to raise a conflict. Donaldson material sits only in Phase 3, where it
resolves Isuzu OE/OEN to Donaldson part identity and never vehicle scope.

**No model-to-model inheritance.** FRR and FXR are in the universe with no filter set
rather than borrowing the FTR's. The 4JJ1-TC NPR does not borrow the 4HK1-TC lube filter.
Both are asserted by test.

**Archived captures were read conservatively.** An isuzucv.com page with no printed model
year is treated as evidence of what Isuzu published on the capture date and supports that
model year only. It is never used as proof of an adjacent year. In the initial 2026-09-22
pass this left seven year-blocks at `PARTIAL`; the `CLOSURE PASS 2026-09-23` closed each
one by locating a document actually dated inside the thin year (see **PHASE 1 —
OFFICIALLY CLOSED** above), never by weakening this rule.

**Extraction was verified before it was trusted.** The Isuzu parts cross reference was
extracted with xpdf `pdftotext` in `-table` and `-raw` mode, which agree row for row. The
`-layout` mode misaligns this document's columns by whole rows and was discarded — it
would have attached the wrong part number to eight of the filter rows. Two rows were then
independently confirmed against external listings of the same Isuzu numbers before the
table was used.

## Answering the question

```js
const { answerFilterSetQuery } = require('./lib/isuzu-us-diesel-closure');
answerFilterSetQuery({ year: 2019, model: 'NPR-HD' });
```

returns every position the vehicle's series can have, each with a status, so a caller sees
the shape of what is closed rather than a silently short list: `AIR_PRIMARY` VERIFIED with
`8981772710` and the unpublished Phase 3 decision Donaldson `P543614` → `EA13614`,
`AIR_SECONDARY` and `AIR_DRYER` and `HYDRAULIC_FILTER` NOT_APPLICABLE, and `CABIN`
UNRESOLVED with no aftermarket answer.

## Next actions

Phases 1, 2 and 3 are closed in the sense defined above. The remaining work is closing
the documented gaps:

1. `P2-N-LUBE-1998-2010` is resolved (`PARTIAL`, Donaldson `P502042`, ELIMFILTERS `EL82042`
   reused) as of the `MICROCASE PASS 2026-09-24`; `CONFLICTING` is 0. The row is still not
   *fully* closed, though: `2906542701` and `2906548100` remain unconfirmed by any source, so
   an Isuzu-side document distinguishing all three numbers would still improve it from
   `PARTIAL`.
2. Reviewer: confirm all 9 reused SKUs (`EA16773`, `EA13614`, `EL82597`, `EF92564`,
   `EF92599`, `EF92427`, `EF90390`, `EL80420`, `EL82042`) are live in PostgreSQL, then decide
   publication through `catalog-write-gateway`. The `P848076 ELIMFILTERS SKU CLOSURE —
   2026-09-24` pass derived a governed candidate SKU, `EL88076`, for Donaldson `P848076`
   using this repository's own codigo_base nomenclature policy, and confirmed via a live
   Postgres query that the only Render Postgres instance visible to this account holds no
   product-catalog tables at all — a reviewer with access to the real catalog database must
   still verify `EL88076` does not already exist under a different name there, and then
   publish it (or an existing match) through `catalog-write-gateway` before the two rows that
   depend on it (`P2-N-LUBE-2011-ON`, `P2-F-LUBE-2018-2021`) can be considered fully live.
3. The Isuzu standard-vs-high-capacity fuel filter distinction (Phase 2 scope, N-Series and
   F-Series 2013-2021/2018-2020) is still open at the Isuzu level; this pass assigned the
   same Donaldson evidence to both configurations of each pair rather than resolving that
   Phase 2 ambiguity, which stays out of scope for Phase 3.
4. The stale legacy `P550008` mappings (`EL50936`/`EL50940`/`EL59363`) were removed from
   both legacy CSV exports when `P550008` became an active Isuzu base. The canonical owner is
   `EL80008`.
5. One `BLOCKED_DONALDSON` row remains: `P2-N-FWS-2022i-ON` / `8982373410`. It still needs a
   genuine Donaldson equivalent or a verified Donaldson non-manufacture determination before
   Fleetguard may be considered.
5. `8982984040` and `2906544040` are resolved (Donaldson `P848076`, candidate ELIMFILTERS
   `EL88076`) as of the `P848076 ELIMFILTERS SKU CLOSURE — 2026-09-24` pass. Obtain
   Donaldson data for `8982373410` through a non-blocked Donaldson channel; until then that
   row stays `BLOCKED_DONALDSON`. Only a verified Donaldson-not-manufactured determination
   may open a Fleetguard base.
6. Obtain an Isuzu F-Series owner's or parts manual to close F-Series air, cabin, air
   dryer, water separator and transmission.
7. Obtain Isuzu parts data for the 4HK1-TC N-Series MY2005-2012 fuel filter, for the
   ECO-MAX fuel and air filters, and for the N-Series MY2022-2026 fuel filter.
8. Locate an Isuzu-published OEN for the H-Series (`HTR`/`HVR`/`HXR`,
   `block_id: H-2005-2008`). Until one exists, Phase 3 carries it as `BLOCKED_OEM`.
9. Obtain NPR-HD and NRR's own MY2021 crew-cab specification PDFs through a route that does
   not hit the reproducible 1,048,576-byte truncation documented above, to replace the
   same-batch sibling-evidence closure with each model's own document.

### P2-N-TRANS single-row closure — 8971822820 (2026-09-24)

The prior `P550008` rejection was reopened only for this row. Isuzu's exact OEN remains
`8971822820`, described by Isuzu as `OIL FILTER; TRANS (CARTRIDGE)` with a `1998-` diesel scope.
The repository-held first-party Donaldson capture directly cross-references that exact Isuzu
number to `P550008`. Independent Fleetguard application material maps the same exact Isuzu OEN
as a **Transmission Filter** to `LF551A`; Fleetguard's current product data identifies `LF551A`
as a 3/4-16 UNF spin-on at 96.06 mm OD × 137.08 mm high. That physical form closely matches
Donaldson `P550008` / ELIMFILTERS `EL80008` at 95 mm × 136 mm with a 3/4-16 UN thread.

Accordingly, the earlier assumption that Isuzu's word `CARTRIDGE` necessarily meant an internal,
non-spin-on transmission element is superseded. The row now resolves to Donaldson `P550008` as
the canonical base and reuses existing ELIMFILTERS SKU `EL80008`. Fleetguard `LF551A` remains
corroboration only; it does not define the base. The decision is `PARTIAL`, not `VERIFIED_BASE`,
because Phase 2 itself is `PARTIAL` and remains the evidence ceiling.

Because `P550008` is now an active Isuzu base, the three stale MANN-import mappings to `EL50936`,
`EL50940`, and `EL59363` were removed from both legacy cross-reference CSV exports. Canonical
ownership remains `P550008 → EL80008`.

### Live catalogue publication — P848076 / EL88076 (2026-09-24)

The governed candidate created in PR #749 was published on ELIMSERVER to the local
`catalogo_elimfilters` PostgreSQL catalogue through migration
`scripts/migrations/run_119_create_el88076_p848076.js`. The pre-write audit found
no existing owner for `EL88076`, `P848076`, `2906544040`, or `8982984040`.

The live row is `EL88076` with canonical source `DONALDSON / P848076`,
`HEAVY_DUTY`, `oil`, and `SYNTRAX™`. Thread, efficiency, and bypass setting
remain unpublished because no verified specification source was available.
Two Isuzu OEM references and six Phase-1/Phase-2-governed USA 4HK1-TC application
ranges were written through the existing catalogue/application governance layer.

Post-write audit returned one public product, one relational catalog parent, two OEM
references, six relational applications, six specifications, and two cache rows.
Resolver validation returns `P848076 → EL88076` as `RESOLVED_CANONICAL_BASE`
and both Isuzu OENs as single resolutions to `EL88076`.

The local Part Search runtime/schema mismatch was subsequently closed on ELIMSERVER.
The already-versioned `scripts/catalog_et9_scope_correction_20260918.sql` was applied
to the local catalogue, adding the `catalog_active` scope columns and creating
`public.elimfilters_catalog_active_v`; `server-original.js` was also corrected to
disable PostgreSQL SSL for loopback database URLs while preserving the existing
remote-SSL behavior. End-to-end HTTP checks then returned HTTP 200 for `P848076`,
`EL88076`, `2906544040`, and `8982984040`, all resolving to `EL88076`.

The Phase 3 `elimfilters_base_decision.published` flag remains `false` by
design: it is the no-auto-publication guard for research decisions, not the live
catalogue publication state. Live publication is recorded separately under
`live_catalog_publication`.
