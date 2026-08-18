# Stage 7 Post-Merge Audit

Date: 2026-08-18

## Verified in repository

- Stage 7 conversion UI is merged to `main`.
- Stage 7 conversion contract CI is merged to `main`.
- Stage 7 production smoke workflow is merged to `main`.
- Production smoke checks each configured prospect route for company identity, `noindex`, the English and Spanish Stage 7 explainer strings, and the `llf-process` marker.

## Operational rule

Repository readiness does not authorize outreach. Commercial email and physical mail remain separate authorization gates.

## CRM reconciliation required

Any CRM note that still says `Stage 7 PR #49 QA pending` or `NEEDS FIX — STAGE 7` is stale after the Stage 7 merge/CI work and must be reconciled against the current production evidence. Do not convert stale notes into permission to contact a prospect.

## Remaining evidence gate

Treat the live route as Stage 7 verified only when the post-deploy smoke has successful evidence for that route. If workflow evidence is unavailable, retain a conservative `verification pending` state rather than assuming success.
