function firstValue(env, names) {
  for (const name of names) {
    const value = env[name]?.trim();
    if (value) return value;
  }
  return '';
}

function normalizeMetaEnvironment(env = process.env) {
  const appSecret = firstValue(env, [
    'META_APP_SECRET',
    'INSTAGRAM_APP_SECRET',
    'FACEBOOK_APP_SECRET',
    'WHATSAPP_APP_SECRET'
  ]);
  const verifyToken = firstValue(env, [
    'META_VERIFY_TOKEN',
    'INSTAGRAM_VERIFY_TOKEN',
    'FACEBOOK_VERIFY_TOKEN',
    'WHATSAPP_VERIFY_TOKEN'
  ]);
  const graphApiVersion = firstValue(env, ['META_GRAPH_API_VERSION']) || 'v23.0';

  if (appSecret) {
    env.META_APP_SECRET = appSecret;
    env.INSTAGRAM_APP_SECRET ||= appSecret;
    env.FACEBOOK_APP_SECRET ||= appSecret;
    env.WHATSAPP_APP_SECRET ||= appSecret;
  }

  if (verifyToken) {
    env.META_VERIFY_TOKEN = verifyToken;
    env.INSTAGRAM_VERIFY_TOKEN ||= verifyToken;
    env.FACEBOOK_VERIFY_TOKEN ||= verifyToken;
    env.WHATSAPP_VERIFY_TOKEN ||= verifyToken;
  }

  env.META_GRAPH_API_VERSION ||= graphApiVersion;

  return {
    appSecret,
    verifyToken,
    graphApiVersion: env.META_GRAPH_API_VERSION,
    accessTokens: {
      instagram: firstValue(env, ['INSTAGRAM_ACCESS_TOKEN', 'META_ACCESS_TOKEN']),
      facebook: firstValue(env, ['FACEBOOK_PAGE_ACCESS_TOKEN', 'META_ACCESS_TOKEN']),
      whatsapp: firstValue(env, ['WHATSAPP_ACCESS_TOKEN', 'META_ACCESS_TOKEN'])
    }
  };
}

module.exports = { firstValue, normalizeMetaEnvironment };
