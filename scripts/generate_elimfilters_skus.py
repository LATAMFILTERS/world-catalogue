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
INPUT_FILE    = Path(r"C:\mann\mann_master.jsonl")
INPUT_XREF    = Path(r"C:\mann\mann_ld_crossrefs.jsonl")   # output de scraper_mann_ld_crossref.py
OUTPUT_JSONL  = Path(r"C:\mann\mann_ld_elimfilters.jsonl")
OUTPUT_CSV    = Path(r"C:\mann\mann_ld_elimfilters.csv")

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
    xref_string formato: "FRAM:PH8A,PH9688 | WIX:51372 | BOSCH:3311"
    Fuentes: oilfilter-crossreference.com / airfilter-crossreference.com / fuelfilter-crossreference.com
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
            # crossrefs stored as {"FRAM": ["PH8A"], "WIX": ["51372"], ...}
            refs = {k: v for k, v in row.items()
                    if k not in ("sku", "site", "url", "status") and isinstance(v, list) and v}
            if refs:
                xrefs[sku] = " | ".join(
                    f"{brand}:{','.join(codes)}" for brand, codes in refs.items()
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

        product_type = rec.get("filter_type", "")

        # Flatten dimensions: {"Height": "142 mm", ...} → "Height:142mm | OD:93mm"
        dims_raw = rec.get("dimensions", {}) or rec.get("dims_inline", {})
        dimensions = " | ".join(
            f"{k}:{v}".replace(" ", "") for k, v in dims_raw.items()
        ) if dims_raw else ""

        # Flatten specs: {"Filter with by-pass valve": "No", ...} → "bypass:No | anti-drain:No"
        specs_raw = rec.get("specs", {})
        specs = " | ".join(
            f"{k}:{v}" for k, v in specs_raw.items()
        ) if specs_raw else ""

        # OEM codes: {"FIAT": ["4119015",...], "OPEL": [...]} → "FIAT:4119015,4121392 | OPEL:3448991"
        oe_raw = rec.get("oe_numbers", {})
        oem_codes = " | ".join(
            f"{make}:{','.join(codes)}" for make, codes in oe_raw.items()
        ) if oe_raw else ""

        # Cross-reference codes from oilfilter/airfilter/fuelfilter-crossreference.com
        xref_codes = xrefs.get(mann_sku.upper(), "") or rec.get("xref_codes", "")

        # Fitment: list of dicts → engine_year "2.0/1998", full fitment string
        fitment_raw = rec.get("fitment", [])
        fitment_lines = []
        engine_year_set = []

        def _ccm_to_liters(ccm_val) -> str:
            try:
                liters = round(float(str(ccm_val).replace(",", "")) / 1000, 1)
                return f"{liters:.1f}"
            except Exception:
                return ""

        def _extract_year(year_val: str) -> str:
            # "08/78 → 08/81" → 1978  |  "01/2020 → 12/2025" → 2020  |  "2025" → 2025
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
            make  = v.get("make", "")
            model = v.get("model_family", "") or v.get("model", "")
            eng   = v.get("engine_code", "") or v.get("engine", "")
            ccm   = v.get("ccm", "")
            kw    = v.get("kw", "")
            year  = v.get("year", "")
            fitment_lines.append(f"{make} {model} {eng} {ccm}cc {kw}kW {year}".strip())

            liters   = _ccm_to_liters(ccm)
            yr       = _extract_year(year)
            ey_token = f"{liters}/{yr}" if liters and yr else (liters or yr)
            if ey_token and ey_token not in engine_year_set:
                engine_year_set.append(ey_token)

        fitment      = " / ".join(fitment_lines)
        engines_str  = " | ".join(engine_year_set)   # "2.0/1978 | 2.3/1982 | 2.5/2025"

        out.append({
            "elim_sku":     elim_sku,
            "base_code":    mann_sku,
            "product_type": product_type,
            "family":       family,
            "family_label": FAMILY_LABELS.get(family, ""),
            "technology":   TECHNOLOGY_MAP.get(family, ""),
            "hd_equiv":     HD_EQUIV_MAP.get(family, ""),
            "gtin":         rec.get("gtin", ""),
            "description":  rec.get("description", "")[:120],
            "dimensions":   dimensions,
            "specs":        specs,
            "oe_count":     rec.get("oe_count", 0),
            "oem_codes":    oem_codes,
            "xref_codes":   xref_codes,
            "fitment_count": rec.get("fitment_count", 0),
            "engine_year":  engines_str,
            "fitment":      fitment,
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
    with open(INPUT_FILE, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))

    print(f"Registros MANN leídos: {len(records)}")

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
        "elim_sku", "base_code", "product_type", "family", "family_label",
        "technology", "hd_equiv",
        "gtin", "description", "dimensions", "specs",
        "oe_count", "oem_codes", "xref_codes",
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
