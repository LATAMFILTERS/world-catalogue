# Fleetguard Scraper — Datos crudos

Carpeta de salida del `scraper_fleetguard.py`. Aquí se guardan los códigos base
Fleetguard scrapeados, por categoría.

## Archivos por categoría

| Archivo | Contenido |
|---|---|
| `fleetguard_<categoria>_results.json` | Productos finales (códigos base + specs, cross-refs, alternativas, equipment/BOM) |
| `fleetguard_<categoria>_progress.json` | Progreso reanudable (guardado atómico tras cada producto) |
| `fleetguard_<categoria>_equipment_matrix.json` | Matriz equipo→filtros deduplicada |

## Categorías

- `air-precleaners` ✅ (37 productos) — ÚNICA categoría obtenida hasta ahora

> Las demás categorías (lube, fuel, hydraulic, primary/safety air) NO están
> hechas. Para agregar una hay que copiar su URL real desde fleetguard.com
> (con el ID Salesforce) y añadirla a `CATEGORIES` en `scraper_fleetguard.py`.

## Uso

```bash
cd scripts
python scraper_fleetguard.py air-precleaners       # corre / reanuda
python scraper_fleetguard.py --retry-empty air-precleaners   # re-scrapea los 0/0/0/0

# Para una categoría nueva, pasar la URL real directamente:
python scraper_fleetguard.py <nombre> "https://www.fleetguard.com/category/..."
```

> Nota: NO se hace mapeo a SKU ELIMFILTERS aquí. Estos son códigos base Fleetguard
> crudos. La relación con catálogo ELIM queda pendiente de instrucción.
