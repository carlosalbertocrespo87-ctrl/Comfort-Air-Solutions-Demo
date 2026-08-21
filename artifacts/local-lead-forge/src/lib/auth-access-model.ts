export type LlfAuthRole = 'AGENT' | 'CLIENT' | 'PROSPECT';

export type AuthenticatedAgentIdentity = {
  role: 'AGENT';
  userId: string;
  displayName: string;
  isActive: boolean;
};

export type AuthenticatedClientIdentity = {
  role: 'CLIENT';
  userId: string;
  clientAccountId: string;
  displayName?: string;
};

export type ScopedProspectIdentity = {
  role: 'PROSPECT';
  conversationId: string;
  scopedAccessToken: string;
};

export type LlfSupportIdentity =
  | AuthenticatedAgentIdentity
  | AuthenticatedClientIdentity
  | ScopedProspectIdentity;

export type SupportCapability =
  | 'READ_ASSIGNED_OR_VISIBLE_CONVERSATIONS'
  | 'READ_TEAM_PRESENCE'
  | 'CLAIM_CONVERSATION'
  | 'SEND_AGENT_MESSAGE'
  | 'MANAGE_OWN_PUSH_DEVICE'
  | 'READ_OWN_CLIENT_CONVERSATION'
  | 'SEND_CLIENT_MESSAGE'
  | 'READ_SCOPED_PROSPECT_CONVERSATION'
  | 'SEND_PROSPECT_MESSAGE';

/**
 * Frontend capability hints only. These MUST NOT be treated as authorization.
 * PostgreSQL RLS / server-side checks remain authoritative.
 */
export function getUiCapabilities(identity: LlfSupportIdentity): SupportCapability[] {
  if (identity.role === 'AGENT') {
    if (!identity.isActive) return [];
    return [
      'READ_ASSIGNED_OR_VISIBLE_CONVERSATIONS',
      'READ_TEAM_PRESENCE',
      'CLAIM_CONVERSATION',
      'SEND_AGENT_MESSAGE',
      'MANAGE_OWN_PUSH_DEVICE',
    ];
  }

  if (identity.role === 'CLIENT') {
    return ['READ_OWN_CLIENT_CONVERSATION', 'SEND_CLIENT_MESSAGE'];
  }

  return ['READ_SCOPED_PROSPECT_CONVERSATION', 'SEND_PROSPECT_MESSAGE'];
}

export function assertNoClientSidePrivilegeEscalation(
  identity: LlfSupportIdentity,
  requested: SupportCapability,
) {
  const allowed = getUiCapabilities(identity);
  if (!allowed.includes(requested)) {
    throw new Error(`LLF UI capability denied for role ${identity.role}: ${requested}`);
  }
}
