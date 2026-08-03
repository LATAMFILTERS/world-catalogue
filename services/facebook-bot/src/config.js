function required(name, value = process.env[name]?.trim()) {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function bool(name, fallback = false) {
  const value = process.env[name];
  if (value == null) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function first(...values) {
  return values.map(value => value?.trim()).find(Boolean) || "";
}

export function getConfig() {
  return {
    port: Number(process.env.PORT || 10000),
    nodeEnv: process.env.NODE_ENV || "production",
    facebookPageId: required("FACEBOOK_PAGE_ID"),
    facebookPageAccessToken: required(
      "META_ACCESS_TOKEN or FACEBOOK_PAGE_ACCESS_TOKEN",
      first(process.env.META_ACCESS_TOKEN, process.env.FACEBOOK_PAGE_ACCESS_TOKEN)
    ),
    facebookVerifyToken: required(
      "META_VERIFY_TOKEN or FACEBOOK_VERIFY_TOKEN",
      first(process.env.META_VERIFY_TOKEN, process.env.FACEBOOK_VERIFY_TOKEN)
    ),
    metaAppSecret: required(
      "META_APP_SECRET or FACEBOOK_APP_SECRET",
      first(process.env.META_APP_SECRET, process.env.FACEBOOK_APP_SECRET)
    ),
    graphApiVersion: process.env.META_GRAPH_API_VERSION || "v23.0",
    databaseUrl: process.env.DATABASE_URL || "",
    knowledgeBaseUrl: process.env.KNOWLEDGE_BASE_URL || "",
    nvidiaApiKey: process.env.NVIDIA_NIM_API_KEY || "",
    nvidiaModel: process.env.NVIDIA_NIM_MODEL || "meta/llama-3.1-70b-instruct",
    dryRun: bool("DRY_RUN", true)
  };
}
