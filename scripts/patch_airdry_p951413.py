"""
patch_airdry_p951413.py — Inyecta crossrefs de P781466 en P951413
Donaldson renombró P781466 → P951413. Data capturada via --test P781466.
Sin Playwright — solo actualiza los JSONs locales.
"""
import json, os

NEW_CODE = "P951413"
PROGRESS_FILE = "donaldson_air-dryer_crossref_progress.json"
RESULTS_FILE  = "donaldson_air-dryer_results.json"

CROSSREFS_P781466 = {
    "BALDWIN": ["BA5374"],
    "BENDIX": ["272897", "5008414"],
    "BOSCH": ["1457434004", "1457434007", "1487434001", "1487434005", "1487434901", "1987434001"],
    "CARQUEST": ["96327"],
    "CROSLAND": ["9107"],
    "DAF": ["0699387", "699387"],
    "DEMAG": ["76117673"],
    "FIAAM": ["FT5315"],
    "FIAT": ["1907612", "2992261", "8123564", "8190948", "85127004", "98446957"],
    "FORD": ["4C452A131AA"],
    "FRAM": ["PH5693"],
    "GENERAL-MOTORS": ["89040662"],
    "GUD": ["Z316"],
    "HALDEX": ["31004109"],
    "HASTINGS": ["AD1"],
    "HENGST": ["T250W"],
    "HIFI": ["TB1374T"],
    "IRISBUS": ["8010002016"],
    "IVECO": ["1907612", "2992261", "8010002016", "8123564", "8190948"],
    "LAUTRETTE": ["ELD8100"],
    "LEYLAND-DAF": ["BBU8146", "BBU9424"],
    "LIEBHERR": ["571352308"],
    "LUBERFINER": ["LFP8654", "LFP8654M"],
    "MAHLE": ["AL10", "AL12", "AL3"],
    "MAN": ["79200361087", "79200361090", "81521020008", "81521020009", "81521020010", "81521020013", "81521020015", "81521020019", "81521086001", "82521020013"],
    "MANN": ["TB1374/13X", "TB1374/15X", "TB1374X"],
    "MANN-HUMMEL": ["4920859101", "81521020015", "81521020019", "TB1374", "TB1374X"],
    "MERCEDES-BENZ": ["0004290897", "0004291097", "0004291297", "0004293395", "0004293695", "0004293795", "0004300669", "4290897", "4291097", "4291297", "4293395", "4293595", "4293695", "4293795", "4300669", "4300969", "A0004293695", "A0004300969"],
    "MERITOR": ["R950011"],
    "SAKURA": ["AC7901"],
    "SCANIA": ["1375997"],
    "SOGEFI": ["FT5315"],
    "SOLARIS": ["1102751110"],
    "STEYR-DAIMLER-PUCH": ["79200361087", "79200361090"],
    "TECFIL": ["DSF0202"],
    "TECNOCAR": ["A606D"],
    "TERBERG": ["T22035192"],
    "UFI": ["2725900"],
    "VOLVO": ["1699132", "20410155", "3090268", "3090288", "30902886", "3091200", "3915558", "8159915"],
    "WABCO": ["4324100202", "4324102212", "4324102222", "4324102227", "4324102270", "4324202202"],
}

# Actualizar progress
with open(PROGRESS_FILE) as f:
    prog = json.load(f)
prog[NEW_CODE] = CROSSREFS_P781466
tmp = PROGRESS_FILE + ".tmp"
with open(tmp, "w") as f:
    json.dump(prog, f, ensure_ascii=False, indent=2)
os.replace(tmp, PROGRESS_FILE)
print(f"Progress: {NEW_CODE} → {len(CROSSREFS_P781466)} marcas")

# Actualizar results
with open(RESULTS_FILE) as f:
    products = json.load(f)
for p in products:
    if p.get("part_number", "").upper() == NEW_CODE:
        p["brand_crossrefs"] = CROSSREFS_P781466
        print(f"Results: {NEW_CODE} actualizado")
        break
with open(RESULTS_FILE, "w") as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print(f"DONE — {len(CROSSREFS_P781466)} marcas inyectadas en {NEW_CODE}")
