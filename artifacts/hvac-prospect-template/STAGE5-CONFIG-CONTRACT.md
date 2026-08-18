# Stage 5 — Repeatable Client Configuration Contract

Stage 5 converts structured onboarding/client data into a repeatable implementation configuration without rebuilding the system from scratch.

## Core identity fields
- companyName
- shortName
- website
- phoneDisplay
- serviceArea
- sinceYear / positioningLabel

## Intake v3 operational fields
When `schemaVersion` is `3`, the configuration must also provide:
- `primaryServices`
- `businessHours`
- `languages`
- `faqs`
- `leadRouting.primaryEmail`
- `guardrails`

These values are embedded into the configured master as `clientOperationalConfig` so the implementation has one canonical operational payload for later chatbot, FAQ, routing, and delivery wiring.

## Safety gates
A configured demo/client preview must fail validation when:
- required identity fields are missing;
- intake v3 operational fields are missing;
- generic template markers remain;
- fake review markers remain;
- noindex/robots protections are absent for a private sales demo;
- a prospect phone number is exposed as a clickable `tel:` action;
- required demo safety rules are disabled.

## Dry-run fixture
`artifacts/prospect-configs/llf-test-hvac.json` represents a complete schemaVersion 3 intake/configuration fixture. CI applies it to the master, validates the generated source, typechecks it, builds it, and runs static safety assertions.

## Exit criterion
Stage 5 is complete when the schemaVersion 3 dry-run passes CI and the configuration can be produced from the master without manual rebuilding or unsafe prospect actions.
