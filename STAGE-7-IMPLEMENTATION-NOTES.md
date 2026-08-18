# Stage 7 — Conversion Layer Implementation Notes

Status: IMPLEMENTED ON BRANCH — QA REQUIRED BEFORE MERGE

This branch implements the previously documented `DEMO-CONVERSION-LAYER-v1.md` contract in the reusable HVAC demo factory.

## Implemented
- EN/ES explanation layer injected by the reusable prospect-config build step.
- Explains what the system does, how it helps, and what happens after a prospect chooses to move forward.
- One final commercial CTA to Local Lead Forge.
- Existing interactive demo controls remain separate from the final commercial CTA.
- Legacy “Book Your Strategy Call” commercial CTAs are removed during generated prospect builds.
- Stage 7 regression validator checks required EN/ES copy, branding, CTA count and prospect-phone safety.
- Dedicated Stage 7 workflow builds and validates all five Batch #1 prospect configurations.

## Release gate
Do not merge until Stage 7 Conversion QA is green for ASAP, Wade, New Level, A.R. Sims and CoolPro and the PR diff has been reviewed for safety.

## Commercial gate
Merge does not authorize outreach, follow-ups, physical mail, payment activation or production-side irreversible actions.
