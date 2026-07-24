# ELIMFILTERS® — Matriz de Comunicaciones y Canales de Correo Corporativos
**Versión**: 1.2  
**Fecha de Emisión**: Julio 2026  
**Estatus**: Política Oficial de Comunicaciones, Logística de Fábrica y Autorización Ejecutiva (Human-in-the-Loop)  

---

## 1. Propósito y Alcance

Este documento establece la estructura canónica de canales de correo electrónico corporativo de **ELIMFILTERS®**. Define la responsabilidad, el tipo de comunicación, el enrutamiento automatizado por Agentes de IA y el **Punto de Control de Autorización Ejecutiva Final por parte de Victor Abreu (CEO)**.

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

## 3. Flujo Automatizado con Autorización Ejecutiva Final (Victor Abreu - CEO)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│          FLUJO AUTOMATIZADO DE AGENTES IA + AUTORIZACIÓN DE VICTOR ABREU    │
└─────────────────────────────────────────────────────────────────────────────┘

  1. CAPTURA Y PRECALIFICACIÓN AUTOMÁTICA POR AGENTES DE IA
     └─ Bots procesan la solicitud, enriquecen datos y preparan el expediente en PostgreSQL.

  2. ENVÍO DE RESUMEN EJECUTIVO A TELEGRAM (VÍA KLEO BOT)
     └─ Victor Abreu recibe una notificación de 1 página en Telegram con los datos clave:
        • Empresa, País, Contacto, Volumen Estimado, Score de Precalificación.

  3. APORTACIÓN O RECHAZO EN 1 CLIC (/approve <id> o /reject <id>)
     └─ Victor Abreu autoriza desde su celular enviando /approve <id>.

  4. EJECUCIÓN AUTOMÁTICA POST-APROBACIÓN
     └─ Al recibir la aprobación, la IA dispara:
        a) Correo oficial de exclusividad territorial desde distribution_network@elimfilters.com.
        b) Orden de Trabajo a Fábrica desde supplychain@elimfilters.com.
        c) Instrucción de cobro del 50% de anticipo desde finance@elimfilters.com.
```

---

## 4. Gobernanza y Seguridad de Datos

* **Punto de Control Unico (Human-in-the-Loop)**: Ningún contrato de exclusividad, orden de fábrica o compromiso comercial irreversible se emite sin la orden explícita de Victor Abreu vía Telegram.
* **Aislamiento B2B / B2C**: Las cuentas `supplychain@elimfilters.com`, `distribution_network@elimfilters.com`, `b2b@elimfilters.com` y `finance@elimfilters.com` son de carácter confidencial y no se exponen a atención minorista.
* **Cumplimiento de Privacidad**: Toda dirección de correo capturada por los bots se almacena en la tabla transaccional `b2b_distributor_leads` de PostgreSQL.
