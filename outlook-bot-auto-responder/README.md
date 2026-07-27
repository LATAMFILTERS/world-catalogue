# ELIMFILTERS Outlook Auto-Responder Bot

Bot automático para responder correos en Outlook usando Python, Microsoft Graph API, y GROQ para detectar intención.

## Características

- ✅ Monitorea múltiples buzones de Outlook (info@elimfilters.com, support@elimfilters.com)
- ✅ Detecta intención de correos usando GROQ AI
- ✅ Responde automáticamente 100% sin intervención manual
- ✅ Marca correos como leídos automáticamente
- ✅ Configurable y escalable

## Configuración Rápida

### 1. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y rellena con tus valores:

```bash
cp .env.example .env
```

```env
AZURE_CLIENT_ID=tu_client_id
AZURE_CLIENT_SECRET=tu_client_secret
AZURE_TENANT_ID=tu_tenant_id
GROQ_API_KEY=tu_groq_api_key
CHECK_INTERVAL=30
LOG_LEVEL=INFO
```

### 3. Ejecutar el bot

```bash
python bot.py
```

## Intenciones de Correo

El bot detecta y responde automáticamente a:

| Intención | Keywords | Respuesta |
|-----------|----------|-----------|
| **pedido** | pedido, order, purchase, compra | Confirma recepción y plazo de 24h |
| **soporte_tecnico** | error, problema, falla, issue | Crea ticket y responde en 24-48h |
| **factura** | factura, invoice, billing, pago | Dirige a panel de cliente |
| **consulta_tecnica** | especificación, compatible, specs | Equipo técnico responde en 48h |
| **devolucion** | devolver, return, cambio, refund | Procesa en 5-7 días hábiles |
| **general** | Cualquier otra | Respuesta genérica estándar |

## Deployment en Render

### 1. Push a GitHub

```bash
git add .
git commit -m "feat: Add Outlook auto-responder bot"
git push -u origin claude/outlook-auto-respuestas-8nn2qn
```

### 2. Crear servicio en Render

1. Ve a [render.com](https://render.com)
2. **New +** → **Web Service**
3. Conecta tu repo GitHub
4. Configuración:
   - **Build command**: `pip install -r requirements.txt`
   - **Start command**: `python bot.py`
   - **Environment**: Agrega variables de `.env`

### 3. Variables de entorno en Render

Copia todos los valores de `.env`:
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`
- `AZURE_TENANT_ID`
- `GROQ_API_KEY`
- `CHECK_INTERVAL` (default: 30)
- `LOG_LEVEL` (default: INFO)

## Monitoreo

El bot registra todas las acciones:
- Correos recibidos
- Intención detectada
- Respuestas enviadas
- Errores

Revisa los logs en el dashboard de Render.

## Troubleshooting

### Error: "Invalid client"
- Verifica que CLIENT_ID, CLIENT_SECRET, TENANT_ID son correctos

### Error: "Permission denied"
- Verifica que Mail.ReadWrite y Mail.Send están autorizados en Azure

### No detecta intención
- Verifica que GROQ_API_KEY es válida
- Aumenta el LOG_LEVEL a DEBUG

## Licencia

ELIMFILTERS © 2024
