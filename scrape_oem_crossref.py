"""
Donaldson OEM Cross Reference Extractor
Extrae OEM codes y equipos desde oilfilter-crossreference.com
Ejecutar: python scrape_oem_crossref.py
"""

from firecrawl import Firecrawl
import json
import time
import re
from datetime import datetime

firecrawl = Firecrawl(api_key="fc-a0a1e35f9850462ea71f42537cffcbc8")

# Códigos Donaldson a buscar (empezamos con DBL y primeros P)
CODES = [
    # DBL Series
    "DBL0832", "DBL3998", "DBL4560", "DBL7300", "DBL7345", "DBL7349",
    "DBL7367", "DBL7405", "DBL7483", "DBL7505", "DBL7670", "DBL7739",
    "DBL7900", "DBL7947",
    # P Series principales
    "P169071", "P173489", "P173998", "P502007", "P502008", "P502009",
    "P502015", "P502016", "P550162", "P550518", "P550949", "P550935",
    "P550006", "P550008", "P550010", "P557505", "P581330", "P582090"
]

results = {}
errors = []

print("🔍 DONALDSON OEM CROSS REFERENCE EXTRACTOR")
print("="*70)
print(f"Extrayendo OEM codes para {len(CODES)} filtros...\n")

for i, code in enumerate(CODES, 1):
    url = f"https://www.oilfilter-crossreference.com/convert/DONALDSON/{code}"
    print(f"[{i}/{len(CODES)}] {code}...")

    try:
        result = firecrawl.scrape(url)
        markdown = result.markdown if result.markdown else ""

        # Extraer OEM codes del markdown
        oem_codes = []
        equipment = []

        # Buscar líneas con códigos OEM
        lines = markdown.split('\n')
        for line in lines:
            # Buscar codes de CAT, Cummins, JD, Volvo, etc.
            if any(brand in line.upper() for brand in [
                'CATERPILLAR', 'CAT', 'CUMMINS', 'JOHN DEERE', 'VOLVO',
                'KOMATSU', 'HITACHI', 'ISUZU', 'MITSUBISHI', 'HONDA',
                'FORD', 'DETROIT', 'MACK', 'MERCEDES', 'MAN', 'DAF',
                'SCANIA', 'DEUTZ', 'PERKINS', 'YANMAR', 'KUBOTA',
                'BALDWIN', 'FLEETGUARD', 'WIX', 'FRAM', 'LUBER'
            ]):
                line_clean = line.strip()
                if line_clean and len(line_clean) < 200:
                    oem_codes.append(line_clean)

        # Guardar resultado
        results[code] = {
            "code": code,
            "url": url,
            "oem_references": oem_codes[:20],  # Max 20
            "content_length": len(markdown),
            "raw_preview": markdown[:500] if markdown else ""
        }

        count = len(oem_codes)
        print(f"   ✅ {count} OEM refs encontradas")

        time.sleep(1.5)  # Rate limit

    except Exception as e:
        print(f"   ❌ Error: {str(e)[:50]}")
        errors.append({"code": code, "error": str(e)})
        time.sleep(2)

print(f"\n{'='*70}")
print(f"✅ COMPLETADO")
print(f"   Exitosos: {len(results)}")
print(f"   Errores: {len(errors)}")

# Guardar resultados
output = {
    "timestamp": datetime.now().isoformat(),
    "source": "oilfilter-crossreference.com",
    "total_codes": len(CODES),
    "results": results,
    "errors": errors
}

with open("donaldson_oem_crossref.json", "w", encoding="utf-8") as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"📁 Guardado: donaldson_oem_crossref.json")
