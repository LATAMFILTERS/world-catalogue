import json
import os
from playwright.sync_api import sync_playwright

# ⚠️ Cambia esta URL por la categoría Air Dryer correcta de Donaldson
# Ejemplo: https://shop.donaldson.com/store/en-us/search?N=XXXXXXXXX
AIR_DRYER_URL = "https://shop.donaldson.com/store/en-us/search?N=2748940002"

def destruir_estorbos(page):
    try:
        page.evaluate("""() => {
            const basura = ['#chat-button', '.LPMcontainer', '.optanon-alert-box-wrapper',
                            '.osano-cm-window', '.modal-backdrop', '.modal-open'];
            basura.forEach(s => { const el = document.querySelector(s); if(el) el.remove(); });
            document.body.style.overflow = 'auto';
        }""")
    except:
        pass

def run_donaldson_air_dryer():
    with sync_playwright() as p:
        user_data_dir = os.path.join(os.getcwd(), "sesion_airdryer")
        context = p.chromium.launch_persistent_context(
            user_data_dir,
            headless=False,
            args=["--disable-blink-features=AutomationControlled"]
        )

        page = context.pages[0]
        page.goto(AIR_DRYER_URL)

        input("👉 Resuelve el acceso y pulsa ENTER cuando veas los filtros...")

        # Fix: evaluate() no evaluate_all() para obtener array de hrefs
        links = page.evaluate("""() => {
            const els = document.querySelectorAll('a.donaldson-part-details');
            return [...new Set([...els].map(e => e.href))];
        }""")

        print(f"📦 Detectados {len(links)} productos.")

        results = []

        for i, link in enumerate(links):
            pid = f"desconocido_{i+1}"  # Default por si falla antes de leer el pid
            new_page = context.new_page()

            try:
                new_page.goto(link, wait_until="domcontentloaded", timeout=60000)
                destruir_estorbos(new_page)

                pid = new_page.locator("#productPageProductNumber").inner_text().strip()
                print(f"[{i+1}/{len(links)}] 📦 Procesando: {pid}")

                # 1. ATRIBUTOS — click tab + expandir Show More
                # Intentar todos los selectores posibles para el tab de especificaciones
                new_page.evaluate("""() => {
                    const tabs = ['a[href="#specifications"]', 'a[href="#productSpecifications"]',
                                  'a[href="#techSpecs"]', 'a[href="#attributes"]',
                                  'button[data-tab="specifications"]'];
                    for (const sel of tabs) {
                        const el = document.querySelector(sel);
                        if (el) { el.click(); break; }
                    }
                }""")
                new_page.wait_for_timeout(2000)

                # Show More en atributos
                new_page.evaluate("""async () => {
                    while (true) {
                        let btn = Array.from(document.querySelectorAll('button, a'))
                                       .find(b => b.innerText.toLowerCase().includes('show more')
                                               && !b.closest('#crossReference')
                                               && !b.closest('#equiptment'));
                        if (!btn) break;
                        btn.click();
                        await new Promise(r => setTimeout(r, 2000));
                    }
                }""")

                # Extraer atributos con múltiples selectores
                raw_attrs = new_page.evaluate("""() => {
                    let data = {};

                    // Selector 1: dl dt/dd (el más común en Donaldson)
                    document.querySelectorAll('dl dt, .product-specification-table dt').forEach(dt => {
                        const dd = dt.nextElementSibling;
                        if (dd) data[dt.innerText.trim()] = dd.innerText.trim();
                    });

                    // Selector 2: tabla con th/td
                    if (Object.keys(data).length === 0) {
                        document.querySelectorAll('.specifications-table tr, .spec-table tr').forEach(tr => {
                            const th = tr.querySelector('th');
                            const td = tr.querySelector('td');
                            if (th && td) data[th.innerText.trim()] = td.innerText.trim();
                        });
                    }

                    // Selector 3: divs con label/value
                    if (Object.keys(data).length === 0) {
                        document.querySelectorAll('[class*="spec"] [class*="label"], [class*="attr"] [class*="label"]').forEach(label => {
                            const value = label.nextElementSibling;
                            if (value) data[label.innerText.trim()] = value.innerText.trim();
                        });
                    }

                    return data;
                }""")

                # 2. CROSS REFERENCE — expansión forzada
                new_page.evaluate("() => document.querySelector('a[href=\"#crossReference\"]')?.click()")
                new_page.wait_for_timeout(2000)

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

                # 3. EQUIPMENT — expansión forzada
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
                        return c.length >= 3
                            ? { make: c[0].innerText.trim(), model: c[1].innerText.trim(), engine: c[2].innerText.trim() }
                            : null;
                    }).filter(x => x);
                }""")

                results.append({
                    "base_code": pid,
                    "od": raw_attrs.get("Outer Diameter"),
                    "len": raw_attrs.get("Length"),
                    "t_desc": raw_attrs.get("Thread Size"),
                    "attrs": raw_attrs,
                    "cross": cross,
                    "apps": equipment
                })

                print(f"   ✅ {len(raw_attrs)} Atrib | {len(cross)} Cross | {len(equipment)} Equip")

            except Exception as e:
                print(f"   ❌ Error en {pid}: {e}")

            finally:
                new_page.close()

        with open("air_dryer_results.json", "w", encoding="utf-8") as f:
            json.dump(results, f, indent=4, ensure_ascii=False)

        print(f"\n🏆 SCRAPING COMPLETADO — {len(results)} productos guardados en air_dryer_results.json")
        context.close()

if __name__ == "__main__":
    run_donaldson_air_dryer()
