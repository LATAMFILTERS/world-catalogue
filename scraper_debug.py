#!/usr/bin/env python3
"""
Debug script - Inspecciona la estructura real de Donaldson
"""

import time
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

    print("\n=== ESTRUCTURA DE LA PÁGINA ===\n")

    # Imprimir HTML relevante
    html = driver.page_source

    # Buscar todos los divs/links que contengan el código
    print(f"🔍 Buscando '{code}' en la página...")
    if code in html:
        print(f"✅ Código encontrado en HTML")
    else:
        print(f"❌ Código NO encontrado en HTML")

    # Intentar encontrar elementos
    print("\n=== INTENTANDO SELECTORES ===\n")

    selectors = [
        ("div[class*='product']", By.CSS_SELECTOR),
        ("a[href*='/store/']", By.CSS_SELECTOR),
        ("//a[contains(@href, 'donaldson')]", By.XPATH),
        ("//div[contains(@class, 'item')]", By.XPATH),
        ("//button[contains(text(), 'Add')]", By.XPATH),
    ]

    for selector, by_type in selectors:
        try:
            elements = driver.find_elements(by_type, selector)
            print(f"✅ {selector}: {len(elements)} elementos encontrados")
            if elements and len(elements) > 0:
                print(f"   Primer elemento: {elements[0].tag_name} - {elements[0].text[:50]}")
        except Exception as e:
            print(f"❌ {selector}: Error - {str(e)[:50]}")

    # Imprimir titulo de página
    print(f"\n=== PÁGINA ACTUAL ===")
    print(f"Título: {driver.title}")
    print(f"URL: {driver.current_url}")

    # Guardar screenshot
    driver.save_screenshot("donaldson_debug.png")
    print(f"\n📸 Screenshot guardado: donaldson_debug.png")

    # Esperar para que el usuario vea
    input("\nPresiona ENTER para cerrar...")

finally:
    driver.quit()
