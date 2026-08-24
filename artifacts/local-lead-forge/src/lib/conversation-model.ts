export type ConversationAudience = 'PROSPECT' | 'CLIENT';
export type ConversationChannel = 'PUBLIC_WEB' | 'CLIENT_PORTAL';
export type ConversationStatus = 'AI_ACTIVE' | 'WAITING_FOR_AGENT' | 'AGENT_ACTIVE' | 'RESOLVED';
export type AgentId = 'CARLOS' | 'MARIA';

export type ConversationMessage = {
  id: string;
  author: 'VISITOR' | 'AI' | 'AGENT';
  authorLabel: string;
  body: string;
  createdAt: string;
};

export type HandoffSummary = {
  reason: string;
  userIntent: string;
  knownFacts: string[];
  unresolvedQuestion: string;
  suggestedNextAction: string;
};

export type Conversation = {
  id: string;
  audience: ConversationAudience;
  channel: ConversationChannel;
  status: ConversationStatus;
  contactName?: string;
  companyName?: string;
  assignedAgent?: AgentId;
  messages: ConversationMessage[];
  handoffSummary?: HandoffSummary;
};

export const INITIAL_AGENTS: Record<AgentId, { id: AgentId; displayName: string; role: string }> = {
  CARLOS: { id: 'CARLOS', displayName: 'Carlos', role: 'LLF Specialist' },
  MARIA: { id: 'MARIA', displayName: 'María', role: 'LLF Specialist' },
};

export const PILOT_AGENT_USER_IDS: Record<AgentId, string> = {
  CARLOS: '1c1e7606-b9dc-4604-8047-df86760809d7',
  MARIA: '31cd8575-1b51-4c95-9d07-ffec6ce21fde',
};

export function resolvePilotAgentId(userId?: string | null): AgentId | undefined {
  if (!userId) return undefined;
  return (Object.entries(PILOT_AGENT_USER_IDS) as Array<[AgentId, string]>)
    .find(([, candidate]) => candidate === userId)?.[0];
}

export function requestHumanHandoff(
  conversation: Conversation,
  reason: string,
  unresolvedQuestion: string,
  userIntent = 'Needs human assistance',
): Conversation {
  return {
    ...conversation,
    status: 'WAITING_FOR_AGENT',
    assignedAgent: undefined,
    handoffSummary: {
      reason,
      userIntent,
      knownFacts: [
        `Audience: ${conversation.audience}`,
        `Channel: ${conversation.channel}`,
        conversation.companyName ? `Company: ${conversation.companyName}` : 'Company not yet known',
      ],
      unresolvedQuestion,
      suggestedNextAction: 'Review context, claim the conversation, and answer without asking the user to repeat prior details.',
    },
  };
}

export function claimConversation(conversation: Conversation, agent: AgentId): Conversation {
  if (conversation.status !== 'WAITING_FOR_AGENT') return conversation;
  return { ...conversation, status: 'AGENT_ACTIVE', assignedAgent: agent };
}

export function returnConversationToAI(conversation: Conversation): Conversation {
  return { ...conversation, status: 'AI_ACTIVE', assignedAgent: undefined };
}

export function resolveConversation(conversation: Conversation): Conversation {
  return { ...conversation, status: 'RESOLVED' };
}

export function buildAgentNotification(conversation: Conversation) {
  const label = conversation.audience === 'CLIENT' ? 'Client' : 'Prospect';
  const origin = conversation.channel === 'CLIENT_PORTAL' ? 'Client Portal' : 'Public Website';
  return {
    title: `${label} needs an LLF specialist`,
    body: `${conversation.contactName ?? conversation.companyName ?? 'A visitor'} is waiting from ${origin}.`,
    conversationId: conversation.id,
  };
}
