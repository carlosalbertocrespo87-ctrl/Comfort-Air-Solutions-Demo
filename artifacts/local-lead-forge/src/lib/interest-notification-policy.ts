import type { AgentId, ConversationAudience, ConversationChannel } from './conversation-model';

export type InterestEventType =
  | 'AI_CONVERSATION_STARTED'
  | 'HIGH_INTENT_DETECTED'
  | 'AI_RESPONSE_RESOLVED'
  | 'AI_RESPONSE_NOT_RESOLVED'
  | 'HUMAN_HANDOFF_REQUESTED';

export type InterestEvent = {
  conversationId: string;
  audience: ConversationAudience;
  channel: ConversationChannel;
  eventType: InterestEventType;
  contactLabel: string;
  occurredAt: string;
  intentSummary?: string;
  satisfactionSource?: 'EXPLICIT_YES' | 'EXPLICIT_NO' | 'THUMBS_UP' | 'THUMBS_DOWN';
};

export type InterestNotificationPlan = {
  dedupeKey: string;
  recipients: AgentId[];
  title: string;
  body: string;
  priority: 'NORMAL' | 'HIGH';
  openConversationImmediately: boolean;
};

/**
 * Notification product rules:
 * - Notify Carlos and María once when a prospect/client starts an AI conversation so both know LLF has active interest.
 * - Ask the visitor/client whether the AI resolved the question; use explicit feedback rather than guessing satisfaction.
 * - Notify both agents when the AI resolves the question so they know the interaction ended successfully.
 * - If the user says the AI did not resolve the question, treat it as an escalation signal.
 * - Human handoff requests notify both agents at HIGH priority and should deep-link directly to the live conversation.
 * - High-intent events notify both agents, but do not generate a push for every message.
 * - Dedupe by conversation + event type to prevent notification fatigue.
 */
export function planInterestNotification(event: InterestEvent): InterestNotificationPlan {
  const audienceLabel = event.audience === 'CLIENT' ? 'Client' : 'Prospect';
  const channelLabel = event.channel === 'CLIENT_PORTAL' ? 'Client Portal' : 'Website';

  if (event.eventType === 'HUMAN_HANDOFF_REQUESTED') {
    return {
      dedupeKey: `${event.conversationId}:human-handoff`,
      recipients: ['CARLOS', 'MARIA'],
      title: `${audienceLabel} wants to talk with LLF`,
      body: `${event.contactLabel} requested an LLF specialist from ${channelLabel}. Tap to respond now.`,
      priority: 'HIGH',
      openConversationImmediately: true,
    };
  }

  if (event.eventType === 'AI_RESPONSE_NOT_RESOLVED') {
    return {
      dedupeKey: `${event.conversationId}:ai-not-resolved`,
      recipients: ['CARLOS', 'MARIA'],
      title: `LLF AI did not fully resolve this ${audienceLabel.toLowerCase()}`,
      body: `${event.contactLabel} indicated the AI answer did not solve the question. Review or take over the chat.`,
      priority: 'HIGH',
      openConversationImmediately: true,
    };
  }

  if (event.eventType === 'HIGH_INTENT_DETECTED') {
    return {
      dedupeKey: `${event.conversationId}:high-intent`,
      recipients: ['CARLOS', 'MARIA'],
      title: `High-interest ${audienceLabel.toLowerCase()} in LLF`,
      body: event.intentSummary
        ? `${event.contactLabel}: ${event.intentSummary}`
        : `${event.contactLabel} showed strong interest while chatting with LLF AI.`,
      priority: 'HIGH',
      openConversationImmediately: false,
    };
  }

  if (event.eventType === 'AI_RESPONSE_RESOLVED') {
    return {
      dedupeKey: `${event.conversationId}:ai-resolved`,
      recipients: ['CARLOS', 'MARIA'],
      title: `LLF AI resolved the ${audienceLabel.toLowerCase()}'s question`,
      body: `${event.contactLabel} confirmed the AI response was helpful. No human takeover is required right now.`,
      priority: 'NORMAL',
      openConversationImmediately: false,
    };
  }

  return {
    dedupeKey: `${event.conversationId}:ai-started`,
    recipients: ['CARLOS', 'MARIA'],
    title: `${audienceLabel} is chatting with LLF AI`,
    body: `${event.contactLabel} started an AI conversation from ${channelLabel}.`,
    priority: 'NORMAL',
    openConversationImmediately: false,
  };
}

/** Real push transport remains disabled until authenticated backend + device registration + security QA are complete. */
export const LIVE_INTEREST_PUSH_ENABLED = false;
