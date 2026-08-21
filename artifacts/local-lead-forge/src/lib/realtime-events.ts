import type { AgentId, ConversationStatus } from './conversation-model';

export type SupportRealtimeEvent =
  | {
      type: 'CONVERSATION_CREATED';
      conversationId: string;
      audience: 'PROSPECT' | 'CLIENT';
      channel: 'PUBLIC_WEB' | 'CLIENT_PORTAL';
      at: string;
    }
  | {
      type: 'MESSAGE_CREATED';
      conversationId: string;
      messageId: string;
      author: 'VISITOR' | 'AI' | 'AGENT' | 'SYSTEM';
      at: string;
    }
  | {
      type: 'AI_CHAT_STARTED';
      conversationId: string;
      at: string;
    }
  | {
      type: 'AI_RESPONSE_FEEDBACK';
      conversationId: string;
      resolved: boolean;
      source: 'EXPLICIT_YES' | 'EXPLICIT_NO' | 'THUMBS_UP' | 'THUMBS_DOWN';
      at: string;
    }
  | {
      type: 'HIGH_INTENT_DETECTED';
      conversationId: string;
      summary?: string;
      at: string;
    }
  | {
      type: 'HANDOFF_REQUESTED';
      conversationId: string;
      at: string;
    }
  | {
      type: 'CONVERSATION_CLAIMED';
      conversationId: string;
      agent: AgentId;
      at: string;
    }
  | {
      type: 'CONVERSATION_STATUS_CHANGED';
      conversationId: string;
      status: ConversationStatus;
      at: string;
    }
  | {
      type: 'AGENT_PRESENCE_CHANGED';
      agent: AgentId;
      availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
      at: string;
    };

export function isAgentAttentionEvent(event: SupportRealtimeEvent) {
  if (event.type === 'HANDOFF_REQUESTED' || event.type === 'HIGH_INTENT_DETECTED') return true;
  return event.type === 'AI_RESPONSE_FEEDBACK' && !event.resolved;
}
