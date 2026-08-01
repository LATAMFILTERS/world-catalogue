# Análisis Externo: Contaminación por Agua en Sistemas Diesel - Mecanismos y Prevención

## Rutas de Ingreso de Agua en Combustible Diesel

### Fuentes Primarias

**1. Condensación en tanques de almacenamiento**
- Temperatura fluctúa diariamente: ±10-15°C
- Aire dentro del tanque se satura de humedad
- Punto de rocío alcanzado → agua se condensa
- Acumula en fondo del tanque (agua es más densa que diesel)
- Típico: 50-200 ppm acumulado en 3-6 meses sin control

**2. Infiltración por sellos defectuosos**
- Tapa de llenado: O-ring desgastado, grietas
- Línea de retorno: fugas por vibración, conexiones flojas
- Tubo respiradero: sin filtro, entrada directa de humedad ambiental
- Rápido: puede alcanzar 200+ ppm en días

**3. Combustible adulterado o de baja calidad**
- Proveedores sin control de calidad (agua residual de refinerías)
- Mezcla fraudulenta de diesel/agua en origen
- Medición: 200-500 ppm en combustible ya contaminado

**4. Condensación en líneas de transferencia**
- Tuberías expuestas a variación térmica
- Especialmente crítico en transportes o distribución
- Contribuye 10-50 ppm adicional

### Puntos Críticos de Acumulación

- **Fondo de tanque**: 30-60% de agua se sedimenta aquí
- **Línea de succión**: partículas suspendidas estan concentradas
- **Filtro de agua/fuel**: acumula agua, punto de "ruptura"
- **Inyectores HPCR**: última barrera, falla si se llega agua libre

## Crecimiento Microbiano en Interfase Agua-Diesel

### Mecanismo de Proliferación

**Cuando concentración de agua > 200 ppm:**

1. **Formación de interfase agua-diesel**
   - Agua se sedimenta en fondo
   - Crea interfase entre dos líquidos no miscibles
   - Esta interfase es **hábitat ideal** para microorganismos

2. **Colonización bacteriana**
   - **Bacillus** (bacteria aeróbica) - metaboliza diesel, genera ácidos
   - **Clostridium** (anaerobia) - crece sin oxígeno, más agresiva
   - **Aspergillus** (hongo) - forma biofilm, erosiona metales
   - Velocidad de multiplicación: duplicación cada 4-8 horas @ 25-30°C

3. **Formación de biofilm**
   - Película de polisacáridos + bacterias + esporas
   - Se adhiere a paredes internas del tanque
   - Color marrón/negro visible en sedimento
   - Espesor: 0.1-1 mm en 2-4 semanas

4. **Degradación de combustible**
   - Ácidos orgánicos producidos (acetato, butirato)
   - Bajan pH de agua: 5.5-4.5 (altamente corrosivo)
   - Corrosión acelerada de acero: 10-50 mg/año → 100-500 mg/año
   - Penetración de herrumbre en inyectores

### Prueba de Crecimiento Microbiano

**Método estándar ASTM D4378:**

```
Muestra de combustible con agua
│
↓ Incubar 7 días @ 37°C en oscuridad
│
Resultado:
- Negativo: 0-10,000 CFU/mL (controlado)
- Débil: 10,000-100,000 CFU/mL (acción recomendada)
- Positivo: 100,000-1,000,000 CFU/mL (urgente drenaje)
- Crítico: > 1,000,000 CFU/mL (fallo de inyectores inmediato)
```

**Tiempo a fallo:**
- Crecimiento exponencial: duplicación cada 4-8 horas
- Desde 100 ppm agua @ 10K CFU/mL → 1M CFU/mL en ~3-5 días

## Daño a Inyectores HPCR (High Pressure Common Rail)

### Mecanismo de Corrosión

**Inyectores HPCR tienen tolerancias críticas:**
- Asiento de válvula: 0.05-0.1 mm
- Orificios de inyección: 0.1-0.15 mm Ø
- Presión operativa: 1,600-2,200 bar

**Agua + ácidos microbianos = corrosión acelerada:**

1. **Corrosión por pitting (picaduras)**
   - Microhuecos en superficie de acero inoxidable
   - Profundidad: 0.01-0.1 mm en 1-2 semanas
   - Resultado: Pérdida de estanqueidad en asiento

2. **Erosión de orificios**
   - Agua + sedimento + ácidos erosionan bordes de orificio
   - Tamaño de orificio aumenta: 0.12 mm → 0.15 mm
   - Efecto: Cambio de patrón de atomización
   - Síntoma: Consumo de combustible +15-25%, humo blanco

3. **Bloqueo de orificio por óxido de hierro**
   - Herrumbre del tanque flota, se sedimenta en inyector
   - Bloquea orificio completamente
   - Resultado: Cilindro no recibe inyección, potencia pierde 30-50%

### Síntomas de Daño Progresivo

| Etapa | Agua (ppm) | Síntoma | Tiempo a Fallo |
|---|---|---|---|
| 1 | 100-200 | Ninguno visible | 3-4 semanas |
| 2 | 200-500 | Consume más combustible +5% | 2-3 semanas |
| 3 | 500-1000 | Humo blanco, pérdida potencia | 1 semana |
| 4 | > 1000 | Fallo de encendido, rough idle | 2-5 días |
| 5 | > 2000 | Fallo total, no arranca | Inmediato |

## Medición: Karl Fischer (ASTM D6304)

### Procedimiento de Prueba

**Equipamiento:** Titulador Karl Fischer
- Reactivo: Iodo + SO₂ en metanol
- Volumen típico muestra: 5-10 mL
- Precisión: ±5 ppm

**Reacción química:**
```
H₂O + I₂ + SO₂ + 3 C₅H₅N → 2 C₅H₅N·HI + C₅H₅N·SO₃
```

**Resultado:** Volumen de titulante usado → ppm de agua

### Criterios de Acción

| Lectura Karl Fischer | Acción |
|---|---|
| < 100 ppm | OK, sin acción |
| 100-200 ppm | Monitoreo, mejorar sello |
| 200-300 ppm | Mejorar filtración, drenaje manual |
| 300-500 ppm | Drenaje inmediato + filtración offline |
| > 500 ppm | Descartar combustible, limpiar tanque |

## Estrategias de Prevención

### 1. Prevención de Ingreso (Primaria)

**Tanque de almacenamiento:**
- Tapa hermética con desiccante
- Tubo respiradero con filtro molecular (silica gel)
- Aislamiento térmico para reducir condensación

**Líneas de combustible:**
- Cambio de aceite en transportistas (no exponer a lluvia)
- Sellos de vibración en conexiones
- Protección de línea de retorno

**Proveedor:**
- Auditoría de refinerías/distribuidores
- Especificación de máximo 50 ppm en origen
- Certificado de análisis Karl Fischer

### 2. Filtración de Agua

**Filtro agua/combustible (Separador):**
- Captura water droplets mediante media coalescente
- Típico: 95%+ separación de agua libre @ 25µm
- Bypass si presión diferencial > 4 bar (cuidado: puede pasar agua)

**Media coalescente:**
- Sintética, resistente a diesel
- Absorción: 500-1000 mL agua por filtro
- Cambio: cada 1,000-2,000 horas O cuando indicador se activa

### 3. Removedor de Agua

**Aditivo absorbente de agua:**
- Típico: etilenglicol o poliol sintético
- Dosificación: 100-200 mL por 1,000 litros de combustible
- Absorbe agua disuelta, mantiene en suspensión (previene microbios)
- Limitación: Solo absorbe agua disuelta, no agua libre

### 4. Drenaje Manual y Limpieza

**Procedimiento de drenaje:**
- Acceso a válvula de drenaje en fondo de tanque
- Drenar 10-20% del volumen (donde se sedimenta agua)
- Frecuencia: Cada 6-12 meses O si lectura Karl Fischer > 200 ppm

**Limpieza de tanque (si contaminación severa):**
- Drenaje completo
- Enjuague con diesel limpio 2-3 veces
- Aspirado de sedimento
- Refill con combustible ISO 4406 16/14/11 (muy limpio)

### 5. Monitoreo Preventivo

**Frecuencia de medición:**
- Estación seca (baja humedad): Trimestral
- Estación lluviosa/tropical: Mensual
- Líneas de transporte: Antes de descarga

**Análisis complementarios:**
- ASTM D4378: Recuento de microorganismos (opcional)
- Inspección visual: Color, sedimento en fondo
- Gravedad específica: Indicador de adulteración

## Casos de Estudio

### Caso 1: Flota de Buses en Ambiente Tropical
- **Problema**: 500 ppm agua después 6 meses operación (clima húmedo)
- **Síntomas**: Consumo +20%, fallo de inyectores en 3 buses
- **Solución**: Instalación de kidney-loop offline + removedor agua
- **Resultado**: Mantenimiento 200 ppm, cero fallos subsecuentes, ahorro $50,000 en reparaciones

### Caso 2: Ferrocarril Diésel
- **Problema**: Tanque de almacenamiento sin mantenimiento, 1,500+ ppm agua
- **Síntomas**: Corrosión severa, 30% de inyectores dañados
- **Solución**: Limpieza completa de tanque, nuevo separador, monitoreo mensual
- **Resultado**: 8 meses para estabilización, mantenimiento 150 ppm

## Estándares Aplicables

### ASTM D6304 - Water in Diesel Fuel
- Método Karl Fischer
- Máximo permitido típicamente: 200 ppm para cumplimiento OEM

### ASTM D4378 - Microbiological Examination of Fuel
- Recuento de microorganismos
- Identificación de bacterias/hongos presentes

### EN 14274 - Fuel Contamination Classification
- Estándar europeo más restrictivo (< 100 ppm recomendado)
- Partículas + agua combinadas

### ISO 12937 - Water Content in Petroleum Products
- Alternativa a Karl Fischer para laboratorios

---

*Análisis basado en: ASTM D6304 estándar, Cummins filtración specification, estudios microbiológicos de sistemas diesel, Parker contamination management guide, casos de fallo de inyectores HPCR.*

*Última actualización: 2026-08-01*
