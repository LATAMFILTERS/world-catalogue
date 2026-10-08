# ELIMFILTERS: dos colisiones con referencia Fleetguard oficial

Verificación del lote original: 2026-10-08T12:44:17.128Z.

**19 de los 367 pendientes originales resueltos; 348 pendientes: 294 colisiones y 54 identidades por confirmar.** El avance del lote original pendiente es 5,18%; no representa el avance completo del catálogo.

| Código anterior | Código corregido | Base comercial | Identidad Donaldson conservada | Registros trasladados |
|---|---|---|---|---:|
| EF980710 | EF90083 | FS20083 | P580710 | 43 |
| EH670949 | EH66590 | HF6590 | P170949 | 87 |

P580710 y FS20083 están relacionados directamente en Donaldson Popular Engine Fuel and Lube Truck Filters, página PDF 2. P170949 y HF6590 aparecen en la misma fila de Donaldson Transmission Filtration, página PDF 3. Ambas referencias Fleetguard fueron comprobadas en sus páginas oficiales mediante código, URL exacta e imagen de producto. Sus destinos estaban libres.

Los ocupantes originales EF90710/DBF0710 y EH60949/HF30949 permanecieron iguales. Para DBF0710 se guardó evidencia oficial Donaldson indexada, expresamente distinguida de una lectura en vivo. HF30949 se comprobó en su página Fleetguard renderizada. El remapeo no fusiona productos diferentes ni declara ausencia de fabricación.

La relación alternativa oficial P580710/DBF0710 autorizada por el usuario se conserva en ambos productos y su historial de evidencias se trasladó al SKU corregido EF90083. DBF0710 sigue siendo la versión Synteq Dry de P580710; no se declaró identidad de medio filtrante ni equivalencia de todas las aplicaciones.

En EH670949, HF6590 aparecía correctamente como Fleetguard y además en dos entradas OEM importadas con los supuestos fabricantes HF6684 y REPLACES. Al promover HF6590 como base Fleetguard, se retiraron únicamente esas dos entradas mal clasificadas, conservándolas completas en el historial de correcciones. Las otras 1.370 referencias OEM y las aplicaciones existentes se conservaron. Esto no certifica la calidad de esas referencias restantes.

Las operaciones se validaron en transacciones revertidas y se aplicaron en transacciones serializables con snapshots completos. Un intento hidráulico con un parámetro SQL incorrecto se revirtió; el intento corregido confirmó COMMIT. La verificación posterior de las nueve correcciones de colisión aplicadas confirma cero referencias antiguas en las 15 tablas existentes comprobadas, ocupantes sin cambios, identidades Donaldson conservadas e índices reconstruidos. Los dos índices nuevos contienen 13 y 1.424 filas respectivamente. El número de filas de índice no certifica cada referencia histórica.

Fuentes oficiales:

- https://www.donaldson.com/content/dam/donaldson/engine-hydraulics-bulk/literature/north-america/engine-liquid/F111289-ENG/Popular-Engine-Fuel-and-Lube-Truck-Filters.pdf
- https://www.donaldson.com/content/dam/donaldson/engine-hydraulics-bulk/literature/north-america/transmission/F111330-ENG/Transmission-Filtration.pdf
- https://www.fleetguard.com/product/FS20083
- https://www.fleetguard.com/product/HF6590
- https://www.fleetguard.com/product/HF30949

No se certificaron motores ni aplicaciones. El objetivo de cero pendientes sigue abierto.
