# SKUs de 5441 rechazados por las políticas del catálogo (ensayo 2026-09-24)

Decisión de Victor (2026-09-24): **quedan fuera de la unificación**; este reporte es para revisión posterior.
Detalle fila a fila: `rejected-skus-20260924.csv` (generado con `rehearsal/rejected-report.sql`).
La fila completa de 5441 se conserva en `catalog_unification.m04_rejected.source_row` mientras exista ese esquema.

| Política | SKUs | Qué significa | Lectura |
|---|---|---|---|
| `ALTERNATE_INTEGRITY` | 39 (todos EH, activos en 5441) | Códigos OEM/competidor duplicados entre columnas | Los 39 tienen un **gemelo con el mismo `codigo_base` ya en el catálogo** (p. ej. EH62096 ↔ EH61096). Son el segundo SKU por `codigo_base` que creó la regla hidráulica del 17-sep: probables duplicados. |
| `APPLICATION_POLICY_V1` | 13 (todos EH, activos en 5441) | Aplicaciones de equipo sin sello de gobernanza (`application_governance`) | Mismo patrón: los 13 tienen gemelo con igual `codigo_base` (p. ej. EH62366 ↔ EH61366). |
| `CATALOG_POLICY_V32` | 8 ET9 (5 activos, 3 inactivos) | `codigo_base` de respaldo HD con menos de 4 dígitos (HA103, FH108…) | Sin gemelo en el catálogo. 3 están entre los 51 ET9 excluidos (hardware). Requieren identidad canónica válida antes de entrar. |

Siguientes pasos sugeridos (no ejecutados):
1. EH (52): confirmar con HERMES que son duplicados del gemelo y, si es así, registrarlos como alias `MERGED_INTO` en `catalog_sku_alias` en lugar de insertarlos.
2. ET9 activos (5): resolver `codigo_base` canónico (≥ 4 dígitos) con evidencia y darlos de alta por el flujo gobernado normal.
3. ET9 inactivos (3): no requieren acción de catálogo (excluidos por alcance).
