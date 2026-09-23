# Isuzu USA Diesel Closure, Model Years 2000-2026

**Phase ID:** `ISUZU_US_DIESEL_THREE_PHASE_CLOSURE`
**Manifest:** `config/vehicle-platform-closure/isuzu-us-phase2-oem.json` (existing, unchanged)
**Closed on:** 2026-09-22
**Scope:** USA market, Isuzu, diesel only, model years 2000-2026 inclusive.

This is the research output for the three gated phases the manifest already defines. It
does not introduce a pipeline, a rule or a table. It fills the manifest's stages with
evidence and states, for every model year, what is closed and what is not.

## Artefacts

| File | Contents |
|---|---|
| `config/vehicle-platform-closure/isuzu-us-diesel-sources.json` | Every source read, with the exact capture used and what each one supports |
| `config/vehicle-platform-closure/isuzu-us-diesel-phase1-universe.json` | Phase 1 vehicle universe, conflicts, exclusions, open discovery items |
| `config/vehicle-platform-closure/isuzu-us-diesel-phase2-oen.json` | Phase 2 position universe and Isuzu OE/OEN rows |
| `config/vehicle-platform-closure/isuzu-us-diesel-phase3-aftermarket.json` | Phase 3 attempt, access blockers, and why no base decision was taken |
| `config/isuzu-n-series-us-oem-matrix.json` | Extended from 2022-2026 to 2000-2026 so the existing bot resolver answers the whole range |
| `lib/isuzu-us-diesel-closure.js` | Reader, validator and the canonical filter-set answer |
| `tests/isuzu-us-diesel-closure.test.js` | 17 tests over the governance invariants and the answer |

## Phase 1 — diesel vehicle universe

Every model year 2000-2026 has an explicit answer. 169 year-and-model combinations.

| | Count |
|---|---|
| VERIFIED | 155 |
| PARTIAL | 11 |
| UNRESOLVED | 2 |
| CONFLICTING | 1 |

`VERIFIED_ABSENT` is used for the six model years in which Isuzu USA published no
F-Series diesel truck at all. That is a closed answer, not a gap.

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
- **FBR** appears in no Isuzu USA source read in this closure.

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

**CONF-NRR-2004** — unresolved. Isuzu published an NRR Diesel page with 4HK1-TC 5.2 L on
2004-03-22, one month after its own NPR and NQR pages still published 4HE1-TC. NHTSA vPIC
does not list an NRR before MY2005. A spring publication of the first 4HK1-TC model is
equally consistent with an early MY2005 launch. MY2004 NRR is recorded CONFLICTING and no
filter set is attached to it. MY2005 onward is VERIFIED.

**CONF-FVR-2020** — resolved in favour of Isuzu. NHTSA vPIC lists an FVR for MY2020 and
MY2021, but no Isuzu document read publishes one, and the MY2021 F-Series brochure
publishes FTR alone. The 2022 specification brochure introduces FVR. FVR starts at MY2022.

### Still open in Phase 1

- **NQR MY2000 and MY2001.** NHTSA lists it; no Isuzu document covering those years was
  retrieved. Left UNRESOLVED rather than back-filled from the 2002 page.
- **H-Series.** Present in the isuzucv.com navigation between the 2006 and 2009 captures
  and in vPIC for MY2005-2008. No specification page was retrieved, so it is neither
  included nor denied.

## Phase 2 — Isuzu OE/OEN filter sets

21 rows, all from Isuzu sources. 6 VERIFIED, 13 PARTIAL, 2 NOT_APPLICABLE. 8 groups of
positions are recorded as UNRESOLVED.

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
  It is an emissions device, not a maintenance filter in the ELIMFILTERS sense.

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

Two format anomalies are flagged rather than silently accepted: the lube rows carrying
`2906542701 / 2906548000 / 2906548100` and `2906544040` do not follow the usual Isuzu
genuine pattern. They are reproduced exactly as published and marked for confirmation
against an Isuzu parts catalogue before any downstream use.

## Phase 3 — aftermarket resolution

**Outcome: `BLOCKED_AT_SOURCE_1`. No resolution row and no ELIMFILTERS base decision was
produced for any position.**

Donaldson is first in the mandated order and the canonical rule is
`DONALDSON_IF_MANUFACTURED_ELSE_FLEETGUARD`, so Fleetguard cannot be substituted without
first establishing that Donaldson does not manufacture the equivalence. That determination
requires Donaldson, and Donaldson's OE cross-reference could not be reached:

- `shop.donaldson.com` returns HTTP 403 from the Akamai edge on every request, including
  with full browser headers. Its `sitemap.xml` and its cross-reference REST endpoint
  return 403 as well.
- `www.donaldson.com/en-us/engine/filters/products/{PART}/` returns 200 but serves the
  generic products page; the product record is not in the HTML.
- Wayback holds `shop.donaldson.com` product pages, but the cross-reference table is
  loaded by XHR and is absent from the archived HTML.
- Web search restricted to donaldson.com returns product titles but no cross-reference rows.

Baldwin returns 403. Fleetguard's catalogue subdomain does not resolve. MANN-FILTER and
WIX are reachable but were not queried, because they are fourth and fifth in the order and
may only corroborate once the first two are settled.

One genuine Donaldson document was found and is preserved in the Phase 3 file: the
Australasia *Fuel and Oil Truck Service Kits* catalogue, which maps Donaldson references to
Isuzu **engines**. It is recorded as `RECORDED_BUT_NOT_USABLE_FOR_A_BASE_DECISION`, because
it maps to an engine rather than to an Isuzu OE/OEN, and because its model column lists
Australian and New Zealand designations. Using it would let an aftermarket catalogue define
USA vehicle scope, which the manifest prohibits.

## Evidence that the rules were kept

**Gasoline was excluded.** Every Phase 1 block is `DIESEL` and no block carries a gasoline
engine code or displacement. The gasoline line — NPR and NPR-HD with the GM Vortec 6000
6.0 L V8 and later the GM L8T 6.6 L V8 — was encountered in the same sources, is named once
in the exclusion record as proof it was seen and left out, and is asserted absent by test.

**Aftermarket did not define the OEM universe.** Phase 1 and Phase 2 cite only sources
published by Isuzu Commercial Truck of America; a test fails the build if any Phase 2 row
cites another publisher. NHTSA vPIC is marked `authority_level: secondary` and is used only
to corroborate or to raise a conflict. The only Donaldson material in the closure sits in
Phase 3 and is explicitly excluded from any decision.

**No model-to-model inheritance.** FRR and FXR are in the universe with no filter set
rather than borrowing the FTR's. The 4JJ1-TC NPR does not borrow the 4HK1-TC lube filter.
Both are asserted by test.

**Archived captures were read conservatively.** An isuzucv.com page with no printed model
year is treated as evidence of what Isuzu published on the capture date and supports that
model year only. It is never used as proof of an adjacent year. Where that left a year
thin, the year is PARTIAL rather than VERIFIED.

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
`8981772710`, `AIR_SECONDARY` and `AIR_DRYER` and `HYDRAULIC_FILTER` NOT_APPLICABLE,
`CABIN` UNRESOLVED, and every aftermarket field null while Phase 3 is blocked.

## Next actions

1. Obtain Donaldson OE cross-reference data through a channel that is not blocked at the
   Akamai edge — a distributor account, the `ecatalog.donaldson.com` e-catalog, or a North
   America edition of the Donaldson filter-kit literature.
2. Only then apply `DONALDSON_IF_MANUFACTURED_ELSE_FLEETGUARD` and take the base decisions.
3. Obtain an Isuzu F-Series owner's or parts manual to close F-Series air, cabin, air
   dryer, water separator and transmission.
4. Obtain Isuzu parts data for the 4HK1-TC N-Series MY2005-2012 fuel filter, for the
   ECO-MAX fuel and air filters, and for the N-Series MY2022-2026 fuel filter.
5. Resolve CONF-NRR-2004 from an Isuzu model-year-dated source.
