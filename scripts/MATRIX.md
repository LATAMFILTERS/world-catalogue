# SCRAPING MATRIX — Donaldson
Última actualización: 2026-05-30

---

## ESTADO GENERAL

| Categoría      | Productos | Attrs/OEM/Equip  | Brand Crossrefs | Script crossref          | Estado Crossrefs |
|----------------|-----------|------------------|-----------------|--------------------------|------------------|
| lube           | 351       | ✅ COMPLETO       | ✅ 330/351       | scraper_oilcrossref.py   | ✅ COMPLETO       |
| fuel           | 500       | ✅ COMPLETO       | ✅ 500/500       | scraper_fuelcrossref.py  | ✅ COMPLETO       |
| fuel-separator | (en fuel) | (en fuel)         | (en fuel)        | scraper_fuelcrossref.py  | (en fuel)         |
| hydraulic      | 1934      | ✅ COMPLETO (28 err) | ⚡ EN CURSO     | scraper_oilcrossref.py   | ⚡ EN CURSO       |
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
  donaldson_lube_results.json        ← 351 prods ✅
  donaldson_fuel_results.json        ← 500 prods (crossrefs pendiente)
  donaldson_air_results.json         ← 1366 prods (crossrefs bloqueado)
  donaldson_air-intake_results.json  ← 243 prods (crossrefs bloqueado)
  donaldson_cabin_results.json       ← 122 prods (crossrefs bloqueado)
  donaldson_air-dryer_results.json   ← 3 prods (crossrefs pendiente)
  donaldson_coolant_results.json     ← 59 prods (crossrefs pendiente)
  donaldson_hydraulic_results.json   ← ~2177 prods ⚡ en curso Mac

Progreso crossrefs (cache — NO borrar):
  donaldson_lube_crossref_progress.json
  donaldson_hydraulic_crossref_progress.json   (cuando corra)
  donaldson_fuel_crossref_progress.json        (cuando corra)
  donaldson_air_crossref_progress.json         (cuando corra)
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

---

## NOTAS

- **0/0/0/0 en DBL codes**: normal. DBL = filtros bulk sin datos en Donaldson. P-codes sí tienen datos.
- **Si cookies expiran**: `--login`, navega 30 seg, ENTER. Luego reanuda.
- **Progreso se guarda por producto**: si se interrumpe, reanuda solo (no re-procesa cache).
- **`--retry-zeros <cat>`**: borra del cache los `{}` para re-intentar productos sin resultados.
- **Mac usa `python3`**, Windows usa `python`.
- **NO mezclar bases de datos todavía** — solo colectar códigos raw.
- **Fleetguard**: ignorar por ahora.
