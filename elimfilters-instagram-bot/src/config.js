function requireValue(name, val) {
  if (!val) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

function first(...values) {
  return values.map(value => value?.trim()).find(Boolean) || "";
}

export function getConfig() {
  return {
    port: parseInt(process.env.PORT || "10000", 10),
    instagramBusinessAccountId: requireValue("INSTAGRAM_BUSINESS_ACCOUNT_ID", process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID),
    instagramAccessToken: requireValue(
      "META_ACCESS_TOKEN or INSTAGRAM_ACCESS_TOKEN",
      first(process.env.META_ACCESS_TOKEN, process.env.INSTAGRAM_ACCESS_TOKEN)
    ),
    instagramVerifyToken: requireValue(
      "META_VERIFY_TOKEN or INSTAGRAM_VERIFY_TOKEN",
      first(process.env.META_VERIFY_TOKEN, process.env.INSTAGRAM_VERIFY_TOKEN)
    ),
    instagramAppSecret: requireValue(
      "META_APP_SECRET or INSTAGRAM_APP_SECRET",
      first(process.env.META_APP_SECRET, process.env.INSTAGRAM_APP_SECRET)
    ),
    graphApiVersion: process.env.META_GRAPH_API_VERSION || "v23.0",
    databaseUrl: requireValue("DATABASE_URL", process.env.DATABASE_URL),
    nvidiaApiKey: process.env.NVIDIA_NIM_API_KEY || "",
    nvidiaModel: process.env.NVIDIA_MODEL || "nvidia/nemotron-3-super-120b-a12b",
    dryRun: (process.env.DRY_RUN || "true").toLowerCase() === "true",
    knowledgeCenterApiUrl: process.env.KNOWLEDGE_CENTER_API_URL?.trim() || "https://knowledge-center-api-staging.onrender.com",
    knowledgeCenterApiKey: process.env.KNOWLEDGE_CENTER_API_KEY?.trim() || null,
    knowledgeEngineRuntimeUrl: process.env.KNOWLEDGE_ENGINE_RUNTIME_URL?.trim() || "https://knowledge-engine-runtime-staging.onrender.com",
    engineApiKey: process.env.ENGINE_API_KEY?.trim() || null
  };
}
