import type { AgentId, ConversationAudience, ConversationChannel } from './conversation-model';

export type InterestEventType = 'AI_CONVERSATION_STARTED' | 'HIGH_INTENT_DETECTED' | 'HUMAN_HANDOFF_REQUESTED';

export type InterestEvent = {
  conversationId: string;
  audience: ConversationAudience;
  channel: ConversationChannel;
  eventType: InterestEventType;
  contactLabel: string;
  occurredAt: string;
  intentSummary?: string;
};

export type InterestNotificationPlan = {
  dedupeKey: string;
  recipients: AgentId[];
  title: string;
  body: string;
  priority: 'NORMAL' | 'HIGH';
};

/**
 * Product decision:
 * - Carlos is notified once when a new prospect/client starts an AI conversation.
 * - Human handoff continues to notify all available authorized agents.
 * - High-intent events may notify Carlos again even if the conversation-start alert already fired.
 * - Do not alert on every AI message; dedupe by conversation + event type to prevent notification fatigue.
 */
export function planInterestNotification(event: InterestEvent): InterestNotificationPlan {
  const audienceLabel = event.audience === 'CLIENT' ? 'Client' : 'Prospect';
  const channelLabel = event.channel === 'CLIENT_PORTAL' ? 'Client Portal' : 'Website';

  if (event.eventType === 'HUMAN_HANDOFF_REQUESTED') {
    return {
      dedupeKey: `${event.conversationId}:human-handoff`,
      recipients: ['CARLOS', 'MARIA'],
      title: `${audienceLabel} needs an LLF specialist`,
      body: `${event.contactLabel} requested human help from ${channelLabel}.`,
      priority: 'HIGH',
    };
  }

  if (event.eventType === 'HIGH_INTENT_DETECTED') {
    return {
      dedupeKey: `${event.conversationId}:high-intent`,
      recipients: ['CARLOS'],
      title: `High-interest ${audienceLabel.toLowerCase()} in LLF`,
      body: event.intentSummary
        ? `${event.contactLabel}: ${event.intentSummary}`
        : `${event.contactLabel} showed strong interest while chatting with LLF AI.`,
      priority: 'HIGH',
    };
  }

  return {
    dedupeKey: `${event.conversationId}:ai-started`,
    recipients: ['CARLOS'],
    title: `${audienceLabel} started chatting with LLF AI`,
    body: `${event.contactLabel} opened an AI conversation from ${channelLabel}.`,
    priority: 'NORMAL',
  };
}

/** Real push transport remains disabled until authenticated backend + device registration + security QA are complete. */
export const LIVE_INTEREST_PUSH_ENABLED = false;
