#!/usr/bin/env python3
"""
homologate_fg_don.py
Cross-matches Fleetguard and Donaldson filter catalogs from scraped JSON files.

Donaldson JSON structure:
  - part_number: str
  - oem_codes: [{manufacturer, part_number}]          (most categories)
  - cross_references: [{manufacturer, part_number}]   (hydraulic category)
  - brand_crossrefs: {BRAND: [part_number, ...]}      (filter brand refs)

Fleetguard JSON structure:
  - part_number: str
  - cross_references: [{brand, part_number}]
"""

import glob
import json
import os
from collections import defaultdict

# ──────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

FG_DIR = os.environ.get(
    "FG_DIR",
    os.path.join(SCRIPT_DIR, "Fleetguard Scraper"),
)
DON_DIR = os.environ.get(
    "DON_DIR",
    SCRIPT_DIR,
)

OUTPUT_MATRIX = os.path.join(SCRIPT_DIR, "homologation_matrix.json")
OUTPUT_SUMMARY = os.path.join(SCRIPT_DIR, "homologation_summary.json")

# Filter brands to exclude from Pass C (shared-OEM matching).
# These are filter brands, not equipment OEMs — a shared part number
# between two filter brands just means they copied each other's catalog,
# not that both fit the same equipment.
FILTER_BRANDS_EXCLUDE = {
    "DONALDSON",
    "FLEETGUARD",
    "CUMMINS FILTRATION",
    "BALDWIN",
    "MANN",
    "WIX",
    "PUROLATOR",
    "FRAM",
    "NAPA",
    "HASTINGS",
    "LUBER-FINER",
    "LUBERFINER",
    "HIFI",
    "CARQUEST",
    "SAKURA",
    "FLEETRITE",
    "HENGST",
    "UFI",
}


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def normalize_pn(pn: str) -> str:
    """Uppercase and strip whitespace from a part number."""
    return pn.upper().strip() if pn else ""


def load_json_files(pattern: str) -> list[dict]:
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


def get_don_oem_codes(product: dict) -> list[dict]:
    """
    Return the list of OEM/manufacturer cross-reference entries for a
    Donaldson product.  Handles two field names used in different scraper
    versions ('oem_codes' and 'cross_references').
    """
    entries = []
    for field in ("oem_codes", "cross_references"):
        raw = product.get(field)
        if isinstance(raw, list):
            entries.extend(raw)
    return entries


def is_filter_brand(brand_str: str) -> bool:
    """Return True if the brand string matches a known filter brand."""
    bu = brand_str.upper().strip()
    for fb in FILTER_BRANDS_EXCLUDE:
        if fb in bu:
            return True
    return False


# ──────────────────────────────────────────────
# Data loading
# ──────────────────────────────────────────────

def load_donaldson(base_dir: str) -> dict[str, dict]:
    """Load all Donaldson results into {normalized_pn: product}."""
    pattern = os.path.join(base_dir, "donaldson_*_results.json")
    products = load_json_files(pattern)
    index: dict[str, dict] = {}
    for p in products:
        pn = normalize_pn(p.get("part_number", ""))
        if pn and pn not in index:
            index[pn] = p
    return index


def load_fleetguard(base_dir: str) -> dict[str, dict]:
    """Load all Fleetguard results into {normalized_pn: product}."""
    pattern = os.path.join(base_dir, "fleetguard_*_results.json")
    products = load_json_files(pattern)
    index: dict[str, dict] = {}
    for p in products:
        if p.get("error"):
            continue  # skip failed scrapes
        pn = normalize_pn(p.get("part_number", ""))
        if pn and pn not in index:
            index[pn] = p
    return index


# ──────────────────────────────────────────────
# Matching passes
# ──────────────────────────────────────────────

def pass_a_fg_to_don(
    fg_by_pn: dict[str, dict],
    don_by_pn: dict[str, dict],
) -> list[dict]:
    """
    Pass A — Direct FG → DON cross-reference.
    For each FG product, look in its cross_references for entries whose
    'brand' contains 'DONALDSON'.  If that part number exists in
    don_by_pn, record a match.
    """
    matches = []
    for fg_pn, fg_prod in fg_by_pn.items():
        xrefs = fg_prod.get("cross_references") or []
        for xref in xrefs:
            brand = xref.get("brand", "")
            don_ref_pn = normalize_pn(xref.get("part_number", ""))
            if "DONALDSON" in brand.upper() and don_ref_pn:
                if don_ref_pn in don_by_pn:
                    matches.append(
                        {
                            "fg_pn": fg_pn,
                            "don_pn": don_ref_pn,
                            "method": "FG_CROSSREF_TO_DON",
                            "fg_brand_ref": brand,
                        }
                    )
    return matches


def pass_b_don_to_fg(
    fg_by_pn: dict[str, dict],
    don_by_pn: dict[str, dict],
) -> list[dict]:
    """
    Pass B — Direct DON → FG cross-reference.
    Donaldson stores filter-brand cross-references in brand_crossrefs
    (a dict keyed by brand name).  Look for keys containing 'FLEETGUARD'
    or 'CUMMINS FILTRATION'; the values are lists of FG part numbers.
    """
    matches = []
    for don_pn, don_prod in don_by_pn.items():
        bc = don_prod.get("brand_crossrefs") or {}
        for brand_key, pn_list in bc.items():
            bku = brand_key.upper()
            if "FLEETGUARD" not in bku and "CUMMINS FILTRATION" not in bku:
                continue
            for fg_ref_pn in (pn_list if isinstance(pn_list, list) else [pn_list]):
                fg_norm = normalize_pn(str(fg_ref_pn))
                if fg_norm in fg_by_pn:
                    matches.append(
                        {
                            "fg_pn": fg_norm,
                            "don_pn": don_pn,
                            "method": "DON_CROSSREF_TO_FG",
                            "don_brand_ref": brand_key,
                        }
                    )
    return matches


def pass_c_shared_oem(
    fg_by_pn: dict[str, dict],
    don_by_pn: dict[str, dict],
) -> list[dict]:
    """
    Pass C — Shared OEM part number.
    Build a reverse index {normalized_oem_code → [fg_pn, ...]} from FG
    cross_references, excluding entries whose brand is a known filter brand.
    Then for each Donaldson OEM code entry, check if that code is in the
    FG reverse index.
    """
    # Build FG OEM reverse index
    # FG cross_references: [{brand, part_number}]
    fg_oem_index: dict[str, list[tuple[str, str]]] = defaultdict(list)
    # key = (normalized_oem_code, brand)
    for fg_pn, fg_prod in fg_by_pn.items():
        xrefs = fg_prod.get("cross_references") or []
        for xref in xrefs:
            brand = xref.get("brand", "")
            if is_filter_brand(brand):
                continue
            oem_pn = normalize_pn(xref.get("part_number", ""))
            if oem_pn:
                fg_oem_index[oem_pn].append((fg_pn, brand))

    matches = []
    for don_pn, don_prod in don_by_pn.items():
        oem_entries = get_don_oem_codes(don_prod)
        for entry in oem_entries:
            mfr = entry.get("manufacturer", "")
            if is_filter_brand(mfr):
                continue
            oem_pn = normalize_pn(entry.get("part_number", ""))
            if not oem_pn:
                continue
            if oem_pn in fg_oem_index:
                for fg_pn, fg_brand in fg_oem_index[oem_pn]:
                    matches.append(
                        {
                            "fg_pn": fg_pn,
                            "don_pn": don_pn,
                            "method": "SHARED_OEM",
                            "shared_code": oem_pn,
                            "brand": mfr or fg_brand,
                        }
                    )
    return matches


# ──────────────────────────────────────────────
# Deduplication
# ──────────────────────────────────────────────

METHOD_PRIORITY = {
    "FG_CROSSREF_TO_DON": 0,
    "DON_CROSSREF_TO_FG": 1,
    "SHARED_OEM": 2,
}


def deduplicate(
    pass_a: list[dict],
    pass_b: list[dict],
    pass_c: list[dict],
) -> list[dict]:
    """
    Keep one canonical match per (fg_pn, don_pn) pair.
    Preference order: Pass A > Pass B > Pass C.
    """
    # Collect all candidates grouped by pair
    pair_candidates: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for match in pass_a + pass_b + pass_c:
        pair = (match["fg_pn"], match["don_pn"])
        pair_candidates[pair].append(match)

    canonical: list[dict] = []
    for pair, candidates in pair_candidates.items():
        best = min(candidates, key=lambda m: METHOD_PRIORITY.get(m["method"], 99))
        canonical.append(best)

    # Stable sort: by fg_pn then don_pn
    canonical.sort(key=lambda m: (m["fg_pn"], m["don_pn"]))
    return canonical


# ──────────────────────────────────────────────
# Statistics
# ──────────────────────────────────────────────

def build_summary(
    matches: list[dict],
    pass_a: list[dict],
    pass_b: list[dict],
    pass_c: list[dict],
    fg_total: int,
    don_total: int,
) -> dict:
    fg_matched = len({m["fg_pn"] for m in matches})
    don_matched = len({m["don_pn"] for m in matches})

    # Top OEM brands from Pass C
    brand_counts: dict[str, int] = defaultdict(int)
    for m in matches:
        if m["method"] == "SHARED_OEM":
            brand_counts[m.get("brand", "UNKNOWN")] += 1

    top_oem = sorted(brand_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    return {
        "fg_total": fg_total,
        "don_total": don_total,
        "total_matches": len(matches),
        "pass_a_count": len(pass_a),
        "pass_b_count": len(pass_b),
        "pass_c_count": len(pass_c),
        "fg_matched": fg_matched,
        "fg_unmatched": fg_total - fg_matched,
        "fg_match_pct": round(fg_matched / fg_total * 100, 1) if fg_total else 0.0,
        "don_matched": don_matched,
        "don_unmatched": don_total - don_matched,
        "don_match_pct": round(don_matched / don_total * 100, 1) if don_total else 0.0,
        "top_oem_brands": [{"brand": b, "count": c} for b, c in top_oem],
    }


# ──────────────────────────────────────────────
# Console output
# ──────────────────────────────────────────────

def print_summary(summary: dict, output_matrix: str) -> None:
    s = summary
    print("\n=== HOMOLOGACIÓN FLEETGUARD ↔ DONALDSON ===")
    print(f"Fleetguard total: {s['fg_total']}")
    print(f"Donaldson total:  {s['don_total']}")
    print()
    print(f"Matches encontrados: {s['total_matches']}")
    print(f"  - Pass A (FG→DON crossref):  {s['pass_a_count']}")
    print(f"  - Pass B (DON→FG crossref):  {s['pass_b_count']}")
    print(f"  - Pass C (OEM compartido):   {s['pass_c_count']}")
    print()
    print(
        f"FG con match:   {s['fg_matched']:>5} / {s['fg_total']} "
        f"({s['fg_match_pct']}%)"
    )
    print(
        f"FG sin match:   {s['fg_unmatched']:>5} / {s['fg_total']} "
        f"({round(100 - s['fg_match_pct'], 1)}%)"
    )
    print(
        f"DON con match:  {s['don_matched']:>5} / {s['don_total']} "
        f"({s['don_match_pct']}%)"
    )
    print(
        f"DON sin match:  {s['don_unmatched']:>5} / {s['don_total']} "
        f"({round(100 - s['don_match_pct'], 1)}%)"
    )
    if s["top_oem_brands"]:
        print()
        print("Top 10 OEM brands que generaron matches:")
        for entry in s["top_oem_brands"]:
            print(f"  {entry['brand']}: {entry['count']}")
    print()
    print(f"→ {output_matrix} ({s['total_matches']} matches)")
    print(f"→ {OUTPUT_SUMMARY}")
    print()


# ──────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────

def main() -> None:
    print("Loading Donaldson catalog …")
    don_by_pn = load_donaldson(DON_DIR)
    print(f"  {len(don_by_pn)} unique Donaldson part numbers loaded.")

    print("Loading Fleetguard catalog …")
    fg_by_pn = load_fleetguard(FG_DIR)
    print(f"  {len(fg_by_pn)} unique Fleetguard part numbers loaded.")

    print("Running Pass A (FG → DON crossref) …")
    pa = pass_a_fg_to_don(fg_by_pn, don_by_pn)
    print(f"  {len(pa)} candidate matches.")

    print("Running Pass B (DON → FG crossref) …")
    pb = pass_b_don_to_fg(fg_by_pn, don_by_pn)
    print(f"  {len(pb)} candidate matches.")

    print("Running Pass C (shared OEM code) …")
    pc = pass_c_shared_oem(fg_by_pn, don_by_pn)
    print(f"  {len(pc)} candidate matches.")

    print("Deduplicating …")
    matches = deduplicate(pa, pb, pc)

    summary = build_summary(matches, pa, pb, pc, len(fg_by_pn), len(don_by_pn))
    print_summary(summary, OUTPUT_MATRIX)

    with open(OUTPUT_MATRIX, "w", encoding="utf-8") as fh:
        json.dump(matches, fh, indent=2, ensure_ascii=False)

    with open(OUTPUT_SUMMARY, "w", encoding="utf-8") as fh:
        json.dump(summary, fh, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
