# HVAC Competitive Batch 09 — Sales Conversion + Outreach Readiness

Status: DONE WITH EVIDENCE — 20/20 internal items implemented
Cost target: $0
Branch: `feature/hvac-comp-batch-09-sales-readiness`
Base: `feature/hvac-comp-batch-08-local-visibility`

## Implemented
1. ICP-fit scoring.
2. Public/authorized contact-channel readiness.
3. Advisory prospect sales priority.
4. Evidence-backed sales-angle builder.
5. First-touch draft preparation.
6. Bilingual EN/ES draft preparation.
7. Sales-claim safety guard.
8. Personalization readiness gate.
9. Contact suppression / opt-out guard.
10. Human-review-only outreach cadence plan.
11. Reply-intent classifier.
12. Follow-up recommendation layer.
13. Meeting/discovery preparation brief.
14. Proposal readiness gate.
15. Direct-mail readiness gate.
16. Outreach experiment design with spend/execution OFF.
17. Sales funnel metrics snapshot.
18. Owner Sales Report.
19. Internal Sales Readiness Pipeline.
20. Synthetic EN/ES sales-readiness cases.

## Foundation reused
Batch 09 reuses evidence, demo readiness, opportunity prioritization, objection preparation, value hypotheses, local visibility evidence and existing revenue-ops safety concepts instead of duplicating those foundations.

## Guardrails
- All outreach remains unauthorized by default; drafts and cadences are preparation artifacts only.
- Opt-out, do-not-contact, wrong-party and unresolved-complaint signals fail closed.
- No automated email, SMS, calls, postal mail, CRM writes or external submissions are enabled.
- Sales claims require evidence and block guarantees, unsupported superlatives and invented outcomes.
- Proposal readiness does not authorize a proposal; commercial/legal release, approved price/scope and payment readiness remain separate gates.
- Direct mail remains blocked until address facts, approved LLF return address and budget are confirmed.
- No spend is authorized for outreach experiments.
- Payments, refunds, contracts, credentials, legal/security changes and destructive actions remain HUMAN_ONLY.

## Deferred / outside batch
Live prospect outreach, paid contact enrichment, mass email/SMS, automated calling, printing/postage spend, CRM provider mutation and credentialed browser submissions remain behind owner, legal/compliance, cost and release gates.

## Closure
Batch 09 is complete as a $0 internal sales-conversion and outreach-readiness foundation. It can prioritize, prepare, classify and report, but it cannot contact prospects or commit LLF externally. Review stacked dependencies in order before merge.
