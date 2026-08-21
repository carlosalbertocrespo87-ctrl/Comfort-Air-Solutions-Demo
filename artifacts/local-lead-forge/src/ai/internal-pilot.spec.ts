import { evaluateInternalPilotStart, IP01_LIMITS, IP01_SYNTHETIC_DATASET } from "./internal-pilot";

const blocked = evaluateInternalPilotStart({
  pa04LiveSyntheticPassed: false,
  pa09InternalReadinessPassed: false,
  killSwitchVerified: true,
  datasetSyntheticOnly: true,
  noCustomerData: true,
  noExternalActions: true,
  budgetWithinLimits: true,
  zeroCriticalAlerts: true,
  bilingualAccuracyPassed: true,
});
if (blocked.authorized) throw new Error("pilot must remain blocked before PA-04/PA-09 pass");
if (!blocked.blockers.includes("pa04LiveSyntheticPassed")) throw new Error("PA-04 blocker must be explicit");
if (blocked.customerTrafficAuthorized) throw new Error("IP-01 must never authorize customer traffic");
if (IP01_LIMITS.maxCustomerRecords !== 0 || IP01_LIMITS.maxExternalActions !== 0) throw new Error("pilot must use zero customer records/actions");
if (IP01_SYNTHETIC_DATASET.length < 6) throw new Error("bilingual synthetic pilot dataset required");
