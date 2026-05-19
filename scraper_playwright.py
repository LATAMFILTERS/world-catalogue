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
            print(f"\nExrayendo datos de elementos encontrados:")

            import re

            # Extraer texto de los elementos de especificación
            all_specs_text = ""
            for elem in specs:
                try:
                    text = elem.inner_text()
                    all_specs_text += text + "\n"
                except:
                    pass

            # Obtener texto de body
            try:
                body_text = page.locator("body").inner_text()
            except:
                body_text = all_specs_text

            print(f"Texto capturado: {len(body_text)} caracteres")

            # Buscar patrones
            if "micron" in body_text.lower():
                print("✅ Encontrado: micron")
                micron = re.search(r'(\d+)\s*(?:µm|micron)', body_text, re.IGNORECASE)
                if micron:
                    print(f"   Valor: {micron.group(0)}")

            if "efficiency" in body_text.lower():
                print("✅ Encontrado: efficiency")
                eff = re.search(r'(\d+(?:\.\d+)?)\s*%', body_text)
                if eff:
                    print(f"   Valor: {eff.group(0)}")

            if "OEM" in body_text or "oem" in body_text.lower():
                print("✅ Encontrado: OEM")
                # Buscar patrón OEM: palabra clave
                oem = re.findall(r'OEM[:\s]+([A-Z0-9\-,\s]+)', body_text, re.IGNORECASE)
                if oem:
                    print(f"   Valores: {oem[:3]}")

        except Exception as e:
            print(f"⚠️  Error extrayendo: {e}")

        # Screenshot
        page.screenshot(path=f"donaldson_{code}_playwright.png")
        print(f"📸 Screenshot: donaldson_{code}_playwright.png")

        browser.close()

if __name__ == "__main__":
    scrape_code("DBL0832")
    print("\n✅ Listo")
