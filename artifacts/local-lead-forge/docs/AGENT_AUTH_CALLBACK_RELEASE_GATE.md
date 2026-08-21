# Agent Auth Callback Release Gate

Do not enable real customer messaging or secure push solely because this auth callback merges.

Required after merge:
1. Fresh magic-link test on production domain.
2. Confirm URL token is stripped automatically.
3. Confirm Carlos reaches `/agent-demo` only after backend validation.
4. Confirm unauthenticated `/agent-demo` fails closed.
5. Run Auth/RLS negative tests.
6. Register trusted device before enabling push.
