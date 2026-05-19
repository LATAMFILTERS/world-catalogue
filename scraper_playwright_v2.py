#!/usr/bin/env python3
"""
Scraper Playwright v2 - Busca específicamente el código del producto
"""

try:
    from playwright.sync_api import sync_playwright
except:
    print("pip install playwright && playwright install chromium")
    exit(1)

def scrape_specific_code(code):
    """Scrape un código específico de Donaldson"""

    url = f"https://shop.donaldson.com/store/en-us/search?q={code}"

    with sync_playwright() as p:
        print(f"Abriendo navegador...")
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        print(f"Navegando a: {url}")
        page.goto(url, wait_until="networkidle")
        page.wait_for_timeout(3000)

        print(f"\n=== BUSCANDO CÓDIGO {code} ===\n")

        # Buscar TODOS los elementos en la página
        all_elements = page.query_selector_all("*")
        print(f"Total elementos en página: {len(all_elements)}")

        # Buscar elementos que contengan el código específico
        product_section = None
        for elem in all_elements:
            try:
                text = elem.inner_text()
                if code in text:
                    # Encontramos un elemento que contiene nuestro código
                    class_name = elem.get_attribute("class")
                    tag_name = elem.tag_name()

                    print(f"✅ ENCONTRADO {code}")
                    print(f"   Tag: {tag_name}")
                    print(f"   Class: {class_name}")
                    print(f"   Contenido completo:")
                    print(f"   {text[:500]}")

                    product_section = elem
                    break
            except:
                pass

        if not product_section:
            print(f"❌ No se encontró {code} en la página")
            browser.close()
            return None

        # Extraer datos del elemento encontrado
        print(f"\n=== EXTRAYENDO DATOS ===\n")

        import re

        product_text = product_section.inner_text()

        data = {
            "code": code,
            "raw_text": product_text,
        }

        # Buscar micron
        micron_match = re.search(r'(\d+)\s*(?:µm|micron)', product_text, re.IGNORECASE)
        if micron_match:
            data["micron"] = micron_match.group(1)
            print(f"✅ Micron: {data['micron']}")

        # Buscar efficiency
        eff_match = re.search(r'(\d+(?:\.\d+)?)\s*%', product_text)
        if eff_match:
            data["efficiency"] = eff_match.group(0)
            print(f"✅ Efficiency: {data['efficiency']}")

        # Buscar media
        media_match = re.search(r'(?:media|Media):\s*([A-Za-z\s]+)', product_text)
        if media_match:
            data["media"] = media_match.group(1).strip()
            print(f"✅ Media: {data['media']}")

        # Buscar OEM
        oem_matches = re.findall(r'([A-Z][A-Z\s]{2,}[0-9\-]{2,})', product_text)
        if oem_matches:
            data["oem_codes"] = list(set(oem_matches[:5]))
            print(f"✅ OEM codes encontrados: {len(data['oem_codes'])}")
            for oem in data["oem_codes"][:3]:
                print(f"   - {oem}")

        # Guardar datos
        import json
        with open(f"donaldson_{code}_data.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print(f"\n✅ Datos guardados: donaldson_{code}_data.json")

        browser.close()
        return data

if __name__ == "__main__":
    result = scrape_specific_code("DBL0832")
    if result:
        print(f"\n✅ Éxito. Datos extraídos:")
        for key, value in result.items():
            if key != "raw_text":
                print(f"  {key}: {value}")
