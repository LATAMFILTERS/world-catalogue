import { createLogger } from "./logger.js";

const logger = createLogger("WhatsApp-Client");

export function createWhatsAppClient({ phoneNumberId, accessToken, businessAccountId }) {
  const apiVersion = "v20.0";
  const baseUrl = `https://graph.whatsapp.com/${apiVersion}`;
  const businessPhoneNumberId = phoneNumberId;

  return {
    async sendMessage(recipientPhoneNumber, textContent) {
      if (!accessToken) {
        logger.error("Missing WhatsApp access token", { action: "send_message" });
        throw new Error("WHATSAPP_ACCESS_TOKEN not configured");
      }

      if (!businessPhoneNumberId) {
        logger.error("Missing WhatsApp business phone number ID", { action: "send_message" });
        throw new Error("WHATSAPP_PHONE_NUMBER_ID not configured");
      }

      const messagePayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipientPhoneNumber,
        type: "text",
        text: {
          preview_url: false,
          body: textContent
        }
      };

      try {
        const response = await fetch(`${baseUrl}/${businessPhoneNumberId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          },
          body: JSON.stringify(messagePayload)
        });

        if (!response.ok) {
          const errorData = await response.json();
          logger.error("WhatsApp API error", {
            status: response.status,
            error: errorData,
            recipientPhoneNumber,
            businessPhoneNumberId
          });
          throw new Error(`WhatsApp API returned ${response.status}: ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();
        logger.info("Message sent successfully", {
          messageId: result.messages?.[0]?.id,
          recipientPhoneNumber,
          textLength: textContent.length
        });

        return result;
      } catch (err) {
        logger.error("Failed to send message", { recipientPhoneNumber, error: err.message });
        throw err;
      }
    },

    async markAsRead(messageId) {
      if (!accessToken) return;

      const payload = {
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId
      };

      try {
        await fetch(`${baseUrl}/${businessPhoneNumberId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        logger.debug("Failed to mark message as read", { messageId, error: err.message });
      }
    }
  };
}
