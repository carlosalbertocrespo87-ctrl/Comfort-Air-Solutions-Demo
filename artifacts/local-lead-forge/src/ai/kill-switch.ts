import type { AIProviderId } from "./contracts";

export type KillSwitchState = {
  globalDisabled: boolean;
  disabledProviders: AIProviderId[];
  disabledTenants: string[];
  reason?: string;
  changedBy?: string;
  changedAt?: string;
};

export const DEFAULT_KILL_SWITCH_STATE: KillSwitchState = {
  globalDisabled: false,
  disabledProviders: [],
  disabledTenants: [],
};

export type KillSwitchDecision = { allowed: boolean; reason: string };

export function evaluateKillSwitch(provider: AIProviderId, tenantId: string, state: KillSwitchState): KillSwitchDecision {
  if (state.globalDisabled) return { allowed: false, reason: "GLOBAL_KILL_SWITCH" };
  if (state.disabledProviders.includes(provider)) return { allowed: false, reason: "PROVIDER_KILL_SWITCH" };
  if (state.disabledTenants.includes(tenantId)) return { allowed: false, reason: "TENANT_KILL_SWITCH" };
  return { allowed: true, reason: "KILL_SWITCH_CLEAR" };
}

export function engageGlobalKillSwitch(reason: string, changedBy = "human"): KillSwitchState {
  return {
    globalDisabled: true,
    disabledProviders: [],
    disabledTenants: [],
    reason,
    changedBy,
    changedAt: new Date().toISOString(),
  };
}

export function rollbackToSafeDefault(): KillSwitchState {
  return {
    globalDisabled: true,
    disabledProviders: [],
    disabledTenants: [],
    reason: "ROLLBACK_TO_SAFE_DEFAULT",
    changedBy: "system",
    changedAt: new Date().toISOString(),
  };
}
