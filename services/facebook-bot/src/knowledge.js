export async function getKnowledgeReply(config, event) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.requestTimeoutMs);
  try {
    const headers = { 'content-type': 'application/json' };
    if (config.knowledgeApiKey) headers.authorization = `Bearer ${config.knowledgeApiKey}`;

    const response = await fetch(config.knowledgeBaseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        channel: 'facebook',
        text: event.text,
        user: {
          id: event.senderId,
          name: event.senderName,
        },
        context: {
          eventType: event.type,
          eventId: event.eventId,
          parentId: event.parentId,
        },
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`Knowledge service ${response.status}: ${JSON.stringify(data)}`);
    const reply = data.reply || data.answer || data.message || data.text;
    if (!reply || typeof reply !== 'string') return null;
    if (reply.trim().toUpperCase() === 'NO_REPLY') return null;
    return reply.trim().slice(0, config.maxReplyLength);
  } finally {
    clearTimeout(timer);
  }
}
