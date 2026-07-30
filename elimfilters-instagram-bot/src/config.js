function requireValue(name, val) {
  if (!val) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

export function getConfig() {
  return {
    port: parseInt(process.env.PORT || "10000", 10),
    linkedinClientId: requireValue("INSTAGRAM_BOT_CLIENT_ID", process.env.INSTAGRAM_BOT_CLIENT_ID),
    linkedinClientSecret: requireValue("INSTAGRAM_BOT_CLIENT_SECRET", process.env.INSTAGRAM_BOT_CLIENT_SECRET),
    linkedinOrganizationId: requireValue("INSTAGRAM_BOT_ORGANIZATION_ID", process.env.INSTAGRAM_BOT_ORGANIZATION_ID),
    linkedinVerifyToken: requireValue("INSTAGRAM_BOT_VERIFY_TOKEN", process.env.INSTAGRAM_BOT_VERIFY_TOKEN),
    databaseUrl: requireValue("DATABASE_URL", process.env.DATABASE_URL),
    nvidiaApiKey: process.env.NVIDIA_NIM_API_KEY || "",
    nvidiaModel: process.env.NVIDIA_MODEL || "nvidia/nemotron-3-super-120b-a12b",
    dryRun: (process.env.DRY_RUN || "true").toLowerCase() === "true",
    // Knowledge System Integration
    KNOWLEDGE_CENTER_API_URL: process.env.KNOWLEDGE_CENTER_API_URL?.trim() || "https://knowledge-center-api-staging.onrender.com",
    KNOWLEDGE_CENTER_API_KEY: process.env.KNOWLEDGE_CENTER_API_KEY?.trim() || null,
    KNOWLEDGE_ENGINE_RUNTIME_URL: process.env.KNOWLEDGE_ENGINE_RUNTIME_URL?.trim() || "https://knowledge-engine-runtime-staging.onrender.com",
    ENGINE_API_KEY: process.env.ENGINE_API_KEY?.trim() || null
  };
}
