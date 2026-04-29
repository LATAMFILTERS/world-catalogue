#!/usr/bin/env python3
"""
Scraper completo Playwright - Extrae datos reales de Donaldson para los 348 códigos
"""

import json
import csv
import time
import re
from datetime import datetime

try:
    from playwright.sync_api import sync_playwright
except:
    print("pip install playwright && playwright install chromium")
    exit(1)

# Lista de todos los 348 códigos
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
    if code.startswith("DBL"):
        return "HD"
    else:
        return "LD"

def get_elimfilters_sku(code):
    return f"EL8{code[-4:]}"

def parse_specs(text, html):
    """Extrae micron, efficiency, media y OEM del texto de la página"""
    specs = {}

    # Micron - varios formatos posibles
    for pattern in [
        r'(\d+)\s*[Mm]icron',
        r'(\d+)\s*µm',
        r'(\d+)\s*um\b',
        r'@ (\d+)',
    ]:
        m = re.search(pattern, text)
        if m:
            specs["micron"] = m.group(1)
            break

    # Efficiency - varios formatos
    for pattern in [
        r'(\d+(?:\.\d+)?)\s*%\s*@\s*\d+',
        r'(\d+(?:\.\d+)?)\s*%\s*(?:efficiency|Efficiency)',
        r'[Ee]fficiency[:\s]+(\d+(?:\.\d+)?)\s*%',
    ]:
        m = re.search(pattern, text)
        if m:
            full = re.search(r'\d+(?:\.\d+)?\s*%[^.]{0,30}', text[m.start():m.start()+50])
            specs["efficiency"] = full.group(0).strip() if full else m.group(0).strip()
            break

    # Media type
    for pattern in [
        r'[Mm]edia[:\s]+([A-Za-z\s\/]+?)(?:\n|,|\.)',
        r'(Synteq XP|Synteq|Cellulose|Synthetic|Celulosa)',
    ]:
        m = re.search(pattern, text)
        if m:
            specs["media_type"] = m.group(1).strip()
            break

    # OEM codes - buscar pares Fabricante: NúmDeParte
    oem_codes = {}
    oem_pattern = r'(CUMMINS|CATERPILLAR|CAT|VOLVO|MACK|DETROIT|JOHN DEERE|KOMATSU|ISUZU|KUBOTA|PERKINS|HINO|FORD|TOYOTA|HONDA|FRAM|BALDWIN|FLEETGUARD)[:\s]+([A-Z0-9\-]{5,20})'
    for mfr, part in re.findall(oem_pattern, text, re.IGNORECASE):
        mfr = mfr.upper()
        if mfr not in oem_codes:
            oem_codes[mfr] = []
        oem_codes[mfr].append(part.strip())
    specs["oem_codes"] = oem_codes

    return specs

def scrape_code(page, code):
    """Scrape un código específico - navega a producto y extrae specs"""
    search_url = f"https://shop.donaldson.com/store/en-us/search?q={code}"

    empty = {
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

    try:
        # Ir a búsqueda
        page.goto(search_url, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(2000)

        # Buscar link del producto en resultados
        product_url = None

        # Intentar encontrar link del producto específico
        links = page.query_selector_all("a[href]")
        for link in links:
            href = link.get_attribute("href") or ""
            # Buscar links que lleven al producto específico
            if code in href and "/store/" in href and "/search" not in href:
                product_url = href if href.startswith("http") else f"https://shop.donaldson.com{href}"
                break

        # Si encontramos URL de producto, navegar ahí
        if product_url:
            page.goto(product_url, wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(2000)

        # Obtener texto y HTML de la página actual
        text = page.locator("body").inner_text()
        html = page.content()

        # Parsear especificaciones
        specs = parse_specs(text, html)

        data = {**empty}
        data["micron"] = specs.get("micron")
        data["efficiency"] = specs.get("efficiency")
        data["media_type"] = specs.get("media_type")
        data["oem_codes"] = specs.get("oem_codes", {})

        return data, True

    except Exception as e:
        return empty, False

def main():
    print(f"🔥 SCRAPING DONALDSON - {len(ALL_CODES)} CÓDIGOS")
    print("=" * 70)

    results = []
    errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        for i, code in enumerate(ALL_CODES, 1):
            print(f"[{i}/{len(ALL_CODES)}] {code}...", end=" ", flush=True)

            data, success = scrape_code(page, code)
            results.append(data)

            if success:
                micron = data.get("micron", "?")
                print(f"✅ (micron: {micron})")
            else:
                print("⚠️  (sin datos)")
                errors.append(code)

            # Rate limiting
            time.sleep(1)

        browser.close()

    # Guardar resultados
    output = {
        "timestamp": datetime.now().isoformat(),
        "source": "shop.donaldson.com (Playwright scrape)",
        "total_requested": len(ALL_CODES),
        "successfully_extracted": len([r for r in results if r.get("micron")]),
        "failed": len(errors),
        "codes": results,
        "errors": errors
    }

    # JSON
    with open("donaldson_365_complete.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    # CSV
    with open("donaldson_365_complete.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "donaldson_code", "elimfilters_sku", "duty", "type",
            "micron", "efficiency", "media_type", "tecnologia",
            "oem_codes", "equipment"
        ])
        writer.writeheader()
        for r in results:
            oem_str = "; ".join([f"{m}:{','.join(p)}" for m, p in r.get("oem_codes", {}).items()])
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

    print()
    print("=" * 70)
    print("✅ SCRAPING COMPLETADO")
    print(f"   Exitosos: {len([r for r in results if r.get('micron')])}")
    print(f"   Con datos: {len([r for r in results if r.get('efficiency')])}")
    print(f"   Errores: {len(errors)}")
    print(f"   📁 donaldson_365_complete.json")
    print(f"   📁 donaldson_365_complete.csv")

if __name__ == "__main__":
    main()
