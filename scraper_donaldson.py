import json
import os
from playwright.sync_api import sync_playwright

def destruir_estorbos(page):
    try:
        page.evaluate("""() => {
            const basura = ['#chat-button', '.LPMcontainer', '.optanon-alert-box-wrapper', '.osano-cm-window', '.modal-backdrop', '.modal-open'];
            basura.forEach(s => { const el = document.querySelector(s); if(el) el.remove(); });
            document.body.style.overflow = 'auto';
        }""")
    except: pass

def run_donaldson_final():
    with sync_playwright() as p:
        user_data_dir = os.path.join(os.getcwd(), "sesion_final")
        context = p.chromium.launch_persistent_context(
            user_data_dir,
            headless=False,
            args=["--disable-blink-features=AutomationControlled"]
        )
        
        page = context.pages[0]
        page.goto("https://shop.donaldson.com/store/en-us/search?N=2748940002")

        input("👉 Resuelve el acceso y pulsa ENTER cuando veas los filtros...")

        links = page.locator("a.donaldson-part-details").evaluate_all("els => [...new Set(els.map(e => e.href))]")
        print(f"📦 Detectados {len(links)} productos.")

        results = []
        for i, link in enumerate(links):
            new_page = context.new_page()
            try:
                new_page.goto(link, wait_until="domcontentloaded", timeout=60000)
                destruir_estorbos(new_page)
                
                pid = new_page.locator("#productPageProductNumber").inner_text().strip()
                print(f"[{i+1}/{len(links)}] 📦 Procesando: {pid}")

                # 1. ATRIBUTOS
                raw_attrs = new_page.evaluate("""() => {
                    let data = {};
                    document.querySelectorAll('.product-specification-table dt').forEach(dt => {
                        const dd = dt.nextElementSibling;
                        if(dd) data[dt.innerText.trim()] = dd.innerText.trim();
                    });
                    return data;
                }""")

                # 2. CROSS REFERENCE - EXPANSIÓN FORZADA
                # Hacemos click en el tab
                new_page.evaluate("() => document.querySelector('a[href=\"#crossReference\"]')?.click()")
                new_page.wait_for_timeout(2000)
                
                # Inyección de script para pulsar 'Show More' hasta el final
                new_page.evaluate("""async () => {
                    while (true) {
                        let btn = Array.from(document.querySelectorAll('#crossReference button, #crossReference a'))
                                       .find(b => b.innerText.toLowerCase().includes('show more'));
                        if (!btn) break;
                        btn.click();
                        await new Promise(r => setTimeout(r, 2500));
                    }
                }""")

                cross = new_page.evaluate("""() => {
                    return Array.from(document.querySelectorAll('#crossreferenceBody tbody tr')).map(r => {
                        const c = r.querySelectorAll('td');
                        return c.length >= 2 ? { brand: c[0].innerText.trim(), code: c[1].innerText.trim() } : null;
                    }).filter(x => x);
                }""")

                # 3. EQUIPMENT - EXPANSIÓN FORZADA
                new_page.evaluate("() => document.querySelector('a[href=\"#equiptment\"]')?.click()")
                new_page.wait_for_timeout(2000)

                new_page.evaluate("""async () => {
                    while (true) {
                        let btn = Array.from(document.querySelectorAll('#equiptment button, #equiptment a'))
                                       .find(b => b.innerText.toLowerCase().includes('show more'));
                        if (!btn) break;
                        btn.click();
                        await new Promise(r => setTimeout(r, 2500));
                    }
                }""")

                equipment = new_page.evaluate("""() => {
                    return Array.from(document.querySelectorAll('#equiptmentBody tbody tr')).map(r => {
                        const c = r.querySelectorAll('td');
                        return c.length >= 3 ? { make: c[0].innerText.trim(), model: c[1].innerText.trim(), engine: c[2].innerText.trim() } : null;
                    }).filter(x => x);
                }""")

                results.append({
                    "base_code": pid,
                    "od": raw_attrs.get("Outer Diameter"),
                    "len": raw_attrs.get("Length"),
                    "t_desc": raw_attrs.get("Thread Size"),
                    "cross": cross,
                    "apps": equipment
                })
                print(f"   ✅ {pid} finalizado: {len(cross)} Cross | {len(equipment)} Equip")

            except Exception as e:
                print(f"   ❌ Error en {pid}: {e}")
            new_page.close()

        with open("resultados.json", "w", encoding="utf-8") as f:
            json.dump(results, f, indent=4, ensure_ascii=False)
        
        print("\n🏆 SCRAPING COMPLETADO.")
        context.close()

if __name__ == "__main__":
    run_donaldson_final()