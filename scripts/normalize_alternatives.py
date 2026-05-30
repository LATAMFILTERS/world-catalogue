"""
normalize_alternatives.py — Hace bidireccionales los alternatives en todos los *_results.json
Si A → B existe, agrega B → A si no está.
"""
import json, os, glob

files = glob.glob("donaldson_*_results.json")
if not files:
    print("No se encontraron archivos donaldson_*_results.json")
    exit()

for filepath in sorted(files):
    with open(filepath, encoding="utf-8") as f:
        prods = json.load(f)

    by_pn = {p["part_number"]: p for p in prods}
    added = 0

    for p in prods:
        pn = p["part_number"]
        for alt in list(p.get("alternatives", [])):
            if alt in by_pn:
                rev = by_pn[alt].setdefault("alternatives", [])
                if pn not in rev:
                    rev.append(pn)
                    added += 1

    tmp = filepath + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(prods, f, ensure_ascii=False, indent=2)
    os.replace(tmp, filepath)

    print(f"{filepath}: {added} relaciones bidireccionales añadidas")
