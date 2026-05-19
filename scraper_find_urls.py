#!/usr/bin/env python3
"""
Accede directamente a páginas de producto de Donaldson
"""

try:
    from playwright.sync_api import sync_playwright
except:
    print("pip install playwright && playwright install chromium")
    exit(1)

import json, time

TEST_CODES = ["DBL0832", "DBL3998", "P502007"]

# URLs posibles para páginas de producto
URL_PATTERNS = [
    "https://www.donaldson.com/en-us/industrial-dust-fume-mist/parts/{code}/",
    "https://www.donaldson.com/en-us/engine/parts/{code}/",
    "https://shop.donaldson.com/store/en-us/product/{code}",
    "https://shop.donaldson.com/store/en-us/p/{code}",
]

def try_url(page, url):
    try:
        response = page.goto(url, wait_until="networkidle", timeout=15000)
        if response and response.status == 200:
            title = page.title()
            text = page.locator("body").inner_text()
            if len(text) > 200:
                return text, url
    except:
        pass
    return None, None

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        for code in TEST_CODES:
            print(f"\n=== {code} ===")

            # Buscar URL que funcione
            found_text = None
            found_url = None

            for pattern in URL_PATTERNS:
                url = pattern.format(code=code)
                print(f"  Probando: {url}")
                text, working_url = try_url(page, url)
                if text and code in text:
                    found_text = text
                    found_url = working_url
                    print(f"  ✅ ENCONTRADO en: {working_url}")
                    break
                else:
                    print(f"  ❌")
                time.sleep(1)

            if found_text:
                print(f"\n  Contenido encontrado ({len(found_text)} chars):")
                print(f"  {found_text[:300]}")

        browser.close()

if __name__ == "__main__":
    main()
