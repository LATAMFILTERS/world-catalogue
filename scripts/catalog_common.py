"""
catalog_common.py — Lógica compartida para construir catálogos ELIMFILTERS
desde datos scrapeados (Donaldson, Fleetguard).

Reglas de SKU ELIMFILTERS (confirmadas en import_donaldson.py):
    EL8 — Lube/Oil          EF9 — Fuel                ES9 — Fuel Water Separator
    ET9 — Fuel Turbine FH   EA1 — Air Filter          EA2 — Air Filter Housing
    EH6 — Hydraulic         EW7 — Coolant/Water       EC1 — Cabin/AC
    ED4 — Air Dryer         EK5 — Kit HD              EK3 — Kit LD

    Formato: prefijo + últimos 4 dígitos, SIN guiones (ej. EF90047)
"""

import re

# Prefijo ELIM → Tecnología asignada
TECH_MAP = {
    "EL8": "SYNTRAX™",
    "EF9": "NANOFORCE™",
    "ES9": "AQUAGUARD™",
    "ET9": "AQUAGUARD/SERIES™",
    "EA1": "MACROCORE™",
    "EA2": "INTEKCORE™",
    "EH6": "SYNTEPORE™",
    "EW7": "COOLTECH™",
    "EC1": "MICROKAPPA™",
    "ED4": "DRYCORE™",
    "EC5": "DRYCORE™",   # crankcase ventilation
    "EK5": "MULTICORE™",
    "EK3": "MULTICORE™",
}

# Tipo legible por prefijo
TYPE_MAP = {
    "EL8": "Lube Filter",
    "EF9": "Fuel Filter",
    "ES9": "Fuel Filter - Water Separator",
    "ET9": "Fuel Filter - Turbine",
    "EA1": "Air Filter",
    "EA2": "Air Filter Housing",
    "EH6": "Hydraulic Filter",
    "EW7": "Coolant Filter",
    "EC1": "Cabin Filter",
    "ED4": "Air Dryer",
    "EC5": "Crankcase Ventilation Filter",
    "EK5": "Kit",
    "EK3": "Kit",
}


# ─── SKU generation ──────────────────────────────────────────────────────────

def last4_digits(code: str) -> str:
    digits = re.sub(r"[^0-9]", "", code or "")
    return digits[-4:] if len(digits) >= 4 else digits.zfill(4)


def rotate_left(s: str) -> str:
    return s[1:] + s[0] if s else s


def make_sku(prefix: str, code: str, used: set) -> str:
    """Genera SKU único: prefijo + 4 dígitos, rotando para evitar colisión."""
    d = last4_digits(code)
    candidate = prefix + d
    for _ in range(9):
        if candidate not in used:
            used.add(candidate)
            return candidate
        d = rotate_left(d)
        candidate = prefix + d
    for i in range(1000, 9999):
        candidate = prefix + str(i)
        if candidate not in used:
            used.add(candidate)
            return candidate
    raise ValueError(f"No unique SKU for {prefix}/{code}")


# ─── Clasificación de tipo de filtro ─────────────────────────────────────────

def elim_prefix_from_fleetguard(code: str, category: str = "") -> str:
    """
    Mapea código Fleetguard → prefijo ELIM.

    Prefijos de código FG:
      AF  = Air Filter primary        → EA1
      AH  = Air Filter Housing        → EA2
      AP  = Air Precleaner            → EA1
      SA  = Safety/Secondary Air      → EA1
      PA  = Panel Air Filter          → EA1
      SP  = Safety Panel Air          → EA1
      LF  = Lube Filter               → EL8
      FF  = Fuel Filter               → EF9
      FT  = Fuel Filter Turbine       → ET9
      FS  = Fuel/Water Separator      → ES9
      HF  = Hydraulic Filter          → EH6
      AK  = Hydraulic Accessory       → EH6
      WF  = Coolant/Water Filter      → EW7
      WS  = Coolant/Water Separator   → EW7
      CA  = Cabin Air Filter          → EC1
      DR  = Air Dryer                 → ED4
      AD  = Air Dryer                 → ED4
      CV  = Crankcase Ventilation     → EL8 (lube circuit)
    """
    c = (code or "").upper().strip()

    # By FG code prefix (ordered: longer prefixes first to avoid partial matches)
    rules = [
        ("FS",  "ES9"),   # Fuel/Water Separator
        ("FT",  "ET9"),   # Fuel Turbine
        ("FF",  "EF9"),   # Fuel Filter
        ("AP",  "EA1"),   # Air Precleaner
        ("AF",  "EA1"),   # Air Filter primary
        ("AH",  "EA2"),   # Air Housing
        ("AK",  "EH6"),   # Hydraulic Accessory
        ("SA",  "EA1"),   # Safety/Secondary Air
        ("SP",  "EA1"),   # Safety Panel Air
        ("PA",  "EA1"),   # Panel Air Filter
        ("LF",  "EL8"),   # Lube Filter
        ("HF",  "EH6"),   # Hydraulic Filter
        ("WF",  "EW7"),   # Coolant Filter
        ("WS",  "EW7"),   # Coolant Separator
        ("CA",  "EC1"),   # Cabin Filter
        ("DR",  "ED4"),   # Air Dryer
        ("AD",  "ED4"),   # Air Dryer
        ("CV",  "EL8"),   # Crankcase Ventilation (lube circuit)
    ]
    for pfx, elim in rules:
        if c.startswith(pfx):
            return elim

    # Fallback by scraped category name (all 18 FG categories covered)
    cat = (category or "").lower().strip()
    cat_map = {
        # Air
        "air-primary-secondary":        "EA1",
        "air-precleaners":              "EA1",
        "air-housings":                 "EA2",
        "panel-air-filters":            "EA1",
        # Lube
        "lube-spin-on":                 "EL8",
        "lube-cartridge":               "EL8",
        "lube-centrifuge":              "EL8",
        "crankcase-ventilation":        "EL8",
        # Fuel
        "fuel-spin-on":                 "EF9",
        "fuel-cartridge":               "EF9",
        "fuel-inline":                  "EF9",
        "fuel-spinon-water-sep":        "ES9",
        "fuel-cartridge-water-sep":     "ES9",
        # Hydraulic
        "hydraulic-cartridge":          "EH6",
        "hydraulic-spin-on":            "EH6",
        "hydraulic-filter-accessories": "EH6",
        # Coolant
        "coolant-filters":              "EW7",
        # Cabin
        "cabin-air-filters":            "EC1",
        # Air dryer
        "air-dryer":                    "ED4",
        # Generic fallbacks
        "air":     "EA1",
        "lube":    "EL8",
        "fuel":    "EF9",
        "hydraulic": "EH6",
        "coolant": "EW7",
        "cabin":   "EC1",
        "dryer":   "ED4",
    }
    if cat in cat_map:
        return cat_map[cat]

    # Partial match fallback
    for key, prefix in cat_map.items():
        if key in cat:
            return prefix

    return "EF9"  # safe default


def elim_prefix_from_donaldson(category_key: str, attributes: dict = None) -> str:
    """Mapea categoría Donaldson → prefijo ELIM."""
    cat_map = {
        "lube": "EL8", "fuel": "EF9", "air": "EA1", "air_housing": "EA2",
        "hydraulic": "EH6", "coolant": "EW7", "cabin": "EC1", "air_dryer": "ED4",
    }
    prefix = cat_map.get(category_key, "EF9")

    # Refinar fuel → water separator
    if prefix == "EF9" and attributes:
        blob = " ".join(str(v) for v in attributes.values()).upper()
        if any(k in blob for k in ("WATER SEP", "SEPARATOR", "FUEL/WATER", "COALESC")):
            return "ES9"
    return prefix


def normalize_part(code: str) -> str:
    """Normaliza un part number: mayúsculas, sin espacios."""
    return re.sub(r"\s+", "", (code or "").upper())
