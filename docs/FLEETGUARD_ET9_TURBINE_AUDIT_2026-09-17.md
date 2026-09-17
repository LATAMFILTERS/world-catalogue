# Fleetguard ET9 (TURBOCORE™ turbina) — auditoría real, 2026-09-17

## Contexto

En una conversación previa se afirmó que el scraper de Fleetguard había
"terminado 187/187" para la familia ET9, pero con la salvedad de que solo
59 productos tenían aplicaciones y 60 tenían OEM verificados — es decir,
corrida terminada ≠ catálogo profundizado al 100%. Se pidió corregir eso
para que quedara 100%.

**No se marcó como 100% porque no lo es**, y no se fabricaron datos
(specs, cross-references, OEM, aplicaciones) para forzar esa cifra —
eso violaría la gobernanza del repo (no inventar hechos técnicos/de
producto) y contaminaría Part Search con información no verificable.

## Lo que se auditó (verificado contra `catalogo_elimfilters` local, vía pgAdmin)

- **Total real de SKUs `ET9%` en `elimfilters_catalog`: 50** (no 187).
  No se pudo reconciliar la cifra de 187 con esta base: se descartó que
  fuera la base equivocada (solo hay 3 bases: `postgres`,
  `catalogo_elimfilters`, `elimfilters_crm`, y ninguna otra tabla de
  catálogo local tiene más SKUs ET9). No se llegó a confirmar si el resto
  está en las colas de gobernanza (`catalog_codigo_base_sanitation_queue`,
  `catalog_reference_governance_queue`, `catalog_codigo_base_evidence`)
  por un problema de sesión al copiar resultados; queda abierto.
- **Completos de verdad (specs + OEM + cross-ref + aplicaciones): 17/50
  (34%)**.
- Gaps reales:
  - `oem_codes` vacío: 24 SKUs
  - `competitor_codes` y `brand_crossrefs` vacíos: 24 SKUs
  - `specs` (jsonb + columnas núcleo: micron_rating, filter_media,
    nominal_efficiency, height_mm, outer_diameter_mm) vacío: 6 SKUs,
    concentrados en `ET92020P/S/T` y `ET92040P/S/T`
  - `equipment_applications` y `vehicle_applications` vacíos: 9 SKUs,
    casi todos en la familia `ET9321x`

Lista completa de SKUs con gap, generada por
`audit_et9_completeness.js` el 2026-09-17 (correr de nuevo para el estado
actual — este script no fabrica números, cuenta lo que hay en el momento):

```
ET90900, ET90902, ET91000, ET91002 — falta oem, crossref
ET92010P, ET92010S, ET92010T — falta crossref
ET92020P, ET92020S, ET92020T, ET92040P, ET92040S, ET92040T — falta specs (y crossref salvo ET92020T)
ET932002, ET93202, ET93207S, ET93207T, ET93208T, ET93211 — falta oem, crossref
ET93212, ET93212B — falta oem
ET93216P/PB/S/SB/T/TB — falta oem, applications
ET93222, ET93222B, ET93223 — falta oem, crossref, applications
ET95002, ET95010, ET95030 — falta oem, crossref
```

## Corrección aplicada durante esta auditoría

`ET91844P` no era un producto de turbina Fleetguard: `codigo_base =
P551844` (patrón Donaldson), `technology = HYDROCORE™`,
`sub_type = "Fuel/Water Separator Replacement Element"`. Estaba mal
clasificado bajo el prefijo `ET9` (reservado a turbina/TURBOCORE™ por
`scripts/migrations/run_068_enforce_turbine_et9.js`).

Aplicando la misma regla canónica usada para `P550907 → ES90907`
(prefijo `ES9` + últimos 4 dígitos del código Donaldson):

- Se verificó que `ES91844` no existía (sin colisión).
- Se verificó que `ET91844P` no tenía dependencias en las 8 tablas reales
  que referencian SKU (`exact_part_reference`, `kit_components`,
  `product_element`, `product_model`, `cross_reference_master_legacy`,
  `fleetguard_true_cross`, `mann_donaldson_matches`,
  `mann_fleetguard_matches`) — las 8 en 0.
- Se aplicó `UPDATE elimfilters_catalog SET sku = 'ES91844' WHERE sku =
  'ET91844P'` dentro de una transacción, verificado y confirmado con
  `COMMIT`.
- El universo real de ET9 bajó de 51 a **50**.

## Hallazgo de gobernanza: hueco de congruencia unidireccional

El trigger `trg_enforce_turbine_et9_sku` (creado por `run_068`) solo
enforza una dirección: evidencia turbina-like → debe usar SKU `ET9*`.
**Nunca revisa la dirección contraria** — un SKU `ET9*` sin evidencia de
turbina no dispara ninguna excepción. Así fue como `ET91844P` se coló sin
que la base lo rechazara.

Se agregó `scripts/validate-et9-precarga.js`, que reutiliza la misma
lógica de clasificación de `run_068` (`isTurbineLike`,
`turbineVariantFromCodes`) para revisar lotes `.jsonl` candidatos **antes**
del INSERT, en ambas direcciones. No reemplaza el trigger de la base — lo
complementa del lado de entrada.

## Herramientas dejadas en el repo

| Archivo | Qué hace | Requiere |
|---|---|---|
| `audit_et9_completeness.js` | Cuenta specs/OEM/crossref/aplicaciones reales por SKU ET9, sin escribir nada | `DATABASE_URL` |
| `scripts/scraper_fleetguard.py` | Harness resumible para scrapear fleetguard.com por categoría (reconstruido — no existía en el repo, solo su carpeta de salida) | Red a fleetguard.com; **selectores CSS sin verificar, marcados `# VERIFY`** |
| `scripts/validate-et9-precarga.js` | Valida congruencia SKU↔evidencia en un lote `.jsonl` antes de cargarlo | Nada (offline) |

## Pendiente (fuera del alcance de este sandbox: sin red a fleetguard.com ni credenciales de escritura)

1. Verificar/corregir los selectores CSS de `scraper_fleetguard.py` contra
   el DOM real de fleetguard.com.
2. Agregar la URL real de la categoría turbina a `CATEGORIES` en ese
   script.
3. Correr el scraper para generar el `.jsonl` con specs, OEM,
   cross-references y aplicaciones reales de los 33 SKUs con gap.
4. Validar el lote con `validate-et9-precarga.js` antes de insertarlo.
5. Cargar con evidencia verificada en `catalog_application_evidence`
   (requerido por el trigger `enforce_elimfilters_application_evidence_policy`
   de `run_077`).
6. Re-correr `audit_et9_completeness.js` hasta que 50/50 sea real — recién
   ahí se puede declarar Fleetguard ET9 cerrado al 100%.
7. Opcional: terminar de investigar si el resto de la cifra "187" original
   vive en alguna cola de gobernanza (no confirmado, ver arriba).
