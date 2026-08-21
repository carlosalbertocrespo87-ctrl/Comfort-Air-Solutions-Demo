# HVAC Competitive Batch 04 — CRM Intelligence + Recovery

Status: DONE WITH EVIDENCE — 20/20 internal items implemented
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
13. Advisory recovery-reason scoring.
14. Lead-leakage summary.
15. Owner Recovery Report builder.
16. Reactivation-candidate handoff.
17. Appointment-risk detector.
18. Append-only recovery audit record model.
19. Synthetic recovery scenarios.
20. Batch closure evidence and release posture documented.

## Guardrails
- External CRM writes: OFF.
- SMS/email/call execution: OFF.
- Recovery communications: NOT authorized.
- Revenue/opportunity estimates are not guarantees.
- Do-not-contact, consent, complaint and duplicate-contact guards fail closed.
- Reactivation is review-only and requires human approval.
- External recovery audit records require recorded approval.
- Human/release approval remains required before any external action.

## Deferred / outside this batch
- Real CRM mutations and provider adapters.
- Real SMS, email or call recovery.
- Live missed-call response execution.
- Paid enrichment or third-party messaging spend.
- Any autonomous pricing, payment, contract, credential or destructive action.

## Closure
Batch 04 is complete for the internal $0 scope. External/live execution remains intentionally gated until credentials, privacy, cost, consent, tenant isolation, QA and explicit release criteria are satisfied.
