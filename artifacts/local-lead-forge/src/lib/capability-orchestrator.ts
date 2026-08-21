export type CapabilityState = 'DORMANT' | 'READY' | 'ACTIVE' | 'BLOCKED' | 'ADVISORY_ONLY';

export type CapabilityKey =
  | 'BILINGUAL_EN_ES'
  | 'PROMPT_INJECTION_DEFENSE'
  | 'PII_REDACTION'
  | 'DATA_RETENTION'
  | 'ABUSE_DETECTION'
  | 'INCIDENT_REPLAY'
  | 'KNOWLEDGE_FRESHNESS'
  | 'KNOWLEDGE_CONFLICT_DETECTION'
  | 'HALLUCINATION_WATCH'
  | 'COMPANY_MEMORY'
  | 'NEXT_BEST_ACTION'
  | 'LEAD_HEAT'
  | 'WEEKLY_QUALITY_REVIEW'
  | 'SELF_HEALING_KNOWLEDGE'
  | 'CLIENT_HEALTH'
  | 'CHURN_INTELLIGENCE'
  | 'REFERRAL_TIMING'
  | 'UPSELL_INTELLIGENCE'
  | 'MULTI_NICHE_KNOWLEDGE'
  | 'SECURE_PUSH';

export type CapabilityPrerequisites = {
  authenticatedBackend: boolean;
  rlsSecurityQaPassed: boolean;
  retentionReviewPassed: boolean;
  negativeSecurityTestsPassed: boolean;
  trustedDevice: boolean;
  liveAiProviderApproved: boolean;
  minimumConversationCount: number;
  minimumClientCount: number;
  legalReleased: boolean;
};

export type CapabilityDecision = {
  key: CapabilityKey;
  state: CapabilityState;
  reason: string;
};

type CapabilityDefinition = {
  key: CapabilityKey;
  needsBackend?: boolean;
  needsSecurityQa?: boolean;
  needsTrustedDevice?: boolean;
  needsLiveAi?: boolean;
  minConversations?: number;
  minClients?: number;
  advisoryUntilEvidence?: boolean;
};

const DEFINITIONS: CapabilityDefinition[] = [
  { key: 'BILINGUAL_EN_ES' },
  { key: 'PROMPT_INJECTION_DEFENSE' },
  { key: 'PII_REDACTION' },
  { key: 'DATA_RETENTION', needsBackend: true, needsSecurityQa: true },
  { key: 'ABUSE_DETECTION', needsBackend: true, needsSecurityQa: true },
  { key: 'INCIDENT_REPLAY', needsBackend: true, needsSecurityQa: true },
  { key: 'KNOWLEDGE_FRESHNESS' },
  { key: 'KNOWLEDGE_CONFLICT_DETECTION' },
  { key: 'HALLUCINATION_WATCH', needsLiveAi: true, needsSecurityQa: true },
  { key: 'COMPANY_MEMORY', needsBackend: true, needsSecurityQa: true },
  { key: 'NEXT_BEST_ACTION', needsBackend: true, minConversations: 1 },
  { key: 'LEAD_HEAT', needsBackend: true, minConversations: 1 },
  { key: 'WEEKLY_QUALITY_REVIEW', needsBackend: true, minConversations: 5 },
  { key: 'SELF_HEALING_KNOWLEDGE', needsBackend: true, minConversations: 3, advisoryUntilEvidence: true },
  { key: 'CLIENT_HEALTH', needsBackend: true, minClients: 2, advisoryUntilEvidence: true },
  { key: 'CHURN_INTELLIGENCE', needsBackend: true, minClients: 5, advisoryUntilEvidence: true },
  { key: 'REFERRAL_TIMING', needsBackend: true, minClients: 2, advisoryUntilEvidence: true },
  { key: 'UPSELL_INTELLIGENCE', needsBackend: true, minClients: 2, advisoryUntilEvidence: true },
  { key: 'MULTI_NICHE_KNOWLEDGE', needsBackend: true, needsSecurityQa: true },
  { key: 'SECURE_PUSH', needsBackend: true, needsSecurityQa: true, needsTrustedDevice: true },
];

export function evaluateCapabilities(p: CapabilityPrerequisites): CapabilityDecision[] {
  return DEFINITIONS.map((d) => {
    if (d.needsBackend && !p.authenticatedBackend) {
      return { key: d.key, state: 'BLOCKED', reason: 'Authenticated backend not available.' };
    }
    if (d.needsSecurityQa && (!p.rlsSecurityQaPassed || !p.negativeSecurityTestsPassed || !p.retentionReviewPassed)) {
      return { key: d.key, state: 'BLOCKED', reason: 'Security/retention release gates are not complete.' };
    }
    if (d.needsTrustedDevice && !p.trustedDevice) {
      return { key: d.key, state: 'BLOCKED', reason: 'Trusted device required.' };
    }
    if (d.needsLiveAi && !p.liveAiProviderApproved) {
      return { key: d.key, state: 'READY', reason: 'Foundation ready; live AI provider remains disabled.' };
    }
    if ((d.minConversations ?? 0) > p.minimumConversationCount || (d.minClients ?? 0) > p.minimumClientCount) {
      return {
        key: d.key,
        state: d.advisoryUntilEvidence ? 'ADVISORY_ONLY' : 'DORMANT',
        reason: 'Installed but waiting for enough real evidence to activate responsibly.',
      };
    }
    return { key: d.key, state: 'ACTIVE', reason: 'Prerequisites satisfied.' };
  });
}

/**
 * Safety invariant: automatic activation can only occur through prerequisite satisfaction.
 * No capability may override auth, RLS, retention, legal, or device-trust gates.
 */
