# LLF Agent persistent-session QA note

Scope: Carlos-only iPhone QA.

Expected flow:
1. One-time activation uses the approved Carlos auth account.
2. Supabase Auth stores and refreshes its own session under the namespaced storage key.
3. The LLF custom agent session remains sessionStorage-only.
4. Each restored launch revalidates the active LLF agent and the current trusted device.
5. Face ID / platform WebAuthn remains the daily unlock gate.
6. María remains revoked; LIVE messaging, payments, merge, and production changes are out of scope.

No production authorization is implied by this QA note.
