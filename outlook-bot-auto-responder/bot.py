import os
import json
import time
import schedule
import requests
import logging
from datetime import datetime
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

# ===== LOGGING =====
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format='[%(asctime)s] %(levelname)s: %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)

# ===== CONFIGURACIÓN =====
CLIENT_ID = os.getenv("AZURE_CLIENT_ID")
CLIENT_SECRET = os.getenv("AZURE_CLIENT_SECRET")
TENANT_ID = os.getenv("AZURE_TENANT_ID")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
CHECK_INTERVAL = int(os.getenv("CHECK_INTERVAL", "30"))

# Emails a monitorear (8 buzones de departamentos)
TARGET_MAILBOXES = [
    "info@elimfilters.com",                              # General
    "support@elimfilters.com",                           # Soporte técnico
    "distribution_network@elimfilters.com",              # Red de distribución
    "finance@elimfilters.com",                           # Finanzas
    "logistic@elimfilters.com",                          # Logística
    "purchases@elimfilters.com",                         # Compras
    "assetprotection@elimfilters.com",                   # Asset Protection
    "sales@elimfilters.com"                              # Ventas
]

# ===== INICIALIZAR GROQ =====
groq_client = Groq(api_key=GROQ_API_KEY)

# ===== CARGAR INTENCIONES =====
with open('intents.json', 'r', encoding='utf-8') as f:
    INTENTS_DATA = json.load(f)

# ===== FUNCIONES AUXILIARES =====

def get_access_token():
    """Obtener token de acceso de Azure AD"""
    url = f"https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token"
    data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "scope": "https://graph.microsoft.com/.default",
        "grant_type": "client_credentials"
    }
    response = requests.post(url, data=data)
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        logger.error(f"Error getting access token: {response.text}")
        return None

def get_unread_emails(mailbox):
    """Obtener correos no leídos de un buzón"""
    token = get_access_token()
    if not token:
        return []

    headers = {"Authorization": f"Bearer {token}"}
    url = f"https://graph.microsoft.com/v1.0/users/{mailbox}/mailFolders/inbox/messages?$filter=isRead eq false&$top=10"

    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return response.json().get("value", [])
    except Exception as e:
        logger.error(f"Error fetching emails from {mailbox}: {str(e)}")
    return []

def detect_intent(email_body, email_subject=""):
    """Detectar intención usando GROQ"""
    try:
        combined_text = f"Asunto: {email_subject}\n\nCuerpo: {email_body}"

        prompt = f"""Analiza el siguiente correo y detecta su INTENCIÓN.

Responde SOLO con el ID de la intención (pedido, soporte_tecnico, factura, consulta_tecnica, devolucion o general).

Intenciones disponibles:
- pedido: Consultas sobre pedidos, órdenes, compras
- soporte_tecnico: Problemas técnicos, errores, solicitudes de ayuda
- factura: Consultas sobre facturación, pagos, cobros
- consulta_tecnica: Preguntas sobre especificaciones técnicas, compatibilidad
- devolucion: Solicitudes de devolución, cambios, reembolsos
- general: Cualquier otra consulta

CORREO:
{combined_text}

RESPUESTA (solo ID):"""

        message = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="mixtral-8x7b-32768",
            max_tokens=50
        )

        intent_id = message.choices[0].message.content.strip().lower()
        return intent_id
    except Exception as e:
        logger.error(f"Error detecting intent: {str(e)}")
        return "general"

def get_response_for_intent(intent_id):
    """Obtener respuesta predefinida para la intención"""
    for intent in INTENTS_DATA["intents"]:
        if intent["id"] == intent_id:
            return intent["response"]
    return INTENTS_DATA["intents"][-1]["response"]

def send_reply(mailbox, email_id, subject, response_text):
    """Enviar respuesta automática"""
    token = get_access_token()
    if not token:
        return False

    headers = {"Authorization": f"Bearer {token}"}

    reply_data = {
        "message": {
            "subject": f"Re: {subject}",
            "body": {
                "contentType": "text",
                "content": response_text + "\n\n---\nRespuesta automática de ELIMFILTERS"
            }
        }
    }

    try:
        url = f"https://graph.microsoft.com/v1.0/users/{mailbox}/messages/{email_id}/createReply"
        response = requests.post(url, json=reply_data, headers=headers)

        if response.status_code == 200:
            reply_id = response.json()["id"]
            send_url = f"https://graph.microsoft.com/v1.0/users/{mailbox}/messages/{reply_id}/send"
            send_response = requests.post(send_url, headers=headers)
            return send_response.status_code == 202
    except Exception as e:
        logger.error(f"Error sending reply: {str(e)}")
    return False

def mark_as_read(mailbox, email_id):
    """Marcar correo como leído"""
    token = get_access_token()
    if not token:
        return False

    headers = {"Authorization": f"Bearer {token}"}
    url = f"https://graph.microsoft.com/v1.0/users/{mailbox}/messages/{email_id}"
    data = {"isRead": True}

    try:
        requests.patch(url, json=data, headers=headers)
        return True
    except Exception as e:
        logger.error(f"Error marking as read: {str(e)}")
    return False

# ===== PROCESO PRINCIPAL =====

def process_emails():
    """Procesar correos no leídos"""
    logger.info("Revisando correos...")

    for mailbox in TARGET_MAILBOXES:
        emails = get_unread_emails(mailbox)

        if not emails:
            logger.info(f"✓ {mailbox}: Sin correos nuevos")
            continue

        logger.info(f"📧 {mailbox}: {len(emails)} correo(s) nuevo(s)")

        for email in emails:
            sender = email.get("from", {}).get("emailAddress", {}).get("address", "desconocido")
            subject = email.get("subject", "(sin asunto)")
            body = email.get("bodyPreview", "")
            email_id = email.get("id")

            logger.info(f"  → De: {sender}")
            logger.info(f"    Asunto: {subject}")

            intent = detect_intent(body, subject)
            response = get_response_for_intent(intent)

            logger.info(f"    Intención: {intent}")

            if send_reply(mailbox, email_id, subject, response):
                logger.info(f"    ✅ Respuesta enviada")
                mark_as_read(mailbox, email_id)
            else:
                logger.error(f"    ❌ Error al enviar respuesta")

def schedule_bot():
    """Ejecutar bot cada X segundos"""
    schedule.every(CHECK_INTERVAL).seconds.do(process_emails)

    logger.info(f"🤖 Bot ELIMFILTERS iniciado (Revisión cada {CHECK_INTERVAL}s)")
    logger.info(f"📧 Monitoreando: {', '.join(TARGET_MAILBOXES)}\n")

    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    schedule_bot()
