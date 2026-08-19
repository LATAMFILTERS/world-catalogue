const crypto = require('crypto');

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_ID_LENGTH = 160;
const ALLOWED_CHANNELS = new Set(['whatsapp', 'instagram', 'facebook', 'linkedin', 'web', 'api']);
const buckets = new Map();

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  if (!left.length || left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function extractApiKey(req) {
  const headerKey = req.get('x-bot-protocol-key');
  if (headerKey) return headerKey.trim();
  const authorization = req.get('authorization') || '';
  if (/^Bearer\s+/i.test(authorization)) return authorization.replace(/^Bearer\s+/i, '').trim();
  return '';
}

function clientKey(req) {
  const channel = String(req.body?.channel || req.body?.context?.channel || 'unknown').toLowerCase();
  const conversation = String(
    req.body?.conversation_id ||
    req.body?.user_id ||
    req.body?.contact_id ||
    req.body?.context?.conversation_id ||
    req.body?.context?.user_id ||
    req.ip ||
    'anonymous'
  );
  return `${channel}:${conversation.slice(0, MAX_ID_LENGTH)}`;
}

function consumeRateLimit(key, now = Date.now()) {
  const existing = buckets.get(key);
  if (!existing || now - existing.startedAt >= WINDOW_MS) {
    buckets.set(key, { startedAt: now, count: 1 });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, retryAfter: 0 };
  }

  existing.count += 1;
  const retryAfter = Math.max(1, Math.ceil((WINDOW_MS - (now - existing.startedAt)) / 1000));
  return {
    allowed: existing.count <= MAX_REQUESTS_PER_WINDOW,
    remaining: Math.max(0, MAX_REQUESTS_PER_WINDOW - existing.count),
    retryAfter
  };
}

function hasDangerousKeys(value, depth = 0) {
  if (!value || typeof value !== 'object' || depth > 8) return false;
  for (const [key, child] of Object.entries(value)) {
    if (key === '__proto__' || key === 'prototype' || key === 'constructor') return true;
    if (hasDangerousKeys(child, depth + 1)) return true;
  }
  return false;
}

function validateSharedBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'invalid_json_body';
  if (hasDangerousKeys(body)) return 'unsafe_object_keys';

  const channel = String(body.channel || body.context?.channel || 'api').trim().toLowerCase();
  if (!ALLOWED_CHANNELS.has(channel)) return 'unsupported_channel';

  for (const field of ['conversation_id', 'user_id', 'contact_id']) {
    if (body[field] != null && String(body[field]).length > MAX_ID_LENGTH) return `${field}_too_long`;
  }

  if (body.context != null && (typeof body.context !== 'object' || Array.isArray(body.context))) {
    return 'invalid_context';
  }
  return null;
}

function validateBody(body, { image = false } = {}) {
  const sharedError = validateSharedBody(body);
  if (sharedError) return sharedError;

  if (image) {
    if (typeof body.image_data_url !== 'string' || !body.image_data_url.startsWith('data:image/')) {
      return 'image_data_url_is_required';
    }
    if (body.caption != null && typeof body.caption !== 'string') return 'invalid_caption';
    return null;
  }

  const message = body.message;
  if (typeof message !== 'string' || !message.trim()) return 'message_is_required';
  if (message.length > MAX_MESSAGE_LENGTH) return 'message_too_long';
  return null;
}

// Single mountable middleware (no path-prefix `app.use` matching, no res.json
// wrapping) — registered explicitly per-route by whoever mounts the endpoint.
function createProtocolSecurityMiddleware({ image = false } = {}) {
  return (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'method_not_allowed' });
    }

    if (!req.is('application/json')) {
      return res.status(415).json({ error: 'application_json_required' });
    }

    const configuredKey = String(process.env.BOT_PROTOCOL_API_KEY || '').trim();
    const mustAuthenticate = process.env.NODE_ENV === 'production' || Boolean(configuredKey);
    if (mustAuthenticate) {
      if (!configuredKey) return res.status(503).json({ error: 'bot_protocol_key_not_configured' });
      if (!safeEqual(extractApiKey(req), configuredKey)) return res.status(401).json({ error: 'unauthorized' });
    }

    const validationError = validateBody(req.body, { image });
    if (validationError) return res.status(400).json({ error: validationError });

    const rate = consumeRateLimit(clientKey(req));
    res.setHeader('X-RateLimit-Limit', String(MAX_REQUESTS_PER_WINDOW));
    res.setHeader('X-RateLimit-Remaining', String(rate.remaining));
    if (!rate.allowed) {
      res.setHeader('Retry-After', String(rate.retryAfter));
      return res.status(429).json({ error: 'rate_limit_exceeded' });
    }

    if (!image) req.body.message = req.body.message.trim();
    req.body.channel = String(req.body.channel || req.body.context?.channel || 'api').trim().toLowerCase();
    next();
  };
}

module.exports = {
  createProtocolSecurityMiddleware,
  validateBody,
  consumeRateLimit,
  safeEqual,
  MAX_MESSAGE_LENGTH,
  MAX_REQUESTS_PER_WINDOW
};
