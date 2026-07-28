export type LinkedInNormalizedEvent = {
  channel: 'LINKEDIN';
  providerEventId: string;
  conversationExternalId: string;
  senderExternalId: string;
  occurredAt: string;
  text?: string;
  eventType: 'COMMENT' | 'MENTION' | 'DIRECT_MESSAGE' | 'LEAD' | 'OTHER';
  raw: unknown;
};

export function normalizeLinkedInEvent(payload: any): LinkedInNormalizedEvent {
  const providerEventId = String(payload?.id ?? payload?.eventId ?? payload?.activity ?? crypto.randomUUID());
  const senderExternalId = String(payload?.actor ?? payload?.from ?? payload?.author ?? 'unknown');
  const conversationExternalId = String(payload?.conversationId ?? payload?.thread ?? payload?.object ?? providerEventId);
  const rawType = String(payload?.type ?? payload?.eventType ?? 'OTHER').toUpperCase();
  const eventType = ['COMMENT','MENTION','DIRECT_MESSAGE','LEAD'].includes(rawType) ? rawType as LinkedInNormalizedEvent['eventType'] : 'OTHER';
  return {
    channel: 'LINKEDIN',
    providerEventId,
    conversationExternalId,
    senderExternalId,
    occurredAt: new Date(payload?.occurredAt ?? payload?.createdAt ?? Date.now()).toISOString(),
    text: payload?.text ?? payload?.comment?.text ?? payload?.message?.text,
    eventType,
    raw: payload
  };
}
