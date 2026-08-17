# Atlanta North Cooling & Heating Demo — Build Spec

## Verified public facts (reviewed 2026-08-17)
- Company: Atlanta North Cooling and Heating Inc
- Official site: https://metrocomfortsolution.com
- Phone: 770-591-0901
- Text: 770-480-4179
- Base: Woodstock, Georgia
- Official site states over 30 years of HVAC experience and family-owned/local positioning.
- Georgia license shown on official site: CN210377.
- Verified service themes: air conditioning service/repair, furnace service/repair, replacement estimates, planned service agreements, indoor air quality/home comfort.
- Official site names service communities including Woodstock, Marietta, Kennesaw, Acworth, Canton, Cumming, Dawsonville, Alpharetta, Milton and Roswell.

## Demo goals
- Premium navy/black + orange visual family consistent with Local Lead Forge.
- Mobile-first, bilingual EN/ES, clear qualification path.
- AI assistant visible without promising availability, pricing or outcomes.
- Preserve verified local/family-owned positioning and service scope.
- Do not import or invent review claims; use verified public highlights instead.

## Safety / truth rules
- Unofficial personalized demo disclaimer visible.
- `noindex,nofollow,noarchive` + robots `Disallow: /`.
- No real service requests, outreach, payment, booking or external email side effects during QA.
- Prospect phone/text are informational only in demo automation.
- Do not invent years beyond the site's published “over 30 years,” staff size, emergency availability, pricing or guarantees.

## QA gate before publication
1. Apply isolated Atlanta North config.
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
