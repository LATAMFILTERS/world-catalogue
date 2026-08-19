# HD Spin-On Pilot Matrix — Reporte

- **Pilot ID:** `HD_SPINON_PILOT_V1`
- **Fuente:** `world_catalogue` → `elimfilters_catalog` (PostgreSQL, conexión read-only)
- **Fecha de generación:** 2026-08-08
- **Candidatos verificados evaluados:** 686 (de 780 filas HD spin-on con `height_mm`, `outer_diameter_mm` y `thread_size` no nulos; 94 excluidas por anomalías físicas, ver sección de anomalías)
- **SKU seleccionados:** 10
- **Estado de tamaño:** `HD_SPINON` — familia de template asignada, **sin** clase de tamaño (XS/S/M/L/XL). Pendiente de calibración dimensional aprobada, conforme a `template-registry.v1.json` (`thresholds: null`, `no_invented_thresholds: true`).

## 1. Los 10 SKU seleccionados

| # | SKU | Tipo | Tecnología | Altura (mm) | Ø Exterior (mm) | Rosca | Duty | Construcción | Motivo de selección | Métrica envolvente (mm²) |
|---|-----|------|------------|-------------|------------------|-------|------|---------------|----------------------|---------------------------|
| 1 | EL83400 | oil | SYNTRAX™ | 52.00 | 76.00 | M14 x 1.5 | HEAVY_DUTY | spin_on | size_quantile_0 (mínimo) | 3,952 |
| 2 | EL80710 | oil | SYNTRAX™ | 95.00 | 94.00 | 1-12 UN | HEAVY_DUTY | spin_on | size_quantile_10 | 8,930 |
| 3 | EF91127 | fuel | SYNTAPORE™ | 132.20 | 93.00 | 15/16-16 UN | HEAVY_DUTY | spin_on | size_quantile_22 | 12,294.6 |
| 4 | EH66919 | hydraulic | NANOFORCE™ | 146.81 | 92.96 | 1 1/2-16 UN | HEAVY_DUTY | spin_on | size_quantile_35 | 13,647.5 |
| 5 | EF97440 | fuel | SYNTAPORE™ | 174.00 | 93.00 | 1-14 UN | HEAVY_DUTY | spin_on | size_quantile_50 (mediana) | 16,182 |
| 6 | EF93201 | fuel | SYNTAPORE™ | 219.30 | 93.00 | 1-14 UN | HEAVY_DUTY | spin_on | size_quantile_65 | 20,394.9 |
| 7 | EL81604 | oil | SYNTRAX™ | 232.00 | 108.00 | 1-12 UN | HEAVY_DUTY | spin_on | size_quantile_78 | 25,056 |
| 8 | EH64737 | hydraulic | NANOFORCE™ | 296.00 | 116.40 | 1 3/8-12 UN | HEAVY_DUTY | spin_on | size_quantile_90 | 34,454.4 |
| 9 | EH64721 | hydraulic | NANOFORCE™ | 367.90 | 119.40 | 1 3/4-12 UN | HEAVY_DUTY | spin_on | size_quantile_100 (máximo) | 43,927.3 |
| 10 | EH65185 | hydraulic | NANOFORCE™ | 208.53 | 151.00 | 1 3/8-12 UN | HEAVY_DUTY | spin_on | widest_verified_spin_on (mayor diámetro) | 31,488.0 |

Todos los valores provienen directamente de `elimfilters_catalog` (`source: world_catalogue`), sin conversión ni inferencia. `duty` y `construction` (`spin_on`) fueron verificados contra la misma fila de origen (los tres criterios de filtro — `installation_type`/`attachment_type`/`sub_type` conteniendo "spin" — se cumplen para las 10).

## 2. Cobertura del rango físico

| Categoría | SKU | Altura (mm) |
|---|---|---|
| Pequeño | EL83400 | 52.00 |
| Pequeño/medio | EL80710 | 95.00 |
| Medio | EF91127, EH66919 | 132.2 – 146.81 |
| Medio/grande | EF97440, EF93201 | 174.0 – 219.3 |
| Grande | EL81604, EH64737 | 232.0 – 296.0 |
| Extra grande | EH64721 | 367.90 |
| Mayor diámetro (transversal) | EH65185 | Ø 151.00 (altura 208.53) |

Diámetros cubiertos: 76.00 – 151.00 mm (no solo altura — EH65185 se incluyó específicamente por ser el mayor diámetro verificado, distinto del SKU de mayor altura).

## 3. Datos faltantes

Ningún SKU tiene datos dimensionales faltantes (altura, diámetro y rosca están verificados para los 10 — es un requisito de la consulta SQL). Lo que falta en los 10, de forma uniforme, es **infraestructura de producción aún no generada** (no un problema de datos de catálogo):

- `production.printable_area.height_mm` — pendiente (requiere diseño de litografía)
- `production.qr_url` — pendiente (requiere generación de QR)
- `production.template_id` — pendiente (bloqueado por calibración de tamaño, ver sección 5)

Por esto los 10 quedan con `gate.factory_release_allowed: false`. Es el comportamiento esperado en esta etapa piloto, no una anomalía.

## 4. Anomalías encontradas (excluidas del pilot, no corregidas en la base de datos)

Durante la selección se detectó un problema de calidad de datos en el pool de candidatos HD spin-on que obligó a excluir 94 filas (de 780) antes de aplicar el muestreo por cuantiles:

- **93 filas con `height_mm` y/o `outer_diameter_mm` por debajo de 20 mm** (mínimo observado: 3.02–3.26 mm). Físicamente imposible para un cartucho spin-on HD. El patrón de valores (3.66, 4.70, 5.04, 3.13, 3.82…) coincide con medidas típicas **en pulgadas** sin convertir a milímetros — sugiere un error sistemático de unidades en un subconjunto de productos `hydraulic` y `fuel`, no errores aislados. Ejemplos: `EH60426`, `EH60464`, `EF92177`, `EH61204`.
- **1 fila con outlier puntual de altura:** `EH60949` (hydraulic), `height_mm = 969.26` — el siguiente valor más alto en todo el pool es 367.90 mm (salto de 2.6x), indicando un valor corrupto/erróneo, no un producto real de esa magnitud.

**Acción tomada:** se agregó un guardrail de plausibilidad física (`height_mm BETWEEN 20 AND 600`, `outer_diameter_mm BETWEEN 20 AND 250`) directamente en la consulta SQL de `select-spinon-pilot.mjs`, documentado inline. No se modificó ni un solo valor en `elimfilters_catalog`; las filas afectadas simplemente no fueron candidatas a selección. Ninguno de los 10 SKU finales proviene de este grupo excluido.

**Bug adicional corregido (no relacionado a datos):** `assign-hd-template.mjs` calculaba `classification_metric.value = 0` para superficie `cylinder` cuando `printable_area.height_mm`/`circumference_mm` eran `null`, porque `Number(null)` evalúa a `0` y `Number.isFinite(0)` es `true` (bug de tipos en JS, no de datos de catálogo). Esto no afectó el resultado del pilot (el estado seguía siendo `pending_pilot_calibration` de todas formas, porque `thresholds` es `null`), pero habría corrompido silenciosamente los datos de calibración usados en la sección 5. Se corrigió para exigir que los campos de origen no sean `null` antes de calcular, y ahora usa el proxy de envolvente real (`height_mm × outer_diameter_mm`) cuando no hay área imprimible definida — ver columna "Métrica envolvente" en la tabla de la sección 1.

## 5. Recomendación para calibrar XS/S/M/L/XL

`template-registry.v1.json` define la familia `HD_SPINON` con `thresholds: null` y `no_invented_thresholds: true` — correctamente, ningún SKU de este pilot recibió clase de tamaño. Con los 10 datos verificados de este pilot (columna "Métrica envolvente", `height_mm × outer_diameter_mm`, rango 3,952 – 43,927 mm²):

1. **No calibrar con solo 10 puntos.** Es una muestra dirigida por cuantiles + extremos, no una muestra estadísticamente representativa del universo completo (686 candidatos válidos, potencialmente miles al incluir otras familias de construcción). Sirve para validar el pipeline, no para fijar umbrales de producción.
2. **Antes de calibrar, resolver la anomalía de unidades de la sección 4** sobre el universo completo de `elimfilters_catalog` (no solo spin-on) — si el mismo patrón de pulgadas-sin-convertir existe en otras construcciones (panel, cartridge, radial), los umbrales quedarían sesgados por outliers hasta que ese subconjunto se corrija o se excluya de forma consistente.
3. **Definir el corte de bandas sobre la métrica de envolvente real** (`height_mm × outer_diameter_mm`, ya usada en el pilot corregido) o, preferiblemente, sobre `printable_area` una vez que exista diseño de litografía real — la métrica de envolvente es un proxy razonable pero no es el área imprimible.
4. **Requiere aprobación de negocio/producción**, no solo estadística: los cortes XS/S/M/L/XL determinan capacidad de imprenta y stock de sustrato, y `no_invented_thresholds: true` en el registry indica que esta decisión está marcada explícitamente como pendiente de aprobación externa al pipeline automatizado.
5. Recomendación operativa: ejecutar `select-spinon-pilot.mjs` (con el guardrail ya aplicado) sobre el universo completo o una muestra aleatoria estratificada más amplia (n≥100), obtener percentiles reales de la métrica de envolvente, y proponerlos como umbrales candidatos para revisión humana — no auto-aplicarlos.

## 6. Validación técnica ejecutada

- `node --check` sobre los 3 scripts modificados/ejecutados: sin errores de sintaxis.
- Los 10 SKU fueron validados contra `elimfilters_catalog` vía `sync-product-master.mjs --sku=<SKU>` individualmente (no en lote), generando `product-identity/production-master/<SKU>.json` con `technical_source.verified: true` y `technical_source.source: "world_catalogue.elimfilters_catalog"`.
- `assign-hd-template.mjs` se ejecutó con `--sku=<SKU>` por separado para cada uno de los 10, para no tocar `EL82100.json` (producto preexistente ajeno a este pilot, de un commit anterior).
- Conexión a PostgreSQL forzada a solo lectura (`-c default_transaction_read_only=on` en el pool de `pg`), sin escrituras a la base de datos en ningún momento.
