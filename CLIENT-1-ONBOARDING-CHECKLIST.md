# Local Lead Forge — CLIENT #1 Onboarding Checklist

Purpose:
Take the first paying HVAC client from “YES” to a working live lead-capture assistant without unnecessary complexity.

---

## 1. Confirm Decision

Before doing any implementation, confirm:

- Client wants to move forward.
- Authorized contact name.
- Authorized contact email.
- Business legal/display name.
- Main phone number.
- Website URL.

Do not begin custom work before confirming the client is actually moving forward.

---

## 2. Confirm Commercial Terms

Current validation offer:

- $299 one-time setup
- $199/month recurring service

Before implementation:

- Confirm setup price.
- Confirm monthly price.
- Confirm what is included.
- Confirm payment method.
- Confirm when monthly billing begins.

Do not promise additional features unless specifically agreed.

---

## 3. Basic Service Agreement

Agreement should clearly cover:

- service being provided;
- setup fee;
- monthly service fee;
- cancellation terms;
- client responsibility for business information;
- no guarantee of leads, revenue, or ROI;
- no HVAC diagnosis or pricing decisions by Local Lead Forge;
- website/access cooperation requirements;
- limitation of scope;
- permission to configure and operate the lead-capture system.

Do not launch a paid client without a basic written agreement.

---

## 4. Collect Setup Payment

Before implementation:

- Collect $299 setup payment.
- Confirm payment received.

When Stripe live mode is available:
use Stripe live payment link.

Until banking/Stripe live is ready:
do not invent an unofficial payment process without deciding it separately.

---

## 5. Client Information to Collect

Request:

### Business
- Business name
- Website URL
- Main phone
- Main contact email
- Service area
- Business hours

### Lead Delivery
- Email address where new leads should be delivered
- Backup recipient if desired

### Website
- Website platform if known
- Website administrator/contact
- Who controls DNS/hosting if needed
- Preferred installation coordination method

### Assistant
- English only or English + Spanish
- Services they want represented
- Areas they actually serve
- Any information the assistant must NOT say

---

## 6. Verify Business Information

Before using client information publicly:

- Confirm company name.
- Confirm phone number.
- Confirm service area.
- Confirm hours.
- Confirm services.
- Confirm spelling.
- Confirm client approval.

Do not invent:
- reviews;
- testimonials;
- licenses;
- awards;
- years in business;
- certifications;
- guarantees.

---

## 7. Create Client Version

Start from:

`artifacts/hvac-prospect-template`

Do NOT rebuild from scratch.

Update:

`prospectConfig`

Fields:
- companyName
- shortName
- emailDomain
- phoneDisplay
- serviceArea
- sinceYear only if verified

Then update any additional verified client-specific copy.

---

## 8. Update Email Delivery

Cloudflare Worker source reference:

`infrastructure/cloudflare/local-lead-forge-demo-mailer.worker.js`

For live client:

- add approved lead-delivery destination;
- remove unnecessary demo-only restrictions;
- preserve anti-abuse controls;
- keep RESEND_API_KEY as a secret;
- never place API key in source code;
- verify sender identity/domain.

Do not edit the production Worker blindly.
Test changes before relying on them.

---

## 9. Live Assistant Rules

The assistant should:

- capture HVAC issue;
- capture city/ZIP;
- capture preferred timing;
- capture customer name;
- capture phone number;
- support EN/ES if included;
- deliver organized lead information.

The assistant should NOT:

- diagnose HVAC problems as a technician;
- quote prices unless client has explicitly approved a safe rule;
- promise appointment availability;
- guarantee response times;
- guarantee service availability;
- make claims not approved by client.

---

## 10. Website Integration

Before installation:

- identify website platform;
- identify who controls website access;
- obtain authorized access or coordinate with webmaster;
- make a backup when appropriate.

Never claim we have website access before access is actually provided.

Install the live assistant using the safest method available for that website.

---

## 11. Pre-Launch Test

Test the full flow:

Visitor
→ assistant
→ issue
→ location
→ timing
→ name/phone
→ lead submission
→ email delivery

Confirm:

- desktop works;
- mobile works;
- English works;
- Spanish works if included;
- lead reaches correct inbox;
- customer phone is correct;
- issue is correct;
- location is correct;
- timing is correct;
- no broken buttons;
- no demo disclaimer remains on live client version unless still needed;
- no prospect-demo email restrictions remain accidentally;
- no old client names remain.

---

## 12. Client Approval Before Launch

Show client:

- assistant appearance;
- conversation flow;
- sample lead;
- lead-delivery email;
- mobile experience.

Ask client to approve:

- business information;
- wording;
- lead destination;
- final appearance.

Record approval.

---

## 13. Launch

After approval:

- deploy live version;
- test again after deployment;
- submit one controlled test lead;
- confirm client receives it;
- confirm client knows how leads appear.

Only then mark:

LIVE.

---

## 14. Monthly Service

Current monthly price:

$199/month

Core monthly responsibility:

- keep lead assistant operational;
- maintain lead delivery;
- correct reasonable issues;
- preserve working integration;
- handle agreed minor configuration changes.

Do not turn the $199 plan into unlimited custom development.

New major features should be scoped separately.

---

## 15. First 7 Days After Launch

Check:

- assistant still loads;
- lead delivery works;
- no client-reported errors;
- no obvious spam/abuse issue.

Ask client:

“Have the leads been coming through clearly?”

Do not promise lead volume.

---

## 16. Client Record

Create a client folder/document containing:

- agreement;
- payment status;
- authorized contacts;
- website;
- lead-delivery email;
- configuration;
- launch date;
- monthly billing date;
- important changes;
- support notes.

Do NOT store:

- passwords in plain text;
- API keys;
- SSN;
- unnecessary sensitive information.

---

## 17. CLIENT #1 Success Definition

CLIENT #1 is successfully onboarded when:

- agreement is accepted;
- setup fee is paid;
- assistant is configured;
- lead delivery is tested;
- client approves;
- live website integration works;
- first live test lead is received;
- monthly billing is established.

---

## Core Rule

Keep CLIENT #1 simple.

Sell and deliver:

Website visitor
→ qualified lead
→ delivered to the HVAC business.

Do not add advanced features unless they are necessary to win or successfully serve the client.
