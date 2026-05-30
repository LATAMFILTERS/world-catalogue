"""
generate_descriptions.py — Generates ELIMFILTERS-branded descriptions + SKUs for all Donaldson products.

Adds two fields to each product in *_results.json:
  - description_elimfilters  (English, ELIMFILTERS tech branding)
  - sku_elimfilters           (e.g. EL82100 from P552100 lube)

SKU prefix map:
  EA1 = air          EA2 = air-intake    EC1 = cabin
  EL8 = lube         EH6 = hydraulic     ED4 = air-dryer
  EF9 = fuel         ES9 = fuel-separator (water sep within fuel)
  EW7 = coolant

Usage:
    python generate_descriptions.py --sample         # Show 5 samples per category
    python generate_descriptions.py                  # Run on all categories
    python generate_descriptions.py lube hydraulic   # Run on specific categories
"""

import json, glob, sys, os, re
from pathlib import Path


# ── Technology mapping ────────────────────────────────────────────────────────

TECH_BY_CATEGORY = {
    "air":       "MACROCORE™",
    "air-intake": "MACROCORE™",
    "cabin":     "MACROCORE™",
    "lube":      "DURATECH™",
    "hydraulic": "NANOFORCE™",
    "coolant":   "MICROKAPPA™",
    "air-dryer": "AQUAGUARD™",
    "fuel":      None,  # resolved per-product (water sep → AQUAGUARD™, else NANOFORCE™)
}

TECH_TAGLINE = {
    "MACROCORE™":  "Progressive Density Gradient Air Protection",
    "DURATECH™":   "Dual-Stage Wear Debris Capture",
    "NANOFORCE™":  "Electrostatic Particle & Water Rejection",
    "MICROKAPPA™": "Precision Coolant System Protection",
    "AQUAGUARD™":  "Integrated Water Extraction System",
}

TECH_STANDARD = {
    "MACROCORE™":  "ISO 5011",
    "DURATECH™":   "ISO 4548-12",
    "NANOFORCE™":  "ISO 16889",
    "MICROKAPPA™": "ISO 16889",
    "AQUAGUARD™":  "ISO 16889 / ASTM D6304",
}


# ── Attribute helpers ─────────────────────────────────────────────────────────

def _attr(product: dict, *keys: str) -> str:
    """Return first matching attribute value, empty string if not found."""
    attrs = product.get("attributes", {})
    for k in keys:
        val = attrs.get(k, "")
        if val and val not in ("-", "N/A"):
            return str(val).strip()
    return ""


def _mm(value: str) -> str:
    """Extract mm value from e.g. '4.65 inch (118 mm)' → '118 mm'"""
    m = re.search(r'\(([^)]+mm)\)', value)
    return m.group(1) if m else value


def _equipment_summary(product: dict, max_items: int = 3) -> str:
    """Return 'Cummins L9, Freightliner 108SD, +N more' or ''"""
    equip = product.get("equipment", [])
    if not equip:
        return ""
    names = list(dict.fromkeys(
        e.get("equipment", "") for e in equip if e.get("equipment")
    ))
    if not names:
        return ""
    if len(names) <= max_items:
        return ", ".join(names)
    return ", ".join(names[:max_items]) + f", +{len(names) - max_items} more"


def _resolve_tech(product: dict, category: str) -> str:
    tech = TECH_BY_CATEGORY.get(category)
    if tech:
        return tech
    # fuel: water separator → AQUAGUARD™, else NANOFORCE™
    desc = product.get("description", "").upper()
    attrs_style = _attr(product, "Style", "style").upper()
    if "WATER" in desc or "SEPARATOR" in desc or "WATER" in attrs_style:
        return "AQUAGUARD™"
    return "NANOFORCE™"


# ── Description builders ──────────────────────────────────────────────────────

def _build_macrocore(p: dict) -> str:
    od     = _mm(_attr(p, "Outer Diameter"))
    length = _mm(_attr(p, "Length"))
    style  = _attr(p, "Style", "Type") or "Round"
    eff    = _attr(p, "Efficiency") or "99.98%"
    media  = _attr(p, "Media Type", "Media Brand") or "nanofiber media"
    std    = _attr(p, "Efficiency Test Std") or "ISO 5011"
    equip  = _equipment_summary(p)

    dims = ""
    if od and length:
        dims = f" — {style}, OD {od} × L {length}"
    elif od:
        dims = f" — {style}, OD {od}"
    elif length:
        dims = f" — {style}, L {length}"

    eff_clause = f"Efficiency {eff} ({std})."
    media_clause = f"{media.title()} media."
    equip_clause = f" Fits: {equip}." if equip else ""

    # Cabin filters protect operator cab, not engine intake
    attrs = p.get("attributes", {})
    is_cabin = attrs.get("Type", "").lower() in ("cabin", "ventilation") or \
               "panel" in attrs.get("Style", "").lower() or \
               "panel" in attrs.get("Type", "").lower() or \
               "ventilation" in p.get("description", "").lower()
    if is_cabin:
        role = "Operator cabin air quality protection. Blocks dust, PM10, and airborne contaminants from reaching vehicle cab."
    else:
        role = "Progressive density gradient protection against particulate ingestion in engine air intake systems."

    return (
        f"MACROCORE™ Air Element{dims}. "
        f"{eff_clause} {media_clause}"
        f" {role}{equip_clause}"
    )


def _build_duratech(p: dict) -> str:
    od     = _mm(_attr(p, "Outer Diameter"))
    length = _mm(_attr(p, "Length"))
    thread = _attr(p, "Thread Size")
    eff    = _attr(p, "Efficiency 99%") or _attr(p, "Efficiency")
    std    = _attr(p, "Efficiency Test Std") or "ISO 4548-12"
    burst  = _attr(p, "Collapse Burst")
    media  = _attr(p, "Media Type") or "synthetic media"
    equip  = _equipment_summary(p)

    dims = ""
    if od and length:
        dims = f" — Spin-On, OD {od} × L {length}"
    elif od:
        dims = f" — Spin-On, OD {od}"
    elif length:
        dims = f" — Spin-On, L {length}"

    specs = []
    if eff and std:
        specs.append(f"Efficiency 99% @ {eff} ({std})")
    if thread:
        specs.append(f"Thread {thread}")
    if burst:
        specs.append(f"Burst {burst}")

    specs_clause = ". ".join(specs) + "." if specs else ""
    media_clause = f" {media.title()} media." if media else ""
    equip_clause = f" Fits: {equip}." if equip else ""

    return (
        f"DURATECH™ Lube Filter{dims}. "
        f"{specs_clause}{media_clause}"
        f" Dual-stage wear debris capture for full-flow engine oil protection.{equip_clause}"
    )


def _build_nanoforce(p: dict, category: str) -> str:
    od     = _mm(_attr(p, "Outer Diameter"))
    length = _mm(_attr(p, "Length"))
    thread = _attr(p, "Thread Size")
    # Hydraulic uses "Efficiency Alpha 1000" key; fuel uses "Efficiency"
    mic    = _attr(p, "Efficiency Alpha 1000", "Absolute Rating", "Nominal Rating")
    eff    = _attr(p, "Efficiency") or "99.9%"
    # Donaldson stores internal codes (e.g. "23369") in Efficiency Test Std for hydraulic
    raw_std = _attr(p, "Efficiency Test Std")
    std    = raw_std if raw_std and not raw_std.isdigit() else ("ISO 16889" if category == "hydraulic" else "ISO 19438")
    equip  = _equipment_summary(p)

    domain = "hydraulic fluid" if category == "hydraulic" else "fuel"
    dims = ""
    if od and length:
        dims = f" — Spin-On, OD {od} × L {length}"

    specs = []
    if mic:
        specs.append(f"@ {mic}")
    elif eff:
        specs.append(f"Efficiency {eff}")
    if thread:
        specs.append(f"Thread {thread}")
    specs.append(std)

    specs_clause = ". ".join(specs) + "." if specs else ""
    equip_clause = f" Fits: {equip}." if equip else ""

    return (
        f"NANOFORCE™ {'Hydraulic' if category == 'hydraulic' else 'Fuel'} Filter{dims}. "
        f"{specs_clause}"
        f" Electrostatic synthetic media for {domain} particle and water contamination control.{equip_clause}"
    )


def _build_aquaguard(p: dict, category: str) -> str:
    od     = _mm(_attr(p, "Outer Diameter"))
    length = _mm(_attr(p, "Length"))
    thread = _attr(p, "Thread Size")
    equip  = _equipment_summary(p)

    dims = ""
    if od and length:
        dims = f" — Spin-On, OD {od} × L {length}"

    domain = "compressed air" if category == "air-dryer" else "diesel fuel"
    role   = "desiccant air drying" if category == "air-dryer" else "superabsorbent water extraction"

    thread_clause = f" Thread {thread}." if thread else ""
    equip_clause  = f" Fits: {equip}." if equip else ""

    return (
        f"AQUAGUARD™ {'Air Dryer' if category == 'air-dryer' else 'Water Separator'}{dims}.{thread_clause}"
        f" Integrated {role} for {domain} systems. 99.2% water removal efficiency.{equip_clause}"
    )


def _build_microkappa(p: dict) -> str:
    od     = _mm(_attr(p, "Outer Diameter"))
    length = _mm(_attr(p, "Length"))
    thread = _attr(p, "Thread Size")
    equip  = _equipment_summary(p)

    dims = ""
    if od and length:
        dims = f" — Spin-On, OD {od} × L {length}"

    thread_clause = f" Thread {thread}." if thread else ""
    equip_clause  = f" Fits: {equip}." if equip else ""

    return (
        f"MICROKAPPA™ Coolant Filter{dims}.{thread_clause}"
        f" Precision micro-filtration for engine coolant circuits."
        f" Extends coolant service life and controls particulate contamination.{equip_clause}"
    )


def generate_description(product: dict, category: str) -> str:
    tech = _resolve_tech(product, category)
    if tech == "MACROCORE™":
        return _build_macrocore(product)
    elif tech == "DURATECH™":
        return _build_duratech(product)
    elif tech == "NANOFORCE™":
        return _build_nanoforce(product, category)
    elif tech == "AQUAGUARD™":
        return _build_aquaguard(product, category)
    elif tech == "MICROKAPPA™":
        return _build_microkappa(product)
    return product.get("description", "")


# ── SKU generation ───────────────────────────────────────────────────────────

SKU_PREFIX = {
    "air":          "EA1",
    "air-intake":   "EA2",
    "cabin":        "EC1",
    "lube":         "EL8",
    "hydraulic":    "EH6",
    "air-dryer":    "ED4",
    "coolant":      "EW7",
    "diesel-kit":   "EK5",  # future category
    # fuel resolved per-product below (EF9 / ES9 water sep)
}


def _fuel_prefix(product: dict) -> str:
    desc = product.get("description", "").upper()
    if "SEPARATOR" in desc or "WATER" in desc:
        return "ES9"
    return "EF9"


def generate_sku(product: dict, category: str, seen: set) -> str:
    """Return ELIMFILTERS SKU. Handles collisions by extending to 5 digits."""
    pn = product.get("part_number", "")
    # Strip non-alphanumeric chars for digit extraction
    digits = re.sub(r'[^A-Z0-9]', '', pn.upper())

    if category == "fuel":
        prefix = _fuel_prefix(product)
    else:
        prefix = SKU_PREFIX.get(category, "EX0")

    # Try last 4 chars first, then 5 if collision
    for length in (4, 5, 6):
        suffix = digits[-length:] if len(digits) >= length else digits.zfill(length)
        sku = prefix + suffix
        if sku not in seen:
            seen.add(sku)
            return sku

    # Fallback: prefix + full stripped part number
    sku = prefix + digits
    seen.add(sku)
    return sku


# ── Main processing ───────────────────────────────────────────────────────────

def process_category(cat: str, sample_only: bool = False):
    results_file = f"donaldson_{cat}_results.json"
    if not Path(results_file).exists():
        print(f"  {results_file} not found — skip")
        return 0

    with open(results_file, encoding="utf-8") as f:
        products = json.load(f)

    if sample_only:
        print(f"\n{'='*60}")
        print(f"  {cat.upper()} — {len(products)} products")
        print(f"{'='*60}")
        seen: set = set()
        for p in products[:5]:
            d   = generate_description(p, cat)
            sku = generate_sku(p, cat, seen)
            tech = _resolve_tech(p, cat)
            print(f"\n  [{p['part_number']}] ({tech})")
            print(f"  SKU      : {sku}")
            print(f"  Original : {p.get('description','')}")
            print(f"  Generated: {d}")
        return 0

    seen: set = set()
    updated = 0
    collisions = 0
    for p in products:
        p["description_elimfilters"] = generate_description(p, cat)
        sku = generate_sku(p, cat, seen)
        p["sku_elimfilters"] = sku
        # Flag if we had to use extended suffix (collision resolved)
        base_prefix = SKU_PREFIX.get(cat, "EX0") if cat != "fuel" else _fuel_prefix(p)
        digits = re.sub(r'[^A-Z0-9]', '', p.get("part_number","").upper())
        expected = base_prefix + (digits[-4:] if len(digits) >= 4 else digits.zfill(4))
        if sku != expected:
            collisions += 1
        updated += 1

    tmp = results_file + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    os.replace(tmp, results_file)

    col_note = f" ({collisions} collisions resolved)" if collisions else ""
    print(f"  {cat}: {updated} SKUs + descriptions{col_note} → {results_file}")
    return updated


ALL_CATS = ["air", "air-intake", "cabin", "air-dryer", "lube", "hydraulic", "fuel", "coolant"]


if __name__ == "__main__":
    argv = sys.argv[1:]

    if "--sample" in argv:
        cats = [a for a in argv if not a.startswith("--")] or ALL_CATS
        for cat in cats:
            process_category(cat, sample_only=True)
        sys.exit(0)

    cats = [a for a in argv if not a.startswith("--")] or ALL_CATS
    total = 0
    for cat in cats:
        total += process_category(cat, sample_only=False)
    print(f"\nDone — {total} descriptions generated.")
