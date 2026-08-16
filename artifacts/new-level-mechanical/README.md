# Local Lead Forge — HVAC Prospect Master Template

Reusable master template for personalized HVAC prospect demos.

## Customize first
Edit `src/App.tsx` and locate:

`const prospectConfig = { ... }`

Change only:
- companyName
- shortName
- emailDomain
- phoneDisplay
- serviceArea
- sinceYear

## Safety rules
Every prospect demo must:
- clearly state it is an unofficial Local Lead Forge sales demo;
- state Local Lead Forge is not affiliated with, endorsed by, or authorized by the prospect;
- not accept real HVAC service requests;
- not promise pricing or appointment times;
- not use fictional reviews or testimonials;
- not copy an official logo unless authorized;
- not include clickable prospect phone links;
- use noindex, nofollow, noarchive;
- allow demo emails only to approved addresses/domains.

## Lead flow
Visitor
→ AI assistant
→ issue
→ city/ZIP
→ timing
→ name/phone
→ lead summary
→ Cloudflare Worker
→ Resend
→ approved recipient inbox

## Before deploying
1. Replace all prospectConfig values.
2. Confirm public business information is accurate.
3. Search project for old prospect names/domains.
4. Confirm no fake reviews.
5. Confirm no active `tel:` links.
6. Confirm disclaimer.
7. Confirm robots noindex.
8. Build successfully.
9. Deploy.
10. Test entire chat.
11. Confirm demo lead arrives by email.

## Worker
Source reference:
`infrastructure/cloudflare/local-lead-forge-demo-mailer.worker.js`

Never commit:
- RESEND_API_KEY
- passwords
- tokens
- private credentials

The Worker recipient allowlist must be updated for each new prospect before outreach.

## Final rule
Customize this template. Do not rebuild prospect demos from scratch unless technically necessary.
