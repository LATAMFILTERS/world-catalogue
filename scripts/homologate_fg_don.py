#!/usr/bin/env python3
"""
homologate_fg_don.py
Cross-match Fleetguard and Donaldson filter catalogs from scraped JSON files.

Actual data structures (verified from scraped files):

  Fleetguard (scripts/Fleetguard Scraper/fleetguard_*_results.json):
    - part_number: str
    - cross_references: [{"brand": "BrandName", "part_number": "CODE123"}]
    - oem_codes:        [{"manufacturer": "BRAND", "part_number": "CODE"}]

  Donaldson (scripts/donaldson_*_results.json):
    - part_number: str
    - brand_crossrefs:  {"BRAND": ["PN1", "PN2", ...]}   ← filter brand xrefs
    - oem_codes:        [{"manufacturer": "BRAND", "part_number": "CODE"}]
    - cross_references: [{"manufacturer": "BRAND", "part_number": "CODE"}]
      (some categories use cross_references instead of oem_codes)

Usage:
  python3 homologate_fg_don.py

Environment overrides:
  FG_DIR   Path to Fleetguard JSON directory (default: scripts/Fleetguard Scraper/)
  DON_DIR  Path to Donaldson JSON directory  (default: scripts/)
"""

import glob
import json
import os
from collections import defaultdict

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

FG_DIR  = os.environ.get("FG_DIR",  os.path.join(SCRIPT_DIR, "Fleetguard Scraper"))
DON_DIR = os.environ.get("DON_DIR", SCRIPT_DIR)

OUTPUT_MATRIX  = os.path.join(SCRIPT_DIR, "homologation_matrix.json")
OUTPUT_SUMMARY = os.path.join(SCRIPT_DIR, "homologation_summary.json")

# Brands to exclude from Pass C (shared OEM) — these are filter brands,
# not equipment OEMs.  A shared part number between two filter brands just
# means they reference each other, not that they fit the same equipment.
FILTER_BRANDS_EXCLUDE = {
    "DONALDSON",
    "FLEETGUARD",
    "FLEETRITE",
    "CUMMINS FILTRATION",
    "CUMMINS",
    "BALDWIN",
    "MANN",
    "MANN-HUMMEL",
    "WIX",
    "PUROLATOR",
    "FRAM",
    "NAPA",
    "HASTINGS",
    "LUBER-FINER",
    "LUBERFINER",
    "HIFI",
    "MAHLE",
    "KNECHT",
    "FILTRON",
    "PURFLUX",
    "AC-DELCO",
    "MOTORCRAFT",
    "CARQUEST",
    "SAKURA",
    "HENGST",
    "UFI",
    "RYCO",
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def normalize_pn(pn) -> str:
    """Uppercase and strip all whitespace from a part number."""
    if not pn:
        return ""
    return str(pn).upper().strip().replace(" ", "")


def is_filter_brand(brand: str) -> bool:
    """Return True if brand matches a known filter manufacturer (not an OEM)."""
    bu = brand.upper().strip()
    for fb in FILTER_BRANDS_EXCLUDE:
        if fb in bu:
            return True
    return False


def load_json_files(pattern: str) -> list:
    """Load all JSON files matching glob pattern; each file is a list of products."""
    products = []
    for path in sorted(glob.glob(pattern)):
        try:
            with open(path, encoding="utf-8") as fh:
                data = json.load(fh)
            if isinstance(data, list):
                products.extend(data)
            elif isinstance(data, dict):
                # Some scrapers wrap the list in a dict
                for v in data.values():
                    if isinstance(v, list):
                        products.extend(v)
        except (json.JSONDecodeError, OSError) as exc:
            print(f"  [WARN] Could not load {path}: {exc}")
    return products


# ---------------------------------------------------------------------------
# Catalog loading
# ---------------------------------------------------------------------------


def load_donaldson(base_dir: str) -> dict:
    """Load all Donaldson results → {normalized_pn: product_dict}."""
    pattern = os.path.join(base_dir, "donaldson_*_results.json")
    products = load_json_files(pattern)
    index = {}
    for p in products:
        pn = normalize_pn(p.get("part_number", ""))
        if pn and pn not in index:
            index[pn] = p
    return index


def load_fleetguard(base_dir: str) -> dict:
    """Load all Fleetguard results → {normalized_pn: product_dict}."""
    pattern = os.path.join(base_dir, "fleetguard_*_results.json")
    products = load_json_files(pattern)
    index = {}
    for p in products:
        pn = normalize_pn(p.get("part_number", ""))
        if pn and pn not in index:
            index[pn] = p
    return index


# ---------------------------------------------------------------------------
# OEM-code extraction helpers
# ---------------------------------------------------------------------------


def get_don_oem_entries(product: dict) -> list:
    """
    Return all OEM/manufacturer cross-reference entries from a Donaldson product.
    Handles two field names used in different categories:
      - oem_codes        → [{"manufacturer": ..., "part_number": ...}]
      - cross_references → [{"manufacturer": ..., "part_number": ...}]
    """
    entries = []
    for field in ("oem_codes", "cross_references"):
        raw = product.get(field)
        if isinstance(raw, list):
            entries.extend(raw)
    return entries


def get_fg_oem_entries(product: dict) -> list:
    """
    Return OEM (non-filter-brand) entries from a Fleetguard product.
    Fleetguard stores these in:
      - cross_references → [{"brand": ..., "part_number": ...}]
      - oem_codes        → [{"manufacturer": ..., "part_number": ...}]
    """
    entries = []
    for xref in (product.get("cross_references") or []):
        brand = xref.get("brand", "") or xref.get("manufacturer", "")
        pn = normalize_pn(xref.get("part_number", ""))
        if brand and pn:
            entries.append({"brand": brand, "part_number": pn})
    for oc in (product.get("oem_codes") or []):
        brand = oc.get("manufacturer", "") or oc.get("brand", "")
        pn = normalize_pn(oc.get("part_number", ""))
        if brand and pn:
            entries.append({"brand": brand, "part_number": pn})
    return entries


# ---------------------------------------------------------------------------
# Matching passes
# ---------------------------------------------------------------------------


def pass_a(fg_by_pn: dict, don_by_pn: dict) -> list:
    """
    Pass A — Direct FG → DON cross-reference.
    For each FG product, check cross_references for entries whose 'brand'
    contains "DONALDSON".  Record a match for every referenced DON part number.
    Match dict: {fg_pn, don_pn, method: "FG_CROSSREF_TO_DON", fg_brand_ref}
    """
    matches = []
    for fg_pn, fg_prod in fg_by_pn.items():
        for xref in (fg_prod.get("cross_references") or []):
            brand = xref.get("brand", "")
            don_ref_pn = normalize_pn(xref.get("part_number", ""))
            if "DONALDSON" in brand.upper() and don_ref_pn:
                matches.append({
                    "fg_pn": fg_pn,
                    "don_pn": don_ref_pn,
                    "method": "FG_CROSSREF_TO_DON",
                    "fg_brand_ref": brand,
                })
    return matches


def pass_b(fg_by_pn: dict, don_by_pn: dict) -> list:
    """
    Pass B — Direct DON → FG cross-reference.
    Donaldson stores filter-brand xrefs in brand_crossrefs: {"BRAND": ["PN1", ...]}.
    Look for keys containing "FLEETGUARD" or "CUMMINS FILTRATION".
    Match dict: {fg_pn, don_pn, method: "DON_CROSSREF_TO_FG"}
    """
    matches = []
    for don_pn, don_prod in don_by_pn.items():
        bc = don_prod.get("brand_crossrefs") or {}
        for brand_key, pn_list in bc.items():
            bku = brand_key.upper()
            if "FLEETGUARD" not in bku and "CUMMINS FILTRATION" not in bku:
                continue
            if not isinstance(pn_list, list):
                pn_list = [pn_list]
            for fg_ref_pn in pn_list:
                fg_norm = normalize_pn(str(fg_ref_pn))
                if fg_norm:
                    matches.append({
                        "fg_pn": fg_norm,
                        "don_pn": don_pn,
                        "method": "DON_CROSSREF_TO_FG",
                    })
    return matches


def pass_c(fg_by_pn: dict, don_by_pn: dict) -> list:
    """
    Pass C — Shared OEM part number.
    Build reverse index {normalized_oem_code → [(fg_pn, brand), ...]} from FG
    cross_references and oem_codes, excluding filter brands.
    For each Donaldson oem_codes/cross_references entry, look up that code in the
    FG reverse index.
    Match dict: {fg_pn, don_pn, method: "SHARED_OEM", shared_code, brand}
    """
    # Build FG OEM reverse index
    fg_oem_index = defaultdict(list)  # {norm_oem_pn: [(fg_pn, brand), ...]}
    for fg_pn, fg_prod in fg_by_pn.items():
        for entry in get_fg_oem_entries(fg_prod):
            brand = entry.get("brand", "")
            if is_filter_brand(brand):
                continue
            oem_pn = normalize_pn(entry.get("part_number", ""))
            if oem_pn:
                fg_oem_index[oem_pn].append((fg_pn, brand))

    matches = []
    for don_pn, don_prod in don_by_pn.items():
        seen_oem_pns = set()
        for entry in get_don_oem_entries(don_prod):
            mfr = entry.get("manufacturer", "") or entry.get("brand", "")
            if is_filter_brand(mfr):
                continue
            oem_pn = normalize_pn(entry.get("part_number", ""))
            if not oem_pn or oem_pn in seen_oem_pns:
                continue
            seen_oem_pns.add(oem_pn)
            if oem_pn in fg_oem_index:
                for fg_pn, fg_brand in fg_oem_index[oem_pn]:
                    matches.append({
                        "fg_pn": fg_pn,
                        "don_pn": don_pn,
                        "method": "SHARED_OEM",
                        "shared_code": oem_pn,
                        "brand": mfr if mfr else fg_brand,
                    })
    return matches


# ---------------------------------------------------------------------------
# Deduplication
# ---------------------------------------------------------------------------

METHOD_PRIORITY = {
    "FG_CROSSREF_TO_DON": 0,
    "DON_CROSSREF_TO_FG": 1,
    "SHARED_OEM": 2,
}


def deduplicate(raw_a: list, raw_b: list, raw_c: list) -> list:
    """
    Keep one canonical match per (fg_pn, don_pn) pair.
    Preference: Pass A > Pass B > Pass C.
    Returns list sorted by fg_pn then don_pn for stable output.
    """
    best = {}  # {(fg_pn, don_pn): match_dict}
    for match in raw_a + raw_b + raw_c:
        key = (match["fg_pn"], match["don_pn"])
        priority = METHOD_PRIORITY.get(match["method"], 99)
        if key not in best or priority < METHOD_PRIORITY.get(best[key]["method"], 99):
            best[key] = match
    result = list(best.values())
    result.sort(key=lambda m: (m["fg_pn"], m["don_pn"]))
    return result


# ---------------------------------------------------------------------------
# Summary statistics
# ---------------------------------------------------------------------------


def build_summary(
    matches: list,
    raw_a: list,
    raw_b: list,
    raw_c: list,
    fg_total: int,
    don_total: int,
) -> dict:
    fg_matched  = len({m["fg_pn"]  for m in matches})
    don_matched = len({m["don_pn"] for m in matches})

    # Count canonical matches by method (post-dedup)
    method_counts = defaultdict(int)
    for m in matches:
        method_counts[m["method"]] += 1

    # Top OEM brands from canonical Pass C matches
    brand_counts = defaultdict(int)
    for m in matches:
        if m["method"] == "SHARED_OEM":
            brand_counts[m.get("brand", "UNKNOWN")] += 1
    top_oem = sorted(brand_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    return {
        "fg_total": fg_total,
        "don_total": don_total,
        "total_matches": len(matches),
        "pass_a_count": method_counts["FG_CROSSREF_TO_DON"],
        "pass_b_count": method_counts["DON_CROSSREF_TO_FG"],
        "pass_c_count": method_counts["SHARED_OEM"],
        "fg_matched": fg_matched,
        "fg_unmatched": fg_total - fg_matched,
        "fg_match_pct": round(fg_matched / fg_total * 100, 1) if fg_total else 0.0,
        "don_matched": don_matched,
        "don_unmatched": don_total - don_matched,
        "don_match_pct": round(don_matched / don_total * 100, 1) if don_total else 0.0,
        "top_oem_brands": [{"brand": b, "count": c} for b, c in top_oem],
    }


# ---------------------------------------------------------------------------
# Console output
# ---------------------------------------------------------------------------


def print_summary(s: dict) -> None:
    print("\n=== HOMOLOGACIÓN FLEETGUARD ↔ DONALDSON ===")
    print(f"Fleetguard total: {s['fg_total']}")
    print(f"Donaldson total:  {s['don_total']}")
    print()
    print(f"Matches encontrados: {s['total_matches']}")
    print(f"  - Pass A (FG→DON crossref):  {s['pass_a_count']}")
    print(f"  - Pass B (DON→FG crossref):  {s['pass_b_count']}")
    print(f"  - Pass C (OEM compartido):   {s['pass_c_count']}")
    print()
    fg_unmatch_pct = round(100.0 - s["fg_match_pct"], 1)
    don_unmatch_pct = round(100.0 - s["don_match_pct"], 1)
    print(
        f"FG con match:   {s['fg_matched']:>5} / {s['fg_total']} "
        f"({s['fg_match_pct']}%)"
    )
    print(
        f"FG sin match:   {s['fg_unmatched']:>5} / {s['fg_total']} "
        f"({fg_unmatch_pct}%)"
    )
    print(
        f"DON con match:  {s['don_matched']:>5} / {s['don_total']} "
        f"({s['don_match_pct']}%)"
    )
    print(
        f"DON sin match:  {s['don_unmatched']:>5} / {s['don_total']} "
        f"({don_unmatch_pct}%)"
    )
    if s["top_oem_brands"]:
        print()
        print("Top 10 OEM brands que generaron matches:")
        for entry in s["top_oem_brands"]:
            print(f"  {entry['brand']}: {entry['count']}")
    print()
    print(f"→ {OUTPUT_MATRIX} ({s['total_matches']} matches)")
    print(f"→ {OUTPUT_SUMMARY}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    print("Loading Donaldson catalog...")
    don_by_pn = load_donaldson(DON_DIR)
    print(f"  {len(don_by_pn)} unique Donaldson part numbers loaded.")

    print("Loading Fleetguard catalog...")
    fg_by_pn = load_fleetguard(FG_DIR)
    print(f"  {len(fg_by_pn)} unique Fleetguard part numbers loaded.")

    print("Running Pass A (FG → DON crossref)...")
    raw_a = pass_a(fg_by_pn, don_by_pn)
    print(f"  {len(raw_a)} candidate matches.")

    print("Running Pass B (DON → FG crossref)...")
    raw_b = pass_b(fg_by_pn, don_by_pn)
    print(f"  {len(raw_b)} candidate matches.")

    print("Running Pass C (shared OEM code)...")
    raw_c = pass_c(fg_by_pn, don_by_pn)
    print(f"  {len(raw_c)} candidate matches.")

    print("Deduplicating...")
    matches = deduplicate(raw_a, raw_b, raw_c)

    summary = build_summary(matches, raw_a, raw_b, raw_c, len(fg_by_pn), len(don_by_pn))
    print_summary(summary)

    with open(OUTPUT_MATRIX, "w", encoding="utf-8") as fh:
        json.dump(matches, fh, indent=2, ensure_ascii=False)

    with open(OUTPUT_SUMMARY, "w", encoding="utf-8") as fh:
        json.dump(summary, fh, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
