#!/usr/bin/env python3
"""
generate_elimfilters_skus.py
============================
Genera SKUs ELIMFILTERS LD a partir de codigos MANN.

Regla de conversion:
  1. Identificar familia por prefijo MANN → EL/EA/EC/EF
  2. Strip letras del prefijo y letras finales (suffix como Y, X, Z)
  3. Si hay slash: tomar parte ANTES del slash
  4. Extraer solo digitos
  5. Tomar ultimos 4 digitos, zero-pad si < 4
  6. SKU = familia + "5" + 4 digitos

Ejemplos:
  W940/21   → EL5 + 0940 = EL50940   (Oil)
  C3698     → EA5 + 3698 = EA53698   (Air)
  CUK22032  → EC5 + 2032 = EC52032   (Cabin)
  WK614/38  → EF5 + 0614 = EF50614   (Fuel)
  HU6013Y   → EL5 + 6013 = EL56013   (Oil cartridge)
  W7        → EL5 + 0007 = EL50007   (Oil)
  HU925/4Y  → EL5 + 0925 = EL50925   (Oil)

Input:  C:\\mann\\mann_master.jsonl   (output de scraper_mann_master.py)
Output: C:\\mann\\mann_ld_elimfilters.jsonl
        C:\\mann\\mann_ld_elimfilters.csv

Uso:
    python generate_elimfilters_skus.py
    python generate_elimfilters_skus.py --stats
    python generate_elimfilters_skus.py --test W940/21
    python generate_elimfilters_skus.py --test-all   # muestra primeros 30 ejemplos
"""

import argparse
import csv
import json
import re
import sys
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
INPUT_FILE      = Path(r"C:\mann\mann_master.jsonl")         # 2,056 SKUs base
INPUT_GAPS_FILE = Path(r"C:\mann\mann_master_gaps.jsonl")    # 6,042 gap SKUs (fase 2)
INPUT_XREF      = Path(r"C:\mann\mann_ld_crossrefs.jsonl")   # crossrefs (FRAM/WIX/BOSCH)
OUTPUT_JSONL    = Path(r"C:\mann\mann_ld_elimfilters.jsonl")
OUTPUT_CSV      = Path(r"C:\mann\mann_ld_elimfilters.csv")

# ── Prefix → ELIMFILTERS family ──────────────────────────────────────────────
# Longest prefix first to avoid CU matching before CUK
MANN_FAMILY_MAP = [
    ("CUK", "EC"),   # Cabin with activated carbon
    ("CU",  "EC"),   # Cabin
    ("CF",  "EC"),   # Cabin (alternative prefix)
    ("WK",  "EF"),   # Fuel (Kraftstoff)
    ("WP",  "EL"),   # Oil with pressure relief
    ("WD",  "EL"),   # Oil (drain-back)
    ("HU",  "EL"),   # Oil cartridge
    ("PU",  "EF"),   # Fuel
    ("KC",  "EF"),   # Fuel (alternative)
    ("KL",  "EL"),   # Oil (alternative — routes to lube in some systems)
    ("LA",  "EA"),   # Air intake pre-filter
    ("SP",  "EA"),   # Air safety element
    ("DB",  "EA"),   # Breather/drain-back
    ("FP",  "EA"),   # Air (fuel pre-filter → treated as air category)
    ("W",   "EL"),   # Oil spin-on
    ("C",   "EA"),   # Air filter
]

FAMILY_LABELS = {
    "EL": "Lube/Oil",
    "EA": "Air",
    "EC": "Cabin",
    "EF": "Fuel",
}

# Category names matching HD system (lube / air / cabin / fuel)
FAMILY_CATEGORY = {
    "EL": "lube",
    "EA": "air",
    "EC": "cabin",
    "EF": "fuel",
}

TECHNOLOGY_MAP = {
    "EL": "ULTRACORE™",
    "EA": "SUPRACORE™",
    "EC": "CLEANCORE™",
    "EF": "NAFTACORE™",
}

HD_EQUIV_MAP = {
    "EL": "EL8 SYNTRAX™",
    "EA": "EA1 MACROCORE™",
    "EC": "EC1 MICROKAPPA™",
    "EF": "EF9 NANOFORCE™",
}

# Filter style from MANN prefix (matching HD: Spin-On / Cartridge / Panel / Element)
FILTER_STYLE_MAP = [
    ("CUK", "Cabin Element"),
    ("CU",  "Cabin Element"),
    ("CF",  "Cabin Element"),
    ("WK",  "Fuel Filter"),
    ("PU",  "Fuel Filter"),
    ("KC",  "Fuel Filter"),
    ("WP",  "Spin-On"),
    ("WD",  "Spin-On"),
    ("HU",  "Cartridge"),
    ("LA",  "Pre-Filter"),
    ("SP",  "Safety Element"),
    ("DB",  "Breather"),
    ("FP",  "Pre-Filter"),
    ("W",   "Spin-On"),
    ("C",   "Panel"),
]

def get_filter_style(mann_sku: str) -> str:
    u = mann_sku.strip().upper()
    for prefix, style in FILTER_STYLE_MAP:
        if u.startswith(prefix):
            return style
    return ""


def mann_to_elim_sku(mann_sku: str) -> tuple[str | None, str | None]:
    """
    Convert MANN SKU to ELIMFILTERS LD SKU.
    Returns (elim_sku, family) or (None, None) if not mappable.
    """
    s = mann_sku.strip().upper()

    # Identify family by prefix
    family = None
    numeric_raw = s
    for prefix, fam in MANN_FAMILY_MAP:
        if s.startswith(prefix):
            family = fam
            numeric_raw = s[len(prefix):]  # remove prefix letters
            break

    if not family:
        return None, None

    # Strip trailing alpha characters (Y, X, Z, A, B — suffix codes)
    numeric_raw = re.sub(r"[A-Z]+$", "", numeric_raw)

    # If slash present: take only the part before the slash
    if "/" in numeric_raw:
        numeric_raw = numeric_raw.split("/")[0]

    # Extract digits only
    digits = re.sub(r"\D", "", numeric_raw)

    if not digits:
        return None, None

    # Take last 4 digits, zero-pad to 4 if shorter
    if len(digits) > 4:
        digits = digits[-4:]
    else:
        digits = digits.zfill(4)

    return f"{family}5{digits}", family


def load_xrefs() -> dict:
    """
    Lee mann_ld_crossrefs.jsonl y devuelve dict {sku_upper: xref_string}.
    Formato de archivo: {"sku":..., "site":..., "crossrefs": {"FRAM":["PH8A"],...}, "fram":...}
    """
    if not INPUT_XREF.exists():
        return {}
    xrefs = {}
    with open(INPUT_XREF, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            row = json.loads(line)
            sku = row.get("sku", "").strip().upper()
            if not sku:
                continue
            refs = row.get("crossrefs", {})
            if refs and isinstance(refs, dict):
                xrefs[sku] = " | ".join(
                    f"{brand}:{','.join(codes)}"
                    for brand, codes in refs.items()
                    if codes
                )
    print(f"Crossrefs cargados: {len(xrefs)} SKUs con equivalencias")
    return xrefs


def process(records: list[dict], xrefs: dict | None = None) -> list[dict]:
    """Apply SKU generation to a list of MANN records."""
    if xrefs is None:
        xrefs = {}
    out = []
    collisions: dict[str, list[str]] = {}

    for rec in records:
        mann_sku = rec.get("sku", "").strip()
        elim_sku, family = mann_to_elim_sku(mann_sku)

        if not elim_sku:
            continue

        # Track collisions (different MANN SKUs → same ELIMFILTERS SKU)
        collisions.setdefault(elim_sku, []).append(mann_sku)

        category     = FAMILY_CATEGORY.get(family, "")
        filter_style = get_filter_style(mann_sku)
        filter_type  = rec.get("filter_type", "")

        # Dimensions dict: {"Height": "142 mm", "Outer Diameter": "93 mm", ...}
        dims_raw = rec.get("dimensions", {}) or rec.get("dims_inline", {})
        # Flat string for CSV
        dimensions = " | ".join(
            f"{k}:{v}".replace(" ", "") for k, v in dims_raw.items()
        ) if dims_raw else ""

        # Specs dict: {"Filter with by-pass valve": "No", ...}
        specs_raw = rec.get("specs", {})
        specs = " | ".join(
            f"{k}:{v}" for k, v in specs_raw.items()
        ) if specs_raw else ""

        # OEM cross-references: raw dict {"FIAT": ["4119015",...], "OPEL": [...]}
        oem_raw = rec.get("oe_numbers", {})
        oem_codes = " | ".join(
            f"{make}:{','.join(codes)}" for make, codes in oem_raw.items()
        ) if oem_raw else ""

        # Competitor cross-references from crossreference sites (FRAM / WIX / BOSCH...)
        xref_str = xrefs.get(mann_sku.upper(), "") or rec.get("xref_codes", "")

        # Equipment applications — HD format: "MAKE MODEL · ENGINE ccmcc kWkW · YEAR"
        fitment_raw = rec.get("fitment", [])
        applications = []
        engine_year_set = []

        def _ccm_to_liters(ccm_val) -> str:
            try:
                liters = round(float(str(ccm_val).replace(",", "")) / 1000, 1)
                return f"{liters:.1f}"
            except Exception:
                return ""

        def _extract_year(year_val: str) -> str:
            import re as _re
            m = _re.search(r"(\d{4})", str(year_val))
            if m:
                return m.group(1)
            m2 = _re.search(r"/(\d{2})", str(year_val))
            if m2:
                y = int(m2.group(1))
                return str(2000 + y if y <= 30 else 1900 + y)
            return ""

        for v in fitment_raw:
            make   = v.get("make", "")
            model  = v.get("model_family", "") or v.get("model", "")
            mtype  = v.get("model_type", "")
            eng    = v.get("engine_code", "") or v.get("engine", "")
            ccm    = v.get("ccm", "")
            kw     = v.get("kw", "")
            year   = v.get("year", "")
            liters = _ccm_to_liters(ccm)
            # HD application format: "OPEL Ascona-B · 2.0D 20D 1998cc 43kW · 08/1978-08/1981"
            eng_desc = f"{liters}L {eng}".strip() if liters else eng
            app_str  = f"{make} {model} · {eng_desc} {ccm}cc {kw}kW · {year}".strip()
            applications.append(app_str)

            yr       = _extract_year(year)
            ey_token = f"{liters}L/{yr}" if liters and yr else (f"{liters}L" if liters else yr)
            if ey_token and ey_token not in engine_year_set:
                engine_year_set.append(ey_token)

        fitment_str  = " / ".join(applications)
        engine_year  = " | ".join(engine_year_set)

        out.append({
            # ── Identity (matches HD structure) ──────────────────
            "elim_sku":      elim_sku,
            "base_code":     mann_sku,
            "segment":       "LIGHT_DUTY",
            "category":      category,          # lube / air / cabin / fuel
            "filter_style":  filter_style,      # Spin-On / Cartridge / Panel / Element
            "technology":    TECHNOLOGY_MAP.get(family, ""),
            "hd_equiv":      HD_EQUIV_MAP.get(family, ""),
            "family":        family,
            # ── Product info ─────────────────────────────────────
            "filter_type":   filter_type,
            "gtin":          rec.get("gtin", ""),
            "description":   rec.get("description", "")[:200],
            # ── Technical specs ──────────────────────────────────
            "dimensions":    dimensions,
            "specs":         specs,
            # ── Cross-references ─────────────────────────────────
            "oe_count":      rec.get("oe_count", 0),
            "oem_codes":     oem_codes,          # OEM: FIAT:4119015 | OPEL:3448991
            "competitor_codes": xref_str,        # Competitor: FRAM:PH8A | WIX:51372
            # ── Equipment applications ───────────────────────────
            "fitment_count": rec.get("fitment_count", 0),
            "engine_year":   engine_year,        # 2.0L/1978 | 2.3L/1982
            "fitment":       fitment_str,        # OPEL Ascona-B · 2.0L 20D · 08/1978
        })

    # Report collisions
    dupes = {k: v for k, v in collisions.items() if len(v) > 1}
    if dupes:
        print(f"\n⚠  {len(dupes)} colisiones de SKU detectadas:")
        for esku, manns in sorted(dupes.items())[:10]:
            print(f"   {esku} ← {', '.join(manns)}")
        if len(dupes) > 10:
            print(f"   ... y {len(dupes)-10} más")

    return out


# ── CLI ──────────────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--test",     metavar="SKU", help="Convierte un SKU MANN de prueba")
    ap.add_argument("--test-all", action="store_true", help="Muestra 30 ejemplos del archivo")
    ap.add_argument("--stats",    action="store_true", help="Estadísticas del output")
    args = ap.parse_args()

    # ── Single SKU test ──
    if args.test:
        sku = args.test.strip().upper()
        elim, fam = mann_to_elim_sku(sku)
        if elim:
            print(f"MANN  : {sku}")
            print(f"ELIM  : {elim}")
            print(f"Familia : {fam} — {FAMILY_LABELS.get(fam)}")
            print(f"Tecnología : {TECHNOLOGY_MAP.get(fam)}")
            print(f"HD equiv   : {HD_EQUIV_MAP.get(fam)}")
        else:
            print(f"❌ No se pudo convertir: {sku}")
        return

    # ── Load input ──
    if not INPUT_FILE.exists():
        print(f"❌ No se encuentra {INPUT_FILE}")
        print("   Espera a que termine scraper_mann_master.py primero.")
        sys.exit(1)

    records = []
    seen_skus: set[str] = set()
    for src in [INPUT_FILE, INPUT_GAPS_FILE]:
        if not src.exists():
            continue
        n_before = len(records)
        with open(src, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                rec = json.loads(line)
                sku = rec.get("sku", "").strip().upper()
                if sku and sku not in seen_skus:
                    seen_skus.add(sku)
                    records.append(rec)
        print(f"  {src.name}: {len(records) - n_before} registros")

    print(f"Registros MANN leídos: {len(records)} (base + gaps)")

    # ── Test-all ──
    if args.test_all:
        print(f"\n{'MANN SKU':<18} {'ELIM SKU':<12} {'FAMILIA':<8} TECNOLOGÍA")
        print("─" * 60)
        sample = records[:30]
        for rec in sample:
            mann = rec.get("sku", "")
            elim, fam = mann_to_elim_sku(mann)
            tech = TECHNOLOGY_MAP.get(fam, "") if fam else ""
            print(f"{mann:<18} {elim or '—':<12} {fam or '':<8} {tech}")
        return

    # ── Generate ──
    xrefs   = load_xrefs()
    results = process(records, xrefs)
    print(f"SKUs ELIMFILTERS generados: {len(results)}")

    # Stats mode
    if args.stats:
        counts: dict[str, int] = {}
        for r in results:
            fam = r["family"]
            counts[fam] = counts.get(fam, 0) + 1
        print(f"\n{'─'*40}")
        for fam in ("EL", "EA", "EC", "EF"):
            label = FAMILY_LABELS[fam]
            tech = TECHNOLOGY_MAP[fam]
            n = counts.get(fam, 0)
            print(f"  {fam}  {label:<10} {tech:<15}  {n:>5} SKUs")
        print(f"{'─'*40}")
        print(f"  TOTAL: {len(results)}")
        return

    # ── Save JSONL ──
    with open(OUTPUT_JSONL, "w", encoding="utf-8") as f:
        for r in sorted(results, key=lambda x: x["elim_sku"]):
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(f"JSONL: {OUTPUT_JSONL}")

    # ── Save CSV ──
    CSV_COLS = [
        "elim_sku", "base_code", "segment", "category", "filter_style",
        "technology", "hd_equiv", "family",
        "filter_type", "gtin", "description", "dimensions", "specs",
        "oe_count", "oem_codes", "competitor_codes",
        "fitment_count", "engine_year", "fitment",
    ]
    with open(OUTPUT_CSV, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=CSV_COLS)
        w.writeheader()
        for r in sorted(results, key=lambda x: x["elim_sku"]):
            w.writerow({k: r.get(k, "") for k in CSV_COLS})
    print(f"CSV:   {OUTPUT_CSV}")

    # ── Summary ──
    counts: dict[str, int] = {}
    for r in results:
        fam = r["family"]
        counts[fam] = counts.get(fam, 0) + 1

    print(f"\n{'─'*40}")
    for fam in ("EL", "EA", "EC", "EF"):
        label = FAMILY_LABELS[fam]
        tech = TECHNOLOGY_MAP[fam]
        n = counts.get(fam, 0)
        print(f"  {fam}  {label:<10} {tech:<15}  {n:>5} SKUs")
    print(f"{'─'*40}")
    print(f"  TOTAL: {len(results)}")


if __name__ == "__main__":
    main()
