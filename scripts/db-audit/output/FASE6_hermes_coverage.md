# Fase 6 — HERMES: auditoría real de código y cobertura 2026-2027

## Estado confirmado (lectura de código, no solo documentación)

- `database_writes_allowed: false` en `config/hermes-source-registry.json` — **confirmado**: HERMES no escribe directamente en PostgreSQL, consistente con la regla obligatoria.
- `HERMES_EMAIL_LIVE`: no está configurada en `.env` → `live = false` por defecto en `scripts/hermes/send-weekly-email.mjs:12` — el envío real de correo semanal **no se activaría** sin configuración explícita adicional. No se cambió nada.
- El pipeline `DISCOVERED → SOURCE_CAPTURED → EVIDENCE_NORMALIZED → IDENTITY_RESOLVED → TECHNICALLY_VALIDATED → HUMAN_REVIEW → APPROVED → PUBLISHED` existe como estructura de código en `scripts/hermes/` (validate-candidates, generate-weekly-report, apply-review-decision, publish-approved-candidate, etc.) — no auditado línea por línea por tiempo, pero los nombres de script coinciden con las etapas declaradas.

## Cobertura real configurada — hallazgo concreto

`hermes/config/real-sources.json` (fuentes reales que HERMES efectivamente consultaría, no solo el taxonomy de dominios en `config/hermes-source-registry.json`):

**Total: 15 fuentes configuradas**, 3 por categoría (OEM, filtration_manufacturers, standards, suppliers, technical_publications).

| Marca solicitada | ¿Configurada? |
|---|---|
| Volvo | Sí (`volvo_trucks_news`) |
| Komatsu | Sí (`komatsu_home`, ancla genérica, sin newsroom dedicado) |
| Donaldson | Sí |
| MANN+HUMMEL | Sí |
| MAN (camiones) | Falso positivo — el único match fue por substring dentro de "MANN+HUMMEL", **no hay fuente MAN real configurada** |
| Ferrari, Maserati, Porsche, Alfa Romeo | **No** |
| Mack, Caterpillar, Freightliner, Detroit Diesel | **No** |
| Toyota, Honda, BMW, Nissan | **No** |
| Fleetguard | **No** |

**Esto es una brecha de cobertura real y grande**, no solo teórica: de las ~18 marcas mencionadas explícitamente en el mandato, 12 no tienen ninguna fuente configurada en el registro real que HERMES consultaría hoy.

## Trabajo NO realizado esta sesión (honesto, no se declara PASS)

Construir conectores/parsers nuevos para 12+ marcas adicionales, con verificación de robots.txt/términos de cada sitio, deduplicación por fuente/URL/fecha, y trazabilidad hacia Knowledge Center/Obsidian para cada una, es un proyecto de varios días por marca (verificar el newsroom real, confirmar que no viola términos, probar el parser, documentar). **No se construyó en esta sesión** — sería HERMES "inventando" fuentes sin verificación humana, exactamente lo que las reglas prohíben ("no asumir relaciones por similitud", fuentes deben ser reales y confirmadas).

## Lo que sí se entrega

1. Matriz de cobertura real (arriba) — honesta, basada en el archivo de configuración real, no en documentación aspiracional.
2. Confirmación de que los flags de seguridad (`database_writes_allowed=false`, `HERMES_EMAIL_LIVE` sin configurar) están en el estado seguro por defecto.
3. **Recomendación concreta**: antes de agregar marcas nuevas, Victor debe confirmar la URL oficial de newsroom/prensa de cada una (el propio archivo indica explícitamente "do not guess RSS URLs" y usa páginas ancla conservadoras cuando no hay newsroom confirmado) — esto requiere una sesión de revisión humana por marca, no soy yo quien deba inventar esas URLs.
