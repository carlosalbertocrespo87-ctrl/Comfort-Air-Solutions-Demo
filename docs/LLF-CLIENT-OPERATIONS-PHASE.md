# Local Lead Forge — Client Operations Phase

Status: INTERNAL / SYNTHETIC ONLY

## Safety boundary
- No real outreach.
- No real customer charges.
- No real customer messaging or push.
- No production onboarding trigger.
- Synthetic fixtures only until release gates pass.
- PR #94 physical PC ↔ iPhone QA remains a separate mandatory release gate.

## Client lifecycle
1. PAID_PENDING_VERIFICATION
2. READY_FOR_ONBOARDING
3. ONBOARDING
4. SETUP
5. QA
6. READY_TO_ACTIVATE
7. ACTIVE
8. AT_RISK
9. PAUSED
10. OFFBOARDED

Transitions are fail-closed. ACTIVE requires explicit release evidence; payment state alone never activates a client.

## Command Center — minimum client record
- client_id
- business_name
- lifecycle_status
- payment_entitlement
- legal_acceptance_status
- onboarding_progress
- implementation_owner
- next_action
- next_action_due_at
- health_status
- support_priority
- last_customer_touch_at
- activation_gate
- evidence_refs

## First 24 hours checklist
- Verify payment entitlement evidence.
- Verify legal acceptance evidence.
- Create synthetic/internal client workspace.
- Collect onboarding requirements.
- Assign implementation owner.
- Establish next action and due time.
- Configure only non-live assets.
- Run QA checklist.
- Record blockers and evidence.
- Require explicit activation approval.

## Command Center views
- Needs Attention
- Onboarding
- Setup
- QA
- Ready to Activate
- Active
- At Risk
- Support Queue
- Blocked

## Health model
GREEN: delivery current, no material blocker.
YELLOW: dependency or SLA risk requiring attention.
RED: material delivery/customer risk requiring immediate owner action.
GRAY: intentionally paused/not applicable.

## Support priority
P1: service unusable/security/material customer impact.
P2: degraded operation or blocked workflow with workaround/limited scope.
P3: normal request, question, improvement or non-urgent defect.

## Dual chatbot routing
PROSPECT: qualification and lead capture only.
EXISTING_CLIENT: authenticate/identify client context before exposing account-specific information; support intake only until live messaging authorization exists.

## Synthetic Client #1 simulation
Required path:
entitlement evidence → legal evidence → onboarding → setup → QA → ready-to-activate → explicit approval → synthetic activation test → support/health monitoring.

The simulation must prove rollback, audit trail, next-action ownership and fail-closed behavior when evidence is missing.

## Definition of done for this phase
- Command Center data contract defined.
- Lifecycle transitions defined and guarded.
- Onboarding checklist and first-24h workflow defined.
- Prospect/client chatbot routing defined.
- Support priorities and health model defined.
- ROI/reporting contract defined.
- Mobile operation and escalation rules defined.
- Synthetic Client #1 passes end-to-end QA.
- Documentation reconciled with Source of Truth.
- No production/live capability is enabled by this phase alone.
