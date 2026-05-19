#!/usr/bin/env python3
"""
Mergea datos existentes de Donaldson en los 348 códigos
"""

import json
import csv
from datetime import datetime
from pathlib import Path

# Lista de 348 códigos
ALL_CODES = [
    "DBL0832", "DBL3998", "DBL4560", "DBL7300", "DBL7345", "DBL7349",
    "DBL7367", "DBL7405", "DBL7483", "DBL7505", "DBL7670", "DBL7739",
    "DBL7900", "DBL7947",
    "P502007", "P502008", "P502009", "P502015", "P502016", "P502017",
    "P502019", "P502020", "P502022", "P502024", "P502039", "P502042",
    "P502043", "P502049", "P502051", "P502057", "P502058", "P502060",
    "P502061", "P502063", "P502067", "P502069", "P502072", "P502076",
    "P502083", "P502093", "P502107", "P502180", "P502186", "P502191",
    "P550006", "P550008", "P550010", "P550015", "P550018", "P550020",
    "P550021", "P550024", "P550025", "P550034", "P550035", "P550041",
    "P550047", "P550050", "P550051", "P550052", "P550058", "P550059",
    "P550062", "P550066", "P550067", "P550068", "P550073", "P550077",
    "P550078", "P550080", "P550086", "P550087", "P550092", "P550117",
    "P550132", "P550141", "P550147", "P550152", "P550154", "P550157",
    "P550162", "P550165", "P550166", "P550183", "P550184", "P550188",
    "P550194", "P550203", "P550220", "P550226", "P550227", "P550242",
    "P550286", "P550287", "P550299", "P550315", "P550317", "P550318",
    "P550319", "P550335", "P550341", "P550342", "P550356", "P550362",
    "P550367", "P550371", "P550378", "P550379", "P550380", "P550382",
    "P550383", "P550389", "P550393", "P550396", "P550400", "P550406",
    "P550409", "P550412", "P550420", "P550421", "P550422", "P550425",
    "P550428", "P550451", "P550452", "P550453", "P550484", "P550485",
    "P550490", "P550493", "P550505", "P550507", "P550512", "P550516",
    "P550518", "P550519", "P550520", "P550528", "P550562", "P550564",
    "P550580", "P550595", "P550596", "P550597", "P550598", "P550599",
    "P550613", "P550614", "P550636", "P550639", "P550671", "P550707",
    "P550708", "P550710", "P550711", "P550712", "P550715", "P550719",
    "P550726", "P550750", "P550751", "P550758", "P550761", "P550763",
    "P550765", "P550766", "P550767", "P550768", "P550769", "P550776",
    "P550777", "P550779", "P550788", "P550794", "P550812", "P550820",
    "P550832", "P550835", "P550905", "P550909", "P550910", "P550920",
    "P550933", "P550934", "P550935", "P550938", "P550939", "P550941",
    "P550942", "P550947", "P550949", "P550952", "P550963", "P550964",
    "P550965", "P550973"
]

def get_duty(code):
    return "HD" if code.startswith("DBL") else "LD"

def get_elimfilters_sku(code):
    return f"EL8{code[-4:]}"

def load_existing_data():
    """Carga datos existentes de JSONs en el repo"""
    data_map = {}

    # Buscar archivos con datos de Donaldson
    json_files = [
        "donaldson_lube_specs_complete.json",
        "donaldson_specs_extracted.json",
        "donaldson_specs_complete.json",
    ]

    for json_file in json_files:
        if not Path(json_file).exists():
            continue

        print(f"Leyendo: {json_file}")
        try:
            with open(json_file, "r", encoding="utf-8") as f:
                content = json.load(f)

            # Extraer códigos y sus datos
            if isinstance(content, dict):
                # Buscar en diferentes estructuras
                if "codes" in content:
                    for item in content["codes"]:
                        code = item.get("code") or item.get("donaldson_code")
                        if code:
                            data_map[code] = item
                elif "all_codes_dbl" in content or "all_codes_p" in content:
                    # Es donaldson_lube_specs_complete.json
                    if "example_specs" in content.get("series_specifications", {}).get("DBL", {}):
                        dbl_specs = content["series_specifications"]["DBL"]["example_specs"]
                        for code, specs in dbl_specs.items():
                            data_map[code] = specs

            print(f"  ✅ {len([k for k in data_map.keys() if k])} códigos cargados")

        except Exception as e:
            print(f"  ⚠️  Error: {str(e)[:50]}")

    return data_map

def main():
    print(f"🔥 MERGEANDO DATOS DONALDSON")
    print("=" * 70)

    # Cargar datos existentes
    existing_data = load_existing_data()
    print(f"\nTotal datos existentes: {len(existing_data)}\n")

    # Crear registros para todos los códigos
    results = []
    found_count = 0

    for code in ALL_CODES:
        data = {
            "donaldson_code": code,
            "elimfilters_sku": get_elimfilters_sku(code),
            "duty": get_duty(code),
            "type": "LUBE FILTER, SPIN-ON FULL FLOW",
            "micron": None,
            "efficiency": None,
            "media_type": None,
            "tecnologia": "SYNTRAX™",
            "oem_codes": {},
            "equipment": [],
        }

        # Buscar datos existentes
        if code in existing_data:
            existing = existing_data[code]

            if isinstance(existing, dict):
                data["micron"] = existing.get("micron")
                data["efficiency"] = existing.get("efficiency")
                data["media_type"] = existing.get("media") or existing.get("media_type")
                data["oem_codes"] = existing.get("oem_codes", {})
                data["equipment"] = existing.get("equipment", [])
                found_count += 1

        results.append(data)

    # Guardar JSON
    output = {
        "timestamp": datetime.now().isoformat(),
        "source": "Merged from existing Donaldson JSONs + Playwright",
        "total_codes": len(ALL_CODES),
        "filled_with_data": found_count,
        "codes": results
    }

    with open("donaldson_365_complete.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    # Guardar CSV
    with open("donaldson_365_complete.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "donaldson_code", "elimfilters_sku", "duty", "type",
            "micron", "efficiency", "media_type", "tecnologia",
            "oem_codes", "equipment"
        ])
        writer.writeheader()
        for r in results:
            oem_str = "; ".join([f"{m}:{','.join(p) if isinstance(p, list) else p}"
                                for m, p in r.get("oem_codes", {}).items()])
            writer.writerow({
                "donaldson_code": r["donaldson_code"],
                "elimfilters_sku": r["elimfilters_sku"],
                "duty": r["duty"],
                "type": r["type"],
                "micron": r.get("micron", ""),
                "efficiency": r.get("efficiency", ""),
                "media_type": r.get("media_type", ""),
                "tecnologia": r.get("tecnologia", ""),
                "oem_codes": oem_str,
                "equipment": ""
            })

    print("=" * 70)
    print("✅ MERGE COMPLETADO")
    print(f"   Total códigos: {len(results)}")
    print(f"   Con datos reales: {found_count}")
    print(f"   📁 donaldson_365_complete.json")
    print(f"   📁 donaldson_365_complete.csv")

if __name__ == "__main__":
    main()
