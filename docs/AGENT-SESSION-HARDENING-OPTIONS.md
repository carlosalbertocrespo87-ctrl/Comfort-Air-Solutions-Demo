# LLF — Agent session hardening options before live customer traffic

Original review date: 24 Aug 2026
Latest decision: 15 Sep 2026
Controller: GitHub Issue #210
Status: **CARLOS-ONLY PERSISTENT IPHONE SESSION IN QA / LIVE CUSTOMER TRAFFIC STILL BLOCKED**

## 15 Sep 2026 — explicit owner decision

Carlos explicitly requested that the installed LLF Agent app on his iPhone stop asking for repeated email links/codes and open with substantially less friction.

The approved implementation for this QA stage is therefore:

**Option A2 — persistent Supabase Auth session on Carlos's trusted iPhone + mandatory Face ID gate.**

This decision changes only the authentication-continuity layer. It does **not** authorize live customer traffic, live messaging, payments, production automation, Maria access to Quick-Fix Factory, or any other release gate.

## Option A2 — persistent trusted-iPhone session for Carlos-only QA

The Agent Console may persist the normal Supabase Auth refresh session using the Supabase client library's dedicated namespaced browser storage so that an already-approved Carlos session can be restored after the installed PWA is closed and reopened.

The application must still enforce all of the following:

- the custom LLF Agent session record remains ephemeral in `sessionStorage` and is reconstructed only after Supabase restores a valid Auth session;
- the restored Supabase access token is revalidated against `llf-agent-ops` before protected UI opens;
- an active LLF agent profile is mandatory;
- the current browser/PWA device fingerprint must match an existing LLF trusted-device record;
- `PENDING` and `REVOKED` devices fail closed;
- Quick-Fix Factory remains Carlos-only by authenticated user ID;
- Face ID / platform WebAuthn with `userVerification: 'required'` remains the daily local unlock gate;
- explicit Sign out clears both the custom LLF session and the locally persisted Supabase Auth session;
- the old custom durable LLF session record and the old JavaScript-readable auth-bridge cookie remain actively purged;
- protected backend requests continue to omit ambient cookies and use the current validated bearer token;
- the installed PWA remains synthetic/read-only for the Quick-Fix Factory while independent LIVE gates are closed.

### One-time activation

If no persistent Supabase session is present on Carlos's iPhone, `/agent-sign-in` is a one-time activation/recovery route. It must use the fixed approved Carlos operator email, not a browser-autofilled or user-editable email. The copied-link handoff remains restricted to the exact Local Lead Forge Supabase project, exact current origin, and `/agent-demo` return path.

After successful activation, the Supabase refresh session is retained by the SDK and future normal launches should restore the Carlos session automatically before the Face ID gate.

### Security trade-off accepted for this QA stage

A refresh credential persisted by a browser SPA is JavaScript-readable to same-origin code. This has greater credential-persistence exposure than the earlier ephemeral-only model. The convenience change is accepted only under the current narrow boundary:

- Carlos-only trusted iPhone;
- internal/synthetic QA;
- Quick-Fix Factory read-only MOCK;
- real outbound messaging blocked;
- real payments blocked;
- live automations blocked;
- backend authorization and trusted-device enforcement remain mandatory.

This is **not** the preferred final architecture for a multi-user production Agent Console handling real customer data.

## Historical Option A — ephemeral session

The 24 Aug 2026 hardening pass selected an ephemeral implementation in PR #211. That model kept the validated access-token session only in `sessionStorage`, intentionally did not retain a refresh token, and required a fresh approved magic-link handoff after the PWA/browser session ended or the access token expired.

It reduced durable credential exposure but created repeated sign-in friction on the installed iPhone. On 15 Sep 2026 Carlos explicitly chose easier trusted-iPhone continuity for the current Carlos-only QA stage, so Option A is now historical for this use case.

## Option B — same-origin/BFF server-managed session

**Preferred longer-term architecture before broad daily production use.**

Move the protected Agent application behind a server-capable origin and use an opaque, Secure, HttpOnly, SameSite session cookie. Keep refresh/provider credentials server-side and rotate/revoke them centrally.

The BFF should:

- exchange/validate authentication server-side;
- store only an opaque session identifier in the browser;
- keep refresh/provider credentials out of JavaScript-readable storage;
- bind sessions to active LLF agent identity and device-trust policy;
- enforce idle/absolute lifetimes, rotation and explicit revocation;
- apply CSRF/origin defenses appropriate to cookie authentication;
- preserve auditable server-side authorization for every protected action;
- avoid becoming a broad service-role bypass.

## Acceptance criteria for Option A2

1. Exact-head Agent Console security workflow passes.
2. Typecheck and production build pass on the exact PR head.
3. Custom LLF Agent session remains `sessionStorage` only; no custom access/refresh credential is written directly to LLF-owned `localStorage` keys or cookies.
4. Supabase Auth persistence uses an explicit LLF namespaced SDK storage key with `persistSession` and `autoRefreshToken` enabled.
5. Persistent-session hydration must revalidate the active agent and register/check the current trusted device before protected UI opens.
6. Face ID/device-passkey remains mandatory on a restored trusted session.
7. Explicit sign-out clears the persisted Supabase session.
8. One-time activation is locked to the approved Carlos account and exact allowed redirect.
9. Maria remains revoked/blocked for this Carlos-only factory cut.
10. Real customer data, Send, payments, live automation and other production capabilities remain blocked until their independent release gates pass.

## Non-goals

This decision does not authorize customer traffic, messaging, push, payment actions, legal release, outreach, credential rotation, Maria access to Quick-Fix Factory, or production AI/voice activation.
