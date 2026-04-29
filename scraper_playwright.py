#!/usr/bin/env python3
"""
Scraper con Playwright - mejor para contenido dinámico
"""

try:
    from playwright.sync_api import sync_playwright
except:
    print("❌ Playwright no instalado. Instalar:")
    print("pip install playwright")
    print("playwright install chromium")
    exit(1)

def scrape_code(code):
    """Scrape un código de Donaldson"""

    url = f"https://shop.donaldson.com/store/en-us/search?q={code}"

    with sync_playwright() as p:
        print(f"Abriendo navegador...")
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        print(f"Navegando a: {url}")
        page.goto(url, wait_until="networkidle")

        print(f"Esperando a que cargue contenido...")
        page.wait_for_timeout(3000)  # Esperar 3 segundos adicionales

        # Obtener HTML después de que todo cargue
        html = page.content()

        print(f"HTML obtenido: {len(html)} caracteres")

        # Guardar HTML
        with open(f"donaldson_{code}_playwright.html", "w", encoding="utf-8") as f:
            f.write(html)

        # Buscar elementos visibles en la página
        try:
            # Buscar cualquier elemento que contenga especificaciones
            specs = page.query_selector_all("[class*='spec'], [class*='detail'], [id*='spec']")
            print(f"Elementos de especificación encontrados: {len(specs)}")

            for i, elem in enumerate(specs[:3]):
                text = elem.text_content()
                if text and len(text) > 10:
                    print(f"  Elem {i+1}: {text[:100]}")

            # Intentar extraer datos visibles
            print(f"\nContenido de texto en página:")
            body_text = page.text_content()

            # Buscar patrones
            import re

            if "micron" in body_text.lower():
                print("✅ Encontrado: micron")
                micron = re.search(r'(\d+)\s*(?:µm|micron)', body_text, re.IGNORECASE)
                if micron:
                    print(f"   Valor: {micron.group(0)}")

            if "efficiency" in body_text.lower():
                print("✅ Encontrado: efficiency")

            if "OEM" in body_text or "oem" in body_text.lower():
                print("✅ Encontrado: OEM")

        except Exception as e:
            print(f"⚠️  Error extrayendo: {e}")

        # Screenshot
        page.screenshot(path=f"donaldson_{code}_playwright.png")
        print(f"📸 Screenshot: donaldson_{code}_playwright.png")

        browser.close()

if __name__ == "__main__":
    scrape_code("DBL0832")
    print("\n✅ Listo")
