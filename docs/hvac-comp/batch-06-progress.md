# HVAC Competitive Batch 06 — Governance + Integration Readiness

Status: DONE WITH EVIDENCE — 20/20 internal items implemented
Cost target: $0
Branch: `feature/hvac-comp-batch-06-governance-integrations`
Base: `feature/hvac-comp-batch-05-retention-analytics`

## Implemented
1. Tenant isolation contract.
2. L0/L1/L2/L3/HUMAN_ONLY permission regression matrix.
3. Audit-log completeness evaluator.
4. Unknown/non-allowlisted tool fail-closed guard.
5. Kill-switch drill evaluator.
6. Data-minimization evaluator.
7. Data-retention window resolver.
8. Consent/communication eligibility model.
9. Communication-window policy.
10. Integration adapter contract readiness gate.
11. ServiceTitan adapter backlog/spec.
12. Jobber adapter backlog/spec.
13. Housecall Pro adapter backlog/spec.
14. HubSpot adapter backlog/spec.
15. GoHighLevel adapter backlog/spec.
16. Territory/ZIP exclusivity experiment model.
17. Performance-guarantee evidence gate.
18. Supervised internal browser/research policy.
19. Multi-agent orchestration readiness gate.
20. Batch closure evidence and release posture.

## Guardrails
- Cross-tenant access fails closed.
- Unknown tools are denied by default.
- L0/L1 cannot send external communications.
- L2/L3 remain subject to explicit allowlists, consent, client policy, QA and release gates.
- Payments, refunds, contracts, legal/security/credential changes and destructive actions remain HUMAN_ONLY.
- Adapter specifications do not enable live provider writes and have no approved vendor spend.
- Territory exclusivity remains an internal experiment; no promise is authorized.
- Performance guarantees remain prohibited until historical evidence, economics, attribution and legal review exist.
- Browser/computer automation is limited to supervised public/internal research/QA; credentialed submissions, purchases and destructive actions remain blocked.
- Multi-agent orchestration is eligible only for shadow/internal use after individual-agent evals and governance controls pass; external orchestration remains unauthorized.

## Deferred / outside batch
Real ServiceTitan/Jobber/Housecall Pro/HubSpot/GoHighLevel adapters, paid vendor/API activation, autonomous browser/computer production actions, customer communications, real CRM writes, territory promises and performance guarantees remain behind demand, cost, credentials, consent/compliance, legal, QA and release gates.

## Closure
Batch 06 is complete as zero-cost governance and integration-readiness architecture. Review stacked dependencies in order before merge.
