export type SupportBackendGateState = {
  liveConversationBackend: boolean;
  liveAgentMessaging: boolean;
  livePushNotifications: boolean;
  liveAiProvider: boolean;
};

export const SUPPORT_BACKEND_GATES: SupportBackendGateState = {
  liveConversationBackend: false,
  liveAgentMessaging: false,
  livePushNotifications: false,
  liveAiProvider: false,
};

export type SupportBackendGate = keyof SupportBackendGateState;

export function isSupportBackendGateEnabled(gate: SupportBackendGate) {
  return SUPPORT_BACKEND_GATES[gate];
}

export function assertSupportBackendDisabledInFoundation() {
  const enabled = Object.entries(SUPPORT_BACKEND_GATES).filter(([, value]) => value);
  if (enabled.length > 0) {
    throw new Error(`LLF support backend foundation must remain fail-closed. Enabled gates: ${enabled.map(([key]) => key).join(', ')}`);
  }
}
