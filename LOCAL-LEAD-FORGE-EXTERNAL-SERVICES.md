# LOCAL LEAD FORGE — EXTERNAL SERVICES INVENTORY

Last updated: 2026-08-15

Purpose:
Document the external services that Local Lead Forge depends on, what each one does, what should be checked during recovery, and where secrets should remain stored.

This file must NEVER contain passwords, API keys, recovery codes, full banking credentials, SSN, or sensitive identity-document numbers.

---

## 1. GITHUB

Repository:
https://github.com/carlosalbertocrespo87-ctrl/Comfort-Air-Solutions-Demo

Primary branch:
main

Purpose:
- source-code backup;
- deployment source;
- documentation backup;
- master-template storage;
- Git history / recovery.

Important tag:
MASTER-TEMPLATE-v1

GitHub Actions:
Used to deploy Local Lead Forge / Wade demo through GitHub Pages.

Recovery checks:
- repository accessible;
- main branch intact;
- latest intended commits present;
- GitHub Actions runs successfully;
- MASTER-TEMPLATE-v1 tag exists.

Do not store:
- API keys;
- passwords;
- provider secrets.

---

## 2. GITHUB PAGES

Main website:
https://localleadforge.com

Wade demo:
https://localleadforge.com/wade-demo/

Purpose:
Public hosting for Local Lead Forge and prospect demos.

Deployment:
GitHub Actions / GitHub Pages.

If site stops working:
1. Check GitHub Actions.
2. Check Pages deployment status.
3. Check domain DNS.
4. Check latest production commit.
5. Verify custom domain configuration.

---

## 3. NAMECHEAP

Domain:
localleadforge.com

Purpose:
- domain registration;
- DNS management;
- professional email service.

Domain renewal:
Track renewal date in Namecheap account.

Important rule:
Do not edit DNS records casually.

Before DNS changes:
- record existing value;
- understand which service depends on it;
- change only the required record;
- verify website and email afterward.

---

## 4. DNS — GITHUB PAGES

Root-domain GitHub Pages A records:

185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153

WWW:
CNAME points to GitHub Pages host for the repository owner.

Purpose:
Route localleadforge.com and www.localleadforge.com to GitHub Pages.

Recovery check:
Confirm GitHub Pages custom-domain status and verify both root and www behavior.

---

## 5. NAMECHEAP PRIVATE EMAIL

Professional mailbox:
info@localleadforge.com

Purpose:
Primary professional Local Lead Forge business/outreach email.

Mail service:
Namecheap Private Email

MX records:
mx1.privateemail.com
mx2.privateemail.com

Important:
Professional outreach should come from:
info@localleadforge.com

Current known issue:
Resend-to-Private-Email test previously produced a temporary delivery bounce.

Do not assume this means the mailbox itself is broken.
Outgoing professional mail has worked.

---

## 6. BUSINESS GMAIL

Account:
localleadforgeagency@gmail.com

Purpose:
- business administration;
- testing;
- provider accounts;
- backup business communication;
- demo lead testing.

Current use:
Successfully receives Local Lead Forge demo leads.

Do not expose account password or recovery codes in repository files.

---

## 7. RESEND

Purpose:
Transactional email delivery for demo leads.

Verified domain:
localleadforge.com

Current sending identity:
Local Lead Forge Demo <demo@localleadforge.com>

API key:
Stored securely outside GitHub.

Production Worker references:
env.RESEND_API_KEY

Do NOT store actual API-key value in:
- Git;
- Markdown documentation;
- screenshots;
- chat;
- source files.

DNS records associated with Resend include:
- DKIM-related record;
- SPF on sending subdomain;
- DMARC policy for domain.

Before changing Resend DNS:
verify current Namecheap DNS and document the exact record first.

---

## 8. CLOUDFLARE

Worker:
local-lead-forge-demo-mailer

Worker URL:
https://local-lead-forge-demo-mailer.localleadforgeagency.workers.dev/

Purpose:
Receive qualified demo lead data from website and send approved demo email through Resend.

Archived Worker source:
infrastructure/cloudflare/local-lead-forge-demo-mailer.worker.js

Production secret:
RESEND_API_KEY

Secret location:
Cloudflare Worker environment / secret binding.

Never store actual secret value in Git.

Current CORS allowlist includes:
- https://localleadforge.com
- https://www.localleadforge.com

Current demo recipient controls include:
- Local Lead Forge approved test addresses;
- Wade approved email domain.

Before using a new prospect:
update/test recipient controls intentionally.

Do not blindly modify production Worker.

---

## 9. CLOUDFLARE WORKER RECOVERY

If Worker is lost or overwritten:

1. Open archived source:
   infrastructure/cloudflare/local-lead-forge-demo-mailer.worker.js

2. Review current prospect-recipient restrictions.

3. Restore Worker code in Cloudflare.

4. Re-create secret binding:
   RESEND_API_KEY

5. Do NOT paste key into source.

6. Test POST request from approved Local Lead Forge origin.

7. Confirm email arrives at approved test inbox.

8. Test prospect-domain behavior before outreach.

---

## 10. STRIPE

Purpose:
Payments for Local Lead Forge.

Current state:
TEST MODE

Test products:
- Setup Fee — $299 one-time
- Monthly Service — $199/month recurring

Do not send test-mode links as production payment links.

When business banking is ready:
1. finish live account requirements;
2. connect/confirm banking;
3. create live products/payment links;
4. test payment flow;
5. record live details in MASTER LOG;
6. use live links in onboarding.

Main website:
https://localleadforge.com

Add/confirm website in Stripe profile when appropriate.

---

## 11. FOUND

Purpose:
Business banking.

Current status:
Pending / unresolved support process.

Known support case:
#1043637

Do not assume account is operational until Found confirms it.

After Found/business banking is active:
- connect appropriate banking to Stripe;
- move business expenses to business account/card;
- record banking readiness in MASTER LOG;
- track expenses in Finanzas.

Do not store banking credentials in Git.

---

## 12. iPOSTAL1

Purpose:
Private/business mailing address for Local Lead Forge.

Plan:
Business mailbox plan.

USPS Form 1583:
- completed;
- notarized through Proof;
- submitted;
- currently under iPostal1 review.

Important:
Do not use mailbox address in commercial outreach until approved.

After approval:
1. confirm exact address formatting shown by iPostal1;
2. update Wade outreach footer;
3. save approved/notarized documentation in Drive;
4. record approval in MASTER LOG;
5. use approved mailing address consistently.

Do not store ID numbers or identity-document images in Git.

---

## 13. PROOF

Purpose:
Online notarization service used for USPS Form 1583.

Status:
Notarization completed successfully.

No ongoing Local Lead Forge infrastructure depends on Proof after iPostal1 accepts the documentation.

Keep notarized records in Legal & Compliance, not source-code folders.

---

## 14. GOOGLE DRIVE

Current primary folder:
LOCAL LEAD FORGE — AGENCY HUB

Purpose:
Business documents and records.

Current Legal folder:
Legal & Compliance

Known stored document:
Local Lead Forge - USPS Form 1583.pdf

Planned organization:
- Legal & Compliance
- Finanzas
- Clientes
- Prospectos & Demos
- Operaciones
- Marketing
- Plantilla Maestra
- Ideas — Fase futura

GitHub:
technical/source-code truth.

Drive:
business-record/document truth.

Do not store API keys or passwords in Drive documents unless using an appropriate secure password-management system instead.

---

## 15. REPLIT / CURRENT WORKSPACE

Purpose:
Current development environment.

Important:
Replit is NOT the sole backup.

Source of truth should remain GitHub main.

If Replit disappears:
clone/recover repository from GitHub.

Do not rely on:
- local shell history;
- browser state;
- temporary build outputs;
- uncommitted files.

Known local/unofficial leftovers may still include:
- .replit modifications;
- old App backups;
- old netlify folder.

These are not production source of truth.

---

## 16. DEMO LEAD FLOW

Current working architecture:

LocalLeadForge.com demo
→ visitor opens AI assistant
→ lead information collected
→ frontend sends POST request
→ Cloudflare Worker validates request
→ recipient allowlist checked
→ Resend sends demo email
→ approved inbox receives lead

Critical dependencies:
- GitHub Pages;
- Cloudflare Worker;
- Resend;
- DNS/domain;
- recipient email provider.

If lead delivery fails:
check these in that order.

---

## 17. CURRENT SECURITY RULES

Always:
- keep API keys in provider secret systems;
- restrict recipient addresses/domains;
- restrict allowed origins;
- sanitize user-supplied HTML values;
- validate required lead fields;
- validate demo email;
- test after changes;
- keep secrets out of commits.

Never:
- expose RESEND_API_KEY;
- commit passwords;
- hardcode private credentials;
- use unrestricted email recipients in public demo;
- assume a deployment worked without testing.

---

## 18. CURRENT COMMERCIAL INFRASTRUCTURE STATUS

Website:
ACTIVE

Professional email:
ACTIVE

Business Gmail:
ACTIVE

GitHub:
ACTIVE

GitHub Pages:
ACTIVE

Cloudflare Worker:
ACTIVE

Resend:
ACTIVE

Wade demo:
ACTIVE / TESTED

Master HVAC template:
CREATED / TESTED / TAGGED

Stripe:
TEST MODE

Found:
PENDING

iPostal1:
UNDER REVIEW

Wade outreach:
READY BUT NOT SENT

Service agreement:
DRAFT

Client onboarding:
READY

---

## 19. EXPENSE-MIGRATION RULE

When business banking/card is fully operational:

Move appropriate Local Lead Forge recurring expenses from personal payment methods to business payment method.

Review:
- Namecheap;
- Private Email;
- iPostal1;
- hosting;
- Cloudflare paid features if any;
- software;
- future business subscriptions.

Track:
- date;
- provider;
- amount;
- purpose;
- payment source.

Keep financial records in:
Google Drive → Finanzas

---

## 20. RECOVERY PRIORITY

If multiple systems fail or access is lost:

1. Secure access to business Gmail.
2. Secure access to GitHub.
3. Secure access to domain/Namecheap.
4. Confirm GitHub Pages site.
5. Confirm Cloudflare Worker.
6. Confirm Resend.
7. Test lead delivery.
8. Confirm professional email.
9. Confirm Stripe/Found.
10. Confirm iPostal1/Drive records.

---

## 21. DO NOT DOCUMENT SECRET VALUES HERE

This inventory may document:
- service names;
- account purposes;
- public URLs;
- non-sensitive architecture;
- secret variable NAMES.

It must not document:
- actual API-key values;
- passwords;
- recovery codes;
- SSN;
- full IDs;
- banking credentials;
- private card information.

---

## CORE RULE

External services must be documented well enough to recover the business without exposing the credentials that protect those services.
