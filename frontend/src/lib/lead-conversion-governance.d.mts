export function commercialLeadKind(urlValue: string, origin: string): 'distributor' | 'lead_capture' | 'commercial' | 'partner' | null;
export function acceptedLeadResponse(response: { ok: boolean; status: number }, payload: unknown): boolean;
export function leadDedupKey(kind: string, requestPayload: Record<string, unknown>, resultPayload: unknown): string | null;
