export function createWhatsAppClient({ accessToken, phoneNumberId, graphApiVersion = "v18.0" }) {
  return {
    async sendMessage(toPhoneNumber, message) {
      const url = `https://graph.instagram.com/${graphApiVersion}/${phoneNumberId}/messages`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: toPhoneNumber,
          type: "text",
          text: {
            body: message
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`WhatsApp API error: ${error.error?.message || response.statusText}`);
      }

      return await response.json();
    }
  };
}
