# SCRAPING MATRIX — Donaldson
Última actualización: 2026-05-30

---

## ESTADO GENERAL

| Categoría   | Productos | Attrs/OEM/Equip | Brand Crossrefs | Máquina | Estado Crossrefs |
|-------------|-----------|-----------------|-----------------|---------|------------------|
| lube        | 351       | ✅ COMPLETO      | ✅ 330/351       | Windows | ✅ COMPLETO       |
| fuel        | 500       | ✅ COMPLETO      | ❌ 0/500         | Windows | ⏳ PENDIENTE      |
| air         | 1366      | ✅ COMPLETO      | ❌ 0/1366        | Windows | 🔴 BLOQUEADO*    |
| air-intake  | 243       | ✅ COMPLETO      | ❌ 0/243         | Windows | 🔴 BLOQUEADO*    |
| cabin       | 122       | ✅ COMPLETO      | ❌ 0/122         | Windows | 🔴 BLOQUEADO*    |
| air-dryer   | 3         | ✅ COMPLETO      | ❌ 0/3           | Windows | ⏳ PENDIENTE      |
| coolant     | 59        | ✅ COMPLETO      | ❌ 0/59          | Windows | ⏳ PENDIENTE†    |
| hydraulic   | ~2177     | ⚡ EN CURSO (Mac)| ❌ 0             | Mac     | ⏳ DESPUÉS        |

`*` BLOQUEADO: airfilter-crossreference.com usa selector HTML distinto (no `ul.compat-list`)  
`†` Coolant: no hay crossref site confirmado — verificar si oilfilter-crossreference.com tiene coolant

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

## FASE 2 — Brand Crossrefs (scraper_crossref.py)

Fuente lube/hydraulic/fuel: `https://www.oilfilter-crossreference.com/convert/DONALDSON/{part}`  
Fuente air/air-intake/cabin: `https://www.airfilter-crossreference.com/convert/DONALDSON/{part}`

Resultado: campo `brand_crossrefs` en cada producto → `{ "BALDWIN": ["B7350", ...], "WIX": [...], ... }`

### ✅ Lube — COMPLETO

```powershell
# Ya corrido. 330 de 351 tienen crossrefs.
# Para re-procesar los 21 que quedaron en {}:
python scraper_crossref.py --retry-zeros lube
```

### ⏳ Fuel — PENDIENTE (oilfilter-crossreference.com)

```powershell
python scraper_crossref.py fuel
```

### ⏳ Air / Air-intake / Cabin — LISTO (airfilter-crossreference.com)

**Fix aplicado**: selector combinado cubre ambos sitios.
- `oilfilter-crossreference.com` → `ul.compat-list`
- `airfilter-crossreference.com` → `ul.twocolumns`

```powershell
# Test primero
python scraper_crossref.py --test air P527682
# Debe mostrar: BALDWIN RS3518, FLEETGUARD AF25139, FRAM CA7140, WIX 46556, etc.

# Si OK → correr
python scraper_crossref.py air
python scraper_crossref.py air-intake
python scraper_crossref.py cabin
```

### ⏳ Hydraulic — DESPUÉS (esperar que termine Mac)

```powershell
# Windows (tiene progreso previo)
python scraper_crossref.py hydraulic
```

```bash
# Mac (alternativa si Windows no tiene los results)
python3 scraper_crossref.py hydraulic
```

### ⏳ Air-dryer — PENDIENTE

```powershell
# Solo 3 productos — oilfilter-crossreference.com (son filtros secantes, no aire)
python scraper_crossref.py air-dryer
```

> Agregar en CATEGORY_URLS: `"air-dryer": "https://www.oilfilter-crossreference.com/..."`

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

## NOTAS

- **0/0/0/0 en DBL codes**: normal. DBL = filtros bulk sin datos en Donaldson. P-codes sí tienen datos.
- **Si cookies expiran**: `--login`, navega 30 seg, ENTER. Luego reanuda.
- **Progreso se guarda por producto**: si se interrumpe, reanuda solo (no re-procesa cache).
- **`--retry-zeros <cat>`**: borra del cache los `{}` para re-intentar productos sin resultados.
- **Mac usa `python3`**, Windows usa `python`.
- **NO mezclar bases de datos todavía** — solo colectar códigos raw.
- **Fleetguard**: ignorar por ahora.
