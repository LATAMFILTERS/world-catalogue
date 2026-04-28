# AI Agent Integration Guide

**Cómo alimentar agentes de IA con conocimiento ELIMFILTERS**

**Versión:** 1.0 | **Fecha:** 2026-04-28 | **Audiencia:** Desarrolladores de Sistemas IA, LLM Engineers

---

## 1. Visión General

La **Knowledge API** (`/api/knowledge`) proporciona acceso estructurado a toda la documentación técnica de ELIMFILTERS. Los agentes IA pueden:

✅ Recuperar información técnica en tiempo real (RAG)
✅ Alimentar system prompts con contexto detallado
✅ Comparar tecnologías para recomendaciones
✅ Buscar por concepto (adsorción, permeabilidad, etc.)
✅ Obtener manuales completos en markdown

---

## 2. Endpoints REST Disponibles

### 2.1 Listar Todas las Tecnologías

```bash
GET /api/knowledge/technologies
```

**Respuesta:**
```json
{
  "success": true,
  "total": 13,
  "technologies": [
    {
      "id": "NANOFORCE",
      "name": "NANOFORCE™",
      "category": "Oil Filter — ELITE / Air Filter",
      "prefix": ["EL8", "EA1"],
      "type": "Nanofibra sintética 100%",
      "micron_range": "10–15 µm",
      "duty": ["HD", "LD"],
      "key_concepts": [
        "nanofibras sintéticas",
        "filtración superficial",
        "eficiencia 99.9%"
      ]
    },
    ...
  ]
}
```

**Uso por IA:** Obtener lista base de todas las tecnologías disponibles.

---

### 2.2 Obtener Detalles de una Tecnología

```bash
GET /api/knowledge/technologies/NANOFORCE
```

**Respuesta:**
```json
{
  "success": true,
  "technology": {
    "id": "NANOFORCE",
    "name": "NANOFORCE™",
    "category": "Oil Filter — ELITE / Air Filter",
    "prefix": ["EL8", "EA1"],
    "type": "Nanofibra sintética 100%",
    "micron_range_oil": "10–15 µm",
    "micron_range_air": "0.3–10 µm",
    "key_concepts": [
      "nanofibras sintéticas",
      "filtración superficial",
      "eficiencia 99.9%",
      "difusión browniana",
      "efecto electrostático inicial",
      "intervalos extendidos hasta 2×"
    ],
    "applications": [
      "Motores de alta precisión",
      "Maquinaria en ambientes polvorientos",
      "Aceites sintéticos premium",
      "Condiciones extremas"
    ],
    "efficiency": "99.9% @ 10µm, 99.97% @ 0.3µm",
    "max_temperature": "150 °C (aceite), 130 °C (aire)",
    "competitors": ["Donaldson Ultra-Web", "FRAM Ultra Synthetic"]
  }
}
```

**Uso por IA:** Contexto detallado para responder preguntas sobre una tecnología específica.

---

### 2.3 Búsqueda Avanzada por Concepto/Aplicación

```bash
GET /api/knowledge/search?concept=adsorcion&duty=HD&limit=5
```

**Parámetros:**
- `concept` — concepto técnico (ej: "adsorcion", "permeabilidad", "electrostática")
- `application` — tipo de aplicación (ej: "minería", "autobús", "maquinaria")
- `duty` — HD, LD, Marine, Industrial
- `prefix` — EL8, EA1, EF9, etc.
- `max_temp` — temperatura máxima (ej: 80)
- `limit` — máximo de resultados (default: 10)

**Respuesta:**
```json
{
  "success": true,
  "query": {"concept": "adsorcion", "duty": "HD"},
  "total_found": 3,
  "results": [
    {
      "id": "MICROKAPPA",
      "name": "MICROKAPPA™",
      "category": "Cabin Air Filter",
      "type": "Microfibra PET electroestática + carbón activado",
      "key_concepts": [
        "capa antimicrobiana plata Ag⁺",
        "adsorción VOCs",
        "carbón de coco 25–35 g"
      ]
    },
    ...
  ]
}
```

**Uso por IA:** Encontrar tecnologías relevantes a partir de conceptos técnicos.

---

### 2.4 Obtener Manual Completo

```bash
GET /api/knowledge/documents/TECHNICAL_FOUNDATIONS
```

**Respuesta:**
```json
{
  "success": true,
  "document_id": "TECHNICAL_FOUNDATIONS",
  "filename": "TECHNICAL_FOUNDATIONS.md",
  "content": "[Contenido markdown completo de 17 KB...]",
  "format": "markdown"
}
```

**Uso por IA:** Obtener documentación completa para RAG o para proporcionar contexto muy detallado.

---

### 2.5 Obtener Contexto Formateado para Prompts

```bash
GET /api/knowledge/context/NANOFORCE
```

**Respuesta:**
```json
{
  "success": true,
  "technology_id": "NANOFORCE",
  "context": "# NANOFORCE™ Technical Context\n\n## Overview\n...",
  "metadata": {
    "name": "NANOFORCE™",
    "category": "Oil Filter — ELITE / Air Filter",
    "type": "Nanofibra sintética 100%",
    "duty": ["HD", "LD"]
  }
}
```

**Uso por IA:** Contexto ya formateado listo para inyectar en system prompts.

---

### 2.6 Comparar Dos Tecnologías

```bash
GET /api/knowledge/comparison?tech1=DURATECH&tech2=NANOFORCE
```

**Respuesta:**
```json
{
  "success": true,
  "technologies": [
    {
      "id": "DURATECH",
      "name": "DURATECH™",
      "type": "Celulosa técnica reforzada",
      "micron_range": "30–40 µm",
      "efficiency": "≥93%",
      "max_temperature": "125 °C",
      "service_interval": "5,000–10,000 km"
    },
    {
      "id": "NANOFORCE",
      "name": "NANOFORCE™",
      "type": "Nanofibra sintética 100%",
      "micron_range": "10–15 µm",
      "efficiency": "99.9%",
      "max_temperature": "150 °C",
      "service_interval": "Hasta 2× vs. estándar"
    }
  ]
}
```

**Uso por IA:** Ayudar al usuario a elegir entre dos tecnologías basándose en especificaciones.

---

### 2.7 Obtener Tecnologías por Prefijo

```bash
GET /api/knowledge/by-prefix/EL8
```

**Respuesta:**
```json
{
  "success": true,
  "prefix": "EL8",
  "total": 3,
  "technologies": [
    {"id": "DURATECH", "name": "DURATECH™", "category": "Oil Filter — STANDARD"},
    {"id": "SINTRAX", "name": "SINTRAX™", "category": "Oil Filter — PERFORMANCE"},
    {"id": "NANOFORCE", "name": "NANOFORCE™", "category": "Oil Filter — ELITE"}
  ]
}
```

**Uso por IA:** Cuando el usuario dice "dame todas las opciones para EL8".

---

### 2.8 Listar Todos los Conceptos

```bash
GET /api/knowledge/concepts
```

**Respuesta:**
```json
{
  "success": true,
  "total": 45,
  "concepts": [
    "Adsorción (física y química)",
    "Antibypass completo",
    "Capacidad de retención",
    "Caída de presión progresiva",
    "Carga electrostática residual",
    "Compatibilidad agua salada",
    ...
  ]
}
```

**Uso por IA:** Validar que un concepto mencionado por el usuario existe en la base de conocimiento.

---

### 2.9 Verificar Salud del Servicio

```bash
GET /api/knowledge/health
```

**Respuesta:**
```json
{
  "success": true,
  "service": "ELIMFILTERS Knowledge API",
  "version": "2.0",
  "status": "active",
  "technologies_loaded": 13,
  "documents_available": 16
}
```

**Uso por IA:** Verificar antes de hacer consultas que el servicio está disponible.

---

## 3. Patrones de Integración para Agentes IA

### 3.1 Patrón RAG (Retrieval Augmented Generation)

```python
# Pseudocódigo Python
import requests

def ask_about_filter(user_question):
    # 1. Extraer concepto clave del usuario
    concepts = extract_concepts(user_question)
    
    # 2. Buscar en Knowledge API
    response = requests.get(
        f"http://localhost:3000/api/knowledge/search",
        params={"concept": concepts[0]}
    )
    
    # 3. Obtener contexto detallado
    relevant_tech = response.json()['results'][0]
    context = requests.get(
        f"http://localhost:3000/api/knowledge/context/{relevant_tech['id']}"
    ).json()['context']
    
    # 4. Pasar contexto al LLM
    system_prompt = f"""
    Eres un experto en filtración ELIMFILTERS.
    Aquí está la información técnica relevante:
    
    {context}
    
    Responde basándote en este conocimiento técnico.
    """
    
    answer = llm.generate(
        system_prompt=system_prompt,
        user_message=user_question
    )
    
    return answer
```

**Flujo:**
1. IA extrae concepto del usuario
2. Consulta `/api/knowledge/search`
3. Obtiene contexto con `/api/knowledge/context/{id}`
4. Inyecta contexto en system prompt
5. Genera respuesta técnica precisa

### 3.2 Patrón de Recomendación

```python
def recommend_filter(duty, application, temperature):
    # Búsqueda multicriteria
    response = requests.get(
        "http://localhost:3000/api/knowledge/search",
        params={
            "duty": duty,          # "HD" o "LD"
            "application": application,  # "minería", "autobús", etc.
            "max_temp": temperature,
            "limit": 5
        }
    )
    
    techs = response.json()['results']
    
    # Formato para presentar al usuario
    recommendations = []
    for tech in techs:
        details = requests.get(
            f"http://localhost:3000/api/knowledge/technologies/{tech['id']}"
        ).json()['technology']
        
        recommendations.append({
            "name": tech['name'],
            "efficiency": details['efficiency'],
            "max_temp": details['max_temperature'],
            "service_interval": details['service_interval']
        })
    
    return recommendations
```

### 3.3 Patrón de Comparación

```python
def compare_options(tech1_id, tech2_id):
    response = requests.get(
        f"http://localhost:3000/api/knowledge/comparison",
        params={"tech1": tech1_id, "tech2": tech2_id}
    )
    
    comparison = response.json()['technologies']
    
    # Generar matriz de comparación
    matrix = {
        "Eficiencia": [
            comparison[0].get('efficiency', 'N/A'),
            comparison[1].get('efficiency', 'N/A')
        ],
        "Temperatura máxima": [
            comparison[0].get('max_temperature', 'N/A'),
            comparison[1].get('max_temperature', 'N/A')
        ],
        "Intervalo de servicio": [
            comparison[0].get('service_interval', 'N/A'),
            comparison[1].get('service_interval', 'N/A')
        ]
    }
    
    return matrix
```

---

## 4. Ejemplos de Consultas

### Ejemplo 1: "¿Cuál es el mejor filtro para minería?"

```bash
curl "http://localhost:3000/api/knowledge/search?application=mineria&duty=HD&limit=3"
```

**IA recibe:** NANOFORCE™ (aire), MACROCORE™, GASULTRA™
**IA responde:** "Para minería recomiendo NANOFORCE™ o MACROCORE™ por su eficiencia 99.5%+ en ambientes polvorientos"

### Ejemplo 2: "Explica la diferencia entre SINTRAX™ y NANOFORCE™"

```bash
curl "http://localhost:3000/api/knowledge/comparison?tech1=SINTRAX&tech2=NANOFORCE"
```

**IA genera tabla comparativa:**
| Aspecto | SINTRAX™ | NANOFORCE™ |
|---------|----------|-----------|
| Tipo | Celulosa sintética | Nanofibra sintética |
| Micronaje | 15–25 µm | 10–15 µm |
| Eficiencia | 95–98% | 99.9% |
| Intervalo | 10,000–15,000 km | Hasta 2× vs. estándar |

### Ejemplo 3: "Necesito un filtro para -20°C"

```bash
curl "http://localhost:3000/api/knowledge/search?concept=temperatura&max_temp=-20&limit=5"
```

**IA responde:** "Para temperaturas extremas, DRYCORE™ garantiza punto de rocío ≤-40°C"

### Ejemplo 4: "¿Qué tecnología usa adsorción de VOCs?"

```bash
curl "http://localhost:3000/api/knowledge/search?concept=adsorcion"
```

**IA responde:** "MICROKAPPA™ usa carbón activado de coco para adsorción de VOCs y gases ácidos (NO₂, H₂S)"

---

## 5. Formato de Prompt del Sistema

Cuando inyectes contexto, usa este formato:

```
System Prompt (para LLM):
═════════════════════════════════

Eres un experto técnico en sistemas de filtración ELIMFILTERS.

TECNOLOGÍA EN CUESTIÓN:
{contexto obtenido de /api/knowledge/context/{tech}}

INFORMACIÓN ADICIONAL:
- Siempre cita los porcentajes de eficiencia y temperaturas exactas
- Menciona los competidores directos cuando sea relevante
- Recommienda el intervalo de servicio correcto
- Explica conceptos con lenguaje técnico pero accesible

Responde la siguiente pregunta basándote ÚNICAMENTE en la información arriba:
═════════════════════════════════
```

---

## 6. Manejo de Errores

### Error: Tecnología no encontrada

```json
{
  "success": false,
  "error": "Technology UNKNOWN not found",
  "available": ["DURATECH", "SINTRAX", "NANOFORCE", ...]
}
```

**IA debe:** Sugerir tecnologías disponibles y preguntar cuál busca el usuario.

### Error: Concepto no encontrado

```json
{
  "success": false,
  "error": "No results found"
}
```

**IA debe:** Usar `/api/knowledge/concepts` para mostrar conceptos válidos.

---

## 7. Límites y Buenas Prácticas

| Consideración | Recomendación |
|---|---|
| **Caché de respuestas** | Cachear /api/knowledge/technologies cada 24h (raramente cambia) |
| **Número de consultas** | Limitar búsquedas a máx 5 consultas por sesión de usuario |
| **Contexto en prompts** | No exceder 10 KB de contexto técnico por prompt (riesgo de contexto perdido) |
| **Lenguaje de respuesta** | Detectar idioma del usuario; la API devuelve ES pero traduce si necesario |
| **Validación** | Llamar a `/api/knowledge/health` al iniciar sesión del agente |

---

## 8. Roadmap Futuro

🔄 **Próximas mejoras planificadas:**
- Embeddings vectoriales para búsqueda semántica
- Correlaciones físico-químicas adicionales (TBN, viscosidad índice)
- Fatiga hidráulica y ciclos de pulso documentados
- Base de datos de casos de uso (field reports)
- Análisis de compatibilidad material vs. fluido automático

---

*ELIMFILTERS Knowledge API v2.0 — Documentación para Integradores IA*
