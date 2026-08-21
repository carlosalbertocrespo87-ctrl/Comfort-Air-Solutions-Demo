# Local Lead Forge — Agent Console Static QA Result

Date: 2026-08-21
Branch: `feature/synthetic-realtime-console-v2`
Replacement PR: **#148**
Release posture: **HOLD / SYNTHETIC ONLY**

## Port checkpoint

The clean current-main port commit `e998a97211561f39fa90917ad432854c30e91ee5` completed hosted `Agent Console Security Gate` run **#18** successfully.

That job passed:

- static fail-closed Agent Console assertions;
- TypeScript typecheck;
- production application build.

This checkpoint proves the original #94 safety surface survived the clean port to current `main`. Any later commit must obtain a fresh hosted PASS before review or merge.

## Current static assertions

The replacement gate verifies that:

1. production origins are explicitly allowlisted;
2. the current PR #148 preview origin is prepared in source control;
3. CORS wildcard remains absent;
4. an active agent profile is required;
5. a trusted device is required for protected actions;
6. synthetic conversation listing is filtered by `is_synthetic = true`;
7. protected mutations retain synthetic-only filtering;
8. outbound agent messaging fails closed;
9. Realtime uses a private broadcast-only topic;
10. Realtime payload is a fixed refresh signal, not conversation content;
11. Realtime capability remains gated pending two-device QA;
12. reply UI remains disabled;
13. Return-to-AI UI remains disabled;
14. live notification transport remains disabled;
15. María's protocol points to replacement PR #148;
16. physical QA remains explicitly `PENDING_PHYSICAL`;
17. the merge gate remains `HOLD` pending QA físico;
18. the runbook distinguishes source preparation from a production deployment authorization.

## Runtime/source distinction

Fresh platform evidence established that Supabase `llf-agent-ops` v11 is ACTIVE with the hardened behavior from the original QA implementation. The currently deployed v11 runtime allowlists production + the legacy PR #94 preview origin. PR #148 source additionally prepares the replacement preview origin, but **that source change is not deployed by this PR**.

Therefore a physical QA session against the PR #148 preview remains blocked until the necessary preview callback/CORS runtime access is explicitly authorized and applied through the production-change process.

## Physical evidence still required

Automated PASS cannot replace the real PC ↔ iPhone evidence. Before release review, verify at minimum:

- authenticated Carlos PC and María iPhone on the same protected PR #148 preview;
- trusted-device enforcement;
- only `[QA]` synthetic conversations visible;
- simultaneous claim produces exactly one owner;
- resolve converges on both devices;
- reply, Send and Return to AI stay blocked;
- no email/SMS/WhatsApp/push or other external delivery occurs;
- expected audit/security/interaction records exist.

Until that evidence exists, PR #148 remains `DRAFT / HOLD` and all real messaging/customer traffic capabilities remain blocked.
