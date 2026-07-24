# ELIMFILTERS® — Organigramas de Agentes IA y Arquitectura Operativa Sincronizada
**Versión**: 1.0  
**Fecha de Emisión**: Julio 2026  
**Estatus**: Especificación Oficial de Organigrama de Agentes, Optimización Logística y Flujo Sincronizado  

---

## 1. Principio de Operación Sincronizada (Sin Silos)

En **ELIMFILTERS®**, ningún Agente de IA trabaja de forma aislada. La infraestructura opera como una **Red Orquestada de Agentes Especializados (Multi-Agent Swarm System)** conectada en tiempo real a la base de datos relacional PostgreSQL.

Cada agente cumple un rol de departamento dentro del organigrama corporativo y pasa el contexto del cliente y la transacción al siguiente agente de la cadena sin perder información.

---

## 2. Organigrama Corporativo de Agentes de IA

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                    DIRECCIÓN GENERAL: VICTOR ABREU (CEO)                                │
│          Aprobaciones Ejecutivas Bicanal (Telegram + Email vabreu@elimfilters.com)      │
└───────────────────────────────────────────┬─────────────────────────────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│              ORQUESTADOR GENERAL: AGENTE CONTROLADOR OPERATIVO (KLEO ENGINE)            │
└───────┬───────────────────┬───────────────────┬───────────────────┬─────────────────────┘
        │                   │                   │                   │
        ▼                   ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ AGENTE        │   │ AGENTE        │   │ AGENTE        │   │ AGENTE        │
│ COMERCIAL &   │   │ TÉCNICO &     │   │ OPTIMIZACIÓN  │   │ FÁBRICA &     │
│ ONBOARDING    │   │ METROLOGÍA    │   │ LOGÍSTICA &   │   │ PROCESO MTO   │
│ distribution_ │   │ support@      │   │ CONTENEDORES  │   │ supplychain@  │
│ network@      │   │               │   │ supplychain@  │   │               │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │                   │
        └───────────────────┴─────────┬─────────┴───────────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │ AGENTE DE FINANZAS &      │
                        │ FACTURACIÓN               │
                        │ finance@                  │
                        └───────────────────────────┘
```

---

## 3. Roles y Funciones de los Agentes Especializados

### 1. Agente Comercial & Onboarding (`distribution_network@elimfilters.com`)
* **Función**: Primer contacto B2B en redes sociales, WhatsApp y web.
* **Misión**: Clasifica perfil B2B vs. B2C. Redirige a los interesados en distribución a `https://elimfilters.com/distributor-application`. Precalifica al prospecto en tiempo real.

### 2. Agente Técnico & Metrología (`support@elimfilters.com`)
* **Función**: Consultor de ingeniería de filtración.
* **Misión**: Valida compatibilidades de maquinaria pesada (Caterpillar, Komatsu, Volvo), normativas ISO 4406, códigos Beta y especificaciones de Kits DURATECH™.

### 3. Agente de Optimización Logística & Cubicaje (`supplychain@elimfilters.com`) — *Ejemplo de Cubicaje 100% FCL*
* **Función**: Asesor de empaque, estibado y llenado óptimo de contenedores en tiempo real.
* **Algoritmo de Cálculo**:
  * Contenedor 20ft Estándar: **33.2 m³** / Capacidad máxima de carga: **21,800 kg** (aprox. 10–11 estibas master).
  * Contenedor 40ft High Cube (HC): **76.4 m³** / Capacidad máxima de carga: **26,500 kg** (aprox. 23–24 estibas master).
* **Flujo Interactivo en Tiempo Real**:
  1. Conforme el comprador selecciona sus Kits de Mantenimiento DURATECH™, el Agente calcula en segundo plano el volumen cúbico y peso total.
  2. **Interacción con el Cliente**:
     > *"Estimado Ing. Mendoza: Su orden actual de Kits DURATECH™ ocupa el **84.2% del volumen de un contenedor de 20ft** (27.9 m³ utilizados / 5.3 m³ disponibles).*  
     > *Para aprovechar su flete marítimo al 100% (FCL - Full Container Load), le sugerimos agregar 110 Kits de Filtro de Aire EA10695 o 85 Kits Hidráulicos EH2014, completando exactamente el 100% de la capacidad sin aumentar el costo de transporte marítimo."*

### 4. Agente de Fábrica & Proceso MTO (`supplychain@elimfilters.com`)
* **Función**: Coordinador de manufactura Make-to-Order.
* **Misión**: Una vez recibida la aprobación `/approve <id>` de Victor Abreu y el 50% de anticipo, emite la Orden de Trabajo (Work Order) a las plantas de producción y monitorea el estado del ensamble.

### 5. Agente de Finanzas & Facturación (`finance@elimfilters.com`)
* **Función**: Gestión monetaria y despacho de documentos de embarque.
* **Misión**: Emite facturas pro-forma, valida depósitos del 50% de anticipo y procesa la cobranza final contra presentación del Bill of Lading (B/L).

---

## 4. Trazabilidad Inmutable y Registro de Auditoría

Toda la interacción entre agentes, datos volumétricos del contenedor, precalificación y aprobación del CEO queda asentada de forma inmutable en PostgreSQL en las siguientes tablas transaccionales:
* `b2b_distributor_leads` (Datos de precalificación comercial)
* `container_cubic_allocations` (Cálculo volumétrico y empaque del contenedor)
* `authorization_audit_log` (Registro de aprobación por Victor Abreu vía Telegram o Email)
