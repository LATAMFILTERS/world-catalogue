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

            page.evaluate(f"""() => {{
                let tab = document.getElementById('{tab_id}');
                if (!tab) tab = document.querySelector('a[href*="{tab_name.lower()}"]');
                if (tab) tab.click();
            }}""")

            page.wait_for_timeout(2000)

            # Try to extract content
            content = page.evaluate("""() => {
                let data = [];

                // Try dl/dt/dd
                document.querySelectorAll('dl dt, dl dd').forEach((el, i) => {
                    if (el.tagName === 'DT') {
                        const dd = el.nextElementSibling;
                        if (dd && dd.tagName === 'DD') {
                            data.push({
                                label: el.innerText.trim().substring(0, 50),
                                value: dd.innerText.trim().substring(0, 100)
                            });
                        }
                    }
                });

                // Try tables
                document.querySelectorAll('table tr').forEach(tr => {
                    const th = tr.querySelector('th');
                    const td = tr.querySelector('td');
                    if (th && td) {
                        data.push({
                            label: th.innerText.trim().substring(0, 50),
                            value: td.innerText.trim().substring(0, 100)
                        });
                    }
                });

                return data;
            }""")

            if content:
                print(f"   Found {len(content)} items:")
                for item in content[:3]:
                    print(f"     {item['label']}: {item['value']}")
            else:
                print("   No structured data found")

        # 3. Save full JSON for reference
        with open("air_dryer_json_structure.json", "w", encoding="utf-8") as f:
            f.write(json_data if json_data else "{}")

        print("\n" + "=" * 80)
        print("✅ Extraction complete. Data saved to air_dryer_json_structure.json")
        print("=" * 80)

        browser.close()

if __name__ == "__main__":
    extract_json_data()
