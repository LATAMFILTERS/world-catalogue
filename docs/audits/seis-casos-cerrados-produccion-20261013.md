# Seis casos cerrados en producción — 13 de octubre de 2026

La autorización expresa del operador permitió instalar la excepción individual de EA33603 en gateway, reglas de base y auditoría. La ejecución confirmó 5432, terminó COMMIT y se comprobó mediante una consulta posterior. No se sustituyó una base ni se desactivaron protecciones.

## Resultado final

EA33603 (KIA OK6B0-23-603), EC39882 (FRAM CF9882), EL31934 (FRAM CH11934), EL32478 (FRAM CH12478), EL32824 (FRAM CH12824ECO) y EL82008 (Donaldson P502008): todos activos, CERTIFIED, cero bloqueos y resolución única de su base al SKU correcto en v_api_resolver_v7.

Comprobación independiente de solo lectura: six-cases-final-production-verification.json. Resultado del grupo: 6 certificados y 0 pendientes de identidad/auditoría. No representa el cierre de todo el catálogo ni certifica ensayos físicos, todas las aplicaciones, motores, imágenes o datos logísticos. No se probó en este pase el HTTP público ni las 301.

De los doce códigos originales sin auditoría: once activos y certificados; EL38936 retirado con sucesor Heavy Duty EL82008, que también está certificado. Cero de aquellos doce carecen de auditoría.

## EA33603: alcance de la excepción instalada

Conserva únicamente el registro id 65522, SKU EA33603, LIGHT_DUTY/air, origen NON_EUROPEAN y la referencia KIA OK6B0-23-603. Requiere aprobación individual, hash del original y evidencia OEM fijados. No habilita otro SKU/id/base/fabricante/duty. No cambia la política general FRAM/MANN, la jerarquía HD ni instala migración 226.

La evidencia AZUMI A13615 identifica expresamente el OEM y sus variantes: https://azfilter.jp/catalogue/498313 . No es publicación KIA propia ni prueba de fabricación o ausencia de fabricación FRAM. Se corrigió el antiguo indicador de ausencia para dejar fram_absence_verified=false, y primary_manufacturer_verified=false se conserva. La autoridad es OEM KIA preservada por autorización específica del operador.

Se instalaron un predicado SQL individual, su uso limitado en el trigger de autoridad, la rama limitada del trigger de identidad y reconocimiento en la vista regional. Se prepararon también la comprobación equivalente en gateway y la consulta de certificación del repositorio local. Las ramas normales siguen intactas. La publicación e integración de este código en GitHub no se realizaron en esta ejecución.

## Respaldo, pruebas y conservación

Respaldo previo: ea33603-originals-2026-10-14T01-09-02-788Z.json (nombre en UTC; ejecución corresponde al 13 de octubre en America/Chicago). SHA256 comprobado por relectura:

762b9cb3c21a92f2c7429c7318e09a66a5fc23a437d079bb65efe0cc11ca1807

Contiene ficha completa, identidades y auditorías originales, y definiciones completas de las dos funciones y la vista modificadas. Manifiesto adyacente. No es respaldo completo de toda la base. Reportes: ea33603-approved-exception-dry-run.json y ea33603-approved-exception-execute.json.

Siete pruebas de límites pasaron tanto en el predicado SQL como en el gateway: caso exacto aprobado; rechazo de SKU, id, base, fabricante o duty distintos y rechazo de aprobación ausente. En la consulta global, exactamente una ficha admite la excepción. La prueba terminó ROLLBACK antes de ejecutar COMMIT. Comparación de todos los campos: código, fabricante, actividad, dimensiones, referencias y aplicaciones se conservaron; solo gobernanza/evidencia y registros de identidad/auditoría cambiaron.

Para revertir por instrucción del operador: verificar hash y estado posterior, guardar cambios más recientes, restaurar solo gobernanza original y sus registros originales de identidad/auditoría, restaurar las dos definiciones de funciones y la vista desde el respaldo, retirar el predicado nuevo solo después de eliminar sus dependencias y restaurar el código local original. Ejecutar en transacción comprobando que no se sobrescribe trabajo posterior. No se ejecutó reversión.

Los demás cinco respaldos y pruebas están documentados en cierre-seis-casos-20261013.md. Se reutilizaron consultas, gateway, índices e identidad canónicos; los arneses temporales locales no se instalaron como tareas recurrentes ni crearon otro catálogo maestro.
