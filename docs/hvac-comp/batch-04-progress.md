# HVAC Competitive Batch 04 — CRM Intelligence + Recovery

Status: IN PROGRESS — 12/20 internal items implemented
Cost target: $0
Branch: `feature/hvac-comp-batch-04-crm-recovery`
Base: `feature/hvac-comp-batch-03-prospect-demo`

## Implemented
1. Internal lead state model.
2. Advisory lead-priority scoring.
3. Missed-call recovery eligibility.
4. Follow-up eligibility guard.
5. Stale-lead detector.
6. Internal contact-attempt ledger.
7. Advisory recovery queue.
8. Normalized lost-reason taxonomy.
9. Owner action queue.
10. Internal SLA clock.
11. Duplicate-contact guard.
12. Recovery opportunity value estimate.

## Guardrails
- External CRM writes: OFF.
- SMS/email/call execution: OFF.
- Recovery communications: NOT authorized.
- Revenue estimates are not guarantees.
- Do-not-contact, consent, complaint and duplicate-contact guards fail closed.
- Human/release approval remains required before any external action.

## Remaining batch focus
- recovery reason scoring
- lead leakage summary
- owner recovery report
- reactivation candidate handoff
- appointment-risk detection
- recovery audit record
- synthetic recovery cases
- batch closure evidence
