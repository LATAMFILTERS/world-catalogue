export type NormalizedChannelEvent = {
  channel: 'FACEBOOK_MESSENGER';
  providerEventId: string;
  conversationExternalId: string;
  senderExternalId: string;
  recipientExternalId?: string;
  occurredAt: string;
  text?: string;
  attachments: Array<{ type: string; url?: string; payload?: unknown }>;
  raw: unknown;
};

export function normalizeFacebookMessenger(payload: any): NormalizedChannelEvent[] {
  const events: NormalizedChannelEvent[] = [];
  for (const entry of payload?.entry ?? []) {
    for (const item of entry?.messaging ?? []) {
      if (!item?.message?.mid) continue;
      events.push({
        channel: 'FACEBOOK_MESSENGER',
        providerEventId: item.message.mid,
        conversationExternalId: `${item.sender?.id ?? 'unknown'}:${item.recipient?.id ?? 'unknown'}`,
        senderExternalId: String(item.sender?.id ?? 'unknown'),
        recipientExternalId: item.recipient?.id ? String(item.recipient.id) : undefined,
        occurredAt: new Date(Number(item.timestamp ?? Date.now())).toISOString(),
        text: item.message?.text,
        attachments: (item.message?.attachments ?? []).map((a: any) => ({ type: String(a?.type ?? 'unknown'), url: a?.payload?.url, payload: a?.payload })),
        raw: item
      });
    }
  }
  return events;
}
