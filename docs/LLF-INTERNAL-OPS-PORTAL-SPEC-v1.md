# Local Lead Forge — Internal Operations Portal v1

Status: PRE-LIVE SPEC / INTERNAL ONLY

## Purpose
Create one internal operator view for each paying LLF client without exposing operational data publicly. This portal should reduce context switching between Drive, lead tracking, QA, incidents, billing, and monthly reviews.

## Do not build as a public client portal yet
Client #1 has not provided real usage patterns. v1 is internal-first. Do not expose billing, leads, PII, incident details, Drive links, or internal notes on a public/demo route.

## Primary client card
For each client display:
- Client/company name
- Lifecycle: PAYMENT CONFIRMED / ONBOARDING / BUILD / QA / LIVE / AT RISK / OFFBOARDING
- LIVE gate: PASS / BLOCKED / PENDING
- Production URL
- Lead destination type (never secret credentials)
- Last verified end-to-end lead test timestamp
- Health Score: 0–100 and GREEN/YELLOW/RED/PENDING
- Open P1/P2/P3 incidents
- Billing: CURRENT / FAILED / RECOVERY / SERVICE REVIEW / CLOSED
- Day 7 / Day 14 / Day 30 review status
- Primary risk
- Next action
- Owner

## Required panels
1. Activation Gate
   - payment verified
   - onboarding sufficient
   - build/config complete
   - functional QA pass
   - safe test lead submitted
   - receipt at configured destination evidenced
   - activation timestamp

2. Lead Outcomes
   RECEIVED → CONTACTED → APPOINTMENT → WON / LOST / INVALID / NO RESPONSE.
   Never infer revenue or ROI.

3. Health & Retention
   - delivery reliability
   - response speed
   - technical health
   - client engagement
   - open incidents
   - billing status
   - risk flags

4. Incidents
   P1/P2/P3, opened time, impact, containment, root cause, fix, verification, client-notified state.

5. Billing & Renewal
   Show status and non-sensitive references only. Never store/display card numbers, CVV, bank credentials, API keys or authentication secrets.

6. Reviews
   Day 7, Day 14, Day 30, monthly review, next review date, testimonial/referral eligibility.

7. Audit Evidence
   Link to approved Drive evidence locations. Internal users only.

## Source-of-truth strategy
Until a secure backend is deliberately implemented, Google Drive/Sheets remain the operating source of truth. The portal must not create a second uncontrolled database.

Canonical operational source: `Local Lead Forge — Post-Sale Operations Control Center v1` plus the per-client `LLF — CLIENT WORKSPACE TEMPLATE` clone.

## Security requirements before implementation
- Authenticated internal route only.
- No public indexing.
- No secrets in source code or browser storage.
- Least-privilege access.
- Audit log for material changes.
- PII minimized.
- No destructive billing actions from v1.
- No automatic client communications from v1.

## v1 Definition of Done
- Internal-only authenticated shell exists.
- One client overview can be rendered from safe non-production/sample data.
- Activation gate, Health, Leads, Incidents, Billing, Reviews and Next Action are visible.
- No secrets/PII leak in repository, logs or public bundle.
- Build/typecheck/QA green.
- Production remains unchanged until reviewed.

## Stop condition
Do not overbuild. After the internal shell is proven, wait for Client #1 usage before deciding whether to build a client-facing portal or additional automation.
