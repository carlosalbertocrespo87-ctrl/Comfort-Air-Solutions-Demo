# Local Lead Forge — Phase 2 Exit Criteria

Status: INTERNAL / FAIL-CLOSED

Phase 2 = Client Portal + Agent Console + Knowledge Center MVP foundation.
Phase 2 is not complete merely because the UI builds. Every required item below must have evidence.

## A. Public prospect path
- Public visitor is classified as PROSPECT / PUBLIC_WEB.
- AI can operate in English or Spanish and preserve context when language changes.
- AI identifies itself as AI.
- Approved Knowledge Center sources only; stale/conflicting/unsupported content fails closed.
- Visible human-specialist path exists.
- Handoff preserves active language, conversation history, unresolved question and summary.
- Public visitor has no direct anonymous database access.

## B. Authenticated client path
- Client is authenticated and scoped to only their client account.
- Client cannot read another client account or internal agent/QA/security data.
- Client AI supports EN/ES and approved client-audience knowledge.
- Handoff enters the same authorized Agent Console inbox without losing context.

## C. Agent Console
- Separate authenticated agent identities.
- Available / Busy / Offline supported.
- Needs Me Now prioritization works.
- Atomic first-agent claim prevents double ownership.
- Agent can see source, audience, active language, summary, unresolved question and transcript.
- Private notes/transfers remain agent-only.
- Quality/audit history is reconstructable.

## D. Knowledge + quality
- Knowledge source provenance and audience are tracked.
- Knowledge Gap Auto-Queue is deduplicated and evidence based.
- Conversation Intelligence can aggregate topics/objections/intent/satisfaction.
- QA Score generates review evidence without penalizing correct escalation.
- Interaction Ledger supports incident reconstruction.
- No isolated conversation may silently change legal/pricing/security/public claims.

## E. Security gates
- Auth/RLS negative test matrix passes in authenticated backend environment.
- Agent impersonation attempts fail.
- Cross-client reads fail.
- Anonymous direct DB reads fail.
- Prompt-injection / hidden-instruction requests fail safely.
- Sensitive-data redaction/never-log tests pass.
- Knowledge conflict/freshness fail-closed tests pass.
- Device Trust required before push.
- No service-role secret exists in browser assets.
- Retention policy is explicitly configured before real data activation.

## F. Realtime + push
- Backend adapter implementation is authenticated and environment-specific.
- Conversation/message/status updates persist durably.
- Claim/status changes propagate realtime.
- Notification service worker has NO fetch cache of customer conversations.
- Push payload contains minimum context only.
- Notification deep-link requires authenticated Agent Console session.
- Push permission is requested only from an explicit user gesture on a trusted device.

## G. Capability orchestration
- Capability state transitions are auditable.
- Security BLOCKED state overrides feature readiness.
- Evidence-dependent features stay DORMANT/ADVISORY until thresholds are satisfied.
- Capability activation never implies permission for autonomous outbound/legal/pricing/security changes.

## H. Final evidence required
- Typecheck/build green.
- Protected repository gates green.
- EN prospect scenario pass.
- ES prospect scenario pass.
- EN client scenario pass.
- ES client scenario pass.
- Human request + claim scenario pass.
- Second-agent duplicate-claim scenario blocked.
- Negative authorization/security matrix pass.
- iPhone Home Screen PWA notification rehearsal pass after secure backend is available.
- Drive Source of Truth updated with final Phase 2 status.

## Phase 2 closure rule
Phase 2 may close when all code-only/foundation items are complete and all environment-dependent items have verified evidence. If a real provider/device prerequisite is unavailable, the item remains explicitly BLOCKED — never assumed complete.
