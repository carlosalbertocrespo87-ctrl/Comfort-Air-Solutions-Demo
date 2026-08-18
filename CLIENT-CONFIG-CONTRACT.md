# Local Lead Forge — Client Configuration Contract

Purpose: translate approved onboarding intake into one reusable configuration object before implementation, so a client is configured from a controlled contract instead of ad-hoc edits.

## Source of truth
Use the approved onboarding submission plus client-approved factual corrections. Never infer or invent business facts.

## Required configuration domains
1. Business identity and contact.
2. Brand/message and approved/prohibited claims.
3. Services, exclusions, priorities and emergency definition.
4. Hours, service-area rules and EN/ES behavior.
5. AI assistant fields, allowed actions, escalation and guardrails.
6. Lead delivery destinations and payload fields.
7. FAQs, promotions and testimonials only when approved/verified.
8. Privacy authorization and prohibited sensitive information.
9. Deployment controls: test/live, noindex, payment/service-request safeguards.

## Stage 5 build sequence
1. Receive and validate onboarding intake.
2. Normalize data into `artifacts/prospect-configs/client-config.example.json` shape.
3. Mark every unverified field as unresolved; do not guess.
4. Apply configuration to the reusable master implementation.
5. Search for stale business names, phones, emails, domains and service areas.
6. Verify chatbot rules and lead-routing destinations.
7. Run typecheck/build and automated validation.
8. Run controlled test lead.
9. Move to Stage 6 QA only after zero critical configuration mismatches.

## Safety gates
- No passwords, API keys, bank data, SSNs, identity documents or recovery codes.
- No real payment activation during configuration rehearsal.
- Demo/prospect experiences remain noindex and must not present themselves as official sites.
- Never promise pricing, appointment times, technician availability, warranty coverage or financing unless explicitly integrated and approved.
- For sales demos, prospect phone numbers must not become actionable real-service CTAs.

## Current technical gap
The existing HVAC master centralizes only a small set of prospect identity fields. Stage 5 is complete only when operational fields such as services, hours, languages, FAQs, lead routing and assistant guardrails can also be applied through configuration rather than scattered hard-coded edits.

## Definition of done
A fictitious client intake can be normalized into configuration, applied to a fresh instance, built successfully, tested end-to-end and advanced to QA without rebuilding the implementation from scratch or inventing any business fact.
