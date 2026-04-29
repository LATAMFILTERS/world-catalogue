#!/usr/bin/env python3
"""
Extract JSON data from Air Dryer product page
Data is hidden in <span class="specSheetPDF"> as JSON
"""

from playwright.sync_api import sync_playwright
import json
import re

def extract_json_data():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        url = "https://shop.donaldson.com/store/en-us/product/P951413/67990"
        page.goto(url, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(3000)

        # Remove chatbot
        page.evaluate("""() => {
            const popups = ['#chat-button', '.LPMcontainer', '[id*="chat"]', '[class*="chat"]',
                           'iframe[title*="chat"]', '.chatbot-container'];
            popups.forEach(s => {
                document.querySelectorAll(s).forEach(el => el.remove());
            });
        }""")

        print("=" * 80)
        print("🔍 EXTRACTING JSON FROM specSheetPDF SPAN")
        print("=" * 80)

        # 1. Extract JSON from specSheetPDF
        json_data = page.evaluate("""() => {
            const span = document.querySelector('span.specSheetPDF');
            if (span) {
                return span.innerText;
            }
            return null;
        }""")

        if json_data:
            print("\n✅ Found specSheetPDF span with JSON:")
            try:
                data = json.loads(json_data)
                print(json.dumps(data, indent=2, ensure_ascii=False))

                # Extract key fields
                print("\n" + "=" * 80)
                print("📊 PARSED DATA:")
                print("=" * 80)

                if "Product Catalog Number" in data:
                    print(f"Product Code: {data['Product Catalog Number']}")

                if "Attributes" in data:
                    print("\nAttribute Values:")
                    for key, val in data["Attributes"].get("Attribute Values", {}).items():
                        print(f"  {key}: {val}")

                    print("\nOther Information:")
                    for key, val in data["Attributes"].get("Other Information", {}).items():
                        print(f"  {key}: {val}")

                if "Product Image" in data:
                    print(f"\nProduct Image: {data['Product Image']}")

            except json.JSONDecodeError as e:
                print(f"Error parsing JSON: {e}")
                print(f"Raw content: {json_data[:500]}")
        else:
            print("❌ specSheetPDF span not found")

        # 2. Check tabs for additional data
        print("\n" + "=" * 80)
        print("🔗 CHECKING TABS FOR ADDITIONAL DATA")
        print("=" * 80)

        tabs = [
            ("specPDPLink", "Product Specifications"),
            ("crossReferenceLink", "Cross Reference"),
            ("equipmentLink", "Equipment"),
        ]

        for tab_id, tab_name in tabs:
            print(f"\n→ Trying tab: {tab_name} (ID: {tab_id})")

            # Intentar todos los selectores posibles para esta tab
            page.evaluate(f"""() => {{
                let tab = document.getElementById('{tab_id}');
                if (!tab) {{
                    // Buscar por texto del link
                    tab = Array.from(document.querySelectorAll('a, button'))
                              .find(el => el.innerText.toLowerCase().trim() === '{tab_name.lower()}');
                }}
                if (tab) {{ tab.click(); console.log('clicked:', tab.id, tab.innerText); }}
                else {{ console.log('tab not found: {tab_id}'); }}
            }}""")

            page.wait_for_timeout(3000)

            # Mostrar HTML completo de la sección activa
            html_section = page.evaluate("""() => {
                // Buscar el panel activo / visible
                let active = document.querySelector('.tab-pane.active, .tab-content .active');
                if (active) return active.outerHTML.substring(0, 3000);

                // Mostrar HTML de tables encontradas
                let tables = [];
                document.querySelectorAll('table').forEach(t => {
                    tables.push(t.outerHTML.substring(0, 500));
                });
                return tables.join('\\n---\\n').substring(0, 3000);
            }""")

            print(f"   HTML de sección activa (primeros 2000 chars):")
            print(html_section[:2000] if html_section else "   (vacío)")

            # Contar filas de cualquier tabla visible
            rows = page.evaluate("""() => {
                let count = 0;
                document.querySelectorAll('table tr').forEach(() => count++);
                return count;
            }""")
            print(f"   Total filas en tablas: {rows}")

        # 3. Mostrar todas las tablas de la página
        print("\n" + "=" * 80)
        print("📋 TODAS LAS TABLAS DE LA PÁGINA")
        print("=" * 80)
        all_tables = page.evaluate("""() => {
            let result = [];
            document.querySelectorAll('table').forEach((t, i) => {
                const rows = t.querySelectorAll('tr').length;
                const id = t.id || t.className.substring(0, 30) || 'sin-id';
                result.push({index: i, id: id, rows: rows, html: t.outerHTML.substring(0, 300)});
            });
            return result;
        }""")
        for t in all_tables:
            print(f"  Table[{t['index']}] ID:{t['id']} Rows:{t['rows']}")
            print(f"    {t['html'][:200]}")

        # 4. Save full JSON for reference
        with open("air_dryer_json_structure.json", "w", encoding="utf-8") as f:
            f.write(json_data if json_data else "{}")

        print("\n" + "=" * 80)
        print("✅ Extraction complete. Data saved to air_dryer_json_structure.json")
        print("=" * 80)

        browser.close()

if __name__ == "__main__":
    extract_json_data()
