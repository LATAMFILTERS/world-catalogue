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
    linkedinClientId: requireValue("LINKEDIN_CLIENT_ID", process.env.LINKEDIN_CLIENT_ID),
    linkedinClientSecret: requireValue("LINKEDIN_CLIENT_SECRET", process.env.LINKEDIN_CLIENT_SECRET),
    linkedinOrganizationId: requireValue("LINKEDIN_ORGANIZATION_ID", process.env.LINKEDIN_ORGANIZATION_ID),
    linkedinVerifyToken: requireValue("LINKEDIN_VERIFY_TOKEN", process.env.LINKEDIN_VERIFY_TOKEN),
    databaseUrl: requireValue("DATABASE_URL", process.env.DATABASE_URL),
    nvidiaApiKey: process.env.NVIDIA_NIM_API_KEY || "",
    nvidiaModel: process.env.NVIDIA_MODEL || "nvidia/nemotron-3-super-120b-a12b",
    dryRun: (process.env.DRY_RUN || "true").toLowerCase() === "true",
    botProtocolUrl: process.env.BOT_PROTOCOL_URL?.trim() || "https://part-search.elimfilters.com",
    botProtocolApiKey: process.env.BOT_PROTOCOL_API_KEY?.trim() || null,
    botProtocolTimeoutMs: positiveInteger(process.env.BOT_PROTOCOL_TIMEOUT_MS, 8000),
    // Knowledge System Integration — retained as controlled fallback while
    // BOT_PROTOCOL_* is rolled out to the deployed LinkedIn service.
    KNOWLEDGE_CENTER_API_URL: process.env.KNOWLEDGE_CENTER_API_URL?.trim() || "https://knowledge-center-api-staging.onrender.com",
    KNOWLEDGE_CENTER_API_KEY: process.env.KNOWLEDGE_CENTER_API_KEY?.trim() || null,
    KNOWLEDGE_ENGINE_RUNTIME_URL: process.env.KNOWLEDGE_ENGINE_RUNTIME_URL?.trim() || "https://knowledge-engine-runtime-staging.onrender.com",
    ENGINE_API_KEY: process.env.ENGINE_API_KEY?.trim() || null
  };
}
