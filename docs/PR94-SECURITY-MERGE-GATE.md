# PR #94 — Security and Merge Gate

Date: 2026-08-21
Branch: `feature/synthetic-realtime-console`
Base: `main` at `9367356`
Scope: authenticated, trusted-device, synthetic-only Agent Console QA.

## Verified locally

- TypeScript typecheck passes.
- Production Vite build passes.
- Agent operations validate the Supabase bearer token server-side.
- An active `llf_agent_profiles` record is required.
- Mutating and synthetic-list actions require a `TRUSTED` device hash.
- Conversation queries and mutations require `is_synthetic = true`.
- Claim uses an atomic status/owner guard.
- Message sending returns `messaging_capability_blocked`.
- The UI keeps reply and return-to-AI controls disabled.
- Private Realtime publishes only a fixed refresh signal; conversation content is fetched again through the protected Edge Function.
- CORS is restricted to `https://localleadforge.com` and `https://www.localleadforge.com`.
- Audit metadata includes the trusted device for protected actions.
- The capability registry remains gated pending two-device QA.

## Required before merge

1. Apply `backend/012_synthetic_realtime_console.sql` to the intended Supabase project.
2. Deploy the updated `llf-agent-ops` Edge Function.
3. Confirm the production Agent Console is served from an allowed origin.
4. Verify Maria's trusted iPhone can:
   - authenticate;
   - load only the two `[QA]` conversations;
   - change availability;
   - claim one synthetic conversation;
   - resolve the conversation;
   - receive a private Realtime refresh.
5. Verify an untrusted second browser/device receives `trusted_device_required` for protected actions.
6. Verify a request with `send_message` receives `messaging_capability_blocked`.
7. Verify a real/non-synthetic conversation ID cannot be listed, claimed, resolved, or otherwise modified through this QA path.
8. Inspect `llf_agent_audit_log`, `llf_device_security_events`, and `llf_interaction_ledger` for the expected entries.
9. Confirm all required GitHub checks pass on the PR head.

## Merge decision

**HOLD — not ready to merge yet.** The static controls and local build are satisfactory, but database migration, Edge Function deployment, negative authorization tests, two-device behavior, and hosted CI must be verified first.

## Production activation decision

Even after merge, keep live messaging and `REALTIME_CONVERSATIONS` capability disabled until a separate production-readiness gate explicitly authorizes customer traffic and outbound messages.
