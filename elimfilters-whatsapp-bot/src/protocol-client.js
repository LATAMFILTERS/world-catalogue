// Thin adapter to the central Conversation Engine (/api/bot/protocol),
// mirroring elimfilters-instagram-bot/src/protocol-client.js and
// services/facebook-bot/src/knowledge.js exactly, so all three channels
// speak the identical contract. This file does NOT reason, diagnose, or
// search the catalog itself -- it only forwards the message and reports
// back what the engine said.
//
// On failure (timeout, network error, non-2xx, empty answer) it retries
// ONCE, then throws -- it never falls back to a local model or invents a
// reply. The caller (worker.js) is responsible for logging the failure and
// applying the safe support message; this file never does that itself so
// the "no inventar ni responder mediante otro modelo" rule cannot be
// bypassed by a caller that forgets to check for a thrown error.

function endpoint(baseUrl) {
  return `${String(baseUrl || '').replace(/\/$/, '')}/api/bot/protocol`;
}

// Stable identity: whatsapp:<phoneNumber> -- never the WhatsApp message id
// or any other value that changes per message, so the central engine's
// memory (and this adapter's context_seed idempotency) is scoped correctly
// per real-world conversation, not per event.
export function conversationIdFor(phoneNumber) {
  return `whatsapp:${String(phoneNumber || '').replace(/[^0-9]/g, '')}`;
}

async function attemptOnce(config, { message, conversationId, contextSeed }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.botProtocolTimeoutMs);

  try {
    const body = {
      channel: 'whatsapp',
      conversation_id: conversationId,
      message: String(message || '').trim(),
      context: {
        channel: 'whatsapp',
        conversation_id: conversationId
      }
    };
    // Only ever attached when the caller determined this conversation is
    // new to the central engine (see worker.js) -- sending it redundantly
    // is harmless (the engine is idempotent on its side too), but the
    // caller avoids the extra DB read on every message regardless.
    if (Array.isArray(contextSeed) && contextSeed.length) {
      body.context_seed = contextSeed;
    }

    const response = await fetch(endpoint(config.botProtocolUrl), {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-bot-protocol-key': config.botProtocolApiKey
      },
      body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`Central protocol ${response.status}: ${data.error || 'unknown_error'}`);
    const answer = String(data.answer || '').trim();
    if (!answer) throw new Error('Central protocol returned an empty answer');
    return {
      answer,
      intent: data.intent || null,
      phase: data.phase || null,
      contextSeedApplied: Boolean(data.memory?.context_seed_applied)
    };
  } finally {
    clearTimeout(timeout);
  }
}

// Retries exactly once (per "reintentar" in the spec -- not an open-ended
// retry loop) before surfacing the failure to the caller. Callers must
// treat a thrown error here as "apply the safe support message, log the
// failure" -- never as a signal to try a different (local) answer source.
export async function queryCentralProtocol(config, { message, conversationId, contextSeed, logger } = {}) {
  if (!config.botProtocolApiKey) {
    throw new Error('BOT_PROTOCOL_API_KEY is not configured -- cannot reach the central Conversation Engine');
  }
  try {
    return await attemptOnce(config, { message, conversationId, contextSeed });
  } catch (firstError) {
    logger?.warn?.('[protocol-client] first attempt failed, retrying once', { error: firstError.message, conversationId });
    try {
      return await attemptOnce(config, { message, conversationId, contextSeed });
    } catch (secondError) {
      logger?.error?.('[protocol-client] central protocol failed after retry', { error: secondError.message, conversationId });
      throw secondError;
    }
  }
}
