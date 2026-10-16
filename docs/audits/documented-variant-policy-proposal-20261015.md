# Propuesta de política: variantes documentadas con referencias compartidas

Estado: propuesta para revisión; NO aplicada ni aprobada. No instala migración226 ni modifica ninguna base. Este documento y sus casos no autorizan actualizar certificados.

## Problema y efecto acotado

La regla actual marca EXACT_PART_REFERENCE_CONFLICT para todo producto que participe en cualquier referencia compartida. La identidad canónica puede ser única mientras un código secundario identifica varias variantes distintas. La fuente propia Donaldson las enumera como alternativas mutuas: no son evidencia de rendimiento idéntico ni de identidad de producto común. Borrar productos o inventar propiedad exclusiva de la referencia sería incorrecto.

Se documentaron46grupos que afectan88SKUs. Solo11tenían todas sus agrupaciones conflictivas cubiertas por esa evidencia y únicamente este bloqueo en la evaluación y el registro. Se comprobaron las marcas manuales del auditor nativo: ninguna de estas11filas está marcada manualmente. NO se propone extenderlo automáticamente a los demás77 ni a los343SKUs del bloqueo global.

## Decisión concreta propuesta

Permitir una excepción documental explícita por cada SKU y por cada referencia secundaria/propietarios enumerados en el archivo de casos, exclusivamente para la certificación de identidad del catálogo. Requiere aprobación de política y revisión de código ANTES de instalarla. No existe todavía un instalador ni se ha cambiado el auditor.

La excepción nunca puede habilitar la resolución automática de la referencia compartida. Una consulta por ese código sigue devolviendo ambigüedad; la consulta por el código canónico propio debe conservar su unicidad. Tampoco autoriza aplicaciones, motores, origen, prestaciones físicas ni publicación de equivalencias garantizadas.

## Casos propuestos

| SKU | Código propio | Otros propietarios documentados | Referencias compartidas en sus grupos |
| --- | --- | --- | --- |
| EA15136 | DBA5136 | EA14867 | 19 |
| EA15520 | P785520 | EA11740 | 4 |
| EA12096 | P182096 | EA11096 | 2 |
| EA12095 | P182095 | EA11095 | 1 |
| EA15043 | DBA5043 | EA12043 | 1 |
| EA15397 | DBA5397 | EA108676 | 1 |
| EA11186 | P181186 | EA15102 | 1 |
| EA15102 | DBA5102 | EA11186 | 1 |
| EA15194 | DBA5194 | EA11017 | 1 |
| EA10676 | P600676 | EA15108 | 1 |
| EA15108 | DBA5108 | EA10676 | 1 |

Los hashes completos del archivo primario y de cada registro propio, las alternativas mutuas y cada referencia/propietarios están en [los casos](./documented-variant-policy-cases-20261015.json). Es evidencia histórica autenticada; no se presenta como captura actual. Antes de cualquier promoción deben recapturarse las fichas propias y verificar marca/código/relación alternativa y la atribución de cada referencia secundaria. Si la fuente no permite verificarla, ese caso permanece pendiente.

## Guardas que debe conservar la implementación

- El conjunto real de propietarios de CADA referencia debe coincidir exactamente con el caso aprobado. Un tercer propietario o una referencia adicional bloquea el caso.
- Identidad y base canónica únicas, fuente explícita VERIFIED y prueba del propio código; nada inferido de terminaciones.
- Todas las demás comprobaciones nativas permanecen activas: clasificación, cuarentena, ámbito y tipo, identidad regional y auditorías aplicables.
- Retenciones manuales y versiones de política escritas por caso se conservan; ninguna marca puede borrarse para obtener un PASS.
- No borrar ni trasladar referencias, no consolidar variantes y no sustituir datos originales de evidencia.
- Ausencia de aprobación, prueba caducada/no conciliada, hash incorrecto, cambio del producto o un solo conflicto sin documentar mantiene BLOCKED.

## Ejecución y reversión, después de aprobación

1. Lectura nueva y verificaciones primarias anteriores; evaluar el efecto exacto sin escribir.
2. Respaldar filas, registro, referencias y dependencias conSHA256; registrar versión de política y prueba usada. No confundirlo con respaldo completo de base.
3. Probar en transacción SERIALIZABLE con bloqueo de filas y ROLLBACK; comprobar igualdad completa de originales y búsqueda ambigua aún rechazada.
4. Solo después de revisión, ejecutar el cambio acotado y comprobar cada fila/consulta, ausencia de nuevos certificados fuera de los casos y conservación de retenciones.
5. Volver al estado original documentado si falla una comprobación. Revalidar inmediatamente consumidores y resultados de búsqueda.

Este PR es solo una propuesta. El número de pendientes no cambia por integrarlo.
