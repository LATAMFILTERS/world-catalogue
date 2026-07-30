import { createLogger } from "./logger.js";

const logger = createLogger("YouTube-Client");

export function createYoutubeClient({ channelId, apiKey }) {
  const baseUrl = "https://www.googleapis.com/youtube/v3";

  return {
    async sendMessage(videoId, textContent) {
      if (!apiKey) {
        logger.error("Missing YouTube API key", { action: "send_message" });
        throw new Error("YOUTUBE_API_KEY not configured");
      }

      const commentPayload = {
        snippet: {
          videoId: videoId,
          textOriginal: textContent
        }
      };

      try {
        const response = await fetch(`${baseUrl}/commentThreads?part=snippet&key=${apiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(commentPayload)
        });

        if (!response.ok) {
          const errorData = await response.json();
          logger.error("YouTube API error", {
            status: response.status,
            error: errorData,
            videoId
          });
          throw new Error(`YouTube API returned ${response.status}: ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();
        logger.info("Comment posted successfully", {
          commentId: result.id,
          videoId,
          textLength: textContent.length
        });

        return result;
      } catch (err) {
        logger.error("Failed to post comment", { videoId, error: err.message });
        throw err;
      }
    }
  };
}
