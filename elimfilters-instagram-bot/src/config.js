function requireValue(name, val) {
  if (!val) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

export function getConfig() {
  return {
    port: parseInt(process.env.PORT || "10000", 10),
    // Instagram Business API Configuration
    instagramBusinessAccountId: requireValue("INSTAGRAM_BUSINESS_ACCOUNT_ID", process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID),
    instagramAccessToken: requireValue("INSTAGRAM_ACCESS_TOKEN", process.env.INSTAGRAM_ACCESS_TOKEN),
    instagramVerifyToken: requireValue("INSTAGRAM_VERIFY_TOKEN", process.env.INSTAGRAM_VERIFY_TOKEN),
    instagramAppSecret: requireValue("INSTAGRAM_APP_SECRET", process.env.INSTAGRAM_APP_SECRET),
    databaseUrl: requireValue("DATABASE_URL", process.env.DATABASE_URL),
    nvidiaApiKey: process.env.NVIDIA_NIM_API_KEY || "",
    nvidiaModel: process.env.NVIDIA_MODEL || "nvidia/nemotron-3-super-120b-a12b",
    dryRun: (process.env.DRY_RUN || "false").toLowerCase() === "true",
    // Knowledge System Integration
    KNOWLEDGE_CENTER_API_URL: process.env.KNOWLEDGE_CENTER_API_URL?.trim() || "https://knowledge-center-api-staging.onrender.com",
    KNOWLEDGE_CENTER_API_KEY: process.env.KNOWLEDGE_CENTER_API_KEY?.trim() || null,
    KNOWLEDGE_ENGINE_RUNTIME_URL: process.env.KNOWLEDGE_ENGINE_RUNTIME_URL?.trim() || "https://knowledge-engine-runtime-staging.onrender.com",
    ENGINE_API_KEY: process.env.ENGINE_API_KEY?.trim() || null
  };
}
