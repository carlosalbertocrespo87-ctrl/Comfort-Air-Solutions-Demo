# AB Refrigeration Heating & Cooling LLC — Demo Build Spec

Date: 2026-08-17

## Verified public identity
- Company: AB Refrigeration Heating & Cooling LLC
- Public site: https://abrefrigeration.org
- Public contact: Tyler Brown
- Public email: TylerB@abrefrigeration.org
- Public phone: (470) 443-4090
- Positioning: Metro Atlanta light-commercial refrigeration + HVAC
- Publicly stated experience positioning: 15+ years
- Verified services: light-commercial refrigeration, HVAC installation, repair, maintenance, and 24/7 emergency service

## Demo objective
Build a premium mobile-first bilingual LLF demo that makes lead qualification simple while preserving AB Refrigeration’s light-commercial refrigeration and HVAC positioning.

## Required safeguards
- Clearly unofficial personalized demo; never present as AB Refrigeration’s official site.
- noindex, nofollow, noarchive and robots Disallow: /.
- No fake reviews, fabricated metrics, pricing, availability, guarantees, or appointment promises.
- Prospect phone shown only as verified information; demo must not initiate a real service request.
- Lead-flow QA must mock/intercept external mail delivery so CI creates no external lead or email.
- Preserve EN/ES and 390x844 mobile behavior.

## QA gate before publication
1. Apply AB config on isolated branch.
2. Typecheck.
3. Production build.
4. Static identity/noindex/robots/placeholders checks.
5. Chromium desktop functional QA.
6. EN→ES→EN language validation.
7. Invalid demo-email validation.
8. Full chatbot flow with mocked mailer.
9. Mobile menu/language test at 390x844.
10. Desktop/mobile render artifacts.
11. Publish only after all gates pass.
12. Verify public URL before READY TO SEND.

## Commercial rule
READY TO SEND means technically/commercially prepared; it does not authorize outreach, charges, terms, or other external commitments.
