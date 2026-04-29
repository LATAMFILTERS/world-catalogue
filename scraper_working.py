#!/usr/bin/env python3
"""
Scraper funcional - Espera a que JavaScript cargue contenido
"""

import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

code = "DBL0832"
url = f"https://shop.donaldson.com/store/en-us/search?q={code}"

options = webdriver.ChromeOptions()
options.add_argument("--start-maximized")

driver = webdriver.Chrome(options=options)

try:
    print(f"Abriendo: {url}")
    driver.get(url)

    # Esperar a que JavaScript cargue los productos
    print("Esperando a que cargue contenido dinámico...")
    wait = WebDriverWait(driver, 15)

    # Estrategia 1: Esperar a que aparezcan elementos con datos
    try:
        element = wait.until(
            EC.presence_of_all_elements_located((By.XPATH, "//*[contains(text(), 'Especificaciones') or contains(text(), 'Efficiency') or contains(text(), 'OEM')]"))
        )
        print("✅ Contenido dinámico cargado")
    except:
        print("⏳ Timeout esperando contenido. Continuando...")
        time.sleep(5)

    # Obtener página completa después de JS
    html = driver.page_source

    # Guardar HTML después de JS
    with open("donaldson_page_after_js.html", "w", encoding="utf-8") as f:
        f.write(html)
    print(f"✅ HTML después de JS: donaldson_page_after_js.html ({len(html)} caracteres)")

    # Buscar tablas ahora
    print("\n=== TABLAS DESPUÉS DE JS ===")
    tables = driver.find_elements(By.TAG_NAME, "table")
    print(f"Encontradas {len(tables)} tablas")

    for i, table in enumerate(tables[:3]):
        text = table.text
        print(f"\nTabla {i+1}: {len(text)} caracteres")
        if len(text) > 0:
            print(f"Contenido: {text[:300]}")

    # Buscar cualquier div/span que contenga especificaciones
    print("\n=== BUSCANDO ESPECIFICACIONES ===")

    specs_text = html.lower()
    if "micron" in specs_text:
        print("✅ Encontrado: micron")
    if "efficiency" in specs_text:
        print("✅ Encontrado: efficiency")
    if "oem" in specs_text:
        print("✅ Encontrado: OEM")
    if "specification" in specs_text:
        print("✅ Encontrado: specification")

    # Intentar extraer con regex
    import re

    # Buscar patrón: número + µm o micron
    micron_matches = re.findall(r'(\d+)\s*(?:µm|micron)', html, re.IGNORECASE)
    if micron_matches:
        print(f"\n✅ Micron encontrados: {micron_matches[:5]}")

    # Buscar patrón: número + %
    efficiency_matches = re.findall(r'(\d+(?:\.\d+)?)\s*%', html)
    if efficiency_matches:
        print(f"✅ Eficiencias encontradas: {efficiency_matches[:5]}")

    # Guardar screenshot
    driver.save_screenshot("donaldson_after_js.png")
    print(f"\n📸 Screenshot: donaldson_after_js.png")

    input("\nPresiona ENTER para cerrar...")

finally:
    driver.quit()
