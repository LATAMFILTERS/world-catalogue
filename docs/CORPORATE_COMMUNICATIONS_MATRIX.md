# ELIMFILTERS® — Matriz de Comunicaciones y Canales de Correo Corporativos
**Versión**: 1.0  
**Fecha de Emisión**: Julio 2026  
**Estatus**: Política Oficial de Comunicaciones y Canales Digitales  

---

## 1. Propósito y Alcance

Este documento establece la estructura canónica de canales de correo electrónico corporativo de **ELIMFILTERS®**. Define la responsabilidad, el tipo de comunicación y las reglas de enrutamiento automatizado para garantizar el aislamiento entre clientes finales (B2C), aliados comerciales (B2B), consultas técnicas e interacciones financieras.

---

## 2. Matriz Canónica de Correos Corporativos

| Dirección de Correo | Tipo de Canal | Propósito Exclusivo | Enrutamiento / Origen de Tráfico |
|---|---|---|---|
| **`distribution_network@elimfilters.com`** | **Captación B2B Directa** | Recepción de solicitudes de precalificación, negociación de exclusividad territorial y acuerdos comerciales uno-a-uno con distribuidores e importadores. | Formulario `https://elimfilters.com/distributor-application` y prospectos precalificados por bots. |
| **`b2b@elimfilters.com`** | **Marketing & Divulgación** | Envío de campañas de Email Marketing B2B, secuencias de nutrición (*nurturing*), boletines técnicos y anuncios de nuevos lanzamientos o tecnologías. | Campañas automatizadas de salida (*outbound*) y boletines periódicos a la base de datos B2B. |
| **`info@elimfilters.com`** | **Contacto General** | Canal corporativo público para consultas generales, proveedores o cualquier persona que desee hacer un primer contacto con la empresa. | Formulario web público `/api/contact` en `elimfilters.com`. |
| **`support@elimfilters.com`** | **Ingeniería & Soporte Técnico** | Consultas técnicas especializadas, validación de aplicaciones complejas, normativas ISO 4406, códigos Beta e informes de garantía de producto. | Escalamiento desde chatbots de atención o correo directo de ingenieros de mantenimiento. |
| **`finance@elimfilters.com`** | **Finanzas & Facturación** | Confirmación de transferencias del 50% de anticipo en firme, emisión de facturas internacionales, gestión de pagos y despacho de Bill of Lading (B/L). | Comunicaciones financieras post-orden de compra con importadores y distribuidores firmados. |

---

## 3. Reglas de Enrutamiento Automático en Sistemas (Backend & Bots)

1. **Precalificación Comercial**: Toda solicitud procesada en `https://elimfilters.com/distributor-application` genera la notificación de control a `distribution_network@elimfilters.com` y responde en `< 5s` con el Dossier B2B HTML.
2. **Escalamiento Técnico**: Respuestas de la IA que requieran verificación de laboratorio remota dirigen al usuario a `support@elimfilters.com`.
3. **Confirmación de Pagos Incoterm FOB**: Todo contrato cerrado deriva los comprobantes de pago del 50% de anticipo directamente a `finance@elimfilters.com`.

---

## 4. Gobernanza y Seguridad de Datos

* **Aislamiento B2B / B2C**: Las cuentas `distribution_network@elimfilters.com`, `b2b@elimfilters.com` y `finance@elimfilters.com` son de carácter confidencial y no deben exponerse como canales de soporte minorista.
* **Cumplimiento de Privacidad**: Toda dirección de correo capturada por los bots se almacena en la tabla transaccional `b2b_distributor_leads` de PostgreSQL con registro de origen.
