# LLF Agent Auth Callback Test

## Expected flow
1. Generate a fresh Supabase magic link for an approved LLF agent.
2. Open the link on `https://localleadforge.com/`.
3. The app strips all auth material from the URL before rendering.
4. The access token is validated through `llf-agent-ops` action `session_info`.
5. Only an active row in `llf_agent_profiles` is accepted.
6. The validated session is stored in `sessionStorage` only.
7. The browser redirects to `/agent-demo`.
8. `/agent-demo` fails closed when no valid unexpired agent session is present.

## Negative checks
- Missing token -> no session created.
- Invalid/expired token -> no session created.
- Valid Supabase user without active agent profile -> HTTP 403; no session created.
- Expired stored session -> removed before Agent Console access.
- No service-role or database credential is stored in browser code.

## Current limitation
This first production-auth test uses the access-token lifetime only. Refresh-session handling will be added before long-lived daily agent use.
