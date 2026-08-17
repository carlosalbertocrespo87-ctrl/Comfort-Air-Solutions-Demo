# Bob's Heating & Air — Demo Build Spec

## Verified source facts
- Company: Bob's Heating & Air
- Website: https://bobsheatingandair.com
- Founder / public owner: Bob Roy
- Public phone: 404-606-0548
- Service positioning: North Metro Atlanta
- Publicly stated experience: 30+ years
- Credentials highlighted publicly: NATE
- Verified service categories: HVAC repair, installation, maintenance, indoor air quality

## Demo objective
Create a mobile-first bilingual EN/ES LLF demo that modernizes the older site structure and reduces friction in lead qualification without presenting the demo as the official website.

## Required safeguards
- Visible unofficial-demo disclaimer
- `noindex, nofollow, noarchive`
- `robots.txt` with `Disallow: /`
- No fictional reviews, results, guarantees or metrics
- No pricing or appointment promises
- No real service request or external lead side effects during QA
- Prospect phone must not be used as an automated outbound action

## QA gates before publication
1. Apply isolated Bob's configuration.
2. Typecheck.
3. Production build.
4. Static identity/noindex/placeholder checks.
5. Chromium desktop QA.
6. 390x844 mobile QA.
7. EN → ES → EN navigation.
8. Invalid demo-email validation.
9. Full chatbot sequence with mailer intercepted/mocked.
10. Render artifact inspection.

## Publication rule
Do not merge/publish until QA passes. Do not mark READY TO SEND until the final public route is verified after deploy. Publication never authorizes outreach.
