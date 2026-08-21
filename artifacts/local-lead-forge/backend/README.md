# LLF Agent Backend Foundation

Status: INTERNAL / FAIL-CLOSED

This folder defines the backend contract for the Local Lead Forge shared support system.

## Goals
- Separate prospect and client conversations while using one LLF support brain.
- Require authenticated agent identities for Carlos and María.
- Persist conversations and messages server-side.
- Support realtime updates for web, portal, and Agent Console.
- Use atomic conversation claiming so only one agent can own a handoff at a time.
- Preserve an AI-generated handoff summary so users never need to repeat themselves.
- Prepare iPhone push notifications without enabling live transport prematurely.

## Security principles
- No service-role secret in browser code.
- Agents authenticate individually.
- Row-level security must deny access by default.
- Public visitors may only access their own conversation through scoped server-issued identifiers.
- Client portal access must be bound to the authenticated client account.
- Agent actions must be audited.
- Push notifications must contain minimal metadata and never sensitive conversation content by default.
- AI responses are generated server-side against approved LLF knowledge only.

## Release gates
The following remain disabled until a real backend environment, authentication, RLS, audit logging, realtime and security QA are completed:

- LIVE_CONVERSATION_BACKEND_ENABLED=false
- LIVE_AGENT_MESSAGING_ENABLED=false
- LIVE_PUSH_NOTIFICATIONS_ENABLED=false
- LIVE_AI_PROVIDER_ENABLED=false

Do not enable these gates from frontend code.