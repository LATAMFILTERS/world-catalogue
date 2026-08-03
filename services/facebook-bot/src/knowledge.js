function protocolEndpoint(baseUrl) {
  return `${String(baseUrl || '').replace(/\/$/, '')}/api/bot/protocol`;
}

export async function generateReply(config, text, event = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.botProtocolTimeoutMs);

  try {
    const response = await fetch(protocolEndpoint(config.botProtocolUrl), {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-bot-protocol-key": config.botProtocolApiKey
      },
      body: JSON.stringify({
        channel: "facebook",
        conversation_id: String(event.senderId || event.recipientId || event.eventId || "facebook-unknown"),
        message: String(text || "").trim(),
        context: {
          channel: "facebook",
          conversation_id: String(event.senderId || event.recipientId || event.eventId || "facebook-unknown")
        }
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`Central protocol ${response.status}: ${data.error || 'unknown_error'}`);
    const answer = String(data.answer || '').trim();
    if (!answer) throw new Error('Central protocol returned an empty answer');
    return answer;
  } finally {
    clearTimeout(timeout);
  }
}
