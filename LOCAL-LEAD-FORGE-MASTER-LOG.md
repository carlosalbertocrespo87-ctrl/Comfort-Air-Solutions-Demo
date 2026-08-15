# LOCAL LEAD FORGE — MASTER LOG

Last updated: 2026-08-15

## 1. Business
- Business: Local Lead Forge
- Founder: Carlos
- Initial niche: U.S. HVAC companies
- Offer: AI-powered bilingual EN/ES website lead capture and qualification
- Validation pricing:
  - $299 one-time setup
  - $199/month
- Current goal: CLIENT #1
- Current prospect being prepared: Wade Heating & Air Conditioning
- Revenue: pre-revenue / $0 MRR

## 2. Main Website
- Website: https://localleadforge.com
- GitHub Pages deployment is active.
- GitHub repository:
  https://github.com/carlosalbertocrespo87-ctrl/Comfort-Air-Solutions-Demo

## 3. Wade Demo
- Live demo:
  https://localleadforge.com/wade-demo/
- EN/ES supported.
- Lead qualification flow tested end-to-end.
- Demo email delivery tested successfully.
- Gmail test recipient:
  localleadforgeagency@gmail.com
- Wade recipient validation allows @wadeheating.com.
- Demo does NOT confirm pricing or appointment times.
- Demo does NOT submit real HVAC service requests.
- Direct phone links to Wade have been disabled.
- Fictional testimonials/reviews have been completely removed.
- Hero testimonial/stars removed.
- Hero now identifies visual as:
  "Demo concept — AI-assisted lead capture"
- Strong visible non-affiliation disclaimer added.
- noindex / nofollow / noarchive enabled.
- No official Wade logo is being used.

## 4. Wade Demo Final Legal/Safety Rules
Every future prospect demo should inherit these rules:
- Clearly state it is an unofficial Local Lead Forge sales demo.
- State Local Lead Forge is not affiliated with, endorsed by, or authorized by prospect.
- Tell visitors not to use demo to request actual service.
- Do not copy official logos unless authorized.
- Do not invent reviews or customer testimonials.
- Do not create clickable phone links to prospect in demo.
- Do not confirm prices.
- Do not promise appointment times.
- Do not imply lead has reached prospect during demo.
- Add noindex, nofollow, noarchive.
- Use only factual public business information.
- Clearly label demo-only functions.
- Keep email recipient allowlist to prevent abuse.

## 5. Lead Delivery Architecture
Current flow:

Website demo
→ AI assistant
→ qualified lead
→ Cloudflare Worker
→ Resend
→ prospect/demo recipient email

Cloudflare Worker:
- local-lead-forge-demo-mailer
- RESEND_API_KEY stored as Cloudflare secret.
- NEVER commit API keys or secrets to GitHub.

Resend:
- localleadforge.com verified.
- Sender:
  Local Lead Forge Demo <demo@localleadforge.com>

Current allowlist includes:
- info@localleadforge.com
- localleadforgeagency@gmail.com
- @wadeheating.com

IMPORTANT:
- Worker source still needs to be saved/versioned in repo WITHOUT secrets.

## 6. Wade Final Test — PASSED
Test completed 2026-08-15.

Test lead:
- HVAC issue captured
- City/ZIP captured
- Timing captured
- Name captured
- Phone captured
- Language captured

Chat displayed:
"Demo lead sent"

Email successfully arrived in Gmail with:
- customer
- phone
- HVAC issue
- location
- requested timing
- language
- CALL CUSTOMER action

Result:
END-TO-END TEST PASSED.

## 7. Important Wade Commits
- dc2a97d — Harden Wade demo legal safeguards
- 91f5455 — Remove fictional reviews from Wade demo
- 0048f26 — Disable direct phone links in Wade demo

GitHub Actions deployment for these changes passed successfully.

## 8. iPostal1 / USPS Form 1583
- iPostal1 business mailbox purchased.
- USPS Form 1583 online notarization completed through Proof.
- Documents received by iPostal1.
- Current status: UNDER REVIEW.
- Approval may take 1–3 business days.
- DO NOT use mailbox address in cold outreach until iPostal1 approves it.
- Once approved:
  - confirm exact approved address formatting;
  - use it in CAN-SPAM outreach footer;
  - save approved/notarized documentation in Legal & Compliance.

## 9. Outreach to Wade
NOT SENT YET.

Do not send until:
- iPostal1 mailbox is approved;
- exact postal address formatting is confirmed;
- final outreach footer includes opt-out and valid postal address.

Initial outreach should come from:
info@localleadforge.com

Target:
Wade Heating & Air Conditioning

Demo URL:
https://localleadforge.com/wade-demo/

No pricing in first cold email.

## 10. Banking / Stripe
Found:
- application/support issue still pending.
- Do not duplicate support requests unnecessarily.

Stripe:
- account created.
- still test mode.
- test products:
  - Setup Fee — $299 one-time
  - Monthly Service — $199/month
- Activate live payments after business banking is ready.

When business banking/card becomes active:
MOVE all Local Lead Forge business expenses to the business account/card.

Examples:
- Namecheap
- Private Email
- iPostal1
- Cloudflare paid services if any
- hosting
- software
- other agency expenses

## 11. Google Drive
Existing:
LOCAL LEAD FORGE — AGENCY HUB

Legal folder:
Legal & Compliance

Saved:
Local Lead Forge - USPS Form 1583.pdf

Future organization:
- Legal & Compliance
- Finanzas
- Clientes
- Prospectos & Demos
- Operaciones
- Marketing
- Plantilla Maestra
- Ideas — Fase futura

Never save:
- passwords
- SSN
- API keys
- full sensitive ID numbers

## 12. MASTER HVAC PROSPECT TEMPLATE — CREATED
Location:
artifacts/hvac-prospect-template

Status:
- CREATED from the final tested Wade architecture.
- All Wade and ComfortAir references removed.
- Reusable prospectConfig added for company name, email domain, phone, service area, and year.
- Build tested successfully.
- Saved in Git and pushed to GitHub.
- Commit: 67a43ca — Add reusable HVAC prospect master template.

It must include:
- reusable EN/ES assistant
- lead qualification flow
- prospect-specific configuration
- recipient/domain allowlist
- Cloudflare/Resend integration pattern
- demo disclaimer
- non-affiliation notice
- noindex/noarchive
- no fake testimonials
- no clickable prospect phone
- no appointment promises
- no pricing promises
- demo-only Request Service replacement
- anti-spam safeguards
- deployment procedure
- final testing checklist
- outreach checklist

Goal:
For future HVAC prospects, customize instead of rebuilding from scratch.

## 13. Immediate Next Order
1. DONE — Freeze/document final Wade version.
2. DONE — Create clean HVAC prospect master template.
3. Save Worker source without secrets.
4. Wait for iPostal1 approval.
5. Confirm approved business postal address formatting.
6. Prepare final Wade outreach email.
7. Send Wade outreach.
8. Prepare response/call playbook.
9. Continue Found/business banking.
10. Activate Stripe live when banking is ready.
11. Build next prospect demo from MASTER TEMPLATE.

## 14. Core Rule
Do not add advanced features unless they directly help:
- win CLIENT #1;
- deliver CLIENT #1 successfully;
- make future prospect demos faster and safer.
