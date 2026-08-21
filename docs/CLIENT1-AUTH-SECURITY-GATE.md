# Client #1 Authenticated Security Gate

Status: FAIL-CLOSED / NOT RELEASED

## Purpose
Define the verification gate that must pass before Local Lead Forge enables real conversation persistence, Realtime delivery, customer messaging, or push transport for the Client #1 Agent Console.

## Current blocker
Cross-account authorization cannot be considered verified until at least two separate authenticated test identities exist. One identity is insufficient to prove tenant/agent isolation.

## Required identities
- Carlos test identity: separate Supabase Auth user.
- María test identity: separate Supabase Auth user.
- Never share credentials or reuse one session to represent both users.

## Required negative tests
1. Unauthenticated session cannot read or mutate protected conversation data.
2. Carlos cannot read conversations outside his authorized scope.
3. María cannot read conversations outside her authorized scope.
4. Carlos cannot mutate María-only assignment/presence state unless explicitly authorized by policy.
5. María cannot mutate Carlos-only assignment/presence state unless explicitly authorized by policy.
6. Neither identity can spoof another user's actor/owner identifier through client-supplied fields.
7. Direct REST/database requests are denied by RLS when UI controls are bypassed.
8. Realtime subscriptions do not leak rows/events outside the authenticated user's authorized scope.
9. Conversation message inserts require an authenticated, authorized actor and valid conversation membership/scope.
10. Push-device registration cannot be created, read, reassigned, or removed across identities without authorization.

## Positive controls
After every negative test above is proven denied, verify each identity can perform only the minimum intended operations inside its own authorized scope.

## Release criteria
All required tests must have reproducible evidence against the deployed authenticated backend. Frontend hiding/disabled controls do not count as authorization evidence. Any unexpected allow is a release-blocking failure.

## Additional Auth hardening
Supabase Leaked Password Protection should be enabled and re-checked before Auth is considered hardened. This is configuration hardening only; it does not replace RLS tests.

## Fail-closed rules until verified
- Real customer messaging: OFF.
- Realtime operational release: OFF.
- Real conversation persistence from customer traffic: OFF.
- Push transport/delivery: OFF.
- Live checkout/onboarding: OFF.
- `LEGAL_RELEASED`: unchanged / not enabled.
- No outreach or prospect/client contact.

## Evidence record
For each test capture: test identity, operation attempted, expected result, actual result, timestamp/environment, and policy/function involved. Do not record passwords, tokens, service-role keys, or other secrets.
