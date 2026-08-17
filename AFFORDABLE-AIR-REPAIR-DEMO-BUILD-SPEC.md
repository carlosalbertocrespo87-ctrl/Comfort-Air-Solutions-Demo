# Affordable Air Repair Demo — Build Spec

## Verified public facts (reviewed 2026-08-17)
- Company: Affordable Air Repair Inc.
- Official site: https://www.affordableairrepair.com
- Phone in CRM: 770-652-4040
- Public business contact in CRM: Brian Goolsby, CEO (Georgia filing)
- Official site currently publishes HVAC content and service positioning for Smyrna, Marietta, Cartersville and the Metro Atlanta area.
- Verified service themes from the official site: residential HVAC repair, replacement, maintenance and indoor air quality.

## Demo goals
- Premium navy/black + orange visual family consistent with Local Lead Forge.
- Mobile-first, bilingual EN/ES, clear qualification path.
- AI assistant visible without promising availability, pricing or outcomes.
- Preserve verified local residential HVAC positioning.
- Replace fictional testimonials with verified public highlights only.

## Safety / truth rules
- Unofficial personalized demo disclaimer visible.
- `noindex,nofollow,noarchive` + robots `Disallow: /`.
- No real service requests, outreach, payment, booking or external email side effects during QA.
- Prospect phone is informational only in demo automation.
- Do not invent staff size, emergency availability, pricing, guarantees, years in business or customer results.

## QA gate before publication
1. Apply isolated Affordable Air Repair config.
2. Typecheck.
3. Production build with prospect-specific base path.
4. Static checks for identity, noindex and robots.
5. Chromium desktop + 390x844 mobile render.
6. EN→ES→EN.
7. Invalid email rejection.
8. Full chatbot sequence with mailer request intercepted/mock.
9. Mobile menu + language switch.
10. Inspect captures for blank-page, overflow, inherited-company references or misleading claims.

READY TO SEND only after QA passes, deployment succeeds and the public route is directly verified.
