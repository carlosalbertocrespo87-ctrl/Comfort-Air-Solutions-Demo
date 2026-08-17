# PM Service Company LLC — Demo Build Spec

## Verified prospect facts
- Official site: https://pmservicecompany.net
- Public phone: 470-757-3300
- Public email: pmservicecompany@gmail.com
- Public business contact: Perez Moody
- Service area positioning: Stonecrest & Atlanta
- Verified services: HVAC installation, heat-pump services, HVAC maintenance, HVAC service/repair
- Source review date: 2026-08-17

## Demo objective
Create a premium mobile-first EN/ES LLF demo from the reusable HVAC master template that improves clarity and lead qualification versus a conventional quote/contact flow.

## Required safeguards
- Clearly label as an unofficial personalized demo.
- Preserve noindex/nofollow/noarchive and robots Disallow: /.
- Do not invent testimonials, ratings, customer counts, guarantees, pricing, appointments, availability or results.
- Do not submit a real service request to PM Service Company.
- Do not make the prospect phone number a live prospect-contact action inside QA.
- Any demo lead test must be isolated/mocked so no external email/contact side effect occurs.

## Required personalization
- PM Service Company LLC branding/name throughout.
- Stonecrest & Atlanta service-area copy.
- Verified HVAC/heat-pump/maintenance service scope.
- Public contact data displayed only as verified facts.
- Replace fictional template reviews with verified factual highlights.
- Maintain bilingual EN/ES experience and mobile navigation.

## QA gate before READY TO SEND
1. Config transform passes.
2. Typecheck passes.
3. Production build passes.
4. Noindex + robots safety checks pass.
5. Desktop and mobile real-browser render pass.
6. EN/ES switch passes.
7. Mobile menu passes.
8. Demo form/email validation passes.
9. Chatbot lead sequence passes with external mailer intercepted/mocked.
10. Public URL must be verified after safe publication before CRM can move to READY TO SEND.

No outreach, commercial contact, pricing commitment or charge is authorized by this build spec.
