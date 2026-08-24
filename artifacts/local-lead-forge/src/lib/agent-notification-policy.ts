import type { AgentId, Conversation } from './conversation-model';

export type AgentAvailability = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export type AgentPresence = {
  agent: AgentId;
  availability: AgentAvailability;
};

export type NotificationPlan = {
  shouldNotify: boolean;
  recipients: AgentId[];
  primary?: AgentId;
  fallback?: AgentId;
  escalationLabel: 'NORMAL' | 'HIGH';
  reason: string;
};

export function planAgentNotification(
  conversation: Conversation,
  presence: AgentPresence[],
): NotificationPlan {
  if (conversation.status !== 'WAITING_FOR_AGENT') {
    return { shouldNotify: false, recipients: [], escalationLabel: 'NORMAL', reason: 'Conversation does not require a human.' };
  }

  const available = presence.filter((item) => item.availability === 'AVAILABLE').map((item) => item.agent);
  const fallbackPool = presence.filter((item) => item.availability !== 'OFFLINE').map((item) => item.agent);
  const recipients = available.length > 0 ? available : fallbackPool;
  const primary = recipients[0];
  const fallback = recipients.length > 1 ? recipients[1] : undefined;

  return {
    shouldNotify: recipients.length > 0,
    recipients,
    primary,
    fallback,
    escalationLabel: conversation.audience === 'CLIENT' ? 'HIGH' : 'NORMAL',
    reason: recipients.length > 0
      ? 'Human handoff requested; notify authorized LLF agents.'
      : 'No authorized LLF agent is currently available; keep the conversation queued for follow-up.',
  };
}

/** Decision layer only. Real push transport stays disabled until an authenticated backend is approved. */
export const LIVE_NOTIFICATION_TRANSPORT_ENABLED = false;
