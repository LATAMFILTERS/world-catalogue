#!/usr/bin/env python3
"""
Debug script: Inspect Air Dryer product page (P951413/67990)
Identifies correct tabs and attribute selectors for Air Dryer category
"""

from playwright.sync_api import sync_playwright
import json

def debug_p781466():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        url = "https://shop.donaldson.com/store/en-us/product/P951413/67990"
        page.goto(url, wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(3000)

        # Remove popups
        page.evaluate("""() => {
            const popups = ['#chat-button', '.LPMcontainer', '.optanon-alert-box-wrapper',
                           '.osano-cm-window', '.modal-backdrop', '.modal-open'];
            popups.forEach(s => { const el = document.querySelector(s); if(el) el.remove(); });
            document.body.style.overflow = 'auto';
        }""")

        print("=" * 80)
        print("🔍 DEBUGGING P781466 DOM STRUCTURE")
        print("=" * 80)

        # 1. Find all tabs
        tabs_found = page.evaluate("""() => {
            let tabs = [];

            // Find all elements that might be tabs
            document.querySelectorAll('a, button, [role="tab"]').forEach(el => {
                const text = el.innerText.toLowerCase();
                const id = el.id || el.getAttribute('href') || el.getAttribute('data-tab') || 'no-id';
                const classes = el.className || '';

                if (text.includes('spec') || text.includes('attr') || text.includes('cross') ||
                    text.includes('equip') || text.includes('product') || el.getAttribute('role') === 'tab') {
                    tabs.push({
                        text: el.innerText.substring(0, 30),
                        id: id,
                        tag: el.tagName,
                        classes: classes.substring(0, 50),
                        role: el.getAttribute('role')
                    });
                }
            });

            return tabs;
        }""")

        print("\n📋 TABS FOUND:")
        for i, tab in enumerate(tabs_found, 1):
            print(f"  [{i}] {tab['text']:<20} | ID: {tab['id']:<30} | Tag: {tab['tag']}")
            if tab['classes']:
                print(f"      Classes: {tab['classes']}")

        # 2. Click each tab and inspect attributes section
        print("\n" + "=" * 80)
        print("🖱️  CLICKING EACH TAB & INSPECTING ATTRIBUTES")
        print("=" * 80)

        for tab_info in tabs_found[:5]:  # Limit to first 5 to avoid too much output
            print(f"\n→ Clicking: {tab_info['text']}")

            # Try clicking
            try:
                selector = None
                if tab_info['id'].startswith('a[href') or tab_info['id'].startswith('#'):
                    selector = f"a[href='{tab_info['id']}']"
                elif tab_info['id'] and tab_info['id'] != 'no-id':
                    selector = f"[id='{tab_info['id']}'], [data-tab='{tab_info['id']}']"

                if selector:
                    page.evaluate(f"""() => {{
                        let el = document.querySelector('{selector}');
                        if (!el) el = document.querySelector('button:has-text("{tab_info['text']}")');
                        if (el) el.click();
                    }}""")
                    page.wait_for_timeout(1500)

                    # Inspect what's now visible
                    visible_content = page.evaluate("""() => {
                        let content = {
                            "dt_dd_pairs": 0,
                            "table_rows": 0,
                            "div_labels": 0,
                            "sample_dt": [],
                            "sample_labels": []
                        };

                        // Count dt/dd pairs
                        const dts = document.querySelectorAll('dl dt');
                        content.dt_dd_pairs = dts.length;
                        for (let i = 0; i < Math.min(3, dts.length); i++) {
                            content.sample_dt.push(dts[i].innerText.substring(0, 40));
                        }

                        // Count table rows in specs
                        const rows = document.querySelectorAll('[class*="spec"] table tr, .specifications-table tr');
                        content.table_rows = rows.length;

                        // Count divs with labels
                        const labels = document.querySelectorAll('[class*="spec"] [class*="label"], [class*="attr"] [class*="label"]');
                        content.div_labels = labels.length;
                        for (let i = 0; i < Math.min(3, labels.length); i++) {
                            content.sample_labels.push(labels[i].innerText.substring(0, 40));
                        }

                        return content;
                    }""")

                    print(f"  Results after click:")
                    print(f"    dt/dd pairs: {visible_content['dt_dd_pairs']}")
                    print(f"    table rows: {visible_content['table_rows']}")
                    print(f"    div labels: {visible_content['div_labels']}")

                    if visible_content['sample_dt']:
                        print(f"    Sample dt: {visible_content['sample_dt'][0]}")
                    if visible_content['sample_labels']:
                        print(f"    Sample label: {visible_content['sample_labels'][0]}")

            except Exception as e:
                print(f"  Error: {str(e)[:60]}")

        # 3. Inspect full HTML structure of attributes area
        print("\n" + "=" * 80)
        print("🏗️  FULL HTML STRUCTURE — ATTRIBUTES SECTION")
        print("=" * 80)

        html_sample = page.evaluate("""() => {
            let html = "";

            // Try to find attributes/specs section by various methods
            let target = null;

            // Method 1: Find by class names containing "spec"
            const specs = document.querySelectorAll('[class*="spec"]');
            if (specs.length > 0) {
                target = specs[0];
            }

            // Method 2: Find by id
            if (!target) {
                target = document.querySelector('#specifications, #productSpecifications, #techSpecs, #attributes');
            }

            if (target) {
                html = target.outerHTML.substring(0, 1500);
            }

            return html;
        }""")

        print("\nFirst 1500 chars of attributes section HTML:")
        print(html_sample[:1500])

        # 4. Try extracting with current methods
        print("\n" + "=" * 80)
        print("🧪 TESTING CURRENT EXTRACTION METHODS")
        print("=" * 80)

        test_results = page.evaluate("""() => {
            let results = {
                "method1_dl_dd": {},
                "method2_table": {},
                "method3_div_labels": {}
            };

            // Method 1: dl dt/dd
            document.querySelectorAll('dl dt').forEach(dt => {
                const dd = dt.nextElementSibling;
                if (dd) {
                    const key = dt.innerText.trim().substring(0, 30);
                    results.method1_dl_dd[key] = dd.innerText.trim().substring(0, 60);
                }
            });

            // Method 2: table
            document.querySelectorAll('table tr').forEach(tr => {
                const th = tr.querySelector('th');
                const td = tr.querySelector('td');
                if (th && td) {
                    const key = th.innerText.trim().substring(0, 30);
                    results.method2_table[key] = td.innerText.trim().substring(0, 60);
                }
            });

            // Method 3: div labels
            document.querySelectorAll('[class*="label"]').forEach(label => {
                const value = label.nextElementSibling;
                if (value && label.innerText.trim().length > 0) {
                    const key = label.innerText.trim().substring(0, 30);
                    results.method3_div_labels[key] = value.innerText.trim().substring(0, 60);
                }
            });

            return results;
        }""")

        print(f"\n✓ Method 1 (dl dt/dd): {len(test_results['method1_dl_dd'])} attributes")
        for key, val in list(test_results['method1_dl_dd'].items())[:3]:
            print(f"    {key}: {val}")

        print(f"\n✓ Method 2 (table th/td): {len(test_results['method2_table'])} attributes")
        for key, val in list(test_results['method2_table'].items())[:3]:
            print(f"    {key}: {val}")

        print(f"\n✓ Method 3 (div labels): {len(test_results['method3_div_labels'])} attributes")
        for key, val in list(test_results['method3_div_labels'].items())[:3]:
            print(f"    {key}: {val}")

        # 5. Save full results for reference
        with open("p781466_debug_results.json", "w", encoding="utf-8") as f:
            json.dump({
                "tabs_found": tabs_found,
                "extraction_results": test_results
            }, f, indent=2, ensure_ascii=False)

        print("\n" + "=" * 80)
        print("✅ Debug complete. Results saved to p781466_debug_results.json")
        print("=" * 80)

        browser.close()

if __name__ == "__main__":
    debug_p781466()
