import { z } from 'zod';

export const createCandidateCaseSchema = z.object({
  externalId: z.string().min(3),
  sourceChannel: z.string().min(2),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']).default('NORMAL'),
  protectionSystem: z.string().optional(),
  technicalFamily: z.string().optional(),
  symptomSummary: z.string().min(5),
  assetSummary: z.record(z.unknown()).default({}),
  structuredIntake: z.record(z.unknown()).default({}),
  noveltyClassification: z.enum(['KNOWN_CASE','VARIANT','ADDITIONAL_EVIDENCE','CONTRADICTION','POSSIBLE_NEW_CASE','INSUFFICIENT_INFORMATION','NON_TECHNICAL']).optional(),
  noveltyScore: z.number().min(0).max(1).optional(),
  dueAt: z.string().datetime().optional()
});

export const transitionCaseSchema = z.object({
  newStatus: z.enum(['CAPTURED','INCOMPLETE','UNDER_ANALYSIS','DUPLICATE','CLUSTERED','DRAFTED','TECHNICAL_REVIEW','APPROVED','REJECTED','PUBLISHED']),
  reason: z.string().min(3),
  payload: z.record(z.unknown()).default({})
});

export const reviewDecisionSchema = z.object({
  decision: z.enum(['REQUEST_MORE_EVIDENCE','MERGE_EXISTING','CREATE_DIAGNOSTIC','RETURN_TO_DRAFT','APPROVE','REJECT']),
  rationale: z.string().min(5),
  targetRecordId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).default({})
});

export const createKnowledgeSchema = z.object({
  externalId: z.string().min(3),
  recordType: z.enum(['DIAGNOSTIC','ASSET','PRODUCT','SOURCE','STANDARD','TECHNOLOGY','SYSTEM','INDUSTRY','COMPONENT','PROCEDURE','POLICY']),
  schemaVersion: z.string().min(1),
  title: z.string().min(3),
  summary: z.string().optional(),
  content: z.record(z.unknown()),
  changeReason: z.string().min(3)
});

export const publishSchema = z.object({
  approvalRecordId: z.string().uuid(),
  targetEnvironment: z.enum(['STAGING','PRODUCTION'])
});
