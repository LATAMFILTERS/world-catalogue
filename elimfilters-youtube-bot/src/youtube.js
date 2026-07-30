export function createYouTubeClient({ apiKey }) {
  return {
    async replyToComment(commentId, replyText) {
      const url = `https://www.googleapis.com/youtube/v3/comments?part=snippet&key=${apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          snippet: {
            parentId: commentId,
            textOriginal: replyText
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`YouTube API error: ${error.error?.message || response.statusText}`);
      }

      return await response.json();
    }
  };
}
