#!/usr/bin/env python3
"""
Extrae datos DIRECTAMENTE de la página de búsqueda
"""

import time
import re
from selenium import webdriver
from selenium.webdriver.common.by import By

code = "DBL0832"
url = f"https://shop.donaldson.com/store/en-us/search?q={code}"

options = webdriver.ChromeOptions()
options.add_argument("--start-maximized")

driver = webdriver.Chrome(options=options)

try:
    print(f"Abriendo: {url}")
    driver.get(url)
    time.sleep(5)

    print("\n=== BUSCANDO SECCIÓN DEL PRODUCTO ===\n")

    # Obtener HTML completo
    html = driver.page_source

    # Buscar secciones que contengan el código
    print(f"Buscando '{code}' en HTML...")

    # Estrategia 1: Buscar div que contenga el código
    divs = driver.find_elements(By.XPATH, f"//*[contains(text(), '{code}')]")
    print(f"Encontrados {len(divs)} elementos contienen '{code}'")

    for i, div in enumerate(divs[:5]):
        print(f"\nElemento {i+1}:")
        print(f"  Tag: {div.tag_name}")
        print(f"  Texto: {div.text[:100]}")

        # Obtener padre
        parent = div.find_element(By.XPATH, "..")
        parent_html = parent.get_attribute('outerHTML')
        print(f"  Padre HTML: {parent_html[:300]}...")

    # Estrategia 2: Buscar tablas o divs estructurados
    print(f"\n=== BUSCANDO TABLAS ===")
    tables = driver.find_elements(By.TAG_NAME, "table")
    print(f"Encontradas {len(tables)} tablas")

    for i, table in enumerate(tables[:2]):
        text = table.text[:200]
        if code in text or "spec" in text.lower():
            print(f"\nTabla {i+1}:")
            print(text)

    # Estrategia 3: Buscar contenedores de producto
    print(f"\n=== BUSCANDO CONTENEDORES ===")
    containers = driver.find_elements(By.XPATH, "//*[contains(@class, 'result') or contains(@class, 'item') or contains(@class, 'product')]")
    print(f"Encontrados {len(containers)} contenedores")

    for i, cont in enumerate(containers[:3]):
        if code in cont.text:
            print(f"\nContenedor {i+1} - CONTIENE {code}:")
            print(f"  Clases: {cont.get_attribute('class')}")
            print(f"  Texto: {cont.text[:200]}")

    # Estrategia 4: Expresión regular para extraer especificaciones
    print(f"\n=== EXPRESIONES REGULARES ===")

    matches = re.findall(r'(\d+)(?:%|µm|micron)', html, re.IGNORECASE)
    if matches:
        print(f"Encontrados valores numéricos: {matches[:10]}")

    if "OEM" in html or "oem" in html:
        print("✅ Página contiene OEM")
        oem_section = re.search(r'OEM.*?(?:<|$)', html, re.IGNORECASE | re.DOTALL)
        if oem_section:
            print(f"OEM section: {oem_section.group(0)[:100]}")

    driver.save_screenshot("donaldson_debug3.png")
    print(f"\n📸 Screenshot guardado: donaldson_debug3.png")

    input("\nPresiona ENTER para cerrar...")

finally:
    driver.quit()
