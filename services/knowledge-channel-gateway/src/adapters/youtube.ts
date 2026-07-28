export type YouTubeNormalizedEvent = {
  channel: 'YOUTUBE';
  providerEventId: string;
  conversationExternalId: string;
  senderExternalId: string;
  occurredAt: string;
  text?: string;
  eventType: 'COMMENT' | 'REPLY' | 'LIVE_CHAT' | 'MENTION' | 'OTHER';
  videoId?: string;
  raw: unknown;
};

export function normalizeYouTubeEvent(payload: any): YouTubeNormalizedEvent {
  const snippet = payload?.snippet ?? payload;
  const providerEventId = String(payload?.id ?? snippet?.id ?? crypto.randomUUID());
  const videoId = snippet?.videoId ?? snippet?.resourceId?.videoId;
  const parentId = snippet?.parentId ?? snippet?.topLevelComment?.id;
  const text = snippet?.textDisplay ?? snippet?.textOriginal ?? snippet?.topLevelComment?.snippet?.textDisplay ?? snippet?.displayMessage;
  const author = snippet?.authorChannelId?.value ?? snippet?.authorChannelId ?? snippet?.authorDisplayName ?? 'unknown';
  const rawType = String(payload?.eventType ?? (snippet?.liveChatId ? 'LIVE_CHAT' : parentId ? 'REPLY' : 'COMMENT')).toUpperCase();
  const eventType = ['COMMENT','REPLY','LIVE_CHAT','MENTION'].includes(rawType) ? rawType as YouTubeNormalizedEvent['eventType'] : 'OTHER';
  return {
    channel: 'YOUTUBE',
    providerEventId,
    conversationExternalId: String(parentId ?? videoId ?? providerEventId),
    senderExternalId: String(author),
    occurredAt: new Date(snippet?.publishedAt ?? payload?.occurredAt ?? Date.now()).toISOString(),
    text,
    eventType,
    videoId: videoId ? String(videoId) : undefined,
    raw: payload
  };
}
