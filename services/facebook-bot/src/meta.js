import crypto from 'node:crypto';

export function verifyMetaSignature(rawBody, signatureHeader, appSecret) {
  if (!signatureHeader?.startsWith('sha256=')) return false;
  const expected = `sha256=${crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex')}`;
  const actualBuffer = Buffer.from(signatureHeader);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

export function extractFacebookEvents(payload, pageId) {
  const events = [];
  if (payload?.object !== 'page') return events;

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      if (change.field !== 'feed' || value.item !== 'comment' || value.verb !== 'add') continue;
      if (!value.comment_id || !value.message) continue;
      if (String(value.from?.id || '') === String(pageId)) continue;
      events.push({
        type: 'comment',
        eventId: value.comment_id,
        targetId: value.comment_id,
        parentId: value.parent_id || value.post_id || null,
        senderId: value.from?.id || null,
        senderName: value.from?.name || null,
        text: value.message,
        raw: value,
      });
    }

    for (const messageEvent of entry.messaging || []) {
      const message = messageEvent.message;
      if (!message?.mid || !message?.text || message.is_echo) continue;
      events.push({
        type: 'message',
        eventId: message.mid,
        targetId: messageEvent.sender?.id,
        senderId: messageEvent.sender?.id,
        senderName: null,
        text: message.text,
        raw: messageEvent,
      });
    }
  }
  return events;
}

async function graphRequest(config, path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.requestTimeoutMs);
  try {
    const response = await fetch(`https://graph.facebook.com/${config.metaGraphVersion}/${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...body, access_token: config.metaPageAccessToken }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`Meta Graph API ${response.status}: ${JSON.stringify(data)}`);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

export async function publishFacebookReply(config, event, message) {
  if (config.dryRun) return { dryRun: true, eventId: event.eventId, message };
  if (event.type === 'comment') {
    return graphRequest(config, `${encodeURIComponent(event.targetId)}/comments`, { message });
  }
  if (event.type === 'message') {
    return graphRequest(config, 'me/messages', {
      recipient: { id: event.targetId },
      messaging_type: 'RESPONSE',
      message: { text: message },
    });
  }
  throw new Error(`Unsupported Facebook event type: ${event.type}`);
}
