import { isSupportBackendGateEnabled } from './backend-gates';

export type PushRegistrationReadiness = {
  ready: boolean;
  reasons: string[];
};

export function evaluatePushRegistrationReadiness(input: {
  authenticatedAgent: boolean;
  trustedDevice: boolean;
  securityQaPassed: boolean;
  userGesture: boolean;
  installedHomeScreenApp: boolean;
}): PushRegistrationReadiness {
  const reasons: string[] = [];

  if (!input.authenticatedAgent) reasons.push('AUTHENTICATED_AGENT_REQUIRED');
  if (!input.trustedDevice) reasons.push('TRUSTED_DEVICE_REQUIRED');
  if (!input.securityQaPassed) reasons.push('SECURITY_QA_REQUIRED');
  if (!input.userGesture) reasons.push('EXPLICIT_USER_GESTURE_REQUIRED');
  if (!input.installedHomeScreenApp) reasons.push('HOME_SCREEN_APP_REQUIRED_FOR_IPHONE_PUSH');
  if (!isSupportBackendGateEnabled('liveConversationBackend')) reasons.push('LIVE_BACKEND_DISABLED');
  if (!isSupportBackendGateEnabled('livePushNotifications')) reasons.push('LIVE_PUSH_DISABLED');

  return { ready: reasons.length === 0, reasons };
}

export const SAFE_PUSH_PAYLOAD_FIELDS = [
  'eventType',
  'notificationId',
  'dedupeKey',
  'deepLink',
  'conversationOpaqueId',
] as const;

export const FORBIDDEN_LOCK_SCREEN_FIELDS = [
  'messageBody',
  'customerPhone',
  'customerEmail',
  'privateAgentNote',
  'paymentData',
  'authToken',
] as const;
