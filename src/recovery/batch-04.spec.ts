import { buildLeadState } from "../crm/crm-state";
import { evaluateMissedCallRecovery } from "./missed-call-recovery";
import { evaluateFollowUp } from "./follow-up-eligibility";
import { evaluateDuplicateContact } from "./duplicate-contact-guard";
import { buildRecoveryQueueItem } from "./recovery-queue";
import { createRecoveryAuditRecord } from "./recovery-audit";
import { detectAppointmentRisk } from "./appointment-risk";
import { SYNTHETIC_RECOVERY_CASES } from "./synthetic-recovery-cases";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function assertThrows(fn: () => unknown, messagePart: string) {
  try {
    fn();
  } catch (error) {
    if (error instanceof Error && error.message.includes(messagePart)) return;
    throw error;
  }
  throw new Error(`Expected error containing: ${messagePart}`);
}

const leadState = buildLeadState({ leadId: "lead-1", stage: "NEW", updatedAt: "2026-08-21T18:00:00Z" });
assert(leadState.externalMutationAuthorized === false, "internal CRM state must never authorize external mutation");

const missedDnc = evaluateMissedCallRecovery({ missed: true, knownCaller: true, consentKnown: true, doNotContact: true, resolved: false });
assert(!missedDnc.eligible && missedDnc.communicationAuthorized === false, "DNC must block missed-call recovery");
const missedUnknownConsent = evaluateMissedCallRecovery({ missed: true, knownCaller: true, consentKnown: false, doNotContact: false, resolved: false });
assert(!missedUnknownConsent.eligible, "unknown consent must block missed-call recovery");
const missedEligible = evaluateMissedCallRecovery({ missed: true, knownCaller: true, consentKnown: true, doNotContact: false, resolved: false });
assert(missedEligible.eligible && missedEligible.communicationAuthorized === false, "eligible missed-call recovery remains advisory only");

const followUpComplaint = evaluateFollowUp({ stage: "QUALIFIED", lastContactHours: 12, consentKnown: true, doNotContact: false, openComplaint: true });
assert(!followUpComplaint.eligible, "open complaint must block follow-up");
const followUpRecent = evaluateFollowUp({ stage: "QUALIFIED", lastContactHours: 1, consentKnown: true, doNotContact: false, openComplaint: false });
assert(!followUpRecent.eligible, "recent contact must suppress duplicate follow-up");
const followUpEligible = evaluateFollowUp({ stage: "QUALIFIED", lastContactHours: 12, consentKnown: true, doNotContact: false, openComplaint: false });
assert(followUpEligible.eligible && followUpEligible.communicationAuthorized === false, "follow-up eligibility must not authorize communication");

const duplicateReached = evaluateDuplicateContact({ lastAttemptMinutes: 240, lastOutcome: "CONNECTED", minimumGapMinutes: 60 });
assert(duplicateReached.blocked, "already-connected leads must block duplicate recovery contact");
const duplicateTooSoon = evaluateDuplicateContact({ lastAttemptMinutes: 15, lastOutcome: "NO_ANSWER", minimumGapMinutes: 60 });
assert(duplicateTooSoon.blocked, "minimum contact gap must be enforced");
const duplicateSafe = evaluateDuplicateContact({ lastAttemptMinutes: 120, lastOutcome: "NO_ANSWER", minimumGapMinutes: 60 });
assert(!duplicateSafe.blocked, "contact may become eligible after the minimum gap, subject to separate approval gates");

const queueItem = buildRecoveryQueueItem({ leadId: "lead-2", reason: "NO_RESPONSE", priority: "P1", recommendedAction: "Human review" });
assert(queueItem.externalActionAuthorized === false, "recovery queue recommendations must remain internal");

assertThrows(
  () => createRecoveryAuditRecord({
    eventId: "evt-1",
    leadId: "lead-2",
    timestamp: "2026-08-21T18:00:00Z",
    actor: "AI",
    action: "send sms",
    reason: "synthetic test",
    externalAction: true,
  }),
  "requires recorded approval",
);
const approvedAudit = createRecoveryAuditRecord({
  eventId: "evt-2",
  leadId: "lead-2",
  timestamp: "2026-08-21T18:00:00Z",
  actor: "HUMAN",
  action: "record approved recovery handoff",
  reason: "human approved",
  externalAction: true,
  approvedBy: "human-owner",
});
assert(Object.isFrozen(approvedAudit), "recovery audit record must be immutable after creation");

const risk = detectAppointmentRisk({ confirmed: false, hoursUntilAppointment: 12, noResponseAfterBooking: true, rescheduleRequested: false, missingContactMethod: false });
assert(risk.atRisk && risk.score >= 40, "unconfirmed near-term appointments should surface as at-risk");
assert(risk.externalActionAuthorized === false, "appointment-risk detection must remain advisory");

assert(SYNTHETIC_RECOVERY_CASES.some((item) => item.expectedEligible), "synthetic recovery pack must include eligible cases");
assert(SYNTHETIC_RECOVERY_CASES.some((item) => !item.expectedEligible), "synthetic recovery pack must include blocking cases");
assert(SYNTHETIC_RECOVERY_CASES.every((item) => item.expectedExternalActionAuthorized === false), "synthetic recovery pack must keep external actions disabled");
