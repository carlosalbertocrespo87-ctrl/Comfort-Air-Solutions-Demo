# LLF Auth + RLS Security Test Matrix

Status: INTERNAL / FAIL-CLOSED

This matrix defines the minimum authorization cases that must pass before any real customer conversation, realtime subscription, agent message, or iPhone push transport is enabled.

## Agent identity

| Scenario | Expected |
| --- | --- |
| Active Carlos agent reads shared agent inbox | ALLOW |
| Active María agent reads shared agent inbox | ALLOW |
| Inactive agent reads inbox | DENY |
| Carlos updates Carlos availability | ALLOW |
| Carlos attempts to update María profile/presence | DENY |
| María claims waiting conversation as María | ALLOW if still unclaimed |
| María sends Carlos user id into claim RPC | DENY: agent_identity_mismatch |
| Second agent attempts claim after first agent wins | DENY: conversation_not_claimable |
| Unauthenticated caller invokes claim RPC | DENY: authentication_required |

## Client isolation

| Scenario | Expected |
| --- | --- |
| Authenticated Client A reads own portal conversation | ALLOW |
| Client A reads Client B conversation | DENY |
| Client A reads public prospect conversation | DENY |
| Client A directly edits assignment/status/handoff fields | DENY |
| Client A directly inserts forged AGENT/AI message | DENY |
| Client A reads private agent note / audit / intelligence | DENY |

## Prospect isolation

| Scenario | Expected |
| --- | --- |
| Anonymous visitor directly queries conversations table | DENY |
| Prospect uses valid server-scoped token for own conversation via API | ALLOW through server endpoint only |
| Prospect token attempts another conversation id | DENY |
| Prospect directly reads team presence or push subscriptions | DENY |
| Prospect directly writes assignment/status | DENY |

## Push/device security

| Scenario | Expected |
| --- | --- |
| Carlos registers Carlos iPhone push subscription | ALLOW after authenticated backend activation |
| Carlos reads María device subscription | DENY |
| Client/prospect reads any agent push endpoint | DENY |
| Browser receives service-role key | FAIL RELEASE immediately |
| Lock-screen notification includes full sensitive transcript | FAIL RELEASE |

## Internal operations data

Conversation Intelligence, Knowledge Gap Queue, private notes, handoff facts and audit logs are LLF internal operations data. Clients and prospects must not receive direct access to these tables.

## Release rule

All cases above must be exercised against the deployment environment, including cross-account negative tests. Frontend hiding is not authorization. PostgreSQL RLS/server authorization is authoritative.
