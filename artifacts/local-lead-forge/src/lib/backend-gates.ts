export const SUPPORT_BACKEND_GATES = {
  liveConversationBackend: false,
  liveAgentMessaging: false,
  livePushNotifications: false,
  liveAiProvider: false,
} as const;

export type SupportBackendGate = keyof typeof SUPPORT_BACKEND_GATES;

export function isSupportBackendGateEnabled(gate: SupportBackendGate) {
  return SUPPORT_BACKEND_GATES[gate] === true;
}

export function assertSupportBackendDisabledInFoundation() {
  const enabled = Object.entries(SUPPORT_BACKEND_GATES).filter(([, value]) => value === true);
  if (enabled.length > 0) {
    throw new Error(`LLF support backend foundation must remain fail-closed. Enabled gates: ${enabled.map(([key]) => key).join(', ')}`);
  }
}
