import type { AgentId, ConversationAudience, ConversationStatus } from './conversation-model';

export type AgentAvailability = 'AVAILABLE' | 'BUSY' | 'OFFLINE';
export type IntentLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'READY_TO_BUY';
export type SatisfactionState = 'UNKNOWN' | 'SATISFIED' | 'NOT_SATISFIED';
export type SnoozePreset = '15_MIN' | '30_MIN' | '1_HOUR';

export type AgentConversationSnapshot = {
  conversationId: string;
  audience: ConversationAudience;
  status: ConversationStatus;
  assignedAgent?: AgentId;
  intentLevel: IntentLevel;
  satisfaction: SatisfactionState;
  waitingSince?: string;
  humanRequested: boolean;
  criticalClientIssue: boolean;
};

export type MobileAttentionLevel = 'ROUTINE' | 'IMPORTANT' | 'URGENT';

export function getAttentionLevel(snapshot: AgentConversationSnapshot): MobileAttentionLevel {
  if (
    snapshot.humanRequested ||
    snapshot.satisfaction === 'NOT_SATISFIED' ||
    snapshot.criticalClientIssue ||
    snapshot.intentLevel === 'READY_TO_BUY'
  ) {
    return 'URGENT';
  }

  if (snapshot.intentLevel === 'HIGH' || snapshot.status === 'WAITING_FOR_AGENT') {
    return 'IMPORTANT';
  }

  return 'ROUTINE';
}

export function belongsInNeedsMeNow(snapshot: AgentConversationSnapshot) {
  return getAttentionLevel(snapshot) !== 'ROUTINE' || snapshot.status === 'WAITING_FOR_AGENT';
}

export function shouldNotifyAgent(
  snapshot: AgentConversationSnapshot,
  agent: AgentId,
  availability: AgentAvailability,
  urgentOnlyMode: boolean,
) {
  if (availability === 'OFFLINE') return false;
  if (snapshot.assignedAgent && snapshot.assignedAgent !== agent) return false;

  const level = getAttentionLevel(snapshot);
  if (urgentOnlyMode) return level === 'URGENT';
  if (availability === 'BUSY') return level !== 'ROUTINE';
  return true;
}

export const SNOOZE_MINUTES: Record<SnoozePreset, number> = {
  '15_MIN': 15,
  '30_MIN': 30,
  '1_HOUR': 60,
};

export const SAFE_QUICK_REPLIES = [
  "I'm reviewing this now and will update you shortly.",
  'Thanks — I have the context from the AI conversation and am checking this now.',
  'I can help with that. Give me a moment to review the details already provided.',
] as const;

export type FiveSecondSummary = {
  identity: string;
  audience: 'Prospect' | 'Client';
  currentQuestion: string;
  aiOutcome: string;
  satisfaction: SatisfactionState;
  intentLevel: IntentLevel;
  recommendedNextAction: string;
};

/**
 * Private notes and internal transfers are agent-only data.
 * They must never be rendered into the customer-visible transcript.
 */
export type PrivateAgentNote = {
  conversationId: string;
  authorAgent: AgentId;
  body: string;
  createdAt: string;
};

export type InternalTransfer = {
  conversationId: string;
  fromAgent: AgentId;
  toAgent: AgentId;
  privateHandoffNote?: string;
  createdAt: string;
};
