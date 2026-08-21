# LLF Client Operations — Data & Gate Contract

Internal synthetic specification.

## Lifecycle transition matrix

| From | To | Minimum evidence |
|---|---|---|
| PAID_PENDING_VERIFICATION | READY_FOR_ONBOARDING | authoritative entitlement + legal acceptance |
| READY_FOR_ONBOARDING | ONBOARDING | owner assigned + onboarding record |
| ONBOARDING | SETUP | required intake complete |
| SETUP | QA | non-live configuration complete |
| QA | READY_TO_ACTIVATE | QA PASS + no P1 + rollback evidence |
| READY_TO_ACTIVATE | ACTIVE | explicit activation approval + all release gates |
| ACTIVE | AT_RISK | health rule or material exception |
| ACTIVE/AT_RISK | PAUSED | authorized operational decision |
| PAUSED | ACTIVE | recovery evidence + approval |
| any eligible state | OFFBOARDED | authorized offboarding workflow |

Forbidden: skipping directly from payment to ACTIVE.

## Next-action invariant
Every non-terminal client record must have exactly one accountable owner, one next action, and a due timestamp or an explicit HOLD dependency.

## Needs Attention rules
Surface a client when any condition is true:
- health_status = RED
- open P1
- stale P2 beyond target window
- onboarding/setup/QA task overdue
- missing required evidence
- payment entitlement exception
- activation gate mismatch
- unresolved Block Queue dependency

## ROI contract
Report only attributable, evidence-backed values:
- leads captured
- qualified leads
- appointments attributable to LLF
- won jobs attributable to LLF
- attributable revenue when supplied/verified by client
- LLF fees
- ROI = (attributable revenue - LLF fees) / LLF fees

Never invent job value or revenue. Unknown stays UNKNOWN.

## Audit events
Record actor, timestamp, client_id, action, previous state, new state, evidence reference and reason for privileged lifecycle/support changes.

## Mobile operation
Mobile view prioritizes Needs Attention, P1/P2, next action, due time, lifecycle state and quick evidence capture. Destructive or live activation actions require explicit confirmation and authorization.

## Escalation
P1 → immediate internal attention and owner assignment.
P2 → tracked owner + due time; escalate if stale.
P3 → normal queue.
RED health → cannot be hidden by a GREEN aggregate metric.

## Release boundary
This contract defines behavior only. It does not authorize real outreach, charging, live messaging, push, customer activation or bypass of legal/payment gates.
