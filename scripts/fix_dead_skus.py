"""
fix_dead_skus.py — recupera los 26 productos muertos (404 por SKU en mayúsculas).

Causa: collect_product_links mayusculizaba el SKU. 'prod340743' → 'PROD340743' → 404.
Fix:   baja a minúsculas el segmento SKU en el progreso y marca los muertos
       como NO procesados para que el scraper los repita con la URL correcta.

Uso:
    1. python fix_dead_skus.py        (prepara el progreso)
    2. python scraper_donaldson_lube.py   (re-scrapea SOLO los 26)

Re-ejecutar es seguro: solo toca productos con 0 atributos.
"""

import json
import os

PROGRESS_FILE = "donaldson_lube_progress.json"
RESULTS_FILE  = "donaldson_lube_results.json"


def lower_sku(path: str) -> str:
    """ 'P502596/PROD340743' → 'P502596/prod340743'. Numéricos sin cambio. """
    if "/" not in path:
        return path
    part, sku = path.split("/", 1)
    return f"{part}/{sku.lower()}"


def main():
    if not os.path.exists(PROGRESS_FILE):
        print(f"ERROR: no existe {PROGRESS_FILE} en esta carpeta.")
        return

    with open(PROGRESS_FILE, encoding="utf-8") as f:
        prog = json.load(f)

    results = prog.get("results", [])

    # Productos muertos = 0 atributos (los 404)
    dead = {r["part_number"] for r in results if len(r.get("attributes", {})) == 0}
    print(f"Muertos detectados: {len(dead)}")
    for d in sorted(dead):
        print(f"  - {d}")

    # 1. Bajar SKU a minúsculas en TODOS los paths (numéricos no se afectan)
    prog["part_numbers"] = [lower_sku(p) for p in prog.get("part_numbers", [])]

    # 2. Quitar muertos de 'done' → el scraper los repetirá
    prog["done"] = [d for d in prog.get("done", []) if d not in dead]

    # 3. Quitar muertos de 'results' → se vuelven a agregar limpios
    prog["results"] = [r for r in results if r["part_number"] not in dead]

    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(prog, f, ensure_ascii=False, indent=2)

    # Sincronizar el results.json final también
    if os.path.exists(RESULTS_FILE):
        with open(RESULTS_FILE, encoding="utf-8") as f:
            final = json.load(f)
        final = [r for r in final if r["part_number"] not in dead]
        with open(RESULTS_FILE, "w", encoding="utf-8") as f:
            json.dump(final, f, ensure_ascii=False, indent=2)

    print(f"\nListo. {len(dead)} marcados para re-scrape.")
    print("Ahora corre:  python scraper_donaldson_lube.py")


if __name__ == "__main__":
    main()
