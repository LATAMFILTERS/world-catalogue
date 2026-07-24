import crypto from "node:crypto";

export function verifyMetaSignature(rawBody, signatureHeader, appSecret) {
  if (!signatureHeader?.startsWith("sha256=")) return false;
  const expected = `sha256=${crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
  const actual = signatureHeader.trim();
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function normalizeFacebookEvents(payload, pageId) {
  if (payload?.object !== "page" || !Array.isArray(payload.entry)) return [];
  const events = [];

  for (const entry of payload.entry) {
    if (String(entry.id) !== String(pageId)) continue;

    for (const change of entry.changes || []) {
      if (change.field !== "feed") continue;
      const value = change.value || {};
      if (value.item !== "comment" || value.verb !== "add") continue;
      if (!value.comment_id || !value.message) continue;
      if (String(value.from?.id || "") === String(pageId)) continue;

      events.push({
        eventId: value.comment_id,
        commentId: value.comment_id,
        postId: value.post_id || null,
        senderId: value.from?.id || null,
        senderName: value.from?.name || null,
        text: value.message.trim(),
        createdAt: value.created_time
          ? new Date(Number(value.created_time) * 1000).toISOString()
          : new Date().toISOString()
      });
    }

    for (const messaging of entry.messaging || []) {
      const message = messaging.message;
      if (!message?.mid || !message?.text || message.is_echo) continue;
      events.push({
        eventId: message.mid,
        messageId: message.mid,
        senderId: messaging.sender?.id || null,
        recipientId: messaging.recipient?.id || null,
        text: message.text.trim(),
        createdAt: messaging.timestamp
          ? new Date(Number(messaging.timestamp)).toISOString()
          : new Date().toISOString(),
        type: "message"
      });
    }
  }

  return events;
}
