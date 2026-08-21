# Agent Auth Callback Status

Status: ready for CI review.

Implemented:
- magic-link fragment consumption
- immediate URL credential stripping
- server-side `session_info` validation
- active-agent requirement
- sessionStorage-only session
- fail-closed `/agent-demo`
- synced Edge Function custom JWT verification config

Still intentionally blocked until QA:
- long-lived refresh sessions
- trusted-device activation
- secure iPhone push
- real customer conversation traffic
