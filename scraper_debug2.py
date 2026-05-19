#!/usr/bin/env python3
"""
Debug mejorado - Inspecciona estructura HTML y clickea producto
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

    print("\n=== ESTRUCTURA DE PRODUCTOS ===\n")

    # Buscar divs con producto
    products = driver.find_elements(By.CSS_SELECTOR, "div[class*='product']")
    print(f"Encontrados {len(products)} divs con clase 'product'\n")

    for i, prod in enumerate(products[:2]):
        print(f"--- Producto {i+1} ---")
        html = prod.get_attribute('outerHTML')
        print(html[:300])
        print()

    # Buscar links
    print(f"\n=== LINKS ENCONTRADOS ===\n")

    all_links = driver.find_elements(By.XPATH, "//a[contains(@href, '/store/')]")
    print(f"Total de links: {len(all_links)}\n")

    found = False
    for i, link in enumerate(all_links):
        text = link.text.strip()
        href = link.get_attribute('href')

        if code in text or code in href:
            print(f"\n✅ ENCONTRADO LINK CON {code}:")
            print(f"   Texto: {text}")
            print(f"   URL: {href}")

            try:
                print(f"   Clickeando...")
                driver.execute_script("arguments[0].click();", link)
                time.sleep(4)
                print(f"   ✅ ÉXITO")
                print(f"   Nueva URL: {driver.current_url}")

                # Extraer datos de la página de producto
                print(f"\n=== EXTRAYENDO DATOS DEL PRODUCTO ===\n")
                page_html = driver.page_source

                # Buscar especificaciones
                if "specification" in page_html.lower():
                    print("✅ Página contiene especificaciones")
                if "oem" in page_html.lower():
                    print("✅ Página contiene OEM")
                if "micron" in page_html.lower():
                    print("✅ Página contiene micron")
                if "efficiency" in page_html.lower():
                    print("✅ Página contiene efficiency")

                found = True
                break
            except Exception as e:
                print(f"   ❌ Error: {str(e)[:100]}")

        elif i < 10:
            if text:
                print(f"Link {i}: {text[:60]}")

    if not found:
        print("\n❌ No se encontró link del producto en los primeros 100")

    driver.save_screenshot("donaldson_debug2.png")
    print(f"\n📸 Screenshot guardado: donaldson_debug2.png")

    input("\nPresiona ENTER para cerrar...")

finally:
    driver.quit()
