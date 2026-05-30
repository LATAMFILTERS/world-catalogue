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
    "air":        "MACROCORE™",   # primary + safety air elements
    "air-intake": "INTAKCORE™",   # air cleaner housings/assemblies
    "cabin":      "MICROKAPPA™",  # operator cab air quality
    "lube":       "SYNTRAX™",     # full-flow, bypass, combination lube
    "hydraulic":  "NANOFORCE™",   # hydraulic filters
    "coolant":    "COOLTECH™",    # coolant filters + hoses
    "air-dryer":  "DRYCORE™",     # compressed air dryers
    "fuel":       None,           # SYNTAPORE™ (fuel) or AQUAGUARD™ (water sep)
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
    # fuel: water separator → AQUAGUARD™, else SYNTAPORE™
    desc = product.get("description", "").upper()
    attrs_style = _attr(product, "Style", "style").upper()
    if "WATER" in desc or "SEPARATOR" in desc or "WATER" in attrs_style:
        return "AQUAGUARD™"
    return "SYNTAPORE™"


# ── Description builders ──────────────────────────────────────────────────────

def _style_label(p: dict, fallback: str = "Spin-On") -> str:
    s = _attr(p, "Style", "Type") or fallback
    return s.title()


def _is_cartridge(p: dict) -> bool:
    desc  = p.get("description", "").upper()
    style = _attr(p, "Style", "Type").upper()
    return "CARTRIDGE" in desc or "CARTRIDGE" in style


def _build_macrocore(p: dict) -> str:
    od     = _mm(_attr(p, "Outer Diameter"))
    length = _mm(_attr(p, "Length"))
    style  = _style_label(p, "Round")
    eff    = _attr(p, "Efficiency") or "99.98%"
    media  = _attr(p, "Media Type", "Media Brand") or "nanofiber"
    std    = _attr(p, "Efficiency Test Std") or "ISO 5011"
    equip  = _equipment_summary(p)
    desc_up = p.get("description", "").upper()

    dims = ""
    if od and length:
        dims = f", {style}, OD {od} × L {length}"
    elif od:
        dims = f", {style}, OD {od}"
    elif length:
        dims = f", {style}, L {length}"

    equip_clause = f" Fits: {equip}." if equip else ""

    # Cabin: operator protection
    attrs    = p.get("attributes", {})
    is_cabin = (
        attrs.get("Type", "").lower() in ("cabin", "ventilation") or
        "panel" in attrs.get("Style", "").lower() or
        "panel" in attrs.get("Type", "").lower() or
        "ventilation" in desc_up
    )
    if is_cabin:
        eff_pct = eff if eff.endswith("%") else eff + "%"
        return (
            f"ELIMFILTERS MACROCORE™ Cabin Air Filter{dims}. "
            f"Provides clean air inside the cab for a safer, healthier work environment. "
            f"{eff_pct} efficiency ({std}) — blocks dust, PM10, and airborne contaminants "
            f"from reaching the operator cab, supporting longer and more productive working hours.{equip_clause}"
        )

    # Safety/secondary elements
    if "SAFETY" in desc_up:
        return (
            f"ELIMFILTERS MACROCORE™ Safety Air Element{dims}. "
            f"{eff} efficiency ({std}). {media.title()} media. "
            f"Inner secondary element guards against unfiltered air reaching the engine "
            f"during primary filter service — providing a critical last line of protection "
            f"for your air intake system.{equip_clause}"
        )

    # Air cleaner housings / intake assemblies (air-intake category)
    housing_keywords = ("HOUSING", "CLEANER", "INTAKE SYSTEM", "AIR CLEANER")
    if any(k in desc_up for k in housing_keywords):
        return (
            f"ELIMFILTERS MACROCORE™ Air Cleaner Assembly{dims}. "
            f"Complete air intake assembly engineered for heavy-duty applications. "
            f"Accepts MACROCORE™ primary and safety elements for {eff} ({std}) system efficiency. "
            f"Designed to protect engine air intake systems in demanding off-road and industrial environments.{equip_clause}"
        )

    filter_type = "Air Element" if "element" in style.lower() else "Air Filter"
    return (
        f"ELIMFILTERS MACROCORE™ {filter_type}{dims}. "
        f"{eff} filtration efficiency ({std}) using {media} media. "
        f"MACROCORE™ progressive density gradient architecture captures harmful particles "
        f"before they can reach critical engine components — protecting your air intake system "
        f"and extending engine life in the most demanding environments.{equip_clause}"
    )


def _build_duratech(p: dict) -> str:
    od      = _mm(_attr(p, "Outer Diameter"))
    length  = _mm(_attr(p, "Length"))
    thread  = _attr(p, "Thread Size")
    eff     = _attr(p, "Efficiency 99%") or _attr(p, "Efficiency")
    std     = _attr(p, "Efficiency Test Std") or "ISO 4548-12"
    burst   = _attr(p, "Collapse Burst")
    media   = _attr(p, "Media Type") or "synthetic"
    equip   = _equipment_summary(p)
    is_cart = _is_cartridge(p)
    desc_up = p.get("description", "").upper()

    style_str = "Cartridge" if is_cart else "Spin-On"
    dims = ""
    if od and length:
        dims = f", {style_str}, OD {od} × L {length}"
    elif od:
        dims = f", {style_str}, OD {od}"

    specs = []
    if eff:
        specs.append(f"99% @ {eff} ({std})")
    if thread:
        specs.append(f"Thread {thread}")
    if burst:
        specs.append(f"burst rated {burst}")
    specs_str = " | ".join(specs)
    specs_intro = f" {specs_str}." if specs_str else ""

    eco        = " Environmentally friendly cartridge design." if is_cart else ""
    equip_clause = f" Fits: {equip}." if equip else ""

    # Bypass filters: different protection mode
    if "BYPASS" in desc_up:
        return (
            f"ELIMFILTERS DURATECH™ Lube Filter — Bypass{dims}.{specs_intro} "
            f"High-efficiency bypass filtration removes ultra-fine particles, soot, "
            f"and oxidation by-products that full-flow filters cannot capture — "
            f"keeping oil cleaner for extended drain intervals and protecting "
            f"critical engine components against long-term wear.{equip_clause}"
        )

    # Combination full-flow + bypass
    if "COMBINATION" in desc_up or "COMBO" in desc_up:
        return (
            f"ELIMFILTERS DURATECH™ Lube Filter — Combination{dims}.{specs_intro}{eco} "
            f"Combines full-flow and bypass filtration in a single filter — "
            f"delivering the perfect balance between flow efficiency and fine particle removal. "
            f"Meets or exceeds engine OEM requirements for extended oil cleanliness.{equip_clause}"
        )

    return (
        f"ELIMFILTERS DURATECH™ Lube Filter{dims}.{eco}"
        f"{specs_intro} "
        f"DURATECH™ dual-stage wear debris capture removes harmful particles "
        f"before they reach critical engine surfaces, delivering full-flow engine oil "
        f"protection that meets or exceeds OEM specifications for maximum engine life. "
        f"{media.title()} media for superior contaminant holding capacity.{equip_clause}"
    )


def _build_nanoforce(p: dict, category: str) -> str:
    od     = _mm(_attr(p, "Outer Diameter"))
    length = _mm(_attr(p, "Length"))
    thread = _attr(p, "Thread Size")
    mic    = _attr(p, "Efficiency Alpha 1000", "Absolute Rating", "Nominal Rating")
    eff    = _attr(p, "Efficiency") or "99.9%"
    raw_std = _attr(p, "Efficiency Test Std")
    std    = raw_std if raw_std and not raw_std.isdigit() else ("ISO 16889" if category == "hydraulic" else "ISO 19438")
    equip  = _equipment_summary(p)
    is_cart = _is_cartridge(p)

    style_str = "Cartridge" if is_cart else "Spin-On"
    is_hyd = (category == "hydraulic")
    dims = ""
    if od and length:
        dims = f", {style_str}, OD {od} × L {length}"
    elif od:
        dims = f", {style_str}, OD {od}"

    rating_clause = f" Absolute rating {mic} ({std})." if mic else f" {eff} efficiency ({std})."
    thread_clause = f" Thread {thread}." if thread else ""
    equip_clause  = f" Fits: {equip}." if equip else ""

    desc_up = p.get("description", "").upper()

    if is_hyd:
        # Strainers: coarse pre-filtration, different role
        if "STRAINER" in desc_up:
            return (
                f"ELIMFILTERS NANOFORCE™ Hydraulic Strainer{dims}.{thread_clause} "
                f"Coarse pre-filtration removes large particles and debris from hydraulic fluid "
                f"before they reach sensitive downstream components — protecting pumps, valves, "
                f"and actuators from ingestion damage.{equip_clause}"
            )
        # Power steering filters
        if "POWER STEERING" in desc_up or "STEERING" in desc_up:
            return (
                f"ELIMFILTERS NANOFORCE™ Power Steering Filter{dims}.{rating_clause}{thread_clause} "
                f"Removes particles and contaminants from power steering fluid to protect "
                f"steering rack, pump, and control valve components — maintaining precise "
                f"steering response and extending system life.{equip_clause}"
            )
        return (
            f"ELIMFILTERS NANOFORCE™ Hydraulic Filter{dims}.{rating_clause}{thread_clause} "
            f"Electrostatic synthetic media keeps your precision hydraulic systems running "
            f"as intended — removing particles and water that cause valve wear, seal degradation, "
            f"and system failure. Engineered to meet or exceed OEM quality and performance standards.{equip_clause}"
        )
    else:
        desc_up_fuel = p.get("description", "").upper()
        if "IN-LINE" in desc_up_fuel or "INLINE" in desc_up_fuel:
            return (
                f"ELIMFILTERS NANOFORCE™ Fuel Filter — In-Line{dims}.{rating_clause}{thread_clause} "
                f"Compact in-line fuel filter removes contaminants from the fuel supply line — "
                f"protecting injectors and ensuring clean fuel delivery to your engine for "
                f"optimal fuel system protection.{equip_clause}"
            )
        return (
            f"ELIMFILTERS NANOFORCE™ Fuel Filter{dims}.{rating_clause}{thread_clause} "
            f"NANOFORCE™ electrostatic synthetic media removes harmful contaminants from your "
            f"fuel system, protecting injectors and ensuring clean fuel delivery to your engine "
            f"for consistent performance and reduced operating costs.{equip_clause}"
        )


def _build_aquaguard(p: dict, category: str) -> str:
    od     = _mm(_attr(p, "Outer Diameter"))
    length = _mm(_attr(p, "Length"))
    thread = _attr(p, "Thread Size")
    equip  = _equipment_summary(p)
    is_cart = _is_cartridge(p)

    style_str = "Cartridge" if is_cart else "Spin-On"
    dims = ""
    if od and length:
        dims = f", {style_str}, OD {od} × L {length}"
    elif od:
        dims = f", {style_str}, OD {od}"

    thread_clause = f" Thread {thread}." if thread else ""
    equip_clause  = f" Fits: {equip}." if equip else ""

    if category == "air-dryer":
        return (
            f"ELIMFILTERS AQUAGUARD™ Air Dryer{dims}.{thread_clause} "
            f"Filters out water vapor, oil vapor, and contaminants from compressed air "
            f"before they reach air tanks and valves — ensuring optimal system uptime "
            f"and protecting pneumatic components. Trust your compressed air system "
            f"with AQUAGUARD™ integrated desiccant protection.{equip_clause}"
        )
    else:
        return (
            f"ELIMFILTERS AQUAGUARD™ Fuel/Water Separator{dims}.{thread_clause} "
            f"Removes water and particulates from diesel fuel before they reach the engine — "
            f"protecting fuel injectors against corrosion and wear, and ensuring clean fuel "
            f"delivery for consistent performance. AQUAGUARD™ superabsorbent technology "
            f"achieves 99.2% water removal efficiency.{equip_clause}"
        )


def _build_microkappa(p: dict) -> str:
    """MICROKAPPA™ — Cabin air quality filters."""
    od     = _mm(_attr(p, "Outer Diameter"))
    length = _mm(_attr(p, "Length"))
    style  = _style_label(p, "Panel")
    eff    = _attr(p, "Efficiency") or "99.98%"
    std    = _attr(p, "Efficiency Test Std") or "ISO 5011"
    equip  = _equipment_summary(p)

    dims = ""
    if od and length:
        dims = f", {style}, OD {od} × L {length}"
    elif od:
        dims = f", {style}, OD {od}"
    elif length:
        dims = f", {style}, L {length}"

    eff_pct      = eff if eff.endswith("%") else eff + "%"
    equip_clause = f" Fits: {equip}." if equip else ""

    return (
        f"ELIMFILTERS MICROKAPPA™ Cabin Air Filter{dims}. "
        f"Provides clean air inside the cab for a safer, healthier work environment. "
        f"{eff_pct} efficiency ({std}) — blocks dust, PM10, and airborne contaminants "
        f"from reaching the operator cab, supporting longer and more productive working hours.{equip_clause}"
    )


def _build_intakcore(p: dict) -> str:
    """INTAKCORE™ — Air cleaner housings and assemblies."""
    od     = _mm(_attr(p, "Outer Diameter"))
    length = _mm(_attr(p, "Length"))
    equip  = _equipment_summary(p)

    dims = ""
    if od and length:
        dims = f", OD {od} × L {length}"
    elif od:
        dims = f", OD {od}"

    equip_clause = f" Fits: {equip}." if equip else ""

    return (
        f"ELIMFILTERS INTAKCORE™ Air Cleaner Assembly{dims}. "
        f"Complete heavy-duty air intake assembly engineered for demanding off-road and industrial applications. "
        f"Accepts MACROCORE™ primary and safety elements for maximum air intake protection — "
        f"covering your sophisticated air intake system requirements with proven heavy-duty filtration.{equip_clause}"
    )


def _build_syntrax(p: dict) -> str:
    """SYNTRAX™ — Lube filters (full-flow, bypass, combination)."""
    od      = _mm(_attr(p, "Outer Diameter"))
    length  = _mm(_attr(p, "Length"))
    thread  = _attr(p, "Thread Size")
    eff     = _attr(p, "Efficiency 99%") or _attr(p, "Efficiency")
    std     = _attr(p, "Efficiency Test Std") or "ISO 4548-12"
    burst   = _attr(p, "Collapse Burst")
    media   = _attr(p, "Media Type") or "synthetic"
    equip   = _equipment_summary(p)
    is_cart = _is_cartridge(p)
    desc_up = p.get("description", "").upper()

    style_str = "Cartridge" if is_cart else "Spin-On"
    dims = ""
    if od and length:
        dims = f", {style_str}, OD {od} × L {length}"
    elif od:
        dims = f", {style_str}, OD {od}"

    specs = []
    if eff:
        specs.append(f"99% @ {eff} ({std})")
    if thread:
        specs.append(f"Thread {thread}")
    if burst:
        specs.append(f"burst rated {burst}")
    specs_intro  = f" {' | '.join(specs)}." if specs else ""
    eco          = " Environmentally friendly cartridge design." if is_cart else ""
    equip_clause = f" Fits: {equip}." if equip else ""

    if "BYPASS" in desc_up:
        return (
            f"ELIMFILTERS SYNTRAX™ Lube Filter — Bypass{dims}.{specs_intro} "
            f"High-efficiency bypass filtration removes ultra-fine particles, soot, "
            f"and oxidation by-products that full-flow filters cannot capture — "
            f"keeping oil cleaner for extended drain intervals and protecting "
            f"critical engine components against long-term wear.{equip_clause}"
        )

    if "COMBINATION" in desc_up or "COMBO" in desc_up:
        return (
            f"ELIMFILTERS SYNTRAX™ Lube Filter — Combination{dims}.{specs_intro}{eco} "
            f"Combines full-flow and bypass filtration in a single filter — "
            f"delivering the perfect balance between flow efficiency and fine particle removal. "
            f"Meets or exceeds engine OEM requirements for extended oil cleanliness.{equip_clause}"
        )

    return (
        f"ELIMFILTERS SYNTRAX™ Lube Filter{dims}.{eco}"
        f"{specs_intro} "
        f"SYNTRAX™ advanced synthetic media removes harmful wear particles "
        f"before they reach critical engine surfaces, delivering full-flow engine oil "
        f"protection that meets or exceeds OEM specifications for maximum engine life. "
        f"{media.title()} media for superior contaminant holding capacity.{equip_clause}"
    )


def _build_syntapore(p: dict) -> str:
    """SYNTAPORE™ — Fuel filters (spin-on, cartridge, in-line)."""
    od      = _mm(_attr(p, "Outer Diameter"))
    length  = _mm(_attr(p, "Length"))
    thread  = _attr(p, "Thread Size")
    eff     = _attr(p, "Efficiency") or "99.9%"
    raw_std = _attr(p, "Efficiency Test Std")
    std     = raw_std if raw_std and not raw_std.isdigit() else "ISO 19438"
    equip   = _equipment_summary(p)
    is_cart = _is_cartridge(p)
    desc_up = p.get("description", "").upper()

    style_str = "Cartridge" if is_cart else "Spin-On"
    dims = ""
    if od and length:
        dims = f", {style_str}, OD {od} × L {length}"
    elif od:
        dims = f", {style_str}, OD {od}"

    rating_clause = f" {eff} efficiency ({std})."
    thread_clause = f" Thread {thread}." if thread else ""
    equip_clause  = f" Fits: {equip}." if equip else ""

    if "IN-LINE" in desc_up or "INLINE" in desc_up:
        return (
            f"ELIMFILTERS SYNTAPORE™ Fuel Filter — In-Line{dims}.{rating_clause}{thread_clause} "
            f"Compact in-line fuel filter removes contaminants from the fuel supply line — "
            f"protecting injectors and ensuring clean fuel delivery to your engine for "
            f"optimal fuel system protection.{equip_clause}"
        )

    return (
        f"ELIMFILTERS SYNTAPORE™ Fuel Filter{dims}.{rating_clause}{thread_clause} "
        f"SYNTAPORE™ advanced media removes harmful contaminants from your fuel system, "
        f"protecting injectors and ensuring clean fuel delivery to your engine "
        f"for consistent performance and reduced operating costs.{equip_clause}"
    )


def _build_drycore(p: dict) -> str:
    """DRYCORE™ — Air dryers (desiccant, compressed air)."""
    od     = _mm(_attr(p, "Outer Diameter"))
    length = _mm(_attr(p, "Length"))
    thread = _attr(p, "Thread Size")
    equip  = _equipment_summary(p)
    is_cart = _is_cartridge(p)

    style_str = "Cartridge" if is_cart else "Spin-On"
    dims = ""
    if od and length:
        dims = f", {style_str}, OD {od} × L {length}"
    elif od:
        dims = f", {style_str}, OD {od}"

    thread_clause = f" Thread {thread}." if thread else ""
    equip_clause  = f" Fits: {equip}." if equip else ""

    return (
        f"ELIMFILTERS DRYCORE™ Air Dryer{dims}.{thread_clause} "
        f"Filters out water vapor, oil vapor, and contaminants from compressed air "
        f"before they reach air tanks and valves — ensuring optimal system uptime "
        f"and protecting pneumatic components. Trust your compressed air system "
        f"with DRYCORE™ integrated desiccant protection.{equip_clause}"
    )


def _build_cooltech(p: dict) -> str:
    """COOLTECH™ — Coolant filters and silicone hoses."""
    od      = _mm(_attr(p, "Outer Diameter"))
    length  = _mm(_attr(p, "Length"))
    thread  = _attr(p, "Thread Size")
    equip   = _equipment_summary(p)
    is_cart = _is_cartridge(p)
    desc_up = p.get("description", "").upper()

    style_str = "Cartridge" if is_cart else "Spin-On"
    dims = ""
    if od and length:
        dims = f", {style_str}, OD {od} × L {length}"
    elif od:
        dims = f", {style_str}, OD {od}"

    thread_clause = f" Thread {thread}." if thread else ""
    equip_clause  = f" Fits: {equip}." if equip else ""

    if "HOSE" in desc_up:
        hose_type = "Heater Hose" if "HEATER" in desc_up else "Coolant Hose"
        hose_dims = ""
        if od and length:
            hose_dims = f", ID {od} × L {length}"
        elif od:
            hose_dims = f", ID {od}"
        return (
            f"ELIMFILTERS COOLTECH™ {hose_type}{hose_dims}. "
            f"Premium silicone coolant hose engineered for high-temperature engine cooling systems. "
            f"Maintains flexibility and seal integrity across extreme temperature cycles — "
            f"preventing coolant leaks and ensuring reliable thermal management.{equip_clause}"
        )

    if "HEAD ASSEMBLY" in desc_up or "ASSEMBLY" in desc_up:
        return (
            f"ELIMFILTERS COOLTECH™ Coolant Filter Assembly{dims}.{thread_clause} "
            f"Precision housing for coolant filtration system. Engineered for reliable "
            f"sealing and easy service access in heavy-duty cooling circuit applications.{equip_clause}"
        )

    return (
        f"ELIMFILTERS COOLTECH™ Coolant Filter{dims}.{thread_clause} "
        f"COOLTECH™ precision micro-filtration for engine coolant circuits removes particulates "
        f"and maintains coolant integrity — extending coolant service life, reducing "
        f"corrosion risk, and protecting against cavitation in high-cycle cooling systems.{equip_clause}"
    )


def generate_description(product: dict, category: str) -> str:
    tech = _resolve_tech(product, category)
    if tech == "MACROCORE™":
        return _build_macrocore(product)
    elif tech == "INTAKCORE™":
        return _build_intakcore(product)
    elif tech == "MICROKAPPA™":
        return _build_microkappa(product)
    elif tech == "SYNTRAX™":
        return _build_syntrax(product)
    elif tech == "NANOFORCE™":
        return _build_nanoforce(product, category)
    elif tech == "SYNTAPORE™":
        return _build_syntapore(product)
    elif tech == "AQUAGUARD™":
        return _build_aquaguard(product, category)
    elif tech == "DRYCORE™":
        return _build_drycore(product)
    elif tech == "COOLTECH™":
        return _build_cooltech(product)
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
