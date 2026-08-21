# LLF — Revenue Operations / Client #1 Readiness

Status: INTERNAL / PRE-LAUNCH

## Objective
Move LLF from build readiness to a controlled, repeatable path for acquiring Client #1 without allowing sales to outrun delivery readiness.

## Non-negotiable gates
- No outreach unless outreach release gate is explicitly GO.
- No real charge unless payment/legal gates are explicitly GO.
- No live messaging/push unless its release gate is explicitly GO.
- PR #94 physical PC ↔ iPhone QA remains mandatory before realtime release.
- Customer #1 Post-Payment Experience must PASS before treating delivery as launch-ready.

## Revenue lifecycle
TARGET -> QUALIFIED -> DEMO_READY -> CONTACT_AUTHORIZED -> CONTACTED -> REPLIED -> DISCOVERY -> PROPOSAL -> VERBAL_YES -> PAYMENT_PENDING -> PAID_VERIFIED -> HANDOFF_READY -> DELIVERY

## Command Center minimum fields
prospect_id, company, fit_tier, evidence_refs, stage, owner, next_action, due_at, last_touch_at, demo_url, contact_authorization, payment_gate, delivery_gate, exception_status.

## Stage invariants
Every non-terminal opportunity requires exactly one owner and one next action with due time or explicit HOLD dependency.
CONTACTED requires contact authorization evidence.
PAID_VERIFIED requires authoritative payment evidence.
HANDOFF_READY requires payment/legal verification plus delivery readiness.
DELIVERY may not start from an unverified payment event.

## Needs Attention
Surface: overdue next action; reply without owner; proposal stalled; payment exception; delivery gate mismatch; RED client/delivery condition; open P1; stale P2; unresolved launch dependency.

## First-customer release decision
GO requires: offer/price current; prospect evidence valid; demo QA; reply handling ready; sales-to-delivery handoff ready; post-payment experience PASS; legal/payment gates GO; rollback/audit evidence; no unresolved P1.

Anything missing => NO-GO or HOLD, never inferred approval.
