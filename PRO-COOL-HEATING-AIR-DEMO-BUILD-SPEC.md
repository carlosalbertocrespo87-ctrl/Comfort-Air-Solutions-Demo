# Pro Cool Heating & Air Demo — Build Spec

## Verified public facts (reviewed 2026-08-17)
- Company: Pro Cool Heating and Air Inc.
- Official site: https://procoolheatingandair.com
- Phone: 678-927-1262
- Public contact: Patrick Safford (BBB Business Manager)
- Location/positioning: Marietta, Georgia; residential HVAC service with Cobb County / Metro Atlanta positioning.
- Georgia license shown on official site: CR110067.
- Verified service themes: residential HVAC repair, service, installation, heating and air conditioning.
- Current-site opportunity: older/text-heavy layout, basic email contact form, and coupon pages that still show 2025 expiration dates.

## Demo goals
- Premium navy/black + orange visual family consistent with Local Lead Forge.
- Mobile-first, fast, clear primary CTA, bilingual EN/ES.
- AI assistant as a visible qualification path without promising appointment availability, price or results.
- Preserve direct local-service positioning and verified facts only.
- Replace any inherited fictional reviews/results with clearly labeled verified public highlights.

## Safety / truth rules
- Unofficial personalized demo disclaimer visible.
- `noindex,nofollow,noarchive` + robots `Disallow: /`.
- No real service requests, outreach, payment, booking or email side effects during QA.
- Prospect phone is informational only in demo; do not trigger external calls in automated QA.
- Do not invent reviews, years, team size, emergency availability, pricing, guarantees or service areas.

## QA gate before publication
1. Apply isolated Pro Cool config.
2. Typecheck.
3. Production build with prospect-specific base path.
4. Static checks for identity, noindex and robots.
5. Chromium desktop + 390x844 mobile render.
6. EN→ES→EN.
7. Invalid email rejection.
8. Full chatbot sequence with mailer request intercepted/mock.
9. Mobile menu + language switch.
10. Inspect rendered captures for blank-page, overflow, inherited-company references or misleading claims.

READY TO SEND is allowed only after QA passes, the demo is deployed, and the public route is directly verified.
