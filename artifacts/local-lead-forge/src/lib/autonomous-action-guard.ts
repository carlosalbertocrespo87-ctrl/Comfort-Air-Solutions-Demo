export type ExternalAction =
  | 'SEND_FOLLOW_UP'
  | 'SEND_REFERRAL_REQUEST'
  | 'SEND_UPSELL_MESSAGE'
  | 'SEND_PUSH_NOTIFICATION'
  | 'CHANGE_KNOWLEDGE'
  | 'CHANGE_PRICING'
  | 'CHANGE_LEGAL_TEXT'
  | 'CHANGE_SECURITY_POLICY';

export type ActionContext = {
  authenticatedBackend: boolean;
  securityQaPassed: boolean;
  legalReleased: boolean;
  trustedDevice: boolean;
  explicitHumanApproval: boolean;
  capabilityActive: boolean;
};

export function canExecuteExternalAction(action: ExternalAction, c: ActionContext) {
  if (!c.authenticatedBackend || !c.securityQaPassed || !c.capabilityActive) return false;

  if (action === 'SEND_PUSH_NOTIFICATION') return c.trustedDevice;

  if (
    action === 'SEND_FOLLOW_UP' ||
    action === 'SEND_REFERRAL_REQUEST' ||
    action === 'SEND_UPSELL_MESSAGE'
  ) {
    return c.legalReleased && c.explicitHumanApproval;
  }

  // Knowledge, pricing, legal and security changes are never silently autonomous.
  return false;
}
