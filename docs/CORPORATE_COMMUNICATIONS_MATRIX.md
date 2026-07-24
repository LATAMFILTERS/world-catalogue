# ELIMFILTERS® — Matriz de Comunicaciones y Canales de Correo Corporativos
**Versión**: 1.1  
**Fecha de Emisión**: Julio 2026  
**Estatus**: Política Oficial de Comunicaciones, Logística de Fábrica y Canales Digitales  

---

## 1. Propósito y Alcance

Este documento establece la estructura canónica de canales de correo electrónico corporativo de **ELIMFILTERS®**. Define la responsabilidad, el tipo de comunicación y las reglas de enrutamiento automatizado para garantizar el aislamiento entre clientes finales (B2C), aliados comerciales (B2B), consultas técnicas, interacciones financieras y la **coordinación automatizada por IA entre Plantas de Manufactura y Logística**.

---

## 2. Matriz Canónica de Correos Corporativos

| Dirección de Correo | Tipo de Canal | Propósito Exclusivo | Enrutamiento / Origen de Tráfico |
|---|---|---|---|
| **`supplychain@elimfilters.com`** | **Fábricas, Logística & Agentes IA** | Comunicación automatizada entre la Red de Agentes de IA de ELIMFILTERS®, las Plantas de Manufactura, Operadores Logísticos Marítimos y Agentes de Carga. | Emisión automática de Órdenes de Trabajo (MTO), recepción de estados de producción y documentos de embarque (B/L). |
| **`distribution_network@elimfilters.com`** | **Captación B2B Directa** | Recepción de solicitudes de precalificación, negociación de exclusividad territorial y acuerdos comerciales uno-a-uno con distribuidores e importadores. | Formulario `https://elimfilters.com/distributor-application` y prospectos precalificados por bots. |
| **`b2b@elimfilters.com`** | **Marketing & Divulgación** | Envío de campañas de Email Marketing B2B, secuencias de nutrición (*nurturing*), boletines técnicos y anuncios de nuevos lanzamientos o tecnologías. | Campañas automatizadas de salida (*outbound*) y boletines periódicos a la base de datos B2B. |
| **`info@elimfilters.com`** | **Contacto General** | Canal corporativo público para consultas generales, proveedores o cualquier persona que desee hacer un primer contacto con la empresa. | Formulario web público `/api/contact` en `elimfilters.com`. |
| **`support@elimfilters.com`** | **Ingeniería & Soporte Técnico** | Consultas técnicas especializadas, validación de aplicaciones complejas, normativas ISO 4406, códigos Beta e informes de garantía de producto. | Escalamiento desde chatbots de atención o correo directo de ingenieros de mantenimiento. |
| **`finance@elimfilters.com`** | **Finanzas & Facturación** | Confirmación de transferencias del 50% de anticipo en firme, emisión de facturas internacionales, gestión de pagos y despacho de Bill of Lading (B/L). | Comunicaciones financieras post-orden de compra con importadores y distribuidores firmados. |

---

## 3. Flujo Automatizado de Agentes de IA en `supplychain@elimfilters.com`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│             FLUJO DE AGENTES IA: FACTORY & LOGISTICS ENGINE                 │
└─────────────────────────────────────────────────────────────────────────────┘

  1. CONFIRMACIÓN DE ANTICIPO (50%)
     └─ El sistema detecta el pago y activa al Agente de Suministro.
                                  │
                                  ▼
  2. EMISIÓN DE ORDEN DE FABRICACIÓN (WORK ORDER)
     └─ Agente IA envía especificaciones técnicas a la Planta desde supplychain@elimfilters.com.
                                  │
                                  ▼
  3. MONITOREO DE PRODUCCIÓN (ROLLING STATUS)
     └─ La Planta responde con actualizaciones de ensamble. El Agente IA actualiza PostgreSQL.
                                  │
                                  ▼
  4. RECEPCIÓN DE DOCUMENTOS DE EMBARQUE (B/L & PACKING LIST)
     └─ Naviera envía B/L a supplychain@elimfilters.com. Agente IA extrae datos y notifica a finance@elimfilters.com.
```

---

## 4. Gobernanza y Seguridad de Datos

* **Aislamiento B2B / B2C**: Las cuentas `supplychain@elimfilters.com`, `distribution_network@elimfilters.com`, `b2b@elimfilters.com` y `finance@elimfilters.com` son de carácter confidencial y no deben exponerse como canales de soporte minorista.
* **Cumplimiento de Privacidad**: Toda dirección de correo capturada por los bots se almacena en la tabla transaccional `b2b_distributor_leads` de PostgreSQL con registro de origen.
