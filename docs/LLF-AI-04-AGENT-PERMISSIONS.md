# LLF AI-04 — Agent Permission & Tool Registry

Status: COMPLETE for architecture/shadow-mode scope.

## Objective
Create a deny-by-default permission layer for LLF agents so model output cannot directly become an unauthorized action.

## Autonomy levels
- L0 Advisory: observe, score, summarize, draft; no external action.
- L1 Internal Ops: permitted internal updates/tasks only.
- L2 Approved Communications: only pre-approved communications under consent/timing/channel rules.
- L3 Low-Risk Autopilot: only explicit allow-listed workflows with verification.
- HUMAN_ONLY: charges/refunds, legal terms, credentials/security, destructive/safety-critical actions.

## Controls implemented
- canonical Tool Registry
- per-role Agent Permission Profiles
- explicit minimum autonomy per tool
- tenant-scope requirement for tenant-bound tools
- human-approval metadata for sensitive tools
- unknown tools fail closed
- non-allowlisted tools fail closed
- HUMAN_ONLY tools can never be executed by an agent
- no agent can expand its own permission set

## Initial roles
Lead Agent, Follow-Up Agent, Sales Agent, Onboarding Agent, QA Agent, Revenue Agent.

## Release boundary
All profiles remain shadow/internal by default. No L2/L3 real communication or production action is authorized by this block.
