function requireValue(name, val) {
  if (!val) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

function first(...values) {
  return values.map(value => value?.trim()).find(Boolean) || "";
}

function positiveInteger(name, value, fallback) {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`${name} must be a positive integer`);
  return parsed;
}

export function getConfig() {
  return {
    port: parseInt(process.env.PORT || "10000", 10),
    // WhatsApp Business API Configuration
    whatsappPhoneNumberId: requireValue("WHATSAPP_BUSINESS_ACCOUNT_ID", process.env.WHATSAPP_BUSINESS_ACCOUNT_ID),
    whatsappAccessToken: requireValue("WHATSAPP_ACCESS_TOKEN", process.env.WHATSAPP_ACCESS_TOKEN),
    whatsappBusinessAccountId: requireValue("WHATSAPP_BUSINESS_ACCOUNT_ID", process.env.WHATSAPP_BUSINESS_ACCOUNT_ID),
    whatsappVerifyToken: requireValue("WHATSAPP_VERIFY_TOKEN", process.env.WHATSAPP_VERIFY_TOKEN),
    whatsappAppSecret: requireValue("WHATSAPP_APP_SECRET", process.env.WHATSAPP_APP_SECRET),
    // Operational DB: WhatsApp's own message/session/lead tables. During the
    // migration to the central Conversation Engine this is READ-ONLY for
    // history (context_seed) purposes -- never the product catalog. See
    // protocol-client.js and worker.js.
    databaseUrl: requireValue("DATABASE_URL", process.env.DATABASE_URL),
    nvidiaApiKey: process.env.NVIDIA_NIM_API_KEY || "",
    nvidiaModel: process.env.NVIDIA_MODEL || "nvidia/nemotron-3-super-120b-a12b",
    dryRun: (process.env.DRY_RUN || "true").toLowerCase() === "true",
    // Knowledge System Integration (legacy independent path -- still used
    // only when useCentralProtocol is false; see worker.js)
    knowledgeCenterApiUrl: process.env.KNOWLEDGE_CENTER_API_URL?.trim() || "https://knowledge-center-api-staging.onrender.com",
    knowledgeCenterApiKey: process.env.KNOWLEDGE_CENTER_API_KEY?.trim() || null,
    knowledgeEngineRuntimeUrl: process.env.KNOWLEDGE_ENGINE_RUNTIME_URL?.trim() || "https://knowledge-engine-runtime-staging.onrender.com",
    engineApiKey: process.env.ENGINE_API_KEY?.trim() || null,
    // Central Conversation Engine adapter (protocol-client.js). Defaults to
    // false -- the legacy independent stack (nvidia.js/knowledge.js/
    // knowledge-engine.js/product-search.js) stays the active path until
    // this is explicitly flipped to true, per channel, as a controlled
    // rollout. Flipping it back to false is the rollback.
    useCentralProtocol: (process.env.USE_CENTRAL_PROTOCOL || "false").toLowerCase() === "true",
    botProtocolUrl: first(process.env.BOT_PROTOCOL_URL, "https://part-search.elimfilters.com"),
    botProtocolApiKey: process.env.BOT_PROTOCOL_API_KEY || "",
    botProtocolTimeoutMs: positiveInteger("BOT_PROTOCOL_TIMEOUT_MS", process.env.BOT_PROTOCOL_TIMEOUT_MS, 8000)
  };
}
