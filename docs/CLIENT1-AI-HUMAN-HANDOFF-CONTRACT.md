# Client #1 AI-to-Human Handoff Contract

Status: INTERNAL DESIGN / FAIL-CLOSED / NOT RELEASED

## Purpose
Define the minimum safe state machine and authorization boundaries for transferring a Client #1 conversation from AI handling to a human agent without enabling real customer messaging, live Realtime operations, or push delivery.

This contract is intentionally transport-agnostic. It may be implemented only after the authenticated security gate in `docs/CLIENT1-AUTH-SECURITY-GATE.md` passes with reproducible cross-account evidence.

## States
- `AI_ACTIVE` — AI may prepare internal draft/triage output only. No real customer transport is implied.
- `HANDOFF_REQUESTED` — a reason and timestamp exist; no human owner has been granted implicitly.
- `HUMAN_QUEUED` — conversation is eligible for an authorized agent to claim.
- `HUMAN_CLAIMED` — exactly one authorized active agent owns the handling lease.
- `HUMAN_ACTIVE` — owner is actively handling the conversation; real sending remains separately gated.
- `RESOLVED` — human handling is complete; conversation is closed from the active queue.
- `RETURN_TO_AI_PENDING` — optional future state requiring explicit authorized action and policy validation.

`RETURN_TO_AI_PENDING` MUST NOT automatically transition to `AI_ACTIVE` while customer messaging is release-gated.

## Allowed transition intent
1. `AI_ACTIVE -> HANDOFF_REQUESTED`: internal AI/rules engine may request handoff with a structured reason.
2. `HANDOFF_REQUESTED -> HUMAN_QUEUED`: backend validates conversation scope and records queue eligibility.
3. `HUMAN_QUEUED -> HUMAN_CLAIMED`: authenticated, authorized, active agent on a trusted device performs an atomic claim.
4. `HUMAN_CLAIMED -> HUMAN_ACTIVE`: only the current valid owner may begin handling.
5. `HUMAN_ACTIVE -> RESOLVED`: only the current valid owner or an explicitly privileged server-side role may resolve.
6. `HUMAN_ACTIVE -> RETURN_TO_AI_PENDING`: explicit owner action only; no automatic AI resumption.

All other transitions are deny-by-default unless later specified, reviewed, tested, and protected by backend authorization.

## Handoff reason envelope
Every request should use a bounded machine-readable reason plus optional internal context. Initial reasons:
- `CUSTOMER_REQUESTED_HUMAN`
- `LOW_CONFIDENCE`
- `SAFETY_OR_POLICY`
- `PRICING_OR_COMMITMENT`
- `SCHEDULING_EXCEPTION`
- `OUT_OF_SCOPE`
- `REPEATED_FAILURE`
- `MANUAL_OPERATOR_REQUEST`

Do not place secrets, auth tokens, payment credentials, or unnecessary sensitive data in the handoff reason/context.

## Ownership and race safety
- Claim MUST be atomic and server-authorized; UI state is not authoritative.
- A simultaneous Carlos/María claim race MUST yield at most one owner.
- Client-supplied `owner_id`, `actor_id`, role, or presence fields MUST NOT be trusted without server-side derivation/validation.
- An expired/revoked agent session or untrusted device MUST NOT claim, activate, resolve, or return a conversation to AI.
- Ownership changes require an auditable actor, timestamp, previous owner, next owner, and reason.

## Presence semantics
Presence is advisory UX, never authorization. `online`, `away`, or `offline` may help routing but cannot grant access. Authorization comes from authenticated identity, membership/capability policy, trusted-device state, and RLS/server checks.

## AI behavior after handoff
Once a handoff is requested, AI must stop autonomous customer-facing output for that conversation. It may continue safe internal work such as summarization, suggested replies, classification, or knowledge retrieval only when those operations do not send externally and remain within authorized data scope.

## Notification boundary
A handoff may create an internal notification intent/event. That event MUST NOT directly invoke APNs/Web Push/SMS/email. Push transport remains OFF until authenticated backend, device registration isolation, and push authorization tests pass.

## Persistence boundary
Handoff state must be persisted only through authenticated backend operations protected by RLS and/or server-side authorization. Local browser state may mirror status for UX but cannot establish ownership or permission.

## Audit fields
Minimum non-secret evidence for material transitions:
- conversation identifier
- transition from/to
- reason code
- authenticated actor identifier
- resulting owner identifier when applicable
- trusted-device decision/result
- server timestamp
- authorization result
- correlation/idempotency identifier

## Required tests before release
1. Unauthenticated handoff/claim/resolve attempts are denied.
2. Unauthorized cross-account transitions are denied.
3. Simultaneous Carlos/María claims produce one winner only.
4. Spoofed actor/owner fields cannot alter authorization outcome.
5. Untrusted device claim is denied.
6. Duplicate/idempotent transition requests do not create conflicting state.
7. Realtime cannot expose handoff events outside authorized scope.
8. Handoff never sends a real customer message or push notification while release gates are OFF.
9. Owner-only resolve and return-to-AI controls are enforced backend-side.
10. Audit evidence contains no secrets.

## Release gates
This design alone authorizes nothing. Before operational use:
- `docs/CLIENT1-AUTH-SECURITY-GATE.md` must pass.
- Cross-account RLS and Realtime isolation must be proven.
- Trusted-device enforcement must be proven.
- Conversation persistence authorization must be proven.
- Push registration isolation must be proven before any push transport.
- Real customer messaging requires its own explicit release decision.

## Fail-closed invariants
- Real customer messaging: OFF.
- Push transport/delivery: OFF.
- Realtime operational release: OFF until security evidence passes.
- Live checkout/onboarding: OFF.
- `LEGAL_RELEASED`: unchanged / not enabled.
- No outreach or prospect/client contact.
