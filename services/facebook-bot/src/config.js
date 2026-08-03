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

function positiveInteger(name, value, fallback) {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`${name} must be a positive integer`);
  return parsed;
}

export function getConfig() {
  return {
    port: Number(process.env.PORT || 10000),
    nodeEnv: process.env.NODE_ENV || "production",
    facebookPageId: required("FACEBOOK_PAGE_ID"),
    facebookPageAccessToken: required(
      "FACEBOOK_PAGE_ACCESS_TOKEN or META_ACCESS_TOKEN",
      first(process.env.FACEBOOK_PAGE_ACCESS_TOKEN, process.env.META_ACCESS_TOKEN)
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
    botProtocolUrl: first(process.env.BOT_PROTOCOL_URL, "https://part-search.elimfilters.com"),
    botProtocolApiKey: required("BOT_PROTOCOL_API_KEY"),
    botProtocolTimeoutMs: positiveInteger("BOT_PROTOCOL_TIMEOUT_MS", process.env.BOT_PROTOCOL_TIMEOUT_MS, 8000),
    dryRun: bool("DRY_RUN", true)
  };
}
