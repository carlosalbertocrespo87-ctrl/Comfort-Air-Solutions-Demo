import { IP01_LIMITS, type InternalPilotScenario } from "./internal-pilot";

export type PilotRunState = {
  requests: number;
  spentUsd: number;
  criticalAlerts: number;
  stopped: boolean;
  stopReason?: string;
};

export type PilotRequestObservation = {
  estimatedCostUsd: number;
  customerRecordsUsed: number;
  externalActionsAttempted: number;
  criticalAlerts: number;
};

export function createPilotRunState(): PilotRunState {
  return { requests: 0, spentUsd: 0, criticalAlerts: 0, stopped: false };
}

export function admitPilotScenario(scenario: InternalPilotScenario, state: PilotRunState): { allowed: boolean; reason: string } {
  if (state.stopped) return { allowed: false, reason: state.stopReason ?? "PILOT_STOPPED" };
  if (!scenario.input.toLowerCase().includes("synthetic") && !scenario.input.toLowerCase().includes("sintético")) {
    return { allowed: false, reason: "SYNTHETIC_DATASET_MARKER_REQUIRED" };
  }
  if (state.requests >= IP01_LIMITS.maxRequests) return { allowed: false, reason: "REQUEST_LIMIT_REACHED" };
  return { allowed: true, reason: "PILOT_SCENARIO_ADMITTED" };
}

export function recordPilotObservation(state: PilotRunState, observation: PilotRequestObservation): PilotRunState {
  const next: PilotRunState = {
    ...state,
    requests: state.requests + 1,
    spentUsd: Number((state.spentUsd + observation.estimatedCostUsd).toFixed(6)),
    criticalAlerts: state.criticalAlerts + observation.criticalAlerts,
  };

  if (observation.customerRecordsUsed > IP01_LIMITS.maxCustomerRecords) return { ...next, stopped: true, stopReason: "CUSTOMER_DATA_DETECTED" };
  if (observation.externalActionsAttempted > IP01_LIMITS.maxExternalActions) return { ...next, stopped: true, stopReason: "EXTERNAL_ACTION_ATTEMPTED" };
  if (observation.estimatedCostUsd > IP01_LIMITS.maxPerRequestCostUsd) return { ...next, stopped: true, stopReason: "PER_REQUEST_BUDGET_BREACH" };
  if (next.spentUsd > IP01_LIMITS.maxSessionCostUsd) return { ...next, stopped: true, stopReason: "SESSION_BUDGET_BREACH" };
  if (next.criticalAlerts > IP01_LIMITS.maxCriticalAlerts) return { ...next, stopped: true, stopReason: "CRITICAL_ALERT" };
  if (next.requests >= IP01_LIMITS.maxRequests) return { ...next, stopped: true, stopReason: "REQUEST_LIMIT_REACHED" };
  return next;
}
