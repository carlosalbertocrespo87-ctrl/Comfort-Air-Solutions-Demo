# Persistent Face ID QA plan

PASS criteria before merge:

- Typecheck passes.
- Agent Console security QA passes.
- Persistent-session hardening QA passes.
- One preview deploy only.
- Carlos activates the preview once with the approved LLF account.
- Closing and reopening the installed preview restores the approved session without requesting email or another magic link.
- Face ID remains required before Agent Console or Quick-Fix Factory content is shown.
- Device trust remains TRUSTED for Carlos's iPhone.
- Revoked devices remain blocked.
- No LIVE messaging, payment, production merge, or customer action is performed.
