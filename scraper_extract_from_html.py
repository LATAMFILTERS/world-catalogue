#!/usr/bin/env python3
"""
Lee HTML guardado y extrae datos mediante patrones
"""

import re
import json

# Leer el HTML guardado
try:
    with open("donaldson_page_after_js.html", "r", encoding="utf-8") as f:
        html = f.read()
except:
    print("❌ No se encuentra donaldson_page_after_js.html")
    exit(1)

code = "DBL0832"
print(f"Analizando: {code}")
print(f"Tamaño HTML: {len(html)} caracteres\n")

# Buscar posición del código
code_pos = html.find(code)
if code_pos != -1:
    print(f"✅ Código encontrado en posición {code_pos}")
    # Mostrar 500 caracteres alrededor
    start = max(0, code_pos - 250)
    end = min(len(html), code_pos + 500)
    context = html[start:end]
    print(f"\nContexto (500 caracteres):")
    print("-" * 80)
    print(context)
    print("-" * 80)

# Buscar patrones de especificaciones
print(f"\n=== BÚSQUEDA DE PATRONES ===\n")

patterns = {
    "Micron": r'(\d+)\s*(?:µm|micron)',
    "Efficiency %": r'(\d+(?:\.\d+)?)\s*%\s*@',
    "OEM Codes": r'OEM[:\s]+([A-Z0-9\-]+)',
    "Media": r'(?:media|Media):\s*([A-Za-z0-9\s\-]+)',
    "PSI": r'(\d+)\s*(?:PSI|psi)',
    "Dimensions": r'(\d+(?:\.\d+)?)\s*(?:inches|mm|")',
}

for name, pattern in patterns.items():
    matches = re.findall(pattern, html, re.IGNORECASE)
    if matches:
        print(f"✅ {name}: {matches[:5]}")

# Buscar JSON embebido (algunos sitios incluyen datos JSON en script tags)
print(f"\n=== BUSCANDO JSON ===")

json_patterns = [
    r'<script[^>]*type="application/json"[^>]*>(.*?)</script>',
    r'var\s+\w+\s*=\s*(\{[^}]+\})',
    r'"catalogPartNumber":\s*"([^"]+)"',
]

for pattern in json_patterns:
    matches = re.findall(pattern, html, re.DOTALL)
    if matches:
        print(f"✅ Encontrado patrón JSON: {len(matches)} matches")
        for match in matches[:2]:
            print(f"   {match[:100]}...")

# Buscar divs con id/class específicos que contengan datos
print(f"\n=== BUSCANDO DIVS CON DATOS ===")

div_patterns = [
    r'<div[^>]*id="[^"]*(?:spec|product|detail)[^"]*"[^>]*>',
    r'<div[^>]*class="[^"]*(?:spec|product|detail)[^"]*"[^>]*>',
]

for pattern in div_patterns:
    matches = re.findall(pattern, html, re.IGNORECASE)
    if matches:
        print(f"✅ Encontrados {len(matches)} divs relevantes")

# Extraer todo el contenido alrededor de "specification" o "especificación"
print(f"\n=== SECCIÓN DE ESPECIFICACIONES ===")

spec_match = re.search(
    r'(?:specification|especificación|spec)[^<]*.*?(?=</?(?:div|section|article)|$)',
    html,
    re.IGNORECASE | re.DOTALL
)

if spec_match:
    spec_section = spec_match.group(0)
    print(f"Encontrado (primeros 400 caracteres):")
    print(spec_section[:400])

print("\n✅ Análisis completado")
print("Próximo paso: Usar patrones encontrados para extraer datos del sitio real")
