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
    Prefijos Fleetguard: AF=air, AP=air precleaner, LF=lube, FF=fuel,
    FS=fuel/water sep, HF=hydraulic, WF=water/coolant, CA/AF(cabin), DR=air dryer.
    """
    c = (code or "").upper().strip()

    # Por prefijo de letra del código Fleetguard
    rules = [
        ("FS",  "ES9"),   # Fuel/Water Separator
        ("AP",  "EA1"),   # Air Precleaner
        ("AF",  "EA1"),   # Air Filter
        ("AH",  "EA2"),   # Air Housing
        ("LF",  "EL8"),   # Lube
        ("FF",  "EF9"),   # Fuel
        ("HF",  "EH6"),   # Hydraulic
        ("WF",  "EW7"),   # Water/Coolant
        ("WS",  "EW7"),   # Water/Coolant
        ("CA",  "EC1"),   # Cabin
        ("DR",  "ED4"),   # Air Dryer
        ("AD",  "ED4"),   # Air Dryer
    ]
    for pfx, elim in rules:
        if c.startswith(pfx):
            return elim

    # Fallback por categoría scrapeada
    cat = (category or "").lower()
    cat_map = {
        "air-precleaners": "EA1", "air-primary": "EA1", "air-safety": "EA1",
        "air": "EA1", "lube": "EL8", "fuel": "EF9", "hydraulic": "EH6",
        "coolant": "EW7", "cabin": "EC1", "air_dryer": "ED4",
    }
    return cat_map.get(cat, "EF9")


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
