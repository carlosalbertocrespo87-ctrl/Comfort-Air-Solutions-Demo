# Local Lead Forge — Client #1 Knowledge + Support Contract

Status: INTERNAL ONLY / FAIL-CLOSED

## Purpose

Define the safe operating contract for the shared LLF Knowledge Center, client support UX, public prospect support UX, and AI-to-human handoff behavior before any real customer messaging is enabled.

This document does not activate backend transport, Realtime product traffic, push delivery, checkout/onboarding, AI provider traffic, or customer communications.

## 1. One governed knowledge brain, two audiences

LLF may use one governed knowledge system, but responses must always be scoped to the authenticated/known audience context.

### Public prospect context

Allowed topics include:
- what LLF does;
- approved offer/pricing currently authorized for public use;
- implementation expectations;
- demos and product capabilities;
- bilingual support;
- high-level security/support explanations;
- approved public FAQ content.

Never expose:
- client-specific records;
- internal agent notes;
- private operational procedures;
- security configuration details that are not approved for public disclosure;
- unpublished legal/payment decisions;
- credentials, tokens, identifiers, or secrets.

### Authenticated client context

May additionally include only data and knowledge authorized for that authenticated client/account, such as:
- onboarding state;
- implementation status;
- client-facing support procedures;
- authorized reporting explanations;
- approved account-specific documentation.

Client context must never grant access to another client's information, internal QA scoring, agent-only notes, or administrative/security data.

## 2. Source registry contract

Every answerable knowledge item should resolve to a governed source record with at least:
- stable source identifier;
- title/category;
- audience scope: PUBLIC / CLIENT / AGENT_INTERNAL;
- lifecycle: DRAFT / APPROVED / SUPERSEDED / BLOCKED;
- source owner;
- reviewed-at timestamp;
- optional expires-at/review-by timestamp;
- canonical source reference;
- language availability;
- sensitivity class.

Only APPROVED, in-scope, non-expired/non-superseded sources are answerable.

If no approved source supports the answer, the system fails closed and requests human review/handoff rather than inventing.

## 3. Knowledge categories

Initial shared structure:
- Quick Answers
- Sales
- Offer / Pricing
- Demos
- Onboarding
- Implementation
- Product / Lead Delivery
- Client Support
- Billing — informational only
- Security / Privacy — approved wording only
- Legal — approved wording only
- Incident / Escalation Procedures
- WordPress / Wix / Squarespace Playbooks
- Internal Agent Procedures

Agent-internal material must never be eligible for public prospect or client answers.

## 4. Conflict and freshness handling

When two approved sources conflict:
1. Do not silently choose one.
2. Mark the answer path as blocked for automated response.
3. Surface the conflict internally for review.
4. Escalate the conversation if an immediate answer is required.

When a source is expired, superseded, unreviewed after its required review date, or marked BLOCKED, treat it as unavailable for automated answering.

## 5. AI-to-human handoff contract

A handoff is required when:
- the user explicitly requests a human;
- the approved Knowledge Center cannot support a confident answer;
- approved sources conflict;
- the conversation shows unresolved frustration or repeated failure;
- a commercial/legal/payment/security exception or commitment is requested;
- a client reports a material incident requiring human judgment;
- an action is requested that the AI is not authorized to execute.

The handoff package should preserve:
- prospect vs client context;
- source channel;
- active language;
- concise conversation summary;
- current unresolved question;
- relevant approved knowledge references;
- intent/satisfaction signals only when supported by evidence;
- recommended next action as advisory only.

The user must not have to repeat the conversation after handoff.

## 6. Carlos / María assignment boundary

The shared inbox may support Carlos and María as separate authenticated agents.

Required behavior:
- first authorized claim wins atomically;
- the other agent immediately sees ownership;
- simultaneous duplicate reply paths remain blocked;
- agent availability can be Available / Busy / Offline;
- private transfer notes remain agent-only;
- no agent identity may be simulated by a browser-only UI toggle in production.

## 7. Portal/client support UX acceptance criteria

Before live client support is enabled, the client support surface must prove:
- authenticated client/account scope is explicit;
- no cross-client data access;
- visible AI identity;
- visible human handoff path;
- clear project/onboarding/support context;
- no unsupported legal/payment commitments;
- private/internal agent data is never rendered;
- EN/ES context can be preserved through handoff;
- no real message is sent while the transport gate is OFF.

## 8. Public-web prospect support UX acceptance criteria

Before public AI support traffic is enabled, the public support surface must prove:
- context is always treated as prospect/public unless authenticated otherwise;
- answers come only from public-approved sources;
- no internal/client data can be retrieved;
- a human escalation path is visible;
- unsupported questions fail closed;
- EN/ES switching preserves conversation context;
- no checkout, onboarding, messaging, or CRM action is triggered by the support UI while its release gate is OFF.

## 9. Push-notification readiness boundary

Push design may reference support/handoff events, but real push transport remains OFF until:
- authenticated backend controls pass;
- trusted-device checks pass;
- physical iPhone permission/install QA passes;
- payload privacy QA passes;
- the relevant capability is explicitly released.

Locked-screen payloads must not include message bodies, payment data, private notes, secrets, auth tokens, or unnecessary customer details.

## 10. QA matrix

Minimum negative tests before live activation:
- unauthenticated user cannot access client support data;
- Client A cannot read Client B data;
- public prospect cannot read client-only or agent-only knowledge;
- client cannot read internal QA/agent notes;
- non-agent cannot claim/resolve conversations;
- non-trusted agent device cannot perform protected operations;
- expired/superseded knowledge cannot answer;
- conflicting approved sources force review/handoff;
- unsupported answer attempts fail closed;
- outbound messaging remains disabled when the transport capability is BLOCKED;
- real push remains disabled when push capability is BLOCKED.

## 11. Release rule

This contract is architecture/documentation only. It does not authorize production activation.

Live customer/prospect support remains blocked until the controlling authenticated backend, RLS/authorization, physical device QA, retention/redaction review, and release gates pass.

`LEGAL_RELEASED` must remain false unless explicitly released through its separate legal gate.
