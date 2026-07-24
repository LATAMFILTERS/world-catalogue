# ELIMFILTERS® — Matriz de Comunicaciones y Canales de Correo Corporativos
**Versión**: 1.4  
**Fecha de Emisión**: Julio 2026  
**Estatus**: Política Oficial de Comunicaciones, Logística de Fábrica y Autorización Simétrica Dual (Telegram & Email)  

---

## 1. Propósito y Alcance

Este documento establece la estructura canónica de canales de correo electrónico corporativo de **ELIMFILTERS®**. Define la responsabilidad, el tipo de comunicación, el enrutamiento automatizado por Agentes de IA y el **Protocolo de Autorización Simétrica Dual y Auditoría por parte de Victor Abreu (CEO)**.

---

## 2. Matriz Canónica de Correos Corporativos

| Dirección de Correo | Tipo de Canal | Propósito Exclusivo | Enrutamiento / Origen de Tráfico |
|---|---|---|---|
| **`vabreu@elimfilters.com`** | **Dirección General (CEO Office)** | Recepción de Expedientes Ejecutivos idénticos a los de Telegram, autorizaciones contractuales por correo y registro de auditoría máster. | Notificación dual simétrica automática enviada a Victor Abreu para cada oportunidad B2B. |
| **`supplychain@elimfilters.com`** | **Fábricas, Logística & Agentes IA** | Comunicación automatizada entre la Red de Agentes de IA de ELIMFILTERS®, las Plantas de Manufactura, Operadores Logísticos Marítimos y Agentes de Carga. | Emisión automática de Órdenes de Trabajo (MTO), recepción de estados de producción y documentos de embarque (B/L). |
| **`distribution_network@elimfilters.com`** | **Captación B2B Directa** | Recepción de solicitudes de precalificación, negociación de exclusividad territorial y acuerdos comerciales uno-a-uno con distribuidores e importadores. | Formulario `https://elimfilters.com/distributor-application` y prospectos precalificados por bots. |
| **`b2b@elimfilters.com`** | **Marketing & Divulgación** | Envío de campañas de Email Marketing B2B, secuencias de nutrición (*nurturing*), boletines técnicos y anuncios de nuevos lanzamientos o tecnologías. | Campañas automatizadas de salida (*outbound*) y boletines periódicos a la base de datos B2B. |
| **`info@elimfilters.com`** | **Contacto General** | Canal corporativo público para consultas generales, proveedores o cualquier persona que desee hacer un primer contacto con la empresa. | Formulario web público `/api/contact` en `elimfilters.com`. |
| **`support@elimfilters.com`** | **Ingeniería & Soporte Técnico** | Consultas técnicas especializadas, validación de aplicaciones complejas, normativas ISO 4406, códigos Beta e informes de garantía de producto. | Escalamiento desde chatbots de atención o correo directo de ingenieros de mantenimiento. |
| **`finance@elimfilters.com`** | **Finanzas & Facturación** | Confirmación de transferencias del 50% de anticipo en firme, emisión de facturas internacionales, gestión de pagos y despacho de Bill of Lading (B/L). | Comunicaciones financieras post-orden de compra con importadores y distribuidores firmados. |

---

## 3. Protocolo de Autorización Simétrica Dual (Telegram & Email)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│          PROTOCOLO DE NOTIFICACIÓN IDÉNTICA Y AUTORIZACIÓN DUAL             │
└─────────────────────────────────────────────────────────────────────────────┘

  1. EXPEDIENTE COMPLETO SIMÉTRICO ENVIADO SIMULTÁNEAMENTE:
     ├─ a) Vía Telegram: Mensaje detallado en @ELIMFILTERS_Operations_Bot.
     └─ b) Vía Correo: Expediente idéntico enviado a vabreu@elimfilters.com.

  2. CANALES DE AUTORIZACIÓN VÁLIDOS (VICTOR ABREU):
     ├─ Vía Telegram: Comando /approve <lead_id> o botón de aprobación en el chat.
     └─ Vía Email: Respuesta con la palabra "AUTORIZADO" o "APROBADO" a vabreu@elimfilters.com.

  3. REGISTRO DE AUDITORÍA DE AUTORIZACIÓN (PostgreSQL - authorization_audit_log):
     └─ El sistema registra de forma inmutable:
        • lead_id: ID de la oportunidad B2B.
        • authorized_by: Victor Abreu (CEO).
        • authorization_channel: 'telegram' | 'email'.
        • timestamp: Hora y fecha exacta de aprobación.
        • reference_hash: ID de mensaje Telegram o Message-ID de correo.

  4. EJECUCIÓN POST-APROBACIÓN (Disparada por cualquiera de los 2 canales):
     a) Correo oficial de exclusividad desde distribution_network@elimfilters.com.
     b) Orden de Trabajo a Fábrica desde supplychain@elimfilters.com (con CC a vabreu@elimfilters.com).
     c) Instrucción de cobro del 50% de anticipo desde finance@elimfilters.com.
```

---

## 4. Gobernanza y Registro Documental

* **Inmutable Audit Log**: Toda aprobación (ya sea ejecutada por Telegram o por Email) queda asentada en la tabla `authorization_audit_log` para fines legales, contables y operativos.
* **Punto de Control Unico (Human-in-the-Loop)**: Ningún contrato de exclusividad, orden de fábrica o compromiso comercial se emite sin la orden explícita de Victor Abreu vía Telegram o Email.
