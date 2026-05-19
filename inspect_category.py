#!/usr/bin/env python3
"""
Inspect Donaldson category to identify product type and structure
"""

from playwright.sync_api import sync_playwright

def inspect_category():
    category_url = "https://shop.donaldson.com/store/en-us/search?N=426772457&Nr=product.language%3AEnglish&catNav=true&st=parts"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        print("=" * 80)
        print("🔍 INSPECTING DONALDSON CATEGORY")
        print("=" * 80)
        print(f"\nURL: {category_url}\n")

        page.goto(category_url, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(3000)

        # Remove popups
        page.evaluate("""() => {
            document.querySelectorAll('[id*="chat"]', '[class*="chat"]', 'iframe').forEach(el => el.remove());
        }""")

        # Get page title and category info
        title = page.title()
        print(f"Page Title: {title}\n")

        # Find category name
        category_info = page.evaluate("""() => {
            let info = {
                title: document.title,
                h1: document.querySelector('h1')?.innerText,
                category: document.querySelector('[class*="category"]')?.innerText,
                breadcrumb: [],
                product_count: 0,
                products: []
            };

            // Get breadcrumb
            document.querySelectorAll('[class*="breadcrumb"] a, nav a').forEach(a => {
                const text = a.innerText.trim();
                if (text && text.length < 100) info.breadcrumb.push(text);
            });

            // Count products
            const products = document.querySelectorAll('a.donaldson-part-details, [class*="product-item"], [class*="product-card"]');
            info.product_count = products.length;

            // Get first 5 product names
            products.forEach((p, i) => {
                if (i < 5) {
                    info.products.push({
                        text: p.innerText?.substring(0, 50),
                        href: p.href
                    });
                }
            });

            return info;
        }""")

        print("📋 CATEGORY INFORMATION:")
        print(f"  Title: {category_info['title']}")
        print(f"  H1: {category_info['h1']}")
        print(f"  Breadcrumb: {' > '.join(category_info['breadcrumb'])}")
        print(f"\n📦 PRODUCTS FOUND: {category_info['product_count']}")
        print(f"\nFirst 5 products:")
        for i, prod in enumerate(category_info['products'], 1):
            print(f"  [{i}] {prod['text']}")
            print(f"      {prod['href'][:80]}...")

        browser.close()

if __name__ == "__main__":
    inspect_category()
