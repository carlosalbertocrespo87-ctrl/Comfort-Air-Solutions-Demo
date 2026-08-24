> **HISTORICAL DEFECT / SUPERSEDED DECISION PATH — 24 Aug 2026.** This file records the physical iOS defect that led to PR #195. Subsequent PRs #198 and #199 changed the practical sign-in/device-security path, and Issue #210 now controls the pre-live persistent-session architecture. Do not schedule the exact “30-day bridge survives restart” retest below as a generic blocker until Issue #210 selects whether LLF will keep persistent browser tokens or move to the recommended ephemeral first-live session. The defect evidence remains useful history.

# PR #190 — iPhone PWA authentication bridge QA

Date: August 24, 2026

Physical observation: approximately 10:19 a.m. EDT

Operator: Carlos

Environment: internal QA only

## Observed defect

Carlos requested a valid passwordless sign-in from the installed `LLF Agent` Home Screen web app. Gmail opened the approved link in Safari. Safari authenticated Carlos and rendered the protected synthetic Agent Console, but the previously installed Home Screen app retained a separate unauthenticated session.

This was a real PWA handoff defect, not operator error. No customer, prospect, external messaging transport, payment flow, or production client data was involved.

## Corrective behavior

- The validated agent session persists inside the installed web app instead of being limited to `sessionStorage`.
- The passwordless callback creates a 30-day, same-site, secure, host-only installation bridge containing only the Supabase token pair and expiry.
- On iOS 17.2 or later, installing the authenticated page copies its login cookie into the new Home Screen web app.
- On first launch, the web app revalidates the agent identity with the backend and separately registers its own Device Trust identity.
- Expired access tokens rotate through the Supabase refresh-token flow; invalid or rejected sessions fail closed and clear local state.
- Existing Device Trust, authenticated-agent, synthetic-only, and no-outbound controls remain enforced.

## Required physical retest

1. Deploy the updated PR #190 preview.
2. Generate a fresh internal QA sign-in for Carlos.
3. Confirm Safari shows authenticated Carlos.
4. Remove the pre-fix `LLF Agent` Home Screen icon.
5. From the authenticated Safari page, add the page to the Home Screen again with `Open as Web App` enabled.
6. Open `LLF Agent` and confirm the protected route hydrates the authenticated Carlos session.
7. If Device Trust is pending, approve only the newly registered Carlos QA device and reopen the app.
8. Fully close and reopen the app; confirm it does not request another email link.

Status: `CORRECTION_IN_PR_195 — PENDING_EXACT_QA_BACKEND_ORIGIN_AND_PHYSICAL_RETEST`.
