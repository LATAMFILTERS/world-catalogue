async function graphRequest(config, path, body) {
  const url = new URL(`https://graph.facebook.com/${config.graphApiVersion}/${path}`);
  url.searchParams.set("access_token", config.facebookPageAccessToken);
  const response = await fetch(url, {
    method: "POST",
    headers: {"content-type": "application/json"},
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Facebook Graph API ${response.status}: ${JSON.stringify(data)}`);
  return data;
}

export async function publishReply(config, event, message) {
  if (config.dryRun) return {dryRun: true, eventId: event.eventId, message};
  if (event.type === "message") {
    return graphRequest(config, "me/messages", {
      recipient: {id: event.senderId},
      messaging_type: "RESPONSE",
      message: {text: message}
    });
  }
  return graphRequest(config, `${event.commentId}/comments`, {message});
}
