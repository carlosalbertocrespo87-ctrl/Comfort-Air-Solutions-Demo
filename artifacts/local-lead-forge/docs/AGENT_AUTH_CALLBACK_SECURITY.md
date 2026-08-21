# Agent Auth Callback Security Notes

- Auth fragments are removed from the visible URL before any application render.
- The browser never receives the Supabase service-role key or database password.
- `llf-agent-ops` accepts a Bearer token, then validates it server-side with Supabase Auth and requires an active `llf_agent_profiles` record.
- The Edge Function gateway JWT check is disabled only because the function performs its own user-token validation before any privileged database action.
- Session state is kept in `sessionStorage`, not localStorage, and is dropped when expired.
- `/agent-demo` fails closed without a stored validated session.
- Long-lived refresh handling is intentionally deferred until the short-lived authenticated Agent Console test is complete.
