function requireValue(name, val) {
  if (!val) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

function positiveInteger(value, fallback) {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function getConfig() {
  return {
    port: parseInt(process.env.PORT || "10000", 10),
    // YouTube API Configuration
    youtubeChannelId: requireValue("YOUTUBE_CHANNEL_ID", process.env.YOUTUBE_CHANNEL_ID),
    youtubeApiKey: requireValue("YOUTUBE_API_KEY", process.env.YOUTUBE_API_KEY),
    youtubeVerifyToken: requireValue("YOUTUBE_VERIFY_TOKEN", process.env.YOUTUBE_VERIFY_TOKEN),
    databaseUrl: requireValue("DATABASE_URL", process.env.DATABASE_URL),
    nvidiaApiKey: process.env.NVIDIA_NIM_API_KEY || "",
    nvidiaModel: process.env.NVIDIA_MODEL || "nvidia/nemotron-3-super-120b-a12b",
    dryRun: (process.env.DRY_RUN || "true").toLowerCase() === "true",
    botProtocolUrl: process.env.BOT_PROTOCOL_URL?.trim() || "https://part-search.elimfilters.com",
    botProtocolApiKey: process.env.BOT_PROTOCOL_API_KEY?.trim() || null,
    botProtocolTimeoutMs: positiveInteger(process.env.BOT_PROTOCOL_TIMEOUT_MS, 8000),
    // Knowledge System Integration — retained as controlled fallback while
    // BOT_PROTOCOL_* is rolled out to the deployed YouTube service.
    knowledgeCenterApiUrl: process.env.KNOWLEDGE_CENTER_API_URL?.trim() || "https://knowledge-center-api-staging.onrender.com",
    knowledgeCenterApiKey: process.env.KNOWLEDGE_CENTER_API_KEY?.trim() || null,
    knowledgeEngineRuntimeUrl: process.env.KNOWLEDGE_ENGINE_RUNTIME_URL?.trim() || "https://knowledge-engine-runtime-staging.onrender.com",
    engineApiKey: process.env.ENGINE_API_KEY?.trim() || null
  };
}
