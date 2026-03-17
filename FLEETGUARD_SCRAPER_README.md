# Fleetguard Catalog Scraper - Guía Completa

Extrae el catálogo **completo** de fleetguard.com desde cero, incluyendo:
- Datos del producto (SKU, nombre, descripción)
- Especificaciones técnicas (dimensiones, medidas, tipo de filtro)
- **Cross References** (números de competidores: Donaldson, Baldwin, Wix, etc.)
- Aplicaciones de vehículos (Make / Model / Year / Engine)
- Imágenes

## Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `scripts/scrape_fleetguard_catalog.js` | Scraper principal con Puppeteer (browser completo) |
| `scripts/fleetguard_api_scraper.js` | Scraper por API/HTTP (más rápido, sin browser) |
| `fleetguard_webscraper_sitemap.json` | Sitemap para importar en Web Scraper Chrome extension |

## Opción 1: Puppeteer Scraper (RECOMENDADO - datos más completos)

### Requisitos
- Node.js 18+
- `npm install` en la carpeta del proyecto
- Chrome/Chromium instalado en tu máquina

### Ejecutar
```bash
# Scraping completo (todas las categorías)
node scripts/scrape_fleetguard_catalog.js

# Solo una categoría
node scripts/scrape_fleetguard_catalog.js --category="Lube Filter"

# Reanudar si se interrumpió
node scripts/scrape_fleetguard_catalog.js --resume

# Ver el browser mientras trabaja (ya configurado por defecto)
# Cambia HEADLESS: false → true en CONFIG para modo silencioso
```

### Resultado
Se crea la carpeta `fleetguard_catalog/` con:
```
fleetguard_catalog/
├── products.json          → Todos los datos completos en JSON
├── products.csv           → SKU, nombre, descripción, URL, imagen
├── cross_references.csv   → SKU | Brand | Part Number
├── specifications.csv     → SKU + todas las specs técnicas
├── product_urls.json      → Lista de todas las URLs de productos
└── progress.json          → Progreso para poder reanudar
```

## Opción 2: Web Scraper.io (ya tienes la extensión instalada)

1. Abre Chrome → Web Scraper extension → **Sitemaps**
2. Click **Create Sitemap** → **Import Sitemap**
3. Pega el contenido de `fleetguard_webscraper_sitemap.json`
4. Ajusta los selectores CSS si el sitio usa nombres de clases diferentes
5. Click **Scrape** → espera que termine → **Export Data as CSV**

### Cómo ajustar los selectores

Abre fleetguard.com, clic derecho en el elemento → Inspeccionar, y verifica:
- Links de productos: `a[href*="/product/"]` o similar
- Tabla de specs: busca el elemento con las medidas
- Tabla de cross references: busca la sección "Interchange" o "Cross Reference"

## Opción 3: API Scraper (rápido, sin browser)

```bash
node scripts/fleetguard_api_scraper.js

# Solo para probar
node scripts/fleetguard_api_scraper.js --test
```

Funciona si el sitio expone datos en JSON (APIs internas).
Si el sitio usa JavaScript dinámico, usa la Opción 1.

## Ajustar los selectores CSS

Si el scraper Puppeteer no encuentra los datos, necesitas identificar los selectores correctos:

1. Abre una página de producto en fleetguard.com, ej:
   `https://www.fleetguard.com/product/LF3620`

2. Abre DevTools (F12) → pestaña **Elements**

3. Busca los elementos:
   - **SKU/Part Number**: Click derecho → "Inspect" sobre el número de parte
   - **Tabla de specs**: Busca `<table>` cerca de las dimensiones
   - **Cross References**: Busca la sección "Interchange" o "Cross Reference"

4. Copia el selector CSS y actualízalo en `scripts/scrape_fleetguard_catalog.js`
   en la función `extractProductData`

## Datos que se extraen por producto

```json
{
  "sku": "LF3620",
  "name": "Fleetguard LF3620 Lube Filter",
  "description": "...",
  "image": "https://...",
  "price": "",
  "specs": {
    "Height": "6.77 in",
    "End 2 OD": "3.66 in",
    "Largest OD": "3.66 in",
    "Thread": "1-8-16",
    "Media Type": "Full Flow",
    "Anti-Drain Valve": "Yes",
    "By-Pass Valve PSI": "11-17"
  },
  "crossReferences": [
    { "brand": "Donaldson", "partNumber": "P550335" },
    { "brand": "Baldwin", "partNumber": "B7156" },
    { "brand": "Wix", "partNumber": "51334" },
    { "brand": "Fram", "partNumber": "PH3600" }
  ],
  "applications": [
    { "Make": "Cummins", "Model": "B5.9", "Year": "1994-2002", "Engine": "5.9L" }
  ],
  "url": "https://www.fleetguard.com/product/LF3620",
  "scrapedAt": "2026-03-17T..."
}
```

## Notas importantes

- El scraper incluye delays entre requests para no sobrecargar el servidor
- Los datos se guardan progresivamente (puedes reanudar con `--resume`)
- **No se usa MongoDB** - todo va a archivos JSON y CSV
- Ejecutar con `HEADLESS: false` para ver qué hace el browser y ajustar si hay problemas
