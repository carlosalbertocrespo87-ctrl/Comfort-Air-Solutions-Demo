# LOCAL LEAD FORGE — BACKUP & RECOVERY INDEX

Last updated: 2026-08-15

Purpose:
This document identifies where the important Local Lead Forge assets are stored and how to recover the project if a computer, Replit workspace, browser session, or conversation is lost.

This is NOT a password or secret-storage document.

---

## 1. PRIMARY CODE BACKUP — GITHUB

Repository:

https://github.com/carlosalbertocrespo87-ctrl/Comfort-Air-Solutions-Demo

Branch:

main

GitHub is the primary backup for source code, documentation, templates, and business operating files stored in the repository.

---

## 2. MASTER PROJECT LOG

File:

LOCAL-LEAD-FORGE-MASTER-LOG.md

Contains:
- business status;
- technical architecture;
- Wade demo status;
- Cloudflare / Resend notes;
- iPostal1 status;
- Stripe / Found status;
- master-template status;
- onboarding status;
- service-agreement status;
- next actions.

If project context is ever lost, read this file FIRST.

---

## 3. WADE DEMO

Source:

artifacts/wade-heating-air/

Live URL:

https://localleadforge.com/wade-demo/

Status:
- final legal/safety pass completed;
- fictional reviews removed;
- direct Wade phone links disabled;
- non-affiliation disclaimer active;
- noindex / nofollow / noarchive active;
- EN/ES chat operational;
- email validation operational;
- end-to-end demo lead delivery tested successfully.

Important final Wade commits:

- dc2a97d — Harden Wade demo legal safeguards
- 91f5455 — Remove fictional reviews from Wade demo
- 0048f26 — Disable direct phone links in Wade demo

---

## 4. HVAC MASTER TEMPLATE

Source:

artifacts/hvac-prospect-template/

Purpose:

Reusable starting point for future HVAC prospect demos.

Primary customization location:

src/App.tsx

Configuration block:

prospectConfig

Current configurable items include:
- companyName
- shortName
- emailDomain
- phoneDisplay
- serviceArea
- sinceYear

Template README:

artifacts/hvac-prospect-template/README.md

Important commit:

67a43ca — Add reusable HVAC prospect master template

---

## 5. FROZEN MASTER VERSION

Official Git tag:

MASTER-TEMPLATE-v1

This tag represents the first frozen reusable HVAC prospect baseline.

If future changes break the template, recover this version from the Git tag instead of rebuilding from memory.

Do NOT move or rewrite this tag.

Current preferred reusable baseline:

MASTER-TEMPLATE-v2

- Commit: dc72cde — Polish HVAC master template mobile experience
- Mobile EN/ES QA completed.
- Unofficial-demo safety protections preserved.
- Git tag pushed successfully to GitHub.
- MASTER-TEMPLATE-v1 remains preserved as the original frozen baseline.


Future major template versions should receive new tags, for example:

MASTER-TEMPLATE-v2

---

## 6. CLOUDFLARE WORKER SOURCE

Archived source:

infrastructure/cloudflare/local-lead-forge-demo-mailer.worker.js

Cloudflare production Worker:

local-lead-forge-demo-mailer

Production Worker URL:

https://local-lead-forge-demo-mailer.localleadforgeagency.workers.dev/

Important commit:

e5cef3e — Archive Cloudflare demo mailer and update master log

IMPORTANT:

The repository contains the Worker SOURCE but does NOT contain the RESEND_API_KEY.

The production secret remains stored in Cloudflare as:

RESEND_API_KEY

Never place its actual value in:
- GitHub;
- MASTER LOG;
- BACKUP INDEX;
- chat;
- screenshots;
- documentation.

---

## 7. RESEND

Service:

Resend

Verified sending domain:

localleadforge.com

Current sender:

Local Lead Forge Demo <demo@localleadforge.com>

Purpose:

Email delivery for demo leads.

Current Worker recipient restrictions include approved Local Lead Forge testing addresses and Wade's approved email domain.

Before using the master template for another prospect:

update and test the Worker recipient allowlist.

Do not store Resend API keys in Git.

---

## 8. MAIN WEBSITE / DEPLOYMENT

Main site:

https://localleadforge.com

Deployment:

GitHub Pages

GitHub Actions handles deployment from the repository.

Wade demo path:

/wade-demo/

If production is broken:

1. Check GitHub Actions.
2. Check latest main commit.
3. Check DNS.
4. Check GitHub Pages configuration.
5. Recover code from GitHub if local workspace is lost.

---

## 9. DOMAIN / DNS / PROFESSIONAL EMAIL

Domain:

localleadforge.com

Registrar / DNS:

Namecheap

Professional email:

info@localleadforge.com

Email service:

Namecheap Private Email

Business Gmail:

localleadforgeagency@gmail.com

Important DNS also supports:
- GitHub Pages;
- Resend email sending;
- DMARC / SPF / related email configuration.

Do not change DNS records casually.

Document and verify existing records before making DNS changes.

---

## 10. WADE OUTREACH

Draft:

WADE-OUTREACH-DRAFT.md

Commit:

dd9c4e9 — Add Wade outreach email draft

Status:

READY except for approved iPostal1 mailing-address insertion.

Do NOT send until:
- iPostal1 mailbox is approved;
- exact approved address format is confirmed;
- final demo test still passes.

---

## 11. WADE SALES PLAYBOOK

File:

WADE-SALES-PLAYBOOK.md

Commit:

a991f1d — Add Wade sales response playbook

Contains responses for:
- interested;
- pricing;
- installation;
- existing website;
- AI questions;
- appointments;
- Spanish;
- demo affiliation;
- sales call;
- closing;
- objections;
- follow-up.

Use this file if Wade responds instead of improvising.

---

## 12. CLIENT #1 ONBOARDING

File:

CLIENT-1-ONBOARDING-CHECKLIST.md

Commit:

6aed1d6 — Add client one onboarding checklist

Covers:

Client YES
→ terms
→ agreement
→ payment
→ information collection
→ configuration
→ website integration
→ testing
→ client approval
→ launch
→ monthly service.

---

## 13. SERVICE AGREEMENT

File:

LOCAL-LEAD-FORGE-SERVICE-AGREEMENT-DRAFT.md

Important commit:

ef0bb4e — Add draft service agreement

Current commercial terms in draft:

- $299 one-time setup
- $199/month

Status:

DRAFT

Must receive final legal/commercial review before first client signature.

Do not represent this draft as attorney-approved.

---

## 14. GOOGLE DRIVE BACKUP

Current main folder:

LOCAL LEAD FORGE — AGENCY HUB

Important existing folder:

Legal & Compliance

Current saved document:

Local Lead Forge - USPS Form 1583.pdf

Drive should eventually contain organized folders for:

- Legal & Compliance
- Finanzas
- Clientes
- Prospectos & Demos
- Operaciones
- Marketing
- Plantilla Maestra
- Ideas — Fase futura

Google Drive is primarily for business records and documents.

GitHub is primarily for source code and technical documentation.

---

## 15. iPOSTAL1

Service:

iPostal1

Purpose:

Business/private mailing address for Local Lead Forge.

USPS Form 1583:
- completed;
- notarized through Proof;
- submitted to iPostal1;
- currently awaiting approval as of 2026-08-15.

Do not use the mailbox in outreach until approval is confirmed.

After approval:
- confirm exact approved address format;
- update Wade outreach;
- store approved/notarized paperwork in Legal & Compliance.

Do not store sensitive ID numbers in this repository.

---

## 16. STRIPE

Stripe account exists.

Current status:

TEST MODE

Test products:

- Setup Fee — $299 one time
- Monthly Service — $199/month recurring

Do not treat test payment links as production links.

After business banking is ready:

1. Complete Stripe live setup.
2. Add/confirm business banking.
3. Create live payment links.
4. Test.
5. Record live commercial setup in MASTER LOG.

---

## 17. FOUND / BUSINESS BANKING

Found account process is still unresolved/pending support.

Do not assume banking is active until confirmed.

Once business banking is operational:

move Local Lead Forge business expenses to the business account/card where appropriate.

Examples:
- Namecheap
- Private Email
- iPostal1
- Cloudflare paid services if applicable
- hosting
- software
- agency expenses

Keep records for Finanzas.

---

## 18. IMPORTANT GIT COMMITS / MILESTONES

Wade safety:
- dc2a97d
- 91f5455
- 0048f26

MASTER LOG:
- 33ccb5a — Add Local Lead Forge master project log

Master template:
- 67a43ca — Add reusable HVAC prospect master template

Worker archive:
- e5cef3e — Archive Cloudflare demo mailer and update master log

Template checklist:
- af94bb3 — Add HVAC prospect template checklist

Master tag recording:
- 41ea2a8 — Record master template v1 tag

Wade outreach:
- dd9c4e9 — Add Wade outreach email draft

Wade sales playbook:
- a991f1d — Add Wade sales response playbook

Client onboarding:
- 6aed1d6 — Add client one onboarding checklist

Service agreement:
- ef0bb4e — Add draft service agreement

---

## 19. FILES INTENTIONALLY NOT PART OF OFFICIAL BACKUP

Current workspace may show unrelated or old files such as:

.replit

artifacts/local-lead-forge/App.comfortair-backup.tsx

artifacts/local-lead-forge/App.english-backup.tsx

artifacts/local-lead-forge/netlify/

These have intentionally NOT been mixed into official commits unless specifically reviewed later.

Do not delete them casually.

Do not treat them as the current production source of truth.

---

## 20. NEVER STORE IN GITHUB

Never commit:

- passwords;
- API keys;
- RESEND_API_KEY value;
- banking credentials;
- SSN;
- full driver's-license data;
- VIN;
- title numbers;
- identity-document photographs;
- private authentication tokens;
- recovery codes;
- credit-card details.

Use the appropriate provider's secure secret/account system instead.

---

## 21. PROJECT RECOVERY ORDER

If the Local Lead Forge working environment is ever lost:

### Step 1
Recover/access the GitHub repository.

### Step 2
Read:

LOCAL-LEAD-FORGE-MASTER-LOG.md

### Step 3
Read:

LOCAL-LEAD-FORGE-BACKUP-INDEX.md

### Step 4
Confirm:

MASTER-TEMPLATE-v2

### Step 5
Confirm external accounts:
- Namecheap
- GitHub
- Cloudflare
- Resend
- Stripe
- iPostal1
- Found
- Gmail / Private Email
- Google Drive

### Step 6
Verify:
https://localleadforge.com

### Step 7
Verify:
https://localleadforge.com/wade-demo/

### Step 8
Test lead delivery before making changes.

---

## 22. SOURCE OF TRUTH

For code:

GitHub `main`

For frozen reusable HVAC baseline:

Git tag `MASTER-TEMPLATE-v2`

For project state:

LOCAL-LEAD-FORGE-MASTER-LOG.md

For recovery locations:

LOCAL-LEAD-FORGE-BACKUP-INDEX.md

For legal/business documents:

Google Drive — LOCAL LEAD FORGE — AGENCY HUB

For secrets:

Only the secure systems of the providers where those secrets belong.

---

## CORE BACKUP RULE

Local Lead Forge should never depend on:

- one computer;
- one browser;
- one Replit session;
- one ChatGPT conversation;
- one person's memory.

Important code should live in GitHub.

Important business records should live in organized Drive storage.

Secrets should remain in secure provider systems.

The MASTER LOG and BACKUP INDEX should make the entire project understandable and recoverable.
