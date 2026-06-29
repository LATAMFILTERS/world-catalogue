"""
fix_dead_skus.py — re-encola productos incompletos para volver a scrapearlos.

Dos arreglos en un paso:
  1. SKU en mayúsculas → 404.  'prod340743' quedó 'PROD340743'.  Se baja a
     minúsculas el segmento SKU de todos los paths (los numéricos no cambian).
  2. Alternativas perdidas.  En la primera corrida no se activaba el tab
     "Alternate Parts" antes de leer, así que muchos quedaron en 0 Alt.

Re-encola TODO producto con 0 Attr (muerto/404) o 0 Alt, y los borra de los
resultados para que el scraper los repita con la URL y la lógica correctas.

Uso:
    1. python fix_dead_skus.py            (prepara el progreso)
    2. python scraper_donaldson_lube.py   (re-scrapea SOLO los incompletos)

Seguro de re-ejecutar: solo toca productos con 0 Attr o 0 Alt.
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

    # Incompletos = 0 Attr (404) o 0 Alt (alternativas no leídas)
    dead = {r["part_number"] for r in results if len(r.get("attributes", {})) == 0}
    no_alt = {r["part_number"] for r in results if len(r.get("alternatives", [])) == 0}
    requeue = dead | no_alt

    print(f"Muertos (0 Attr): {len(dead)}")
    print(f"Sin Alt (0 Alt):  {len(no_alt)}")
    print(f"Total a re-scrapear: {len(requeue)}")

    # 1. Bajar SKU a minúsculas en TODOS los paths (numéricos no se afectan)
    prog["part_numbers"] = [lower_sku(p) for p in prog.get("part_numbers", [])]

    # 2. Quitar incompletos de 'done' → el scraper los repetirá
    prog["done"] = [d for d in prog.get("done", []) if d not in requeue]

    # 3. Quitar incompletos de 'results' → se vuelven a agregar limpios
    prog["results"] = [r for r in results if r["part_number"] not in requeue]

    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(prog, f, ensure_ascii=False, indent=2)

    # Sincronizar el results.json final también
    if os.path.exists(RESULTS_FILE):
        with open(RESULTS_FILE, encoding="utf-8") as f:
            final = json.load(f)
        final = [r for r in final if r["part_number"] not in requeue]
        with open(RESULTS_FILE, "w", encoding="utf-8") as f:
            json.dump(final, f, ensure_ascii=False, indent=2)

    print(f"\nListo. {len(requeue)} marcados para re-scrape.")
    print("Ahora corre:  python scraper_donaldson_lube.py")


if __name__ == "__main__":
    main()
