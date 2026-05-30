# SCRAPING MATRIX — Donaldson + Fleetguard
Última actualización: 2026-05-30

---

## DONALDSON

| Categoría  | Productos | Máquina | Archivo progreso                      | Estado     |
|------------|-----------|---------|---------------------------------------|------------|
| lube       | ~365      | Windows | donaldson_lube_progress.json          | ⚡ EN CURSO |
| fuel       | 500       | Windows | donaldson_fuel_results.json           | ✅ COMPLETO 498 OK |
| hydraulic  | ~2177     | Mac     | donaldson_hydraulic_progress.json     | ⚡ EN CURSO recollect |
| air        | 1366      | Windows | donaldson_air_results.json            | ✅ COMPLETO 1365 OK |
| air-dryer  | ?         | Windows | donaldson_air-dryer_progress.json     | ⏳ PENDIENTE |

### Comandos Windows

```powershell
# Lube (si se interrumpe — reanuda automático)
python scraper_donaldson.py lube

# Fuel (reanuda desde [242/500])
python scraper_donaldson.py fuel

# Air (COMPLETO)
# python scraper_donaldson.py air

# Air Dryer
python scraper_donaldson.py air-dryer

# Hydraulic Windows (después de air, tiene 59 ya guardados)
python scraper_donaldson.py hydraulic

# Login si cookies expiran
python scraper_donaldson.py --login

# Test 1 producto
python scraper_donaldson.py --test P167405
```

### Comandos Mac

```bash
# Hydraulic (en curso con --recollect, 2177 productos)
python3 scraper_donaldson.py hydraulic

# Si se interrumpe — reanuda automático sin flag extra
python3 scraper_donaldson.py hydraulic

# Si página vuelve a dar 0/0/0 → renovar cookies
python3 scraper_donaldson.py --login
# luego:
python3 scraper_donaldson.py hydraulic

# Test 1 producto para verificar cookies
python3 scraper_donaldson.py --test P502007/18796
```

---

## FLEETGUARD

| Categoría             | Máquina | Archivo progreso                              | Estado     |
|-----------------------|---------|-----------------------------------------------|------------|
| air-precleaners       | Windows | fleetguard_air-precleaners_progress.json      | ⏳ PENDIENTE |
| air-primary-secondary | Windows | fleetguard_air-primary-secondary_progress.json | ⏳ PENDIENTE |
| lube-cartridge        | Windows | fleetguard_lube-cartridge_progress.json       | ⏳ PENDIENTE |
| fuel-spin-on          | Windows | fleetguard_fuel-spin-on_progress.json         | ⏳ PENDIENTE |
| hydraulic-spin-on     | Windows | fleetguard_hydraulic-spin-on_progress.json    | ⏳ PENDIENTE |

### Comandos Windows — Fleetguard

```powershell
# Air precleaners
python scraper_fleetguard.py air-precleaners

# Air primary+secondary (inicia desde AF4878)
python scraper_fleetguard.py air-primary-secondary --start AF4878

# Lube
python scraper_fleetguard.py lube-cartridge

# Fuel
python scraper_fleetguard.py fuel-spin-on

# Hydraulic
python scraper_fleetguard.py hydraulic-spin-on

# Login si cookies expiran
python scraper_fleetguard.py --login

# Test 1 producto
python scraper_fleetguard.py --test https://www.fleetguard.com/product/AF4878
```

---

## ORDEN RECOMENDADO (para minimizar espera)

```
Windows en paralelo con Mac:
  Mac:     hydraulic Donaldson            (~2177 prods, 6+ horas)
  Windows: lube → fuel → air → hydraulic  (secuencial)
  
Cuando termina Donaldson en Windows → iniciar Fleetguard:
  air-precleaners → air-primary-secondary → lube-cartridge → fuel-spin-on → hydraulic-spin-on
```

---

## ARCHIVOS DE SALIDA

```
Resultados finales (JSON):
  donaldson_lube_results.json
  donaldson_fuel_results.json
  donaldson_hydraulic_results.json
  donaldson_air_results.json
  fleetguard_air-precleaners_results.json
  fleetguard_air-primary-secondary_results.json
  fleetguard_lube-cartridge_results.json
  fleetguard_fuel-spin-on_results.json
  fleetguard_hydraulic-spin-on_results.json
```

---

## NOTAS

- **0/0/0/0 en DBL codes**: normal. DBL = filtros bulk sin datos de tabs. P-codes sí tienen datos.
- **Si cookies expiran**: corre `--login`, navega el sitio 30 seg, ENTER. Luego reanuda.
- **Progreso se guarda por producto**: si se interrumpe, reanuda solo.
- **Mac usa `python3`**, Windows usa `python`.
- **NO mezclar bases de datos todavía** — solo colectar códigos raw.
