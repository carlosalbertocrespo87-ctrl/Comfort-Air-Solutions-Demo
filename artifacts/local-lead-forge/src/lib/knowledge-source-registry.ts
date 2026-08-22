export type KnowledgeAudience = 'PROSPECT' | 'CLIENT' | 'AGENT';
export type KnowledgeSensitivity = 'PUBLIC_APPROVED' | 'CLIENT_AUTHENTICATED' | 'INTERNAL_AGENT_ONLY';
export type KnowledgeLifecycle = 'DRAFT' | 'APPROVED' | 'SUPERSEDED' | 'BLOCKED';

export type KnowledgeSource = {
  key: string;
  title: string;
  driveFileId: string;
  audiences: KnowledgeAudience[];
  sensitivity: KnowledgeSensitivity;
  priority: number;
  purpose: string;
  allowAiAnswering: boolean;
};

export type KnowledgeSourceRuntimeState = {
  lifecycle: KnowledgeLifecycle;
  reviewedAt: string;
  expiresAt?: string | null;
};

export type KnowledgeRetrievalContext = {
  audience: KnowledgeAudience;
  authenticatedClient: boolean;
  now?: Date;
};

export type KnowledgeEligibilityDecision =
  | { allowed: true; reason: 'APPROVED_IN_SCOPE' }
  | {
      allowed: false;
      reason:
        | 'AI_ANSWERING_DISABLED'
        | 'SOURCE_STATE_REQUIRED'
        | 'SOURCE_NOT_APPROVED'
        | 'AUDIENCE_NOT_ALLOWED'
        | 'SENSITIVITY_MISMATCH'
        | 'CLIENT_AUTH_REQUIRED'
        | 'SOURCE_EXPIRED'
        | 'INVALID_SOURCE_DATE';
    };

/**
 * Canonical LLF knowledge registry.
 *
 * Runtime ingestion is intentionally NOT enabled in this frontend package.
 * A server-side ingestion/retrieval service must fetch only current approved
 * versions, attach source metadata, and exclude historical / DO NOT SEND files.
 */
export const LLF_KNOWLEDGE_SOURCES: KnowledgeSource[] = [
  {
    key: 'source-of-truth',
    title: 'LOCAL LEAD FORGE — SOURCE OF TRUTH INDEX v1',
    driveFileId: '1BFZIElhwJvsMuOEXLIaJZgtqiTQKRlB6aJEXnTkQ9YI',
    audiences: ['PROSPECT', 'CLIENT', 'AGENT'],
    sensitivity: 'INTERNAL_AGENT_ONLY',
    priority: 100,
    purpose: 'Controls which LLF documents are current, canonical, historical, or superseded.',
    allowAiAnswering: false,
  },
  {
    key: 'sales-client-delivery',
    title: 'LLF — Sales & Client Delivery Operating Pack v1',
    driveFileId: '1rbJYcuOQYmoiLyoJnTvixwtq6IaBsrj-8UUlUNl8gOI',
    audiences: ['PROSPECT', 'CLIENT', 'AGENT'],
    sensitivity: 'INTERNAL_AGENT_ONLY',
    priority: 95,
    purpose: 'Approved offer, sales FAQ, onboarding, client delivery and operating guidance.',
    allowAiAnswering: true,
  },
  {
    key: 'sops-operations',
    title: 'Local Lead Forge — SOPs y Operaciones',
    driveFileId: '1CXnIcWt4sAZiCHFXgvPyEGjeCT84awjCADQYpNLKHnc',
    audiences: ['CLIENT', 'AGENT'],
    sensitivity: 'INTERNAL_AGENT_ONLY',
    priority: 90,
    purpose: 'Operational procedures, support handling and implementation procedures.',
    allowAiAnswering: true,
  },
  {
    key: 'customer-success',
    title: 'Local Lead Forge — Customer Success Evidence & Communications Pack v1',
    driveFileId: '11xpz_B1MZ4Ovm6CME6_O0GvZjdsgBFINxppLiJw0nwY',
    audiences: ['CLIENT', 'AGENT'],
    sensitivity: 'CLIENT_AUTHENTICATED',
    priority: 85,
    purpose: 'Customer success communications, evidence handling, Day 1/7/30 and value-review guidance.',
    allowAiAnswering: true,
  },
  {
    key: 'launch-readiness',
    title: 'LLF — Launch Readiness Execution Pack v1',
    driveFileId: '1PhVotjiaH5UtDgyk7op-6Xrf7n2d8XxoHx8NnpE0VFk',
    audiences: ['AGENT'],
    sensitivity: 'INTERNAL_AGENT_ONLY',
    priority: 80,
    purpose: 'Internal launch, QA, escalation and first-24-hour procedures.',
    allowAiAnswering: false,
  },
  {
    key: 'client-activation',
    title: 'Local Lead Forge — Client #1 Activation Pack Index v1',
    driveFileId: '1fHytBHrbDbG0LJ1Iy4enl4h3QeuQVtAZFfvVqMrzg60',
    audiences: ['CLIENT', 'AGENT'],
    sensitivity: 'CLIENT_AUTHENTICATED',
    priority: 80,
    purpose: 'Activation, handoff and client-stage guidance.',
    allowAiAnswering: true,
  },
  {
    key: 'quality-standard',
    title: 'Local Lead Forge — Quality & Automation Operating Standard v1',
    driveFileId: '1wwwRh7UALiPBBKaU6TJhduHByFJgf0BtcIUXPIO2sOQ',
    audiences: ['AGENT'],
    sensitivity: 'INTERNAL_AGENT_ONLY',
    priority: 75,
    purpose: 'Quality, automation and fail-closed operating standards.',
    allowAiAnswering: false,
  },
];

/**
 * Deny-by-default eligibility check for future server-side retrieval.
 *
 * A registry row alone never authorizes an answer. The caller must also supply
 * current lifecycle metadata. Missing metadata, stale content, audience/sensitivity
 * mismatches, and unauthenticated client requests all fail closed.
 */
export function canUseKnowledgeSource(
  source: KnowledgeSource,
  state: KnowledgeSourceRuntimeState | null | undefined,
  context: KnowledgeRetrievalContext,
): KnowledgeEligibilityDecision {
  if (!source.allowAiAnswering) return { allowed: false, reason: 'AI_ANSWERING_DISABLED' };
  if (!state) return { allowed: false, reason: 'SOURCE_STATE_REQUIRED' };
  if (state.lifecycle !== 'APPROVED') return { allowed: false, reason: 'SOURCE_NOT_APPROVED' };
  if (!source.audiences.includes(context.audience)) return { allowed: false, reason: 'AUDIENCE_NOT_ALLOWED' };

  if (source.sensitivity === 'INTERNAL_AGENT_ONLY' && context.audience !== 'AGENT') {
    return { allowed: false, reason: 'SENSITIVITY_MISMATCH' };
  }

  if (source.sensitivity === 'CLIENT_AUTHENTICATED') {
    if (context.audience === 'PROSPECT') return { allowed: false, reason: 'SENSITIVITY_MISMATCH' };
    if (context.audience === 'CLIENT' && !context.authenticatedClient) {
      return { allowed: false, reason: 'CLIENT_AUTH_REQUIRED' };
    }
  }

  const reviewedAt = Date.parse(state.reviewedAt);
  if (!Number.isFinite(reviewedAt)) return { allowed: false, reason: 'INVALID_SOURCE_DATE' };

  if (state.expiresAt) {
    const expiresAt = Date.parse(state.expiresAt);
    if (!Number.isFinite(expiresAt)) return { allowed: false, reason: 'INVALID_SOURCE_DATE' };
    if ((context.now ?? new Date()).getTime() >= expiresAt) return { allowed: false, reason: 'SOURCE_EXPIRED' };
  }

  return { allowed: true, reason: 'APPROVED_IN_SCOPE' };
}

export const KNOWLEDGE_GUARDRAILS = {
  requireSourceCitationInternally: true,
  refuseHistoricalDoNotSend: true,
  refuseSupersededContent: true,
  refuseUnapprovedLegalClaims: true,
  refuseUnsupportedOutcomeClaims: true,
  escalateWhenConfidenceBelowThreshold: true,
  retrievalConfidenceThreshold: 0.8,
} as const;
