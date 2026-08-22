import { IP01_SYNTHETIC_DATASET } from "./internal-pilot";
import { admitPilotScenario, createPilotRunState, recordPilotObservation } from "./internal-pilot-runner";

const initial = createPilotRunState();
const admitted = admitPilotScenario(IP01_SYNTHETIC_DATASET[0], initial);
if (!admitted.allowed) throw new Error("synthetic scenario should be admitted");

const safe = recordPilotObservation(initial, { estimatedCostUsd: 0.001, customerRecordsUsed: 0, externalActionsAttempted: 0, criticalAlerts: 0 });
if (safe.stopped) throw new Error("safe observation should not stop pilot");

const customerData = recordPilotObservation(initial, { estimatedCostUsd: 0, customerRecordsUsed: 1, externalActionsAttempted: 0, criticalAlerts: 0 });
if (!customerData.stopped || customerData.stopReason !== "CUSTOMER_DATA_DETECTED") throw new Error("customer data must stop pilot");

const action = recordPilotObservation(initial, { estimatedCostUsd: 0, customerRecordsUsed: 0, externalActionsAttempted: 1, criticalAlerts: 0 });
if (!action.stopped || action.stopReason !== "EXTERNAL_ACTION_ATTEMPTED") throw new Error("external action must stop pilot");

const expensive = recordPilotObservation(initial, { estimatedCostUsd: 0.011, customerRecordsUsed: 0, externalActionsAttempted: 0, criticalAlerts: 0 });
if (!expensive.stopped || expensive.stopReason !== "PER_REQUEST_BUDGET_BREACH") throw new Error("request budget breach must stop pilot");

const alert = recordPilotObservation(initial, { estimatedCostUsd: 0, customerRecordsUsed: 0, externalActionsAttempted: 0, criticalAlerts: 1 });
if (!alert.stopped || alert.stopReason !== "CRITICAL_ALERT") throw new Error("critical alert must stop pilot");
