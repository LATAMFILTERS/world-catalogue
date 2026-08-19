function endpoint(baseUrl) {
  return `${String(baseUrl || '').replace(/\/$/, '')}/api/bot/protocol`;
}

export async function queryCentralProtocol(config, { message, conversationId }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.botProtocolTimeoutMs);

  try {
    const response = await fetch(endpoint(config.botProtocolUrl), {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-bot-protocol-key': config.botProtocolApiKey
      },
      body: JSON.stringify({
        channel: 'instagram',
        conversation_id: String(conversationId),
        message: String(message || '').trim(),
        context: {
          channel: 'instagram',
          conversation_id: String(conversationId)
        }
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`Central protocol ${response.status}: ${data.error || 'unknown_error'}`);
    const answer = String(data.answer || '').trim();
    if (!answer) throw new Error('Central protocol returned an empty answer');
    return { answer, intent: data.intent || null, phase: data.phase || null };
  } finally {
    clearTimeout(timeout);
  }
}
