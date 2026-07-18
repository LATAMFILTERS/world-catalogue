-- Fix: EA17682 (Donaldson base P527682) is missing FLEETGUARD/BALDWIN/WIX/etc.
-- competitor_codes in the live catalog, so cross-reference searches like
-- "AF25139M" (Fleetguard) return no results even though it is a verified
-- equivalent of P527682.
--
-- Root cause: scripts/air_competitor_matrix.json (built by
-- build-air-competitor-matrix.js from the raw Donaldson-only scrape) has an
-- empty entry for P527682, because the brand-crossref scrape
-- (airfilter-crossreference.com) was merged only into
-- scripts/donaldson_import_ready.jsonl, never back into the matrix file that
-- apply-air-competitor-matrix.js pushes to the DB.
--
-- This statement backfills the correct competitor_codes for EA17682 using
-- the verified data already present in scripts/donaldson_import_ready.jsonl
-- (line for sku="EA17682"), which itself matches the crossref test documented
-- in scripts/MATRIX.md ("--test P527682" -> BALDWIN RS3518, FLEETGUARD
-- AF25139, FRAM CA7140, WIX 46556, etc.).
--
-- Run with: psql "$DATABASE_URL" -f scripts/fix_ea17682_competitor_codes.sql
-- (or paste into Render Shell / psql connected to the production DB)

BEGIN;

UPDATE elimfilters_catalog
SET competitor_codes = '[
  {"manufacturer": "AC-DELCO", "code": "1461C"},
  {"manufacturer": "AC-DELCO", "code": "A1461C"},
  {"manufacturer": "AIR-REFINER", "code": "ARM527682"},
  {"manufacturer": "AIR-REFINER", "code": "ARM535717"},
  {"manufacturer": "AIR-SUPPLY", "code": "122262"},
  {"manufacturer": "ALLIANCE", "code": "ABPN10GAF25"},
  {"manufacturer": "ALLIANCE", "code": "ABPN10GAF25139M"},
  {"manufacturer": "AMERICAN-PARTS", "code": "94556"},
  {"manufacturer": "BALDWIN", "code": "RS3518"},
  {"manufacturer": "BIG-A", "code": "94556"},
  {"manufacturer": "BIG-A", "code": "94566"},
  {"manufacturer": "CARBOCOL", "code": "001315811"},
  {"manufacturer": "CARBOCOL", "code": "V1117576"},
  {"manufacturer": "CARQUEST", "code": "88556"},
  {"manufacturer": "CARQUEST", "code": "88566"},
  {"manufacturer": "CASE", "code": "3520400C1"},
  {"manufacturer": "CATERPILLAR", "code": "3I1456"},
  {"manufacturer": "CHAMPION-LABORATORIES", "code": "LAF1849MXM"},
  {"manufacturer": "COMPAIR", "code": "K0262794"},
  {"manufacturer": "COUNTRY-COACH", "code": "30264"},
  {"manufacturer": "COUNTRY-COACH", "code": "500527"},
  {"manufacturer": "DONSSON", "code": "DA2524"},
  {"manufacturer": "FLEETGUARD", "code": "AF25139"},
  {"manufacturer": "FLEETGUARD", "code": "AF25139M"},
  {"manufacturer": "FLEETGUARD", "code": "AF4908"},
  {"manufacturer": "FLEETRITE", "code": "AFR825139M"},
  {"manufacturer": "FLEETRITE", "code": "AFR84908"},
  {"manufacturer": "FORD", "code": "9576P527682"},
  {"manufacturer": "FORD", "code": "F1HT9600BB"},
  {"manufacturer": "FORD", "code": "F1HZ9601B"},
  {"manufacturer": "FORD", "code": "F6HZ9601BC"},
  {"manufacturer": "FORD", "code": "F8HT9600BA"},
  {"manufacturer": "FRAM", "code": "CA7140"},
  {"manufacturer": "FRAM", "code": "CA8227"},
  {"manufacturer": "FREIGHTLINER", "code": "DNP527682"},
  {"manufacturer": "FREIGHTLINER", "code": "EAF5069"},
  {"manufacturer": "GARDNER-DENVER", "code": "300EHG1445"},
  {"manufacturer": "GENERAL-MOTORS", "code": "25177196"},
  {"manufacturer": "GILLIG", "code": "8210791000"},
  {"manufacturer": "GUD", "code": "ADG1602R"},
  {"manufacturer": "HASTINGS", "code": "AF2120"},
  {"manufacturer": "HENGST", "code": "E1147L"},
  {"manufacturer": "HIFI", "code": "SA16341"},
  {"manufacturer": "HOBART", "code": "EB5964"},
  {"manufacturer": "INDUCONTROL", "code": "AA1195"},
  {"manufacturer": "KRALINATOR", "code": "LA1404"},
  {"manufacturer": "LEROI", "code": "K0262794"},
  {"manufacturer": "LINK-BELT", "code": "3A19832"},
  {"manufacturer": "LOESING", "code": "021947"},
  {"manufacturer": "LUBERFINER", "code": "LAF1849"},
  {"manufacturer": "LUBERFINER", "code": "LAF5717"},
  {"manufacturer": "M", "code": "A594"},
  {"manufacturer": "MACK", "code": "2191P527682"},
  {"manufacturer": "MANN", "code": "C341300"},
  {"manufacturer": "MANN-HUMMEL", "code": "C341300"},
  {"manufacturer": "MECAFILTER", "code": "FA3625"},
  {"manufacturer": "MERCEDES-BENZ", "code": "527682"},
  {"manufacturer": "MERCEDES-BENZ", "code": "DNP527682"},
  {"manufacturer": "MERCEDES-BENZ", "code": "VDNP527682"},
  {"manufacturer": "MISFAT", "code": "R1053"},
  {"manufacturer": "MOTORCRAFT", "code": "FA1077"},
  {"manufacturer": "NAPA", "code": "6556"},
  {"manufacturer": "NAWOOTEC", "code": "3303371040"},
  {"manufacturer": "NEOPLAN", "code": "DONP527682"},
  {"manufacturer": "PARTMO-FILTERS", "code": "AP3518"},
  {"manufacturer": "PUROLATOR", "code": "A74700"},
  {"manufacturer": "PUROLATOR", "code": "FA1077"},
  {"manufacturer": "PUROLATOR", "code": "FA408"},
  {"manufacturer": "REYTOR", "code": "IT2086"},
  {"manufacturer": "SAKURA", "code": "A5023"},
  {"manufacturer": "SURE", "code": "SFA7682P"},
  {"manufacturer": "TOMI", "code": "T527682"},
  {"manufacturer": "TYLER-POWER-PRODUCTS", "code": "229614003"},
  {"manufacturer": "TYLER-POWER-PRODUCTS", "code": "2296141003"},
  {"manufacturer": "UNITED-CENTRAL-INDUSTRIAL", "code": "688076"},
  {"manufacturer": "VMC", "code": "AF527682"},
  {"manufacturer": "VOLVO", "code": "1117576"},
  {"manufacturer": "VOLVO", "code": "85106370"},
  {"manufacturer": "VOLVO", "code": "V1117576"},
  {"manufacturer": "WHITE", "code": "220013212"},
  {"manufacturer": "WHITE", "code": "V1117576"},
  {"manufacturer": "WIX", "code": "46556"},
  {"manufacturer": "WOODGATE", "code": "WGA1108"}
]'::jsonb
WHERE sku = 'EA17682' AND codigo_base = 'P527682';

-- Sanity check before commit: must affect exactly 1 row.
-- If this prints 0, the SKU doesn't exist yet in this DB (needs an import,
-- not just an update) -- ROLLBACK and investigate instead of committing.
-- If this prints >1, something else is wrong (duplicate SKU) -- ROLLBACK.

COMMIT;

-- Verify:
-- SELECT sku, codigo_base, jsonb_array_length(competitor_codes) AS n_refs
-- FROM elimfilters_catalog WHERE sku = 'EA17682';
