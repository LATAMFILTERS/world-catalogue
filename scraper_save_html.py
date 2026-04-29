#!/usr/bin/env python3
"""
Guarda HTML de la página para inspección manual
"""

import time
from selenium import webdriver

code = "DBL0832"
url = f"https://shop.donaldson.com/store/en-us/search?q={code}"

options = webdriver.ChromeOptions()
options.add_argument("--start-maximized")

driver = webdriver.Chrome(options=options)

try:
    print(f"Abriendo: {url}")
    driver.get(url)
    time.sleep(5)

    html = driver.page_source

    # Guardar HTML completo
    with open("donaldson_page.html", "w", encoding="utf-8") as f:
        f.write(html)

    print(f"✅ HTML guardado: donaldson_page.html ({len(html)} caracteres)")

    # Buscar dónde está el código
    idx = html.find(code)
    if idx != -1:
        print(f"\n✅ Código encontrado en posición {idx}")
        print(f"Contexto (100 caracteres antes y después):")
        start = max(0, idx - 100)
        end = min(len(html), idx + 100)
        print(html[start:end])
    else:
        print(f"\n❌ Código no encontrado en HTML")

    # Buscar todas las tablas y guardarlas
    print(f"\n=== TABLAS ENCONTRADAS ===\n")

    tables = driver.find_elements("tag name", "table")
    for i, table in enumerate(tables):
        print(f"Tabla {i+1}: {table.get_attribute('id')} - {len(table.text)} caracteres")
        print(f"Primeros 200 caracteres:")
        print(table.text[:200])
        print()

    input("Presiona ENTER para cerrar. Abre 'donaldson_page.html' en navegador...")

finally:
    driver.quit()
