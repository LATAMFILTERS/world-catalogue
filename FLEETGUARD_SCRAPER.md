# 🚀 Fleetguard Catalog Scraper

Sistema completo para scraping del catálogo de Fleetguard (500 páginas) y almacenamiento en MongoDB.

## 📋 Características

✅ **Scraping Robusto**
- Extrae 500 páginas del catálogo Fleetguard
- Manejo de errores y reintentos automáticos
- Rate limiting para no sobrecargar servidores
- Timeout inteligente

✅ **Datos Extraídos**
- SKU del producto
- Nombre y descripción
- Especificaciones técnicas completas
- **Partes relacionadas** (Replaces, For Upgrade Use, Upgrade Of)
- **Cross-references OEM** (códigos homólogos por fabricante)
- **Compatibilidad de equipos** (Equipment, Engine, Year, Qty)
- **Kits de mantenimiento** (con componentes incluidos)
- URLs de imágenes
- URLs de productos

✅ **Almacenamiento**
- MongoDB nativo
- Upsert automático (actualiza si existe)
- Índices optimizados para búsqueda
- Timestamps de actualización

✅ **API REST**
- Búsqueda por SKU
- Búsqueda por nombre/descripción
- Filtros por tipo
- Paginación
- Estadísticas

## 🛠️ Instalación

### Prerequisites
```bash
# Node.js 18+
node --version

# MongoDB conectado (via Mongoose)
# Usar env: MONGODB_URI
```

### Setup
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
# .env debe incluir MONGODB_URI
```

## 🚀 Uso

### 1. Scraping Simple (Test - 2 páginas)
```bash
node scripts/scrapeFleetguardCatalog.js
```

### 2. Scraping Completo (500 páginas)
```bash
node scripts/scrapeFleetguardCatalog.js 500
```

### 3. Scraping + Guardar en MongoDB
```bash
node scripts/scrapeFleetguardCatalog.js 500 --save-db
```

### 4. Scraping Páginas Específicas
```bash
# 100 páginas
node scripts/scrapeFleetguardCatalog.js 100

# 50 páginas
node scripts/scrapeFleetguardCatalog.js 50
```

## 📊 Salida

### Archivo JSON
```
fleetguard-catalog.json
```

Ejemplo de estructura:
```json
{
  "sku": "LF14000NN",
  "name": "Lube Filter, Spin-On, NanoNet",
  "description": "Fleetguard® LF14000NN lube spin-on filter features...",
  "specifications": {
    "Media Type": "NanoNet",
    "Gasket OD": "4.68 inch / 118.88 mm",
    "Length": "11.60 inch / 294.69 mm",
    "Pressure Valve Opening Pressure": "1.00 kPa",
    "Test Specification": "ISO 4548-12",
    "Rated Flow": "27.74 gpm / 105.00 L/min"
  },
  "related_parts": {
    "Replaces": ["LF9080"],
    "For Upgrade, Use": ["LF14001NN"],
    "Upgrade Of": ["LF9080"]
  },
  "oem_cross_reference": [
    {
      "oem_code": "CAT 1R1808",
      "manufacturer": "Caterpillar",
      "description": "Spin-On Oil Filter"
    },
    {
      "oem_code": "VOLVO 20430585",
      "manufacturer": "Volvo",
      "description": "Oil Filter"
    }
  ],
  "equipment_compatibility": [
    {
      "equipment": "Freightliner - XC Raised Rail",
      "engine": "X12",
      "year": "2021",
      "qty_req": "1"
    }
  ],
  "maintenance_kits": [
    {
      "maintenance_kit": "MK11015",
      "part_number": "LF14000NN",
      "quantity": "1",
      "product_family": "Lube"
    },
    {
      "maintenance_kit": "MK11016",
      "part_number": "LF14000NN",
      "quantity": "1",
      "product_family": "Lube"
    }
  ],
  "image_url": "https://...",
  "product_url": "https://www.fleetguard.com/product/...",
  "scraped_at": "2024-01-15T10:30:00.000Z"
}
```

### Reporte
```
scrape_reports/fleetguard-scrape-{timestamp}.json
```

## 🔌 API Endpoints

### Base URL
```
http://localhost:8080/api/fleetguard
```

### 1. Obtener Producto por SKU
```bash
GET /api/fleetguard/product/LF14000NN

# Response
{
  "success": true,
  "data": {
    "sku": "LF14000NN",
    "name": "Lube Filter, Spin-On, NanoNet",
    ...
  }
}
```

### 2. Buscar Productos (Nombre/Descripción/SKU)
```bash
GET /api/fleetguard/search?q=lube&type=filter&limit=20

# Query params:
# q - término de búsqueda
# type - tipo de filtro (opcional)
# limit - máximo 100 (default: 20)
```

### 3. Obtener Catálogo Completo (Paginado)
```bash
GET /api/fleetguard/catalog?skip=0&limit=50&sort=sku

# Query params:
# skip - offset para paginación (default: 0)
# limit - máximo 500 (default: 50)
# sort - campo para ordenar (default: sku)
```

### 4. Buscar por Código OEM (Fabricante de Equipos)
```bash
GET /api/fleetguard/oem-code/CAT1R1808

# Busca códigos equivalentes de fabricantes como:
# Caterpillar, Komatsu, Volvo, Mack, Ford, Toyota, Nissan, John Deere, etc.
```

### 5. Buscar por Código de Referencia Cruzada (Fabricante de Filtros)
```bash
GET /api/fleetguard/cross-reference/DONALDSON

# Busca códigos equivalentes de fabricantes como:
# Donaldson, Fleetguard, Baldwin, Wix, Mann Filters, Fram, Bosch, Mahle, etc.
```

### 6. Buscar por Compatibilidad de Equipo
```bash
GET /api/fleetguard/equipment/Freightliner

# Busca todos los productos compatibles con un equipo específico
```

### 7. Buscar Componentes de Kit de Mantenimiento
```bash
GET /api/fleetguard/maintenance-kit/MK11015

# Busca todos los componentes incluidos en un kit de mantenimiento
```

### 8. Obtener Fabricantes Disponibles
```bash
GET /api/fleetguard/manufacturers

# Response
{
  "success": true,
  "data": {
    "equipment_manufacturers": {
      "count": 20,
      "list": ["Caterpillar", "Komatsu", "Volvo", ...]
    },
    "filter_manufacturers": {
      "count": 15,
      "list": ["Donaldson", "Fleetguard", "Baldwin", ...]
    }
  }
}
```

### 9. Obtener Tipos de Filtros
```bash
GET /api/fleetguard/filter-types

# Response
{
  "success": true,
  "data": {
    "filter_types": ["NanoNet", "Standard", "Elite", ...],
    "total_types": 15
  }
}
```

### 10. Obtener Estadísticas
```bash
GET /api/fleetguard/stats

# Response
{
  "success": true,
  "data": {
    "total_products": 3200,
    "collection": "fleetguard_products",
    "database": "connected"
  }
}
```

### 11. Importar Lote (Testing)
```bash
POST /api/fleetguard/batch-import

# Body
{
  "products": [
    {
      "sku": "LF14000NN",
      "name": "Lube Filter...",
      ...
    }
  ]
}
```

## 📈 Performance

### Timing Estimado
- **2 páginas (test)**: ~2-3 minutos
- **100 páginas**: ~30-40 minutos
- **500 páginas (completo)**: ~3-4 horas

### Rate Limiting
```javascript
DELAY_BETWEEN_PRODUCTS = 2000ms  // 2 segundos
DELAY_BETWEEN_PAGES = 3000ms     // 3 segundos
```

### Recursos
- Memoria: ~500MB - 1GB (con Puppeteer)
- Conexión: ~10MB por ejecución
- Almacenamiento: ~50-100MB en MongoDB

## 🔧 Configuración Avanzada

### Reclasificación Automática de OEM Codes

El sistema automáticamente clasifica los códigos OEM en dos categorías:

**OEM Codes** (Códigos de Equipos):
- Cat, Komatsu, Volvo, Mack, Ford, Toyota, Nissan, John Deere, Onan, Cummins, Duramax, Powerstroke, Detroit Diesel, Mercedes, BMW, Daimler, Scania, Man, Iveco, Renault

**Cross Reference Codes** (Códigos de Filtros):
- Donaldson, Fleetguard, Baldwin, Wix, Mann Filters, Fram, Bosch, Mahle, Hydac, Parker, Hastings, ACDelco, Motorcraft, Mopar, Toyota OEM

La reclasificación usa:
1. Búsqueda de fabricante por nombre/alias
2. Matching de prefijo de código
3. Patrones de código
4. Clasificación por defecto

Ver: `services/oem-classifier.service.js`

### Ajustar Rate Limiting
En `services/fleetguard-catalog.scraper.js`:
```javascript
const DELAY_BETWEEN_PRODUCTS = 2000; // Reducir si es necesario
const DELAY_BETWEEN_PAGES = 3000;    // Reducir si es necesario
```

### Cambiar URL Base
```javascript
const FLEETGUARD_BASE = 'https://www.fleetguard.com';
```

### Timeout
```javascript
const TIMEOUT_MS = 30000; // 30 segundos
```

## 📝 Logs

El scraper genera logs en tiempo real:
```
🚀 Iniciando scraping de catálogo Fleetguard...
📊 Total de páginas: 500 (Scrapeando 500)

--- Página 1/500 ---
  📦 Extrayendo: LF14000NN
  📦 Extrayendo: FF63054NN
  ✅ Encontrados 45 productos en página 1
```

## 🐛 Troubleshooting

### Timeout en Puppeteer
```bash
# Aumentar timeout
# Editar TIMEOUT_MS en scraper.js
const TIMEOUT_MS = 60000; // 60 segundos
```

### MongoDB Connection Error
```bash
# Verificar MONGODB_URI en .env
# Probar conexión
node config/mongo.config.js
```

### Memory Issues
```bash
# Ejecutar en partes más pequeñas
node scripts/scrapeFleetguardCatalog.js 50 --save-db
# Esperar entre ejecuciones
```

## 📊 Monitoreo

### Ver progreso
```bash
# Terminal 1: Ejecutar scraper
node scripts/scrapeFleetguardCatalog.js 100 --save-db

# Terminal 2: Ver estadísticas en vivo
watch 'curl -s http://localhost:8080/api/fleetguard/stats | jq'
```

### Verificar datos guardados
```bash
# MongoDB Compass o CLI
db.fleetguard_products.countDocuments()
db.fleetguard_products.findOne()
```

## 🚀 Integración con API

✅ **La API Fleetguard está integrada en el servidor principal**

El servidor Express (server.js) ahora incluye las rutas Fleetguard automáticamente:
```javascript
const fleetguardRoutes = require('./routes/fleetguard.routes');
app.use('/api/fleetguard', fleetguardRoutes);
```

Todos los endpoints están disponibles en: `http://localhost:8080/api/fleetguard/*`

Para iniciar el servidor:
```bash
npm start
# o
node server.js
```

## 📄 Archivos Generados

```
/home/user/world-catalogue/
├── services/
│   ├── fleetguard-catalog.scraper.js    # Scraper principal
│   └── fleetguard-db.service.js         # Servicio de BD
├── routes/
│   └── fleetguard.routes.js             # API endpoints
├── scripts/
│   └── scrapeFleetguardCatalog.js      # Script ejecutable
├── config/
│   └── mongo.config.js                 # Config MongoDB
├── fleetguard-catalog.json             # Datos extraídos
└── scrape_reports/
    └── fleetguard-scrape-*.json        # Reportes
```

## 📞 Soporte

Para problemas o preguntas:
1. Revisar logs en `scrape_reports/`
2. Verificar conexión a MongoDB
3. Probar con menos páginas primero
4. Aumentar timeouts si es necesario

---

**Versión**: 1.0.0
**Última actualización**: 2026-03-13
**Estado**: ✅ Producción
