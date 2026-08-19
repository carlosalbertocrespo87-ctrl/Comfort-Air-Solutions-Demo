const ALLOWED_ORIGINS = [
  "https://localleadforge.com",
  "https://www.localleadforge.com",
];

const TEST_EMAILS = [
  "info@localleadforge.com",
  "localleadforgeagency@gmail.com",
];

const ALLOWED_PROSPECT_DOMAINS = [
  "wadeheating.com",
  "newlevelmechanical.com",
];

const MAX_FIELD_LENGTH = 1000;
const MAX_ONBOARDING_BODY_BYTES = 64 * 1024;

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(data, status = 200, origin = "") {
  const headers = { "Content-Type": "application/json" };
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    Object.assign(headers, cors(origin));
  }
  return new Response(JSON.stringify(data), { status, headers });
}

function clean(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function text(value = "") {
  return String(value).trim().slice(0, MAX_FIELD_LENGTH);
}

function validEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function emailAllowed(email) {
  const e = email.toLowerCase().trim();
  return (
    TEST_EMAILS.includes(e) ||
    ALLOWED_PROSPECT_DOMAINS.some((domain) => e.endsWith(`@${domain}`))
  );
}

function timingSafeEqualHex(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function hmacSha256Hex(secret, payload) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyStripeSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;

  const entries = signatureHeader.split(",").map((part) => part.trim());
  const timestampPart = entries.find((part) => part.startsWith("t="));
  const signatures = entries
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));

  if (!timestampPart || signatures.length === 0) return false;

  const timestamp = Number(timestampPart.slice(2));
  if (!Number.isFinite(timestamp)) return false;

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) return false;

  const expected = await hmacSha256Hex(secret, `${timestamp}.${rawBody}`);
  return signatures.some((signature) => timingSafeEqualHex(expected, signature));
}

async function readJsonWithLimit(request, maxBytes = MAX_ONBOARDING_BODY_BYTES) {
  const declaredLength = Number(request.headers.get("Content-Length") || 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return { error: "Request body too large", status: 413 };
  }

  if (!request.body) {
    return { error: "Invalid JSON", status: 400 };
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let raw = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel();
        return { error: "Request body too large", status: 413 };
      }
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
  } catch {
    return { error: "Unable to read request body", status: 400 };
  }

  try {
    return { value: JSON.parse(raw) };
  } catch {
    return { error: "Invalid JSON", status: 400 };
  }
}

async function sendResendEmail(env, payload, idempotencyKey) {
  if (!env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Resend error: ${await response.text()}`);
  }

  return response.json();
}

function welcomeEmailHtml(customerName, onboardingUrl) {
  const firstName = clean(customerName || "there");
  return `
<div style="margin:0;background:#07111f;padding:28px 14px;font-family:Arial,sans-serif;color:#eaf0f7">
  <div style="max-width:640px;margin:0 auto;background:#0b1728;border:1px solid #26364b;border-radius:16px;overflow:hidden">
    <div style="padding:28px 30px;border-bottom:2px solid #ff6a00;background:linear-gradient(135deg,#07111f,#0b1728)">
      <div style="font-size:26px;font-weight:800;letter-spacing:.02em"><span style="color:#fff">LLF</span><span style="color:#ff6a00">↗</span> <span style="font-size:16px;font-weight:600;color:#eaf0f7">LOCAL LEAD FORGE</span></div>
      <div style="margin-top:8px;color:#ff8a34;font-size:14px">Turn more website visitors into qualified leads.</div>
    </div>
    <div style="padding:32px 30px">
      <h1 style="margin:0 0 16px;font-size:25px;color:#fff">Welcome to Local Lead Forge</h1>
      <p style="line-height:1.65;color:#c9d4e2">Hi ${firstName},</p>
      <p style="line-height:1.65;color:#c9d4e2">Your setup payment has been confirmed and your implementation is officially underway.</p>
      <p style="line-height:1.65;color:#c9d4e2">The next step is a short business intake. We use it to configure your site experience, AI assistant, lead qualification, and lead delivery around how your company actually operates.</p>
      <div style="margin:28px 0">
        <a href="${clean(onboardingUrl)}" style="display:inline-block;background:#ff6a00;color:#07111f;text-decoration:none;font-weight:800;padding:14px 22px;border-radius:9px">Complete Your Business Intake</a>
      </div>
      <p style="line-height:1.65;color:#9cabbc;font-size:13px">For your security, never submit passwords, API keys, banking information, Social Security numbers, or identity documents through the intake form.</p>
      <p style="line-height:1.65;color:#c9d4e2">We’ll keep you updated as your project moves through configuration, QA, validation, and activation.</p>
    </div>
  </div>
</div>`;
}

async function handleStripeWebhook(request, env) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return json({ error: "Webhook unavailable" }, 503);
  }

  const rawBody = await request.text();
  const signature = request.headers.get("Stripe-Signature") || "";
  const verified = await verifyStripeSignature(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);

  if (!verified) {
    return json({ error: "Invalid Stripe signature" }, 400);
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (!["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
    return json({ received: true, ignored: true });
  }

  const session = event?.data?.object || {};
  if (session.payment_status === "unpaid") {
    return json({ received: true, ignored: true, reason: "unpaid" });
  }

  if (!env.STRIPE_SETUP_PAYMENT_LINK_ID) {
    console.error("STRIPE_SETUP_PAYMENT_LINK_ID is not configured");
    return json({ error: "Setup payment link is not configured" }, 503);
  }

  if (session.payment_link !== env.STRIPE_SETUP_PAYMENT_LINK_ID) {
    return json({ received: true, ignored: true, reason: "different payment link" });
  }

  const customerEmail = session?.customer_details?.email || session?.customer_email || "";
  const customerName = session?.customer_details?.name || "";

  if (!validEmail(customerEmail)) {
    console.error("Checkout Session completed without a valid customer email", session.id);
    return json({ error: "Customer email missing" }, 422);
  }

  const onboardingUrl = env.ONBOARDING_URL || "https://localleadforge.com/onboarding/";

  try {
    await sendResendEmail(
      env,
      {
        from: "Local Lead Forge <info@localleadforge.com>",
        to: [customerEmail],
        reply_to: "info@localleadforge.com",
        subject: "Welcome to Local Lead Forge — Let’s Get Your Setup Started",
        text: `Welcome to Local Lead Forge. Your setup payment has been confirmed. Complete your business intake here: ${onboardingUrl}\n\nFor security, do not submit passwords, API keys, banking information, SSNs, or identity documents.`,
        html: welcomeEmailHtml(customerName, onboardingUrl),
      },
      `llf-welcome/${session.id}`,
    );

    await sendResendEmail(
      env,
      {
        from: "Local Lead Forge Automation <info@localleadforge.com>",
        to: ["localleadforgeagency@gmail.com"],
        reply_to: customerEmail,
        subject: `New Client Setup Payment Confirmed — ${customerEmail}`,
        text: `A Local Lead Forge setup payment was confirmed.\n\nCheckout Session: ${session.id}\nCustomer: ${customerName || "Not provided"}\nEmail: ${customerEmail}\nAmount: ${(Number(session.amount_total || 0) / 100).toFixed(2)} ${String(session.currency || "usd").toUpperCase()}\n\nThe automated welcome email has been triggered.`,
      },
      `llf-internal-payment/${session.id}`,
    );
  } catch (error) {
    console.error(error);
    return json({ error: "Unable to send onboarding email" }, 500);
  }

  return json({ received: true, welcomeSent: true });
}

function normalizeOnboarding(form) {
  const schemaVersion = Number(form.schemaVersion || 1);
  const isV3 = schemaVersion === 3;

  return {
    schemaVersion,
    source: text(form.source),
    submittedAt: text(form.submittedAt),
    legalBusinessName: text(form.legalBusinessName || form.businessName),
    dbaName: text(form.dbaName),
    businessAddress: text(form.businessAddress),
    authorizedContactName: text(form.authorizedContactName || form.contactName),
    authorizedContactTitle: text(form.authorizedContactTitle),
    authorizedContactEmail: text(form.authorizedContactEmail || form.email).toLowerCase(),
    authorizedContactPhone: text(form.authorizedContactPhone || form.phone),
    websiteUrl: text(form.websiteUrl || form.website),
    professionalLicense: text(form.professionalLicense),
    socialProfiles: text(form.socialProfiles),
    brandColors: text(form.brandColors),
    brandMessage: text(form.brandMessage),
    assetLinks: text(form.assetLinks),
    approvedPhotos: text(form.approvedPhotos),
    approvedReviews: text(form.approvedReviews),
    brandUseAuthorized: Boolean(form.brandUseAuthorized),
    servicesOffered: text(form.servicesOffered || form.services),
    servicesNotOffered: text(form.servicesNotOffered || form.excludedServices),
    equipmentBrands: text(form.equipmentBrands),
    customerType: text(form.customerType),
    customerLanguages: text(form.customerLanguages || form.languages),
    areasServed: text(form.areasServed || form.serviceArea),
    businessHours: text(form.businessHours),
    afterHoursProtocol: text(form.afterHoursProtocol),
    emergencyService: text(form.emergencyService),
    promotions: text(form.promotions),
    financing: text(form.financing),
    faqs: text(form.faqs),
    schedulingDetails: text(form.schedulingDetails),
    assistantLanguage: text(form.assistantLanguage),
    minimumLeadInfo: text(form.minimumLeadInfo),
    priorityJobs: text(form.priorityJobs),
    unwantedJobs: text(form.unwantedJobs),
    urgencyDefinition: text(form.urgencyDefinition),
    forbiddenQuestions: text(form.forbiddenQuestions),
    forbiddenClaims: text(form.forbiddenClaims || form.assistantRestrictions),
    pricingPermission: text(form.pricingPermission),
    arrivalTimePermission: text(form.arrivalTimePermission),
    schedulingPermission: text(form.schedulingPermission),
    leadDeliveryEmail: text(form.leadDeliveryEmail || form.leadEmail).toLowerCase(),
    backupLeadEmail: text(form.backupLeadEmail).toLowerCase(),
    crmDestination: text(form.crmDestination),
    leadReviewHours: text(form.leadReviewHours),
    followupOwner: text(form.followupOwner),
    requiredLeadData: text(form.requiredLeadData),
    sensitiveDataRestrictions: text(form.sensitiveDataRestrictions),
    retentionPreference: text(form.retentionPreference),
    privacyContact: text(form.privacyContact),
    websitePlatform: text(form.websitePlatform),
    websiteAdminContact: text(form.websiteAdminContact),
    dnsHostingController: text(form.dnsHostingController),
    installationCoordination: text(form.installationCoordination),
    accuracyConfirmed: Boolean(form.accuracyConfirmed),
    configurationAuthorized: Boolean(form.configurationAuthorized),
    isV3,
  };
}

function validateOnboarding(data) {
  const required = [
    ["Legal business name", data.legalBusinessName],
    ["Authorized contact name", data.authorizedContactName],
    ["Authorized contact phone", data.authorizedContactPhone],
    ["Website URL", data.websiteUrl],
    ["Service area", data.areasServed],
    ["Services offered", data.servicesOffered],
    ["Lead-delivery email", data.leadDeliveryEmail],
  ];

  if (data.isV3) {
    required.push(
      ["Business address", data.businessAddress],
      ["Authorized contact title", data.authorizedContactTitle],
      ["Services not offered", data.servicesNotOffered],
      ["Customer type", data.customerType],
      ["Languages served", data.customerLanguages],
      ["Business hours", data.businessHours],
      ["After-hours protocol", data.afterHoursProtocol],
      ["Emergency-service wording", data.emergencyService],
      ["Customer FAQs", data.faqs],
      ["Lead review hours", data.leadReviewHours],
      ["Follow-up owner", data.followupOwner],
      ["Required lead data", data.requiredLeadData],
      ["Privacy contact", data.privacyContact],
      ["Website platform", data.websitePlatform],
      ["Website administrator/contact", data.websiteAdminContact],
      ["DNS/hosting controller", data.dnsHostingController],
      ["Installation coordination", data.installationCoordination],
      ["Minimum lead information", data.minimumLeadInfo],
      ["Priority jobs", data.priorityJobs],
      ["Unwanted jobs", data.unwantedJobs],
      ["Urgency definition", data.urgencyDefinition],
      ["Forbidden claims", data.forbiddenClaims],
      ["Pricing permission", data.pricingPermission],
      ["Arrival-time permission", data.arrivalTimePermission],
      ["Scheduling permission", data.schedulingPermission],
    );
  }

  const missing = required.filter(([, value]) => !String(value || "").trim()).map(([label]) => label);
  if (missing.length > 0) {
    return `Missing required fields: ${missing.join(", ")}`;
  }

  if (!validEmail(data.authorizedContactEmail)) return "Authorized contact email is invalid";
  if (!validEmail(data.leadDeliveryEmail)) return "Primary lead-delivery email is invalid";
  if (data.backupLeadEmail && !validEmail(data.backupLeadEmail)) return "Backup lead email is invalid";

  if (data.isV3) {
    if (!data.brandUseAuthorized) return "Brand-use authorization is required";
    if (!data.accuracyConfirmed) return "Accuracy confirmation is required";
    if (!data.configurationAuthorized) return "Configuration authorization is required";
  }

  return "";
}

function onboardingSummary(data) {
  return `
LOCAL LEAD FORGE — CLIENT INTAKE RECEIVED
Schema: ${data.schemaVersion}
Source: ${data.source || "Not provided"}
Submitted: ${data.submittedAt || "Not provided"}

BUSINESS & AUTHORIZED CONTACT
Legal business name: ${data.legalBusinessName}
DBA: ${data.dbaName || "Not provided"}
Business address: ${data.businessAddress || "Not provided"}
Authorized contact: ${data.authorizedContactName}
Title: ${data.authorizedContactTitle || "Not provided"}
Contact email: ${data.authorizedContactEmail}
Contact phone: ${data.authorizedContactPhone}
Website: ${data.websiteUrl}
Professional license: ${data.professionalLicense || "Not provided"}
Social profiles: ${data.socialProfiles || "Not provided"}

BRAND & CONTENT
Brand colors: ${data.brandColors || "Not provided"}
Approved message/slogan: ${data.brandMessage || "Not provided"}
Logo/asset links: ${data.assetLinks || "Not provided"}
Approved photos: ${data.approvedPhotos || "Not provided"}
Approved reviews/testimonials: ${data.approvedReviews || "Not provided"}
Brand use authorized: ${data.brandUseAuthorized ? "Yes" : "No"}

OPERATIONS
Services offered: ${data.servicesOffered}
Services not offered: ${data.servicesNotOffered || "Not provided"}
Equipment/brands: ${data.equipmentBrands || "Not provided"}
Customer type: ${data.customerType || "Not provided"}
Languages served: ${data.customerLanguages || "Not provided"}
Service areas: ${data.areasServed}
Business hours: ${data.businessHours || "Not provided"}
After-hours protocol: ${data.afterHoursProtocol || "Not provided"}
Emergency service wording: ${data.emergencyService || "Not provided"}
Promotions: ${data.promotions || "None provided"}
Financing: ${data.financing || "None provided"}
Customer FAQs: ${data.faqs || "Not provided"}
Scheduling details: ${data.schedulingDetails || "Not provided"}

LEAD DELIVERY & PRIVACY
Primary lead email: ${data.leadDeliveryEmail}
Backup lead email: ${data.backupLeadEmail || "None"}
CRM/external destination: ${data.crmDestination || "None"}
Lead review hours: ${data.leadReviewHours || "Not provided"}
Follow-up owner: ${data.followupOwner || "Not provided"}
Required lead data: ${data.requiredLeadData || "Not provided"}
Sensitive data restrictions: ${data.sensitiveDataRestrictions || "Not provided"}
Retention preference: ${data.retentionPreference || "Not provided"}
Privacy/incident contact: ${data.privacyContact || "Not provided"}

WEBSITE & ACCESS
Website platform: ${data.websitePlatform || "Unknown"}
Website admin/contact: ${data.websiteAdminContact || "Not provided"}
DNS/hosting controller: ${data.dnsHostingController || "Not provided"}
Installation coordination: ${data.installationCoordination || "Not provided"}

ASSISTANT GUARDRAILS
Assistant language: ${data.assistantLanguage || "Not provided"}
Minimum lead information: ${data.minimumLeadInfo || "Not provided"}
Priority jobs: ${data.priorityJobs || "Not provided"}
Unwanted jobs: ${data.unwantedJobs || "Not provided"}
Urgency definition: ${data.urgencyDefinition || "Not provided"}
Forbidden questions: ${data.forbiddenQuestions || "None provided"}
Forbidden claims: ${data.forbiddenClaims || "None provided"}
Pricing permission: ${data.pricingPermission || "Not provided"}
Arrival-time permission: ${data.arrivalTimePermission || "Not provided"}
Scheduling permission: ${data.schedulingPermission || "Not provided"}

AUTHORIZATIONS
Accuracy confirmed: ${data.accuracyConfirmed ? "Yes" : "No"}
Configuration authorized: ${data.configurationAuthorized ? "Yes" : "No"}
`;
}

async function handleOnboarding(request, env, origin) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(origin) });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, origin);
  }

  const parsed = await readJsonWithLimit(request);
  if (parsed.error) {
    return json({ error: parsed.error }, parsed.status, origin);
  }

  const data = normalizeOnboarding(parsed.value || {});
  if (![1, 3].includes(data.schemaVersion)) {
    return json({ error: "Unsupported onboarding schema version" }, 400, origin);
  }

  const validationError = validateOnboarding(data);
  if (validationError) {
    return json({ error: validationError }, 400, origin);
  }

  const summaryText = onboardingSummary(data);

  try {
    await sendResendEmail(
      env,
      {
        from: "Local Lead Forge Intake <info@localleadforge.com>",
        to: ["localleadforgeagency@gmail.com"],
        reply_to: data.authorizedContactEmail,
        subject: `Client Intake Received — ${data.legalBusinessName}`,
        text: summaryText,
      },
      `llf-intake-internal/v${data.schemaVersion}/${data.authorizedContactEmail}/${data.legalBusinessName}`.slice(0, 256),
    );

    await sendResendEmail(
      env,
      {
        from: "Local Lead Forge <info@localleadforge.com>",
        to: [data.authorizedContactEmail],
        reply_to: "info@localleadforge.com",
        subject: "We Received Your Local Lead Forge Setup Information",
        text: `Hi ${data.authorizedContactName},\n\nWe received your business intake for ${data.legalBusinessName}. Your project is now moving into review and configuration. If anything essential is missing, we’ll contact you before configuration begins.\n\nLocal Lead Forge\nTurn more website visitors into qualified leads.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#172033"><h2 style="color:#0b1728">Information received</h2><p>Hi ${clean(data.authorizedContactName)},</p><p>We received your business intake for <strong>${clean(data.legalBusinessName)}</strong>. Your project is now moving into review and configuration.</p><p>If anything essential is missing, we’ll contact you before configuration begins.</p><p style="margin-top:28px"><strong>Local Lead Forge</strong><br><span style="color:#ff6a00">Turn more website visitors into qualified leads.</span></p></div>`,
      },
      `llf-intake-confirmation/v${data.schemaVersion}/${data.authorizedContactEmail}/${data.legalBusinessName}`.slice(0, 256),
    );
  } catch (error) {
    console.error(error);
    return json({ error: "Unable to process intake" }, 500, origin);
  }

  return json({ success: true, stage: "information-received", schemaVersion: data.schemaVersion }, 200, origin);
}

async function handleDemoLead(request, env, origin) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: cors(origin),
    });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, origin);
  }

  let lead;

  try {
    lead = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400, origin);
  }

  const {
    name,
    phone,
    issue,
    location,
    timing,
    language,
    demoEmail,
  } = lead;

  if (
    !name ||
    !phone ||
    !issue ||
    !location ||
    !timing ||
    !language ||
    !demoEmail
  ) {
    return json({ error: "Missing lead information" }, 400, origin);
  }

  const email = String(demoEmail).trim().toLowerCase();

  if (!validEmail(email)) {
    return json({ error: "Invalid email" }, 400, origin);
  }

  if (!emailAllowed(email)) {
    return json(
      { error: "Please use an approved prospect or Local Lead Forge test email address." },
      403,
      origin,
    );
  }

  try {
    await sendResendEmail(env, {
      from: "Local Lead Forge Demo <demo@localleadforge.com>",
      to: [email],
      subject: `Demo Website Lead — ${name} — ${location}`,
      text: `\nLOCAL LEAD FORGE\nDEMO WEBSITE LEAD\n\nCustomer: ${name}\nPhone: ${phone}\nHVAC issue: ${issue}\nLocation: ${location}\nRequested timing: ${timing}\nLanguage: ${language}\n\nThis is a demonstration lead generated through a personalized Local Lead Forge preview.\n\nIn a live installation, leads like this can be delivered automatically to your team, including leads captured outside normal business hours.\n\nLocal Lead Forge\nhttps://localleadforge.com\n`,
      html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#183b45">
  <div style="background:#183b45;color:white;padding:24px;border-radius:12px 12px 0 0">
    <div style="color:#f47735;font-size:12px;font-weight:bold">LOCAL LEAD FORGE</div>
    <h1>DEMO WEBSITE LEAD</h1>
  </div>
  <div style="padding:28px;border:1px solid #ddd">
    <p>This is what a qualified website lead could look like when delivered automatically to your team.</p>
    <p><strong>Customer:</strong> ${clean(name)}</p>
    <p><strong>Phone:</strong> ${clean(phone)}</p>
    <p><strong>HVAC issue:</strong> ${clean(issue)}</p>
    <p><strong>Location:</strong> ${clean(location)}</p>
    <p><strong>Requested timing:</strong> ${clean(timing)}</p>
    <p><strong>Language:</strong> ${clean(language)}</p>
    <a href="tel:${clean(phone)}" style="display:block;background:#f47735;color:#183b45;text-decoration:none;text-align:center;padding:14px;border-radius:30px;font-weight:bold;margin-top:24px">CALL CUSTOMER</a>
    <p style="margin-top:28px;font-size:13px;color:#666">Demo generated by <strong>Local Lead Forge</strong>. In a live installation, website leads can be delivered automatically to your team for follow-up.</p>
  </div>
</div>`,
    });
  } catch (error) {
    console.error(error);
    return json({ error: "Unable to send demo email" }, 500, origin);
  }

  return json({ success: true }, 200, origin);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/stripe-webhook") {
      return handleStripeWebhook(request, env);
    }

    const origin = request.headers.get("Origin") || "";
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return new Response("Forbidden", { status: 403 });
    }

    if (url.pathname === "/onboarding") {
      return handleOnboarding(request, env, origin);
    }

    return handleDemoLead(request, env, origin);
  },
};