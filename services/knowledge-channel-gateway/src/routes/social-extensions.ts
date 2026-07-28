import { Router } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { normalizeFacebookMessenger } from '../adapters/facebook-messenger.js';
import { normalizeLinkedInEvent } from '../adapters/linkedin.js';
import { normalizeYouTubeEvent } from '../adapters/youtube.js';

export const socialExtensionRoutes = Router();

function requireInternalSecret(req: any, res: any, next: any) {
  const expected = process.env.CHANNEL_INTERNAL_SECRET ?? '';
  const supplied = String(req.header('x-channel-secret') ?? '');
  const a = Buffer.from(expected);
  const b = Buffer.from(supplied);
  if (!expected || a.length !== b.length || !timingSafeEqual(a, b)) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }
  next();
}

socialExtensionRoutes.post('/webhooks/facebook-messenger', async (req, res, next) => {
  try {
    const events = normalizeFacebookMessenger(req.body);
    res.status(202).json({ accepted: events.length, events });
  } catch (error) { next(error); }
});

socialExtensionRoutes.post('/internal/linkedin-events', requireInternalSecret, async (req, res, next) => {
  try {
    res.status(202).json({ accepted: 1, event: normalizeLinkedInEvent(req.body) });
  } catch (error) { next(error); }
});

socialExtensionRoutes.post('/internal/youtube-events', requireInternalSecret, async (req, res, next) => {
  try {
    res.status(202).json({ accepted: 1, event: normalizeYouTubeEvent(req.body) });
  } catch (error) { next(error); }
});
