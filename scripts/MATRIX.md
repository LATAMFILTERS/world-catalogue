# SCRAPING MATRIX — Donaldson + Equipment Applications Gap
Última actualización: 2026-07-11

---

## ESTADO GENERAL

| Categoría      | Productos | Attrs/OEM/Equip  | Brand Crossrefs | Script crossref          | Estado Crossrefs |
|----------------|-----------|------------------|-----------------|--------------------------|------------------|
| lube           | 351       | ✅ COMPLETO       | ✅ 330/351       | scraper_oilcrossref.py   | ✅ COMPLETO       |
| fuel           | 500       | ✅ COMPLETO       | ✅ 500/500       | scraper_fuelcrossref.py  | ✅ COMPLETO       |
| fuel-separator | (en fuel) | (en fuel)         | (en fuel)        | scraper_fuelcrossref.py  | (en fuel)         |
| hydraulic      | 1962      | ✅ COMPLETO (28 err) | ✅ 1962/1962    | scraper_oilcrossref.py   | ✅ COMPLETO       |
| air            | 1366      | ✅ COMPLETO       | ✅ 1366/1366     | scraper_aircrossref.py   | ✅ COMPLETO       |
| air-intake     | 243       | ✅ COMPLETO       | ✅ 243/243       | scraper_aircrossref.py   | ✅ COMPLETO       |
| cabin          | 122       | ✅ COMPLETO       | ✅ 122/122       | scraper_aircrossref.py   | ✅ COMPLETO       |
| air-dryer      | 3         | ✅ COMPLETO       | ✅ 3/3 (patch)   | scraper_aircrossref.py   | ✅ COMPLETO       |
| coolant        | 59        | ✅ COMPLETO       | ✅ 59/59         | scraper_oilcrossref.py   | ✅ COMPLETO       |

**fuel-separator**: incluido en `donaldson_fuel_results.json` (500 productos). No requiere scraping separado.

---

## FASE 1 — Donaldson Product Scraping (COMPLETO para todos excepto hydraulic)

Cada producto tiene: `part_number`, `description`, `category`, `oem_codes`, `alternatives`, `equipment`, `attributes`

### Comandos (si se necesita re-correr)

```powershell
# Windows
python scraper_donaldson.py lube
python scraper_donaldson.py fuel
python scraper_donaldson.py air
python scraper_donaldson.py air-intake
python scraper_donaldson.py cabin
python scraper_donaldson.py air-dryer
python scraper_donaldson.py coolant

# Si cookies expiran
python scraper_donaldson.py --login

# Test 1 producto
python scraper_donaldson.py --test P167405
```

```bash
# Mac — Hydraulic (en curso)
python3 scraper_donaldson.py hydraulic

# Si se interrumpe — reanuda solo
python3 scraper_donaldson.py hydraulic

# Si cookies expiran
python3 scraper_donaldson.py --login
python3 scraper_donaldson.py hydraulic

# Test
python3 scraper_donaldson.py --test P502007/18796
```

---

## FASE 2A — Brand Crossrefs OIL (scraper_oilcrossref.py)

Fuente: `https://www.oilfilter-crossreference.com/convert/DONALDSON/{part}`  
Categorías: lube, hydraulic, fuel  
Selector: `ul.compat-list li a[href*="/convert/"]`

### ✅ Lube — COMPLETO

```powershell
# 330 de 351 tienen crossrefs. Re-procesar los 21 vacíos:
python scraper_oilcrossref.py --retry-zeros lube
```

### ⏳ Fuel — PENDIENTE

```powershell
python scraper_oilcrossref.py fuel
```

### ⏳ Hydraulic — DESPUÉS (esperar que termine Mac)

```powershell
python scraper_oilcrossref.py hydraulic
```

```bash
# Mac
python3 scraper_oilcrossref.py hydraulic
```


---

## FASE 2B — Brand Crossrefs AIR (scraper_aircrossref.py)

Fuente: `https://www.airfilter-crossreference.com/convert/DONALDSON/{part}`  
Categorías: air, air-intake, cabin, air-dryer  
Selector: `ul.twocolumns li a[href*="/convert/"]`

### ⏳ Air — PENDIENTE

```powershell
# Test primero
python scraper_aircrossref.py --test P527682
# Debe mostrar: BALDWIN RS3518, FLEETGUARD AF25139, FRAM CA7140, WIX 46556, etc.

# Si OK → correr
python scraper_aircrossref.py air
```

### ⏳ Air-intake — PENDIENTE

```powershell
python scraper_aircrossref.py air-intake
```

### ⏳ Cabin — PENDIENTE

```powershell
python scraper_aircrossref.py cabin
```

### ⏳ Air-dryer — PENDIENTE

```powershell
python scraper_aircrossref.py air-dryer
```

---

## FASE 3 — Después de completar crossrefs

Cuando `brand_crossrefs` esté en todos los `*_results.json`, correr:

```bash
# Construye catálogo unificado Donaldson
python build_catalog_donaldson.py

# Verifica conteos
python count_donaldson.py
```

---

## ARCHIVOS DE SALIDA

```
Donaldson results (con brand_crossrefs):
  donaldson_lube_results.json        ← 351 prods ✅ (21 sin crossref — retry pendiente)
  donaldson_fuel_results.json        ← 500 prods ✅
  donaldson_air_results.json         ← 1366 prods ✅
  donaldson_air-intake_results.json  ← 243 prods ✅
  donaldson_cabin_results.json       ← 122 prods ✅
  donaldson_air-dryer_results.json   ← 3 prods ✅
  donaldson_coolant_results.json     ← 59 prods ✅
  donaldson_hydraulic_results.json   ← 1962 prods ✅ (brand_crossrefs en Windows — push pendiente)

Progreso crossrefs (cache — NO borrar):
  donaldson_lube_crossref_progress.json
  donaldson_hydraulic_crossref_progress.json   ← ✅ en Windows, push pendiente
  donaldson_fuel_crossref_progress.json
  donaldson_air_crossref_progress.json
```

---

## ESTRUCTURA JSON — CAMPOS POR PRODUCTO

```
part_number            Donaldson part number (código base)
sku_elimfilters        SKU ELIMFILTERS (EL8xxxx, EA1xxxx, etc.)
category               lube / air / fuel / hydraulic / cabin / ...
technology             SYNTRAX™ / MACROCORE™ / NANOFORCE™ / ...
description_elimfilters Descripción branded ELIMFILTERS (inglés)
dimensions             { od, id, length, width, height, thread } con .in y .mm
attributes             Specs técnicos (efficiency, media, burst, style...)
oem_codes[]            Códigos de fabricantes de EQUIPO (Cummins, Atlas Copco, Case IH...)
brand_crossrefs{}      Filtros equivalentes de otras marcas (Baldwin, Mann, WIX, Fleetguard...)
alternatives[]         Otros part numbers Donaldson equivalentes
equipment[]            Equipos/vehículos compatibles { equipment, type, engine }
```

**`oem_codes` vs `brand_crossrefs`:**
- `oem_codes` = números de parte usados por fabricantes de equipo (OEM de maquinaria)
- `brand_crossrefs` = filtros de marcas competidoras equivalentes al producto
- Fleetguard aparece en `oem_codes` por error de Donaldson — el dato correcto está en `brand_crossrefs`

---

## ESTRATEGIA FLEETGUARD

`brand_crossrefs.FLEETGUARD[]` es la clave foránea para el catálogo Fleetguard.

```
Donaldson P559000
  brand_crossrefs.FLEETGUARD = [LF9000, LF9001, LF9011...]
        ↓ foreign key
  Fleetguard LF9001 → datos completos desde scraper Fleetguard
        ↓
  Productos Fleetguard sin equivalente Donaldson → evaluar aparte
```

Fleetguard tiene catálogo más grande — los productos sin match en Donaldson se revisan al final.

**`alternatives[]` — pendiente multimark:**
Actualmente solo contiene P-codes Donaldson equivalentes.
Cuando se integre Fleetguard evaluar: `alternatives_donaldson[]` + `alternatives_fleetguard[]`
o un formato unificado `alternatives: [{brand, part_number}]`. Decidir cuando tengamos los datos.

---

## NOTAS

- **0/0/0/0 en DBL codes**: normal. DBL = filtros bulk sin datos en Donaldson. P-codes sí tienen datos.
- **Si cookies expiran**: `--login`, navega 30 seg, ENTER. Luego reanuda.
- **Progreso se guarda por producto**: si se interrumpe, reanuda solo (no re-procesa cache).
- **`--retry-zeros <cat>`**: borra del cache los `{}` para re-intentar productos sin resultados.
- **Mac usa `python3`**, Windows usa `python`.
- **NO mezclar bases de datos todavía** — solo colectar códigos raw.

---

## FASE 4 — equipment_applications Gap Matrix (2026-07-11)

Estado calculado desde `donaldson_import_ready.jsonl` (4,606 SKUs HD).

### Resumen Global

| Métrica                              | Count |
|--------------------------------------|------:|
| Total SKUs HD en DB                  | 4,606 |
| SKUs con equipment_applications      | 2,781 |
| SKUs sin equipment_applications      | 1,825 |
| — con FG cross-ref (importables)     |   493 |
| — sin FG cross-ref (otra fuente)     | 1,332 |

### Por Categoría

| Categoría   | Total | Con FG | Con Equip | FG sin Equip | Sin FG sin Equip |
|-------------|------:|-------:|----------:|-------------:|-----------------:|
| air         | 1,366 |  1,025 |     1,140 |          132 |               94 |
| air-intake  |   243 |     81 |        17 |           67 |              159 |
| cabin       |   122 |     76 |       105 |            9 |                8 |
| coolant     |    59 |      6 |        30 |            0 |               29 |
| fuel        |   500 |    315 |       433 |           25 |               42 |
| hydraulic   | 1,962 |    632 |       723 |          251 |              988 |
| lube        |   351 |    268 |       330 |            9 |               12 |
| air-dryer   |     3 |      0 |         3 |            0 |                0 |
| **TOTAL**   | **4,606** | **2,403** | **2,781** | **493** | **1,332** |

### Acción Inmediata — 493 SKUs via Fleetguard

Los 493 SKUs en columna "FG sin Equip" se llenan corriendo el script de importación:

```powershell
# Windows — requiere git pull primero
git pull origin claude/create-elimfilters-manuals-iFz1q

# Dry run (verifica 200, no 403)
$env:ADMIN_KEY="<key-de-render>"; node scripts\import-hd-fitment-fg.js --dry

# Live
$env:ADMIN_KEY="<key-de-render>"; node scripts\import-hd-fitment-fg.js
```

Archivo fuente: `C:\mann\hd_fitment_fleetguard.jsonl` (6,509 rows, 2,628 con equipment data)
Batches: 27 × 100 rows, ~500ms entre batches. Tiempo estimado: ~14 segundos.

**ADMIN_KEY**: obtener de Render Dashboard → Service `elimfilters-search-pro` → Environment Variables.

### Acción Futura — 1,332 SKUs sin FG

Distribución del gap restante después del import FG:

| Categoría   | SKUs gap post-FG |
|-------------|----------------:|
| hydraulic   |             988 |
| air-intake  |             159 |
| air         |              94 |
| fuel        |              42 |
| coolant     |              29 |
| cabin       |               8 |
| lube        |              12 |

Fuentes candidatas para llenar este gap:
1. **OEM equipment matrices** ya en `competitor_matrix.json` / `donaldson_oem_matrix.json`
2. **Scraper Fleetguard** — categorías lube/fuel/hydraulic pendientes
3. **Donaldson equipment data** — campo `equipment[]` en `donaldson_*_results.json`

> **Nota sobre DBL codes**: DBL0832, DBL3998, etc. son Donaldson bulk codes sin datos en su catálogo.
> El scraper retorna 0 Attr / 0 Cross / 0 Alt / 0 Equip para todos. No requieren re-scraping.
> Solo 14 SKUs tienen codigo_base DBL. Ignorar en cualquier scraping futuro.
