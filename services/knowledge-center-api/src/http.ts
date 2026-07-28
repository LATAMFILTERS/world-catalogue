import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { config } from './config.js';

export type ActorRequest = Request & { actorId?: string; actorRole?: string };

export function authenticate(req: ActorRequest, res: Response, next: NextFunction): void {
  const key = req.header('x-api-key');
  const actorId = req.header('x-actor-id');
  const actorRole = req.header('x-actor-role');
  if (!key || !config.apiKeys.has(key) || !actorId || !actorRole) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }
  req.actorId = actorId;
  req.actorRole = actorRole;
  next();
}

export function requireRole(...roles: string[]) {
  return (req: ActorRequest, res: Response, next: NextFunction): void => {
    if (!req.actorRole || !roles.includes(req.actorRole)) {
      res.status(403).json({ error: 'FORBIDDEN' });
      return;
    }
    next();
  };
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof ZodError) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: error.flatten() });
    return;
  }
  const message = error instanceof Error ? error.message : 'Unknown error';
  res.status(500).json({ error: 'INTERNAL_ERROR', message });
}
