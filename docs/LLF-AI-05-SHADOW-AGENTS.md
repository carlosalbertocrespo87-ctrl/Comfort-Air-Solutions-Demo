# LLF AI-05 — Lead Agent + QA Agent Shadow Mode

Status: COMPLETE in feature branch; production activation NOT authorized.

## Delivered
- `LeadShadowAgent` for lead classification/recommendation only.
- `QAShadowAgent` for artifact review/recommendation only.
- Both run at autonomy level L0 / SHADOW.
- `externalActionsAllowed` is hard-coded false.
- `recommendationOnly` is hard-coded true.
- Tenant and correlation identifiers are propagated into every observation/result.
- Agent metadata is attached to routed AI requests for auditability.
- Contract checks confirm both agents remain L0 and cannot claim external-action permission.

## Lead Agent scope
May classify and recommend based on synthetic/internal lead text. Intended output includes urgency, serviceability, lead tier, summary, next-step recommendation and human-review flag.

## QA Agent scope
May inspect synthetic/internal artifact text and recommend fixes. Intended output includes pass/fail suggestion, severity, findings, fixes and human-review flag.

## Explicitly prohibited
- sending email/SMS
- making or routing calls
- modifying CRM/customer records
- changing prices, payments, legal state, credentials or permissions
- production voice
- any autonomous external action

## Release rule
Promotion beyond L0 requires separate evaluation evidence, permission policy review, tenant-isolation QA, tool-registry enforcement and explicit release approval.
