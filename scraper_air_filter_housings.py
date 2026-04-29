import json
import os
from playwright.sync_api import sync_playwright

AIR_FILTER_HOUSINGS_URL = "https://shop.donaldson.com/store/en-us/search?N=2065132825&Nr=product.language%3AEnglish&catNav=true&st=parts"

def remover_popups(page):
    """Remove popups and chatbots"""
    try:
        page.evaluate("""() => {
            const popups = ['#chat-button', '.LPMcontainer', '.optanon-alert-box-wrapper',
                           '.osano-cm-window', '.modal-backdrop', '.modal-open',
                           '[id*="chat"]', '[class*="chat"]', 'iframe[title*="chat"]'];
            popups.forEach(s => {
                document.querySelectorAll(s).forEach(el => el.remove());
            });
            document.body.style.overflow = 'auto';
        }""")
    except:
        pass

def extraer_atributos(page):
    """Extract attributes from #attributesBody table"""
    attrs = page.evaluate("""() => {
        let data = {};
        document.querySelectorAll('#attributesBody table tr').forEach(tr => {
            const tds = tr.querySelectorAll('td');
            if (tds.length >= 2) {
                const label = tds[0].innerText.trim();
                const value = tds[1].innerText.trim();
                if (label && value) {
                    data[label] = value;
                }
            }
        });
        return data;
    }""")
    return attrs

def expandir_show_more_atributos(page):
    """Click Show More in attributes section until all expanded"""
    page.evaluate("""async () => {
        let expanded = true;
        while (expanded) {
            let btn = document.getElementById('showMoreProductSpecsButton');
            if (!btn || btn.style.display === 'none') {
                expanded = false;
            } else {
                btn.click();
                await new Promise(r => setTimeout(r, 1500));
            }
        }
    }""")
    page.wait_for_timeout(1000)

def extraer_cross_reference(page):
    """Extract cross reference data"""
    cross = page.evaluate("""() => {
        let data = [];
        document.querySelectorAll('#crossreferenceBody table tbody tr').forEach(tr => {
            const tds = tr.querySelectorAll('td');
            if (tds.length >= 2) {
                const mfr = tds[0].innerText.trim();
                const part = tds[1].innerText.trim();
                if (mfr && part && !mfr.includes('Manufacturer')) {
                    data.push({
                        manufacturer: mfr,
                        part_number: part
                    });
                }
            }
        });
        return data;
    }""")
    return cross

def expandir_show_more_cross(page):
    """Click Show More in cross reference"""
    page.evaluate("""async () => {
        let expanded = true;
        while (expanded) {
            let btn = document.getElementById('showAllCrossReferenceListButton');
            if (!btn || btn.style.display === 'none') {
                expanded = false;
            } else {
                btn.click();
                await new Promise(r => setTimeout(r, 1500));
            }
        }
    }""")
    page.wait_for_timeout(1000)

def extraer_equipment(page):
    """Extract equipment data"""
    equip = page.evaluate("""() => {
        let data = [];
        document.querySelectorAll('#equiptmentBody table tbody tr').forEach(tr => {
            const tds = tr.querySelectorAll('td');
            if (tds.length >= 5) {
                const equipment = tds[0].innerText.trim();
                const year = tds[1].innerText.trim();
                const type = tds[2].innerText.trim();
                const engine = tds[4].innerText.trim();
                if (equipment && equipment !== 'Equipment') {
                    data.push({
                        equipment: equipment,
                        year: year !== '-' ? year : null,
                        type: type,
                        engine: engine
                    });
                }
            }
        });
        return data;
    }""")
    return equip

def expandir_show_more_equipment(page):
    """Click Show More in equipment"""
    page.evaluate("""async () => {
        let expanded = true;
        while (expanded) {
            let btn = document.getElementById('showMorePdpListButton');
            if (!btn || btn.style.display === 'none') {
                expanded = false;
            } else {
                btn.click();
                await new Promise(r => setTimeout(r, 1500));
            }
        }
    }""")
    page.wait_for_timeout(1000)

def extraer_alternates(page):
    """Extract alternate products (same geometry/thread, different media)"""
    alternates = page.evaluate("""() => {
        let data = [];
        const alternateBody = document.getElementById('alternateBody');
        if (!alternateBody) return data;

        document.querySelectorAll('#alternateBody .owl-item .item').forEach(item => {
            const code = item.querySelector('pre.preAlternate h5')?.innerText?.trim();
            const desc = item.querySelector('h6.desLengthCheck')?.innerText?.trim();
            const notes = item.querySelector('.lengthCheck')?.innerText?.trim();
            const url = item.querySelector('[data-url]')?.getAttribute('data-url');

            if (code) {
                data.push({
                    code: code,
                    description: desc,
                    notes: notes,
                    url: url
                });
            }
        });

        return data;
    }""")
    return alternates

def run_donaldson_air_filter_housings():
    with sync_playwright() as p:
        user_data_dir = os.path.join(os.getcwd(), "sesion_air_filter_housings")
        context = p.chromium.launch_persistent_context(
            user_data_dir,
            headless=False,
            args=["--disable-blink-features=AutomationControlled"]
        )

        page = context.pages[0]
        page.goto(AIR_FILTER_HOUSINGS_URL)
        page.wait_for_timeout(2000)

        input("👉 Resuelve el acceso y pulsa ENTER cuando veas los filtros...")

        results = []
        page_num = 1
        total_processed = 0

        while True:
            print(f"\n📄 Página {page_num}: Detectando y scrapeando productos...")

            links = page.evaluate("""() => {
                const els = document.querySelectorAll('a.donaldson-part-details');
                return [...new Set([...els].map(e => e.href))];
            }""")

            print(f"   📦 {len(links)} productos en esta página\n")

            for i, link in enumerate(links):
                pid = f"desconocido_{total_processed + i + 1}"
                new_page = context.new_page()

                try:
                    link_us = link.replace('/store/en-nl/', '/store/en-us/')
                    print(f"   [{i+1}/{len(links)}] Abriendo {link_us[:60]}...")
                    new_page.goto(link_us, wait_until="networkidle", timeout=60000)
                    new_page.wait_for_timeout(2000)
                    remover_popups(new_page)

                    pid = new_page.locator("#productPageProductNumber").inner_text().strip()
                    print(f"           → Código: {pid}")

                    print(f"           → Extrayendo atributos...")
                    expandir_show_more_atributos(new_page)
                    raw_attrs = extraer_atributos(new_page)

                    print(f"           → Extrayendo cross-references...")
                    expandir_show_more_cross(new_page)
                    cross = extraer_cross_reference(new_page)

                    print(f"           → Extrayendo equipment...")
                    expandir_show_more_equipment(new_page)
                    equipment = extraer_equipment(new_page)

                    print(f"           → Extrayendo productos alternativos...")
                    alternates = extraer_alternates(new_page)

                    results.append({
                        "base_code": pid,
                        "od": raw_attrs.get("Outer Diameter"),
                        "len": raw_attrs.get("Length"),
                        "thread": raw_attrs.get("Thread Size"),
                        "attributes": raw_attrs,
                        "cross_reference": cross,
                        "equipment": equipment,
                        "alternative_products": alternates
                    })

                    alt_count = len(alternates) if alternates else 0
                    print(f"           ✅ {len(raw_attrs)} Atrib | {len(cross)} Cross | {len(equipment)} Equip | {alt_count} Alternates\n")

                except Exception as e:
                    print(f"           ❌ Error: {str(e)[:50]}\n")
                    results.append({"base_code": pid, "error": str(e)})

                finally:
                    new_page.close()
                    page.wait_for_timeout(2000)

            total_processed += len(links)

            has_next = page.evaluate("""() => {
                const nextBtn = document.querySelector('a[title="Next Page"], a[class*="next"]');
                if (!nextBtn) return false;
                const isVisible = nextBtn.style.display !== 'none' && nextBtn.offsetParent !== null;
                const isEnabled = !nextBtn.disabled && !nextBtn.hasAttribute('aria-disabled') && !nextBtn.classList.contains('disabled');
                return isVisible && isEnabled;
            }""")

            if has_next:
                print(f"\n{'='*80}")
                print(f"📄 Página {page_num} completada. Total: {total_processed}/280")
                print(f"{'='*80}")
                print(f"⏳ Continuando automáticamente a página {page_num + 1}...")

                page.evaluate("""() => {
                    const nextBtn = document.querySelector('a[title="Next Page"], a[class*="next"]');
                    if (nextBtn) nextBtn.click();
                }""")
                page.wait_for_timeout(5000)
                page_num += 1
            else:
                print(f"\n✅ Fin de páginas.")
                break

        successful = len([r for r in results if "error" not in r])
        print(f"\n{'='*80}")
        print(f"🏆 AIR FILTER HOUSINGS SCRAPING COMPLETADO")
        print(f"{'='*80}")
        print(f"Total procesados: {total_processed}")
        print(f"Exitosos: {successful}")
        print(f"Errores: {len(results) - successful}")

        with open("air_filter_housings_results.json", "w", encoding="utf-8") as f:
            json.dump(results, f, indent=4, ensure_ascii=False)

        print(f"\n📁 Guardado en: air_filter_housings_results.json")
        context.close()

if __name__ == "__main__":
    run_donaldson_air_filter_housings()
