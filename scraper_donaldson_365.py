#!/usr/bin/env python3
"""
Donaldson 365 Lube Filter Scraper
Extrae especificaciones completas de cada código desde shop.donaldson.com
Genera mapeo ELIMFILTERS con EL8XXXX
"""

import json
import time
import csv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from datetime import datetime

# =====================
# CONFIGURACIÓN
# =====================

DONALDSON_CODES = [
    # DBL Series (14)
    "DBL0832", "DBL3998", "DBL4560", "DBL7300", "DBL7345", "DBL7349",
    "DBL7367", "DBL7405", "DBL7483", "DBL7505", "DBL7670", "DBL7739",
    "DBL7900", "DBL7947",
    # P500 Series (30)
    "P502007", "P502008", "P502009", "P502015", "P502016", "P502017",
    "P502019", "P502020", "P502022", "P502024", "P502039", "P502042",
    "P502043", "P502049", "P502051", "P502057", "P502058", "P502060",
    "P502061", "P502063", "P502067", "P502069", "P502072", "P502076",
    "P502083", "P502093", "P502107", "P502180", "P502186", "P502191",
    # P550 Series (sample - agregar todos 150)
    "P550006", "P550008", "P550010", "P550015", "P550018", "P550020",
    "P550021", "P550024", "P550025", "P550034", "P550035", "P550041",
]

# Diesel OEM para clasificar HD
DIESEL_OEM = [
    "CUMMINS", "CATERPILLAR", "CAT", "DETROIT DIESEL", "VOLVO",
    "MACK", "PERKINS", "YAMMER", "KUBOTA", "KOMATSU"
]

# =====================
# FUNCIONES
# =====================

def get_duty(oem_list):
    """Clasifica HD (diesel) o LD (gasolina/auto)"""
    oem_text = " ".join(oem_list).upper()
    for diesel in DIESEL_OEM:
        if diesel in oem_text:
            return "HD"
    return "LD"

def get_elimfilters_sku(donaldson_code):
    """Genera EL8 + últimos 4 dígitos"""
    last_4 = donaldson_code[-4:]
    return f"EL8{last_4}"

def scrape_donaldson_code(driver, code):
    """Extrae datos de una página de producto Donaldson"""

    # URL base - necesita ID numérico
    # Intentamos formato común
    url = f"https://shop.donaldson.com/store/en-us/search?q={code}"

    try:
        driver.get(url)
        time.sleep(3)

        # Buscar el primer resultado
        products = driver.find_elements(By.CLASS_NAME, "product-item")
        if not products:
            return None

        # Click en el primer producto
        products[0].click()
        time.sleep(3)

        data = {
            "donaldson_code": code,
            "elimfilters_sku": get_elimfilters_sku(code),
            "type": "LUBE FILTER, SPIN-ON FULL FLOW",
            "specifications": {},
            "oem_codes": [],
            "equipment": [],
            "duty": "UNKNOWN",
            "micron": None,
            "efficiency": None,
            "tecnologia": "SYNTRAX™"
        }

        # Extraer especificaciones (buscar en tablas)
        try:
            spec_rows = driver.find_elements(By.XPATH, "//tr")
            for row in spec_rows:
                cells = row.find_elements(By.TAG_NAME, "td")
                if len(cells) >= 2:
                    key = cells[0].text.strip()
                    value = cells[1].text.strip()
                    data["specifications"][key] = value

                    # Capturar micron y efficiency
                    if "micron" in key.lower():
                        data["micron"] = value
                    if "efficiency" in key.lower():
                        data["efficiency"] = value
        except:
            pass

        # Extraer OEM Cross References
        try:
            oem_table = driver.find_element(By.XPATH, "//table[@class='cross-reference']")
            oem_rows = oem_table.find_elements(By.XPATH, ".//tr")
            for row in oem_rows[1:]:  # Skip header
                cells = row.find_elements(By.TAG_NAME, "td")
                if len(cells) >= 2:
                    manufacturer = cells[0].text.strip()
                    part_num = cells[1].text.strip()
                    oem_code = f"{manufacturer}:{part_num}"
                    data["oem_codes"].append(oem_code)
        except:
            pass

        # Extraer Equipment
        try:
            equipment_section = driver.find_element(By.ID, "equipment")
            eq_rows = equipment_section.find_elements(By.XPATH, ".//tr")
            for row in eq_rows[1:]:  # Skip header
                cells = row.find_elements(By.TAG_NAME, "td")
                if len(cells) >= 3:
                    equipment_name = f"{cells[0].text} {cells[1].text}"
                    engine = cells[2].text if len(cells) > 2 else ""
                    data["equipment"].append(f"{equipment_name} ({engine})")
        except:
            pass

        # Clasificar Duty
        data["duty"] = get_duty(data["oem_codes"])

        return data

    except Exception as e:
        print(f"❌ Error scraping {code}: {str(e)}")
        return None

def main():
    print("🔥 DONALDSON 365 LUBE FILTER SCRAPER")
    print("=" * 70)
    print(f"Total códigos a extraer: {len(DONALDSON_CODES)}")
    print()

    # Iniciar Selenium
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    # Descomenta para headless: options.add_argument("--headless")

    driver = webdriver.Chrome(options=options)

    results = []
    errors = []

    try:
        for i, code in enumerate(DONALDSON_CODES, 1):
            print(f"[{i}/{len(DONALDSON_CODES)}] Extrayendo {code}...", end=" ", flush=True)

            data = scrape_donaldson_code(driver, code)

            if data:
                results.append(data)
                print(f"✅ (Duty: {data['duty']})")
            else:
                print("❌")
                errors.append(code)

            time.sleep(2)  # Rate limiting

    finally:
        driver.quit()

    # Guardar resultados
    output = {
        "timestamp": datetime.now().isoformat(),
        "source": "shop.donaldson.com",
        "total_requested": len(DONALDSON_CODES),
        "successfully_extracted": len(results),
        "failed": len(errors),
        "codes": results,
        "errors": errors
    }

    # JSON
    with open("donaldson_365_complete.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    # CSV
    if results:
        with open("donaldson_365_complete.csv", "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=[
                "donaldson_code", "elimfilters_sku", "duty", "micron", "efficiency",
                "tecnologia", "type", "oem_codes", "equipment"
            ])
            writer.writeheader()
            for r in results:
                writer.writerow({
                    "donaldson_code": r["donaldson_code"],
                    "elimfilters_sku": r["elimfilters_sku"],
                    "duty": r["duty"],
                    "micron": r.get("micron", ""),
                    "efficiency": r.get("efficiency", ""),
                    "tecnologia": r["tecnologia"],
                    "type": r["type"],
                    "oem_codes": "; ".join(r["oem_codes"]),
                    "equipment": "; ".join(r["equipment"])
                })

    # Resumen
    print()
    print("=" * 70)
    print("✅ EXTRACCIÓN COMPLETADA")
    print(f"   Exitosos: {len(results)}")
    print(f"   Errores: {len(errors)}")
    print(f"   📁 Guardado: donaldson_365_complete.json")
    print(f"   📁 Guardado: donaldson_365_complete.csv")

    if errors:
        print(f"\n⚠️  Códigos con error: {', '.join(errors)}")

if __name__ == "__main__":
    main()
