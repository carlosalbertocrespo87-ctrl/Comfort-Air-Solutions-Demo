import type { ConversationAudience, ConversationStatus } from './conversation-model';

export type PersistedConversation = {
  id: string;
  audience: ConversationAudience;
  status: ConversationStatus;
  channel: 'PUBLIC_WEB' | 'CLIENT_PORTAL';
  assignedAgentUserId?: string | null;
  activeLanguage: 'EN' | 'ES';
  createdAt: string;
  updatedAt: string;
};

export type PersistedMessage = {
  id: string;
  conversationId: string;
  author: 'VISITOR' | 'AI' | 'AGENT' | 'SYSTEM';
  authorLabel: string;
  body: string;
  createdAt: string;
};

export type ConversationRealtimeEvent = {
  conversationId: string;
  eventType:
    | 'CONVERSATION_CREATED'
    | 'MESSAGE_CREATED'
    | 'HANDOFF_REQUESTED'
    | 'CONVERSATION_CLAIMED'
    | 'CONVERSATION_RESOLVED'
    | 'AGENT_AVAILABILITY_CHANGED';
  occurredAt: string;
};

/**
 * Vendor-neutral authenticated backend contract.
 * Implementations must derive authorization from the authenticated server/session
 * context, never from a caller-supplied user/agent id alone.
 */
export interface SupportBackendAdapter {
  getConversation(conversationId: string): Promise<PersistedConversation | null>;
  listAuthorizedConversations(): Promise<PersistedConversation[]>;
  listMessages(conversationId: string): Promise<PersistedMessage[]>;
  requestHumanHandoff(conversationId: string, reason: string): Promise<void>;
  claimConversation(conversationId: string): Promise<PersistedConversation>;
  resolveConversation(conversationId: string): Promise<PersistedConversation>;
  subscribe(
    conversationId: string,
    onEvent: (event: ConversationRealtimeEvent) => void,
  ): () => void;
}

export class DisabledSupportBackendAdapter implements SupportBackendAdapter {
  private disabled(): never {
    throw new Error('LLF live support backend is disabled until Auth/RLS security QA passes.');
  }

  async getConversation(): Promise<PersistedConversation | null> {
    return this.disabled();
  }

  async listAuthorizedConversations(): Promise<PersistedConversation[]> {
    return this.disabled();
  }

  async listMessages(): Promise<PersistedMessage[]> {
    return this.disabled();
  }

  async requestHumanHandoff(): Promise<void> {
    return this.disabled();
  }

  async claimConversation(): Promise<PersistedConversation> {
    return this.disabled();
  }

  async resolveConversation(): Promise<PersistedConversation> {
    return this.disabled();
  }

  subscribe(): () => void {
    this.disabled();
  }
}
