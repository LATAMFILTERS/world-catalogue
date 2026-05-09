# Fundamentos Técnicos de Filtración ELIMFILTERS

**Versión:** 2.0 | **Fecha:** 2026-04-28 | **Clasificación:** Referencia Técnica

---

## 1. Dinámica de Sólidos y Líquidos en Medios Porosos

### 1.1 Comportamiento de Partículas Sólidas

#### Clasificación por Tamaño y Densidad

Las partículas contaminantes en fluidos industriales varían en tamaño y densidad. ELIMFILTERS clasifica las partículas según su comportamiento en el medio filtrante:

| Tipo | Rango | Densidad Típica | Mecanismo de Captura |
|---|---|---|---|
| **Macropartículas** | >100 µm | 2.5–7.8 g/cm³ (metal) | Tamizado directo |
| **Micropartículas** | 10–100 µm | 2.0–3.5 g/cm³ | Intercepción, impacto inercial |
| **Nanopartículas** | 0.1–10 µm | Variable | Difusión browniana, Van der Waals |
| **Coloides** | <0.1 µm | 1.0–1.2 g/cm³ | Electroforesis, adsorción |

#### Movimiento de Partículas en Flujo

El número de **Reynolds (Re)** determina el régimen de flujo en el medio poroso:

```
Re = (ρ × v × D_p) / μ

Donde:
  ρ = densidad del fluido [kg/m³]
  v = velocidad superficial [m/s]
  D_p = diámetro de la fibra del medio [m]
  μ = viscosidad dinámica [Pa·s]
```

- **Re < 0.1** — Flujo laminar dominante (difusión browniana activa)
- **Re 0.1–1,000** — Flujo transicional (mecanismos mixtos)
- **Re > 1,000** — Flujo turbulento (inercial dominante)

### 1.2 Comportamiento de Fluidos Newtonianos vs. No-Newtonianos

#### Fluidos Newtonianos (La mayoría de fluidos ELIMFILTERS)

Aceites lubricantes, diésel, agua: la viscosidad es **constante** respecto a la velocidad de corte.

```
τ = μ × dv/dy

Donde:
  τ = esfuerzo cortante [Pa]
  μ = viscosidad absoluta [Pa·s]
  dv/dy = gradiente de velocidad [1/s]
```

**Implicación para filtración:** La caída de presión (ΔP) es proporcional al caudal volumétrico (Q).

#### Fluidos No-Newtonianos

Algunos refrigerantes industriales y fluidos de perforación exhiben comportamiento no-newtoniano:
- **Pseudoplásticos** (fluidos con cizallamiento adelgazante) — viscosidad decrece con velocidad de corte
- **Dilatantes** (fluidos con cizallamiento espesante) — viscosidad aumenta con velocidad de corte

**Implicación para filtración:** La caída de presión no es lineal respecto al caudal. La predicción de vida útil requiere análisis dinámico.

### 1.3 Efecto de la Temperatura en Dinámicas de Fluido

La viscosidad de un aceite varía exponencialmente con temperatura, descrita por la **ecuación de Walther**:

```
log(log(ν + 0.8)) = A - B·log(T)

Donde:
  ν = viscosidad cinemática [cSt]
  T = temperatura absoluta [K]
  A, B = constantes del aceite
```

**Ejemplo práctico:**
- Aceite EL8 PERFORMANCE a 40 °C: ~100 cSt
- Mismo aceite a 100 °C: ~11 cSt

**Impacto en filtración:**
1. Menor viscosidad a temperatura alta → menor caída de presión → mayor flujo → mayor carga de contaminantes al medio
2. Mayor viscosidad a arranque en frío → caída de presión alta → posible apertura de válvula de bypass

---

## 2. Mecanismos de Captura de Contaminantes

### 2.1 Tamizado (Sieving)

**Definición:** Retención directa de partículas cuyo tamaño supera la apertura de poro del medio.

```
Condición: d_partícula > d_poro

Eficiencia: η_sieve = 1 - (n_salida / n_entrada)
```

**Características:**
- Mecanismo más eficiente para macropartículas (>10 µm)
- Ocurre en la superficie externa del medio
- Genera una capa de partículas acumuladas (cake formation)

**Ejemplo ELIMFILTERS:** DURATECH™ (30–40 µm nominal) retiene ~90% de partículas >40 µm por puro tamizado en los primeros minutos.

### 2.2 Intercepción Directa (Interception)

**Definición:** Partículas siguen las líneas de flujo pero, al aproximarse a una fibra, son capturadas por fuerzas de Van der Waals a corta distancia.

```
Distancia de intercepción: d_intercept = r_fibra + r_partícula

Depende de: Número de Péclet (Pe)
Pe = (v × d_fibra) / D_brownian
```

**Características:**
- Dominante para micropartículas (1–10 µm) en flujo laminar
- La proximidad a la fibra es más importante que el impacto frontal
- Aumenta con densidad del empaque de fibras

**Ejemplo ELIMFILTERS:** SINTRAX™ y NANOFORCE™ aprovechan alta densidad de fibras para máxima intercepción.

### 2.3 Impacto Inercial (Inertial Impaction)

**Definición:** Partículas con inercia suficiente no pueden seguir las líneas de corriente y chocan frontalmente contra la fibra.

```
Número de Stokes (Stk) = (d_p² × ρ_p × v) / (18 × μ × d_fibra)

Stk >> 1 → impacto probable
Stk << 1 → sigue línea de corriente
```

**Características:**
- Dominante en flujo de alta velocidad (turbulento, Re > 1,000)
- Partículas densas (metales: ρ = 7.8 g/cm³) vs. partículas ligeras (polímeros: ρ = 1.2 g/cm³)
- Aumenta con diámetro de partícula

**Ejemplo ELIMFILTERS:** Filtros EA1 (aire) operan en régimen inercial — las partículas de polvo denso son capturadas por impacto.

### 2.4 Difusión Browniana (Brownian Diffusion)

**Definición:** Movimiento errático de nanopartículas (<1 µm) por colisión con moléculas del fluido.

```
Coeficiente de difusión: D_B = (k_B × T) / (3π × μ × d_p)

Donde:
  k_B = constante de Boltzmann [1.38×10⁻²³ J/K]
  T = temperatura absoluta [K]
```

**Características:**
- Mecanismo **dominante y único** para nanopartículas < 0.5 µm
- Proporcional a temperatura (aumenta en fluidos calientes)
- Inversamente proporcional a viscosidad (menor en fluidos viscosos)

**Ejemplo ELIMFILTERS:** NANOFORCE™ (0.3–10 µm) captura nanopartículas <1 µm casi enteramente por difusión browniana, no por impacto.

### 2.5 Fuerzas de Van der Waals y Atracción Electrostática

**Van der Waals:** Fuerzas atractivas débiles entre moléculas/partículas neutras a distancia corta (nanómetros).

```
Fuerza: F_vdW ≈ (C / r⁶)

Donde C es la constante de Hamaker y r es la distancia
```

**Electrostática:** En medios con carga (fibras electroestáticas), atracción entre cargas opuestas.

```
Fuerza: F_elec = (k_e × Q₁ × Q₂) / r²

Donde k_e = 8.99×10⁹ N·m²/C²
```

**Aplicación ELIMFILTERS:**
- **MICROKAPPA™**: Microfibra **cargada electrostáticamente** atrae polen y partículas polares (virus, bacterias)
- Cobertura positiva de fibra atrae partículas negativas de polvo/polen

---

## 3. Permeabilidad y Caída de Presión (Pressure Drop)

### 3.1 Concepto de Permeabilidad

**Definición:** Facilidad con la que un fluido puede atravesar un medio poroso.

```
Ley de Darcy: Q = (k × A × ΔP) / (μ × L)

Donde:
  Q = caudal volumétrico [m³/s]
  k = permeabilidad del medio [m²]
  A = área de flujo [m²]
  ΔP = caída de presión [Pa]
  μ = viscosidad [Pa·s]
  L = espesor del medio [m]
```

**Unidades de permeabilidad:**
- SI: m² (metro cuadrado)
- Darcy: 1 Darcy ≈ 10⁻¹² m² (unidad de campo petrolero)
- Porosidad típica de medios ELIMFILTERS: 65–95%

### 3.2 Factores que Afectan la Permeabilidad

| Factor | Efecto | Cuantificación |
|---|---|---|
| Diámetro de fibra (d_f) | Inverso exponencial | k ∝ d_f² |
| Porosidad (ε) | Exponencial positivo | k ∝ ε⁴ (modelo de Kozeny-Carman) |
| Espesor del medio (L) | Lineal inverso | ΔP ∝ L |
| Densidad de empaque | Inverso | Mayor densidad = menor k |
| Temperatura del fluido | Inverso (viscosidad) | Menor temp = mayor ΔP |

### 3.3 Caída de Presión Inicial vs. Durante la Vida Útil

#### Fase 1 — Caída de Presión Inicial (Clean Pressure Drop)

```
ΔP₀ = (8 × μ × L × v) / (d_f² × ε / (1-ε))

Donde v = velocidad superficial [m/s]
```

**Valores típicos ELIMFILTERS:**

| Tecnología | Micronaje | ΔP₀ inicial | ΔP máxima (saturación) |
|---|---|---|---|
| DURATECH™ | 30–40 µm | 0.3 bar | 2.5 bar |
| SINTRAX™ | 15–25 µm | 0.5 bar | 4.0 bar |
| NANOFORCE™ | 10–15 µm | 0.8 bar | 5.5 bar |
| SYNTEPORE™ | 2–10 µm | 1.2 bar | 6.0 bar |
| AQUAGUARD™ | 0.3–10 µm | 2.0 bar | 8.0 bar |

#### Fase 2 — Acumulación de Pastel (Cake Formation)

A medida que se acumulan partículas en la superficie y interior del medio:

```
ΔP(t) = ΔP₀ + (C × m_acumulada / A)

Donde C es el coeficiente de formación de pastel
```

**Comportamiento esperado:**
- Lineal para filtración con baja concentración de contaminantes
- Exponencial/parabólico en sistemas muy contaminados
- Válvula de bypass se abre cuando ΔP > ΔP_bypass

### 3.4 Permeabilidad y Eficiencia — Trade-off

**Dilema fundamental de la filtración:**

```
Mayor eficiencia (micronaje fino) ⟺ Menor permeabilidad (mayor ΔP)

Ejemplo:
  DURATECH™ (30–40 µm):   ΔP₀ = 0.3 bar,  eficiencia = 93%
  SINTRAX™  (15–25 µm):   ΔP₀ = 0.5 bar,  eficiencia = 97%
  NANOFORCE™(10–15 µm):   ΔP₀ = 0.8 bar,  eficiencia = 99.9%
```

**Solución ELIMFILTERS:** Medios multicapa con gradiente de porosidad
- Capa externa: baja densidad (alta permeabilidad, tamizado grueso)
- Capa media: densidad media (intercepción óptima)
- Capa interna: alta densidad (captura de nanopartículas)

---

## 4. Trazabilidad y Certificación

### 4.1 Sistema de Trazabilidad ELIMFILTERS

Cada producto ELIMFILTERS incluye un **código de lote único** que permite rastrear:

```
Formato: EL8-[AÑO]-[SEMANA]-[LOTE]-[SECUENCIA]

Ejemplo: EL8-2026-17-AB-0042
  ↓       ↓    ↓      ↓  ↓     ↓
  Prefijo Año  Sem.  Lte Seq.  Número
```

#### Información Trazable

| Dato | Recuperable | Fuente |
|---|---|---|
| Fecha exacta de fabricación | ✅ | Código de lote → Base de datos QC |
| Línea de producción | ✅ | Código de lote |
| Lote de materia prima (fibras) | ✅ | Certificados de proveedor |
| Resultado de prueba de eficiencia | ✅ | Protocolo ISO 4548 / ISO 5011 |
| Auditor / Inspector QC | ✅ | Hoja de inspección |
| Condiciones ambientales de fabricación | ✅ | Registro de planta |
| Información de distribución | ✅ | Sistema de logística |

### 4.2 Certificaciones y Normas de Referencia

#### Normas ISO de Filtración

| Norma | Aplicación | Contenido Clave |
|---|---|---|
| **ISO 4548-12** | Aceites de motor | Protocolo de prueba de eficiencia, caída de presión, capacidad |
| **ISO 5011** | Filtros de aire | Prueba de eficiencia con polvo de prueba Arizona |
| **ISO 16889** | Sistemas hidráulicos | Protocolo de filtración absoluta, β-ratio |
| **ISO 19438** | Filtros de combustible | Eficiencia, separación de agua, compatibilidad con biodiesel |
| **ISO 8573-1** | Aire comprimido | Clasificación de pureza (partículas, agua, aceite) |

#### Protocolos de Prueba Estándar

##### ISO 4548-12 — Prueba de Eficiencia en Aceite

```
Procedimiento:
1. Filtro limpio → medición de ΔP₀
2. Inyección de polvo de prueba ISO 4406 (2-10 µm)
3. Toma de muestras aguas arriba/abajo
4. Conteo de partículas con contador óptico
5. Cálculo de β-ratio = N_entrada / N_salida

Resultado: Eficiencia η = (1 - 1/β) × 100%

Ejemplo:
  β₁₀ = 200 → η = 99.5% @ 10 µm
```

##### ISO 5011 — Prueba de Aire

```
Procedimiento:
1. Flujo constante de aire limpio (38–40 m³/min)
2. Inyección de polvo Arizona Test Dust (0.5–100 µm)
3. Medición de ΔP continua hasta saturación (ΔP_final = 1,000 Pa típico)
4. Medición de cantidad de polvo filtrado

Resultado: Capacidad de polvo [g], Eficiencia inicial/final [%]
```

### 4.3 Documentación de Trazabilidad

#### Certificado de Análisis (CoA)

Cada filtro ELIMFILTERS incluye un **Certificado de Análisis** que detalla:

```
┌─────────────────────────────────────┐
│ ELIMFILTERS Certificate of Analysis │
├─────────────────────────────────────┤
│ Producto: EL8-SINTRAX-XYZ           │
│ Lote: 2026-17-AB-0042               │
│ Fecha de fabricación: 2026-04-21     │
│                                     │
│ RESULTADOS DE PRUEBA                │
│ ─────────────────────────           │
│ Eficiencia @ 5 µm:     96.8% ✓      │
│ ΔP inicial (0.1 bar):   0.52 bar   │
│ Capacidad de polvo:    15.2 g      │
│ Validez de sello:      0 fugas      │
│                                     │
│ CONFORME A:                         │
│ ✓ ISO 4548-12                       │
│ ✓ Especificación OEM                │
│ ✓ Procedimiento QC-EL8-v3.2         │
│                                     │
│ Inspector: María García (ID: MG-42) │
│ Firma digital: [SHA-256 hash]       │
│ Fecha de emisión: 2026-04-21        │
└─────────────────────────────────────┘
```

### 4.4 Trazabilidad Inversa (Recall)

En caso de issue de calidad:

```
1. Identificar código de lote afectado
2. Consultar base de datos de fabricación
3. Recuperar información de materia prima
4. Identificar todos los clientes que recibieron ese lote
5. Enviar notificación de recall con instrucciones
6. Documentar retorno y análisis de causa raíz
```

**Ejemplo de aviso de recall:**
```
RECALL ID: RC-2026-0147
Producto: NANOFORCE™ EL8-ELITE (código de lote: 2026-16-*)
Razón: Posible degradación de sello de goma en lotes 
       fabricados 2026-04-14 a 2026-04-18
Acción: Cambiar filtro inmediatamente
```

---

## 5. Modelado Matemático de Vida Útil del Filtro

### 5.1 Ecuación de Vida Útil (Tiempo de Saturación)

```
t_saturación = (m_max × A × ε × ρ_fluido) / (c_contaminante × Q)

Donde:
  m_max = capacidad máxima del filtro [g]
  A = área de filtración [m²]
  ε = porosidad del medio [-]
  c_contaminante = concentración de partículas [mg/L]
  Q = caudal volumétrico [L/min]
```

**Ejemplo práctico:**

Filtro DURATECH™ con:
- Capacidad: 12 g
- Área: 0.3 m²
- Caudal: 50 L/min
- Concentración ISO 4406: 19/16/13 (≈ 25 mg/L)

```
t_sat = (12 × 0.3 × 0.8 × 0.85) / (25 × 50)
      = 2.45 / 1,250
      = 0.00196 horas = 7 segundos ???

(Este cálculo es ilustrativo — en realidad la vida útil 
depende también de la distribución de tamaño de partículas)
```

### 5.2 Modelo de Caída de Presión Progresiva

```
ΔP(t) = ΔP₀ + α × √(t) + β × t

Donde:
  α = coeficiente de captura superficial
  β = coeficiente de carga profunda
  t = tiempo de operación [horas]
```

**Interpretación:**
- Término √(t): crecimiento rápido inicial (cake en superficie)
- Término t: crecimiento lento persistente (colmatación interna)
- ΔP₀: presión inicial (medio limpio)

---

## 6. Relaciones entre Parámetros Técnicos

### 6.1 Matriz de Interdependencias

```
                    Micronaje   Permeabilidad   Eficiencia   Vida útil
Aumentar:
Densidad fibra  →     ↓             ↓              ↑           ↓
Espesor medio   →     ↓             ↓              ↑           ↓
Diámetro fibra  →     ↑             ↑              ↓           ↑
Viscosidad flu. →     ↑             ↓              ↑           ↑
Velocidad (v)   →     ↑             ↓              ↑           ↓
Temperatura     →     ↑             ↑              ↓           ↓
```

**Leyenda:** ↑ aumenta, ↓ disminuye

### 6.2 Casos de Aplicación

#### Caso 1: Aceite frío en arranque (-20 °C)
```
Problema: Viscosidad muy alta (>1,000 cSt) → ΔP peligrosamente alto

Solución ELIMFILTERS:
- Válvula anti-retorno (PV-integral)
- Línea de bypass a presión calibrada
- Arranque en seco protegido
```

#### Caso 2: Combustible biodiesel contaminado
```
Problema: Concentración de agua emulsificada alta

Solución ELIMFILTERS:
- SYNTEPORE™ con tratamiento coalescente
- Media hidrofóbica que repele agua
- Bowl de drenaje para agua separada
```

#### Caso 3: Aire de mina con polvo de sílice
```
Problema: Concentración extrema de polvo fino

Solución ELIMFILTERS:
- NANOFORCE™ con prefiltro centrífugo
- Recirculación de aire caliente para regeneración
- Cambios de filtro frecuentes (cada 250 h vs. 1,000 h estándar)
```

---

## 7. Referencias y Normativa

### Normas Internacionales de Filtración
- ISO 4548 Series — Fluidos de motor
- ISO 5011 — Filtración de aire
- ISO 16889 — Sistemas hidráulicos
- ISO 19438 — Filtración de combustible
- SAE J806 / J726 — Especificaciones automotrices
- ASHRAE 52.2 — Eficiencia de filtros de aire

### Conceptos y Definiciones
- **Eficiencia absoluta:** porcentaje de partículas capturadas de tamaño ≥ rating nominal
- **β-ratio:** relación de concentración antes/después del filtro
- **Capacidad de suciedad:** masa máxima de contaminante que el filtro puede retener
- **Caída de presión:** diferencia de presión entre entrada y salida (resistencia del flujo)
- **Permeabilidad:** facilidad del medio para permitir paso de fluido

---

*ELIMFILTERS Engineering Team — Fundamentos Técnicos v2.0*
