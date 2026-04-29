#!/usr/bin/env python3
"""
Donaldson 365 Lube Filter Scraper
Extrae especificaciones completas de cada código desde shop.donaldson.com
Genera mapeo ELIMFILTERS con EL8XXXX
"""

import json
import time
import csv
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from datetime import datetime

# =====================
# CONFIGURACIÓN
# =====================

# Test con 3 códigos primero; después usar ALL_DONALDSON_CODES para los 365
TEST_CODES = ["DBL0832", "DBL3998", "P502007"]

# Todos los 365 códigos
ALL_DONALDSON_CODES = [
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
    "P502194", "P502203", "P502222", "P502223", "P502225", "P502433",
    "P502458", "P502464", "P502465", "P502476", "P502477", "P502503",
    "P502549", "P502568", "P502596", "P502597", "P506077",
    # P550 Series (150)
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
    "P550965", "P550973",
    # P551-P555 Series (140+)
    "P551005", "P551014", "P551015", "P551016", "P551017", "P551018",
    "P551019", "P551042", "P551088", "P551100", "P551102", "P551108",
    "P551132", "P551133", "P551145", "P551251", "P551257", "P551263",
    "P551264", "P551267", "P551285", "P551297", "P551336", "P551343",
    "P551352", "P551364", "P551381", "P551400", "P551402", "P551441",
    "P551603", "P551604", "P551670", "P551763", "P551783", "P551784",
    "P551807", "P551808", "P551910", "P552025", "P552050", "P552100",
    "P552206", "P552231", "P552361", "P552363", "P552414", "P552421",
    "P552422", "P552451", "P552465", "P552518", "P552562", "P552819",
    "P552849", "P553000", "P553161", "P553191", "P553315", "P553335",
    "P553400", "P553404", "P553411", "P553548", "P553634", "P553712",
    "P553746", "P553771", "P553871", "P554004", "P554005", "P554105",
    "P554136", "P554206", "P554403", "P554407", "P554408", "P554560",
    "P554770", "P554925", "P555570", "P555616", "P555680", "P556352",
    "P557207", "P557356", "P557382", "P557500", "P557505", "P557780",
    "P558250", "P558329", "P558425", "P558462", "P558615", "P558616",
    "P559000", "P559126", "P559127", "P559128", "P559129", "P559130",
    "P559418", "P574862", "P574863", "P577065", "P577066", "P577086",
    "P579196", "P579275", "P579280", "P579787", "P580780", "P580781",
    "P580794", "P581330", "P582021", "P582090", "P582506", "P583710",
    "P583711", "P583712", "P583713", "P583936", "P584026", "P584063",
    "P584244", "P584522", "P584944", "P585315", "P764896", "P953329",
    "P956094", "P957929", "P959206", "P959217", "P959218", "P959772",
    "P959936",
    # P1xx Series (legacy/other)
    "P167405", "P167670", "P167947", "P169071", "P173489", "P173998",
    "P177300", "P177345", "P177349", "P177367", "P177483", "P177739",
    "P179353",
]

# Usar TEST_CODES para prueba; cambiar a ALL_DONALDSON_CODES para ejecutar completo
DONALDSON_CODES = TEST_CODES

# Diesel OEM para clasificar HD
DIESEL_OEM = [
    "CUMMINS", "CATERPILLAR", "CAT", "DETROIT DIESEL", "VOLVO",
    "MACK", "PERKINS", "YAMMER", "KUBOTA", "KOMATSU", "ISUZU",
    "MITSUBISHI", "HINO"
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

def extract_specifications(driver, code):
    """Extrae tabla de especificaciones de la página"""
    specs = {}
    try:
        # Buscar todas las filas de la tabla principal
        tables = driver.find_elements(By.TAG_NAME, "table")
        for table in tables:
            rows = table.find_elements(By.TAG_NAME, "tr")
            for row in rows:
                cells = row.find_elements(By.TAG_NAME, "td")
                if len(cells) >= 2:
                    key = cells[0].text.strip()
                    value = cells[1].text.strip()
                    if key and value:
                        specs[key] = value

        # Extraer también desde divs de especificación
        spec_divs = driver.find_elements(By.CLASS_NAME, "spec-item")
        for div in spec_divs:
            try:
                label = div.find_element(By.CLASS_NAME, "spec-label").text.strip()
                value = div.find_element(By.CLASS_NAME, "spec-value").text.strip()
                if label and value:
                    specs[label] = value
            except:
                pass
    except Exception as e:
        pass

    return specs

def extract_oem_codes(driver, code):
    """Extrae códigos OEM cross-reference"""
    oem_codes = {}
    try:
        # Buscar tablas con cross-reference
        tables = driver.find_elements(By.TAG_NAME, "table")
        for table in tables:
            try:
                header = table.find_element(By.XPATH, ".//th[contains(text(), 'Manufacturer') or contains(text(), 'OEM')]")
                rows = table.find_elements(By.TAG_NAME, "tr")[1:]  # Skip header
                for row in rows:
                    cells = row.find_elements(By.TAG_NAME, "td")
                    if len(cells) >= 2:
                        manufacturer = cells[0].text.strip()
                        part_number = cells[1].text.strip()
                        if manufacturer and part_number:
                            if manufacturer not in oem_codes:
                                oem_codes[manufacturer] = []
                            oem_codes[manufacturer].append(part_number)
            except:
                pass
    except Exception as e:
        pass

    return oem_codes

def extract_equipment(driver, code):
    """Extrae equipos/aplicaciones donde se usa el filtro"""
    equipment_list = []
    try:
        # Buscar sección de equipos
        eq_sections = driver.find_elements(By.CLASS_NAME, "equipment-section")
        for section in eq_sections:
            try:
                eq_table = section.find_element(By.TAG_NAME, "table")
                rows = eq_table.find_elements(By.TAG_NAME, "tr")[1:]  # Skip header
                for row in rows:
                    cells = row.find_elements(By.TAG_NAME, "td")
                    if len(cells) >= 2:
                        eq_name = cells[0].text.strip()
                        eq_engine = cells[1].text.strip()
                        if eq_name:
                            equipment_list.append({
                                "name": eq_name,
                                "engine": eq_engine
                            })
            except:
                pass
    except Exception as e:
        pass

    return equipment_list

def extract_alternative_products(driver, code):
    """Extrae productos alternativos o similares"""
    alternatives = []
    try:
        alt_section = driver.find_element(By.CLASS_NAME, "alternatives")
        alt_items = alt_section.find_elements(By.CLASS_NAME, "alt-item")
        for item in alt_items:
            try:
                alt_code = item.find_element(By.CLASS_NAME, "alt-code").text.strip()
                alt_name = item.find_element(By.CLASS_NAME, "alt-name").text.strip()
                alternatives.append({"code": alt_code, "name": alt_name})
            except:
                pass
    except:
        pass

    return alternatives

def scrape_donaldson_code(driver, code):
    """Extrae datos completos de una página de producto Donaldson"""

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
            "oem_codes": {},
            "equipment": [],
            "alternative_products": [],
            "duty": "UNKNOWN",
            "micron": None,
            "efficiency": None,
            "media_type": None,
            "tecnologia": "SYNTRAX™"
        }

        # Extraer especificaciones completas
        specs = extract_specifications(driver, code)
        data["specifications"] = specs

        # Buscar micron y efficiency en especificaciones
        for key, value in specs.items():
            key_lower = key.lower()
            if "micron" in key_lower:
                data["micron"] = value
            if "efficiency" in key_lower or "% @" in value:
                data["efficiency"] = value
            if "media" in key_lower:
                data["media_type"] = value

        # Extraer OEM Cross References
        oem_codes = extract_oem_codes(driver, code)
        if oem_codes:
            data["oem_codes"] = oem_codes

        # Extraer Equipment
        equipment = extract_equipment(driver, code)
        if equipment:
            data["equipment"] = equipment

        # Extraer productos alternativos
        alternatives = extract_alternative_products(driver, code)
        if alternatives:
            data["alternative_products"] = alternatives

        # Clasificar Duty basado en OEM codes
        if oem_codes:
            oem_list = []
            for manufacturer, parts in oem_codes.items():
                oem_list.append(manufacturer)
            data["duty"] = get_duty(oem_list)

        return data

    except Exception as e:
        print(f"❌ Error scraping {code}: {str(e)}")
        return None

def main():
    is_test_mode = DONALDSON_CODES == TEST_CODES

    print("🔥 DONALDSON LUBE FILTER SCRAPER")
    print("=" * 70)
    if is_test_mode:
        print(f"MODO TEST: Extrayendo {len(DONALDSON_CODES)} códigos")
    else:
        print(f"MODO COMPLETO: Extrayendo {len(DONALDSON_CODES)} códigos")
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
                duty = data.get('duty', 'UNKNOWN')
                micron = data.get('micron', '?')
                print(f"✅ (Duty: {duty}, Micron: {micron})")
            else:
                print("❌")
                errors.append(code)

            time.sleep(2)  # Rate limiting

    finally:
        driver.quit()

    # Guardar resultados
    output_prefix = "donaldson_test" if is_test_mode else "donaldson_365_complete"

    output = {
        "timestamp": datetime.now().isoformat(),
        "source": "shop.donaldson.com",
        "mode": "test" if is_test_mode else "complete",
        "total_requested": len(DONALDSON_CODES),
        "successfully_extracted": len(results),
        "failed": len(errors),
        "codes": results,
        "errors": errors
    }

    # JSON
    json_file = f"{output_prefix}.json"
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    # CSV - Formato expandido
    if results:
        csv_file = f"{output_prefix}.csv"
        with open(csv_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=[
                "donaldson_code", "elimfilters_sku", "duty", "type",
                "micron", "efficiency", "media_type", "tecnologia",
                "oem_codes", "equipment", "alternative_products"
            ])
            writer.writeheader()
            for r in results:
                # Serializar OEM codes como string
                oem_str = "; ".join([
                    f"{mfr}:{','.join(parts)}"
                    for mfr, parts in r.get("oem_codes", {}).items()
                ])

                # Serializar equipos
                eq_str = "; ".join([
                    f"{eq['name']} ({eq['engine']})" if eq.get('engine') else eq['name']
                    for eq in r.get("equipment", [])
                ])

                # Serializar alternativas
                alt_str = "; ".join([
                    f"{alt['code']}: {alt['name']}"
                    for alt in r.get("alternative_products", [])
                ])

                writer.writerow({
                    "donaldson_code": r["donaldson_code"],
                    "elimfilters_sku": r["elimfilters_sku"],
                    "duty": r.get("duty", ""),
                    "type": r.get("type", ""),
                    "micron": r.get("micron", ""),
                    "efficiency": r.get("efficiency", ""),
                    "media_type": r.get("media_type", ""),
                    "tecnologia": r.get("tecnologia", ""),
                    "oem_codes": oem_str,
                    "equipment": eq_str,
                    "alternative_products": alt_str
                })

    # Resumen
    print()
    print("=" * 70)
    print("✅ EXTRACCIÓN COMPLETADA")
    print(f"   Exitosos: {len(results)}")
    print(f"   Errores: {len(errors)}")
    print(f"   📁 Guardado: {json_file}")
    print(f"   📁 Guardado: {csv_file}")

    if errors:
        print(f"\n⚠️  Códigos con error: {', '.join(errors)}")

if __name__ == "__main__":
    main()
