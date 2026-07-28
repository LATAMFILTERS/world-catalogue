import { z } from 'zod';

export const reasoningRequestSchema = z.object({
  query: z.string().min(3).max(12000),
  audience: z.enum(['TECHNICAL_SUPPORT','DISTRIBUTOR','CUSTOMER','INTERNAL_ENGINEERING']).default('TECHNICAL_SUPPORT'),
  channel: z.string().min(1).max(80),
  correlationId: z.string().uuid().optional(),
  candidateCaseId: z.string().uuid().optional(),
  userEvidence: z.array(z.object({ type: z.string(), text: z.string().max(12000), sourceLabel: z.string().max(200).optional() })).max(20).default([]),
  context: z.record(z.unknown()).default({})
});

export type ReasoningRequest = z.infer<typeof reasoningRequestSchema>;
export type ControlAction = 'ANSWER'|'VERIFY'|'ESCALATE'|'STOP';

export interface RetrievedRecord {
  recordId: string;
  versionId: string;
  externalId: string;
  recordType: string;
  title: string;
  summary: string | null;
  content: unknown;
  confidence: number;
  sources: Array<{ sourceId: string; title: string; authorityLevel: string; supportType: string; locator: string | null }>;
}

export interface ReasoningResponse {
  traceId: string;
  action: ControlAction;
  confidence: number;
  answer: string | null;
  verificationRequests: string[];
  escalationReason: string | null;
  stopReason: string | null;
  citations: Array<{ recordId: string; versionId: string; sourceId?: string; label: string }>;
  limitations: string[];
}