export function createInstagramClient({ accessToken, instagramBusinessAccountId, graphApiVersion = "v18.0" }) {
  return {
    async sendMessage(toUserId, message) {
      const url = `https://graph.instagram.com/${graphApiVersion}/me/messages`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          recipient: {
            id: toUserId
          },
          message: {
            text: message
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Instagram API error: ${error.error?.message || response.statusText}`);
      }

      return await response.json();
    }
  };
}
