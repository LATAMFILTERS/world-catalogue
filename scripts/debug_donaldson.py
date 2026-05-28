"""
debug_donaldson.py
Diagnóstico rápido: abre DBL3998, screenshot + HTML dump + cheque de IDs.
Ejecutar:  python debug_donaldson.py
Genera: debug_screenshot.png + debug_page.html
"""

import os, time
from playwright.sync_api import sync_playwright

try:
    from playwright_stealth import stealth_sync
    STEALTH = True
except ImportError:
    STEALTH = False

PROFILE_DIR  = os.path.join(os.path.expanduser("~"), ".donaldson_profile")
TEST_URL     = "https://shop.donaldson.com/store/en-us/product/DBL3998"
OUT_SCREEN   = "debug_screenshot.png"
OUT_HTML     = "debug_page.html"

TARGET_IDS = [
    "attributesBody",
    "crossreferenceBody",
    "alternateBody",
    "equiptmentBody",      # Donaldson typo intencional
]

def main():
    with sync_playwright() as pw:
        print(f"Stealth: {'SI' if STEALTH else 'NO'}")
        print(f"Perfil: {PROFILE_DIR}")

        context = pw.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            channel="chrome",
            headless=False,
            slow_mo=60,
            locale="en-US",
            viewport={"width": 1366, "height": 768},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            extra_http_headers={"Accept-Language": "en-US,en;q=0.9"},
            args=["--disable-blink-features=AutomationControlled"],
            ignore_default_args=["--enable-automation"],
        )

        page = context.new_page()
        if STEALTH:
            stealth_sync(page)

        print(f"\n→ Navegando a {TEST_URL}")
        page.goto(TEST_URL, timeout=90000, wait_until="networkidle")
        time.sleep(3)

        # ── 1. Info básica ──────────────────────────────────────────────────
        title   = page.title()
        cur_url = page.url
        print(f"\n[TÍTULO]    {title}")
        print(f"[URL FINAL] {cur_url}")

        # ── 2. Cheque de IDs objetivo ───────────────────────────────────────
        print("\n[IDs EN DOM]")
        results = page.evaluate("""(ids) => {
            const out = {};
            ids.forEach(id => {
                const el = document.getElementById(id);
                out[id] = el ? {
                    found: true,
                    tagName: el.tagName,
                    childCount: el.children.length,
                    innerText_preview: el.innerText.slice(0, 200).replace(/\\s+/g,' ')
                } : { found: false };
            });
            return out;
        }""", TARGET_IDS)

        for id_, info in results.items():
            if info["found"]:
                print(f"  ✅ #{id_} ({info['tagName']}) — {info['childCount']} hijos")
                print(f"     preview: {info['innerText_preview']}")
            else:
                print(f"  ❌ #{id_} — NO ENCONTRADO")

        # ── 3. Buscar IDs similares (por si cambiaron nombres) ──────────────
        print("\n[BUSCAR IDs CON 'attribute|cross|alternate|equip']")
        similar = page.evaluate("""() => {
            const found = [];
            document.querySelectorAll('[id]').forEach(el => {
                const id = el.id.toLowerCase();
                if (id.includes('attribute') || id.includes('cross') ||
                    id.includes('alternate') || id.includes('equip') ||
                    id.includes('spec') || id.includes('product')) {
                    found.push({ id: el.id, tag: el.tagName, children: el.children.length });
                }
            });
            return found;
        }""")
        if similar:
            for s in similar:
                print(f"  → #{s['id']} <{s['tag']}> ({s['children']} hijos)")
        else:
            print("  (ninguno encontrado — ¿bot detection activo?)")

        # ── 4. Detectar si hay modal/overlay bloqueando ─────────────────────
        print("\n[MODALES / OVERLAYS VISIBLES]")
        modals = page.evaluate("""() => {
            const found = [];
            document.querySelectorAll('[class*="modal"],[class*="overlay"],[class*="popup"],[class*="region"]').forEach(el => {
                if (el.offsetParent !== null) {
                    found.push({ class: el.className.slice(0,80), tag: el.tagName });
                }
            });
            return found.slice(0,10);
        }""")
        if modals:
            for m in modals:
                print(f"  ⚠  <{m['tag']}> class='{m['class']}'")
        else:
            print("  (ninguno visible)")

        # ── 5. H1/H2 visible ───────────────────────────────────────────────
        headings = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('h1,h2')).slice(0,5).map(h => ({
                tag: h.tagName,
                text: h.textContent.trim().slice(0,120)
            }));
        }""")
        print("\n[HEADINGS VISIBLES]")
        for h in headings:
            print(f"  <{h['tag']}> {h['text']}")

        # ── 6. Screenshot ───────────────────────────────────────────────────
        page.screenshot(path=OUT_SCREEN, full_page=False)
        print(f"\n[SCREENSHOT] guardado → {OUT_SCREEN}")

        # ── 7. HTML completo (primeros 50 000 chars) ────────────────────────
        html = page.content()
        with open(OUT_HTML, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"[HTML]       guardado → {OUT_HTML}  ({len(html):,} chars)")

        context.close()

    print("\n=== DEBUG COMPLETO ===")
    print("Revisar debug_screenshot.png y debug_page.html para diagnóstico.")

if __name__ == "__main__":
    main()
