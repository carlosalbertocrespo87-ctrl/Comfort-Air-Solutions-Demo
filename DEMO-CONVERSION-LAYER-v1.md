# Local Lead Forge — Demo Conversion Layer v1

Status: READY FOR IMPLEMENTATION
Purpose: make every prospect demo explain the product and next step clearly enough to sell the idea without requiring a call first.

## Principle
The demo must answer three questions within one scroll path:
1. What does this do?
2. How does it help this business?
3. What happens if the owner wants to move forward?

Do not expose internal infrastructure, CI, secrets, payment plumbing, deployment internals, or implementation jargon.

## Placement
Add the conversion explanation layer after the main interactive/AI lead-capture experience and before the final CTA/footer. It must feel like part of the prospect demo, not like an LLF corporate landing page pasted on top.

## Section A — How Local Lead Forge works for your business
Use four compact steps with icons/cards. Keep each step scannable on mobile.

### EN
**How Local Lead Forge works for your business**

1. **A visitor needs HVAC help**  
They land on your site and can start a service request without having to call first.

2. **The system captures the important details**  
It collects the HVAC problem, location, urgency and contact information in English or Spanish.

3. **Your team receives an organized request**  
The information is packaged so your team can quickly understand what the customer needs and follow up using your normal workflow.

4. **Local Lead Forge keeps the system configured**  
We customize the experience for your business, test it before launch and maintain the lead-capture flow as part of the service.

### ES
**Cómo funciona Local Lead Forge para tu negocio**

1. **Un visitante necesita ayuda de HVAC**  
Entra a tu página y puede iniciar una solicitud de servicio sin tener que llamar primero.

2. **El sistema captura los datos importantes**  
Recopila el problema de HVAC, ubicación, urgencia y datos de contacto en inglés o español.

3. **Tu equipo recibe una solicitud organizada**  
La información se presenta de forma clara para que tu equipo entienda qué necesita el cliente y pueda darle seguimiento con su proceso habitual.

4. **Local Lead Forge mantiene el sistema configurado**  
Personalizamos la experiencia para tu empresa, la probamos antes de activarla y mantenemos el flujo de captación como parte del servicio.

## Section B — What happens if you decide to move forward?
Use a horizontal stepper on desktop and vertical stack on mobile.

### EN
**What happens if you decide to move forward?**

**1. Setup** — We confirm the service and activation details.  
**2. Business information** — You provide the facts, services, service area and routing preferences we need.  
**3. Customization** — We configure the experience for your business.  
**4. QA & approval** — We test desktop/mobile, English/Spanish, forms and lead routing before activation.  
**5. Activation** — After approval, the live version is turned on for your business.

### ES
**¿Qué pasa si decides avanzar?**

**1. Configuración inicial** — Confirmamos el servicio y los detalles de activación.  
**2. Información del negocio** — Nos das los datos, servicios, zona de atención y preferencias de entrega que necesitamos.  
**3. Personalización** — Configuramos la experiencia para tu empresa.  
**4. QA y aprobación** — Probamos desktop/móvil, inglés/español, formularios y entrega de leads antes de activar.  
**5. Activación** — Luego de tu aprobación, se activa la versión live para tu negocio.

## Section C — Final CTA
Use one CTA only. Do not introduce a second competing action.

Preferred EN:
**Want this configured for your business?**  
Reply to the message that brought you here or contact Local Lead Forge to review the setup details.

Preferred ES:
**¿Quieres esto configurado para tu empresa?**  
Responde al mensaje que te trajo hasta aquí o contacta a Local Lead Forge para revisar los detalles de configuración.

Brand line:
**Local Lead Forge — localleadforge.com**

## Claims and safety
- Never guarantee more leads, more sales, appointments, revenue, ROI, response times or rankings.
- Preferred benefit language: "help capture more service opportunities from website visitors" and "make it easier for potential customers to request service".
- Keep the visible unofficial/private demo disclaimer.
- Keep noindex/nofollow/noarchive on prospect demos.
- Demo lead submission must never become a real HVAC service request.
- Prospect phone numbers must remain non-clickable in demo mode where the safety contract requires it.
- Do not imply endorsement, affiliation or customer status.

## Reusability contract
This layer belongs in the master demo system so future demos inherit it automatically. Prospect-specific builds may customize factual wording only; they may not remove the three-question explanation structure without an explicit exception.

## QA acceptance gate
A demo may be READY TO SEND only if:
1. The explanation layer renders correctly on desktop and mobile.
2. EN/ES content switches correctly where language switching is enabled.
3. The three questions are answerable without a sales call.
4. Final CTA is singular and visible.
5. `localleadforge.com` branding is present.
6. No unsupported claims or guaranteed outcomes appear.
7. Existing demo safety controls remain intact.
8. The new layer does not break chatbot/forms/lead routing.

## Direct-mail compatibility
Every QR/postcard route should land on a demo containing this layer. The physical piece earns attention; the demo explains the mechanism and next step.