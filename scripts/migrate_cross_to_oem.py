"""
Renombra el campo cross_references → oem_codes en todos los *_results.json
del directorio actual. Ejecutar una sola vez.
"""
import json, os, glob

files = glob.glob("*_results.json") + glob.glob("*_progress.json")
for path in files:
    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    changed = False

    # results.json es lista; progress.json tiene key "results"
    records = data if isinstance(data, list) else data.get("results", [])
    for r in records:
        if isinstance(r, dict) and "cross_references" in r:
            r["oem_codes"] = r.pop("cross_references")
            changed = True

    if changed:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✅ {path}")
    else:
        print(f"—  {path} (sin cambios)")
