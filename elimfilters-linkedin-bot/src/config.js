function requireValue(name, val) {
  if (!val && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val || "";
}

export function getConfig() {
  return {
    port: parseInt(process.env.PORT || "10000", 10),
    linkedinClientId: requireValue("LINKEDIN_CLIENT_ID", process.env.LINKEDIN_CLIENT_ID || "866h35ln0x9989"),
    linkedinClientSecret: requireValue("LINKEDIN_CLIENT_SECRET", process.env.LINKEDIN_CLIENT_SECRET),
    linkedinOrganizationId: requireValue("LINKEDIN_ORGANIZATION_ID", process.env.LINKEDIN_ORGANIZATION_ID || "133064152"),
    linkedinVerifyToken: process.env.LINKEDIN_VERIFY_TOKEN || "elimfilters_linkedin_webhook_verify_2026",
    databaseUrl: requireValue("DATABASE_URL", process.env.DATABASE_URL || "postgres://localhost:5432/elimfilters"),
    nvidiaApiKey: process.env.NVIDIA_NIM_API_KEY || "",
    nvidiaModel: process.env.NVIDIA_MODEL || "nvidia/nemotron-3-super-120b-a12b",
    dryRun: (process.env.DRY_RUN || "true").toLowerCase() === "true"
  };
}
