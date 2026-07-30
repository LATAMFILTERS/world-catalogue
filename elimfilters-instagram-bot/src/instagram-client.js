import { createLogger } from "./logger.js";

const logger = createLogger("Instagram-Client");

export function createInstagramClient({ businessAccountId, accessToken }) {
  const apiVersion = "v20.0";
  const baseUrl = `https://graph.instagram.com/${apiVersion}`;

  return {
    async sendMessage(userId, textContent) {
      if (!accessToken) {
        logger.error("Missing Instagram access token", { action: "send_message" });
        throw new Error("INSTAGRAM_ACCESS_TOKEN not configured");
      }

      const messagePayload = {
        recipient: { id: userId },
        message: { text: textContent }
      };

      try {
        const response = await fetch(`${baseUrl}/${businessAccountId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          },
          body: JSON.stringify(messagePayload)
        });

        if (!response.ok) {
          const errorData = await response.json();
          logger.error("Instagram API error", {
            status: response.status,
            error: errorData,
            userId
          });
          throw new Error(`Instagram API returned ${response.status}: ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();
        logger.info("Message sent successfully", {
          messageId: result.message_id,
          userId,
          textLength: textContent.length
        });

        return result;
      } catch (err) {
        logger.error("Failed to send message", { userId, error: err.message });
        throw err;
      }
    }
  };
}
