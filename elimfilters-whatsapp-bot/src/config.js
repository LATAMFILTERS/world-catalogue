function requireValue(name, val) {
  if (!val) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
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
