"""
analyze_general_gap.py
Compara general_part_numbers.json contra el universo de las 8 categorías existentes.

Requiere:
  scripts/general_part_numbers.json  (generado por collect_general_parts.py)

Lee:
  scripts/donaldson_lube_results.json
  scripts/donaldson_fuel_results.json
  scripts/donaldson_hydraulic_results.json
  scripts/donaldson_air_results.json
  scripts/donaldson_air-intake_results.json
  scripts/donaldson_cabin_results.json
  scripts/donaldson_air-dryer_results.json
  scripts/donaldson_coolant_results.json

Output:
  scripts/DONALDSON_GENERAL_GAP_ANALYSIS.md
  scripts/general_gap_new_parts.json   — solo los part numbers nuevos

Usage:
  python scripts/analyze_general_gap.py
"""

import json
import os
import re
from collections import defaultdict
from datetime import date

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

GENERAL_FILE = os.path.join(SCRIPT_DIR, "general_part_numbers.json")
REPORT_FILE  = os.path.join(SCRIPT_DIR, "DONALDSON_GENERAL_GAP_ANALYSIS.md")
GAP_FILE     = os.path.join(SCRIPT_DIR, "general_gap_new_parts.json")

CATEGORY_FILES = {
    "lube":       "donaldson_lube_results.json",
    "fuel":       "donaldson_fuel_results.json",
    "hydraulic":  "donaldson_hydraulic_results.json",
    "air":        "donaldson_air_results.json",
    "air-intake": "donaldson_air-intake_results.json",
    "cabin":      "donaldson_cabin_results.json",
    "air-dryer":  "donaldson_air-dryer_results.json",
    "coolant":    "donaldson_coolant_results.json",
}

# Patrones de nombre para clasificación tentativa de partes desconocidas
FILTER_TYPE_PATTERNS = [
    (r"^P\d",       "lube/hydraulic/fuel (P-series)"),
    (r"^DBL",       "lube (DBL bulk)"),
    (r"^DBF",       "fuel (DBF bulk)"),
    (r"^B\d",       "air/hydraulic (B-series)"),
    (r"^G\d",       "air-intake/cabin"),
    (r"^EW\d",      "cabin/air (EW-series)"),
    (r"^W\d",       "lube/hydraulic (W-series spin-on)"),
    (r"^HMK",       "hydraulic"),
    (r"^K\d",       "air intake"),
    (r"^DP\d",      "air-dryer"),
    (r"^DBA",       "air-dryer"),
    (r"^FFP",       "fuel"),
    (r"^P5",        "likely lube or fuel"),
    (r"^1R",        "CAT cross-reference"),
]


def guess_filter_type(part: str) -> str:
    for pattern, label in FILTER_TYPE_PATTERNS:
        if re.match(pattern, part, re.IGNORECASE):
            return label
    return "unknown"


def load_general() -> list:
    with open(GENERAL_FILE, encoding="utf-8") as f:
        return json.load(f)


def load_existing_universe() -> dict:
    """Returns {part_number: category}"""
    universe = {}
    counts   = {}
    for cat, filename in CATEGORY_FILES.items():
        path = os.path.join(SCRIPT_DIR, filename)
        try:
            with open(path, encoding="utf-8") as f:
                data = json.load(f)
            counts[cat] = len(data)
            for rec in data:
                pn = (rec.get("part_number") or "").strip().upper()
                if pn:
                    universe[pn] = cat
        except FileNotFoundError:
            print(f"  AVISO: No encontrado {filename} — omitido")
            counts[cat] = 0
    return universe, counts


def classify_new_parts(new_parts: list) -> dict:
    """Groups new parts by guessed filter type."""
    groups = defaultdict(list)
    for p in new_parts:
        g = guess_filter_type(p)
        groups[g].append(p)
    return dict(groups)


def generate_report(general: list, universe: dict, category_counts: dict, new_parts: list, groups: dict) -> str:
    total_general  = len(general)
    total_existing = len(universe)
    duplicates     = total_general - len(new_parts)
    coverage_pct   = (duplicates / total_general * 100) if total_general else 0
    today          = date.today().isoformat()

    lines = []
    lines.append(f"# DONALDSON GENERAL CATALOG — GAP ANALYSIS")
    lines.append(f"Generated: {today}")
    lines.append("")
    lines.append("## Resumen ejecutivo")
    lines.append("")
    lines.append(f"| Métrica | Valor |")
    lines.append(f"|---------|-------|")
    lines.append(f"| Part numbers en catálogo general | **{total_general:,}** |")
    lines.append(f"| Part numbers en 8 categorías existentes | **{total_existing:,}** |")
    lines.append(f"| Duplicados (ya scrapeados) | **{duplicates:,}** |")
    lines.append(f"| **Productos nuevos (gap)** | **{len(new_parts):,}** |")
    lines.append(f"| Cobertura actual | **{coverage_pct:.1f}%** |")
    lines.append("")

    lines.append("## Cobertura por categoría existente")
    lines.append("")
    lines.append(f"| Categoría | Productos scrapeados |")
    lines.append(f"|-----------|---------------------|")
    for cat, count in sorted(category_counts.items()):
        lines.append(f"| {cat} | {count:,} |")
    lines.append(f"| **TOTAL** | **{total_existing:,}** |")
    lines.append("")

    if not new_parts:
        lines.append("## Conclusión")
        lines.append("")
        lines.append("**Gap = 0.** Las 8 categorías actuales cubren el 100% del catálogo general.")
        lines.append("No se requiere scraping adicional.")
        return "\n".join(lines)

    lines.append(f"## Productos nuevos detectados ({len(new_parts):,})")
    lines.append("")
    lines.append("Clasificación tentativa por prefijo de part number:")
    lines.append("")
    lines.append(f"| Tipo inferido | Cantidad | Ejemplos |")
    lines.append(f"|---------------|----------|---------|")
    for gtype, parts in sorted(groups.items(), key=lambda x: -len(x[1])):
        examples = ", ".join(parts[:5])
        if len(parts) > 5:
            examples += f" … +{len(parts)-5}"
        lines.append(f"| {gtype} | {len(parts):,} | `{examples}` |")
    lines.append("")

    lines.append("## Lista completa de productos nuevos")
    lines.append("")
    lines.append(f"Exportada a: `general_gap_new_parts.json` ({len(new_parts):,} part numbers)")
    lines.append("")
    lines.append("Primeros 50:")
    lines.append("")
    lines.append("```")
    for p in sorted(new_parts)[:50]:
        lines.append(p)
    if len(new_parts) > 50:
        lines.append(f"… y {len(new_parts) - 50} más en general_gap_new_parts.json")
    lines.append("```")
    lines.append("")

    lines.append("## Recomendación")
    lines.append("")
    if len(new_parts) < 50:
        lines.append("Gap pequeño (<50 productos). Evaluar manualmente antes de crear nueva categoría.")
    elif len(new_parts) < 500:
        lines.append("Gap moderado. Revisar clasificación tentativa y decidir si agrega nueva categoría al scraper.")
    else:
        lines.append("Gap significativo (>500 productos). Considerar scraping de categoría 'general' como categoría adicional.")
    lines.append("")
    lines.append("**Nota:** La clasificación por prefijo es tentativa. Confirmar contra la página del producto.")

    return "\n".join(lines)


def main():
    if not os.path.exists(GENERAL_FILE):
        print(f"ERROR: No encontrado {GENERAL_FILE}")
        print("Primero corre: python scripts/collect_general_parts.py")
        return

    print("Cargando catálogo general…")
    general = [p.strip().upper() for p in load_general() if p.strip()]
    print(f"  {len(general):,} part numbers en catálogo general")

    print("Cargando universo existente (8 categorías)…")
    universe, category_counts = load_existing_universe()
    print(f"  {len(universe):,} part numbers en universo existente")

    general_set  = set(general)
    universe_set = set(universe.keys())
    new_parts    = sorted(general_set - universe_set)
    duplicates   = sorted(general_set & universe_set)

    print(f"\nResultados:")
    print(f"  Total general   : {len(general):,}")
    print(f"  Ya existentes   : {len(duplicates):,}")
    print(f"  Nuevos (gap)    : {len(new_parts):,}")
    coverage = len(duplicates) / len(general) * 100 if general else 0
    print(f"  Cobertura       : {coverage:.1f}%")

    groups = classify_new_parts(new_parts)

    report = generate_report(general, universe, category_counts, new_parts, groups)
    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        f.write(report)
    print(f"\nReporte → {REPORT_FILE}")

    with open(GAP_FILE, "w", encoding="utf-8") as f:
        json.dump(new_parts, f, ensure_ascii=False, indent=2)
    print(f"Gap list → {GAP_FILE}")


if __name__ == "__main__":
    os.chdir(SCRIPT_DIR)
    main()
