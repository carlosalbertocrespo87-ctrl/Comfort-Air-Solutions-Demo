export type InternalPilotScenario = {
  id: string;
  locale: "en" | "es";
  input: string;
  expectedUrgency: "emergency" | "today" | "soon" | "routine" | "unknown";
};

export const IP01_SYNTHETIC_DATASET: InternalPilotScenario[] = [
  { id: "ip-en-1", locale: "en", input: "Synthetic: AC stopped cooling today, no smoke or burning smell.", expectedUrgency: "today" },
  { id: "ip-en-2", locale: "en", input: "Synthetic: burning smell from HVAC and system shut down.", expectedUrgency: "emergency" },
  { id: "ip-en-3", locale: "en", input: "Synthetic: customer wants seasonal maintenance next month.", expectedUrgency: "routine" },
  { id: "ip-es-1", locale: "es", input: "Sintético: el aire no enfría desde hoy, sin humo ni olor a quemado.", expectedUrgency: "today" },
  { id: "ip-es-2", locale: "es", input: "Sintético: hay olor a quemado y el sistema se apagó.", expectedUrgency: "emergency" },
  { id: "ip-es-3", locale: "es", input: "Sintético: quiere mantenimiento preventivo el próximo mes.", expectedUrgency: "routine" },
];

export type InternalPilotLimits = {
  maxRequests: number;
  maxSessionCostUsd: number;
  maxPerRequestCostUsd: number;
  maxCriticalAlerts: number;
  maxCustomerRecords: 0;
  maxExternalActions: 0;
};

export const IP01_LIMITS: InternalPilotLimits = {
  maxRequests: 20,
  maxSessionCostUsd: 0.05,
  maxPerRequestCostUsd: 0.01,
  maxCriticalAlerts: 0,
  maxCustomerRecords: 0,
  maxExternalActions: 0,
};

export type InternalPilotEvidence = {
  pa04LiveSyntheticPassed: boolean;
  pa09InternalReadinessPassed: boolean;
  killSwitchVerified: boolean;
  datasetSyntheticOnly: boolean;
  noCustomerData: boolean;
  noExternalActions: boolean;
  budgetWithinLimits: boolean;
  zeroCriticalAlerts: boolean;
  bilingualAccuracyPassed: boolean;
};

export function evaluateInternalPilotStart(evidence: InternalPilotEvidence) {
  const blockers = Object.entries(evidence).filter(([, ok]) => ok !== true).map(([name]) => name);
  return {
    authorized: blockers.length === 0,
    blockers,
    trafficClass: "synthetic" as const,
    customerTrafficAuthorized: false as const,
  };
}
