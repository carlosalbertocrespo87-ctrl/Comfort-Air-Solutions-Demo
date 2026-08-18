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
      <div style="margin-top:8px;color:#ff8a34;font-size:14px">Turn more visitors into booked jobs.</div>
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

async function handleOnboarding(request, env, origin) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(origin) });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, origin);
  }

  let form;
  try {
    form = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400, origin);
  }

  const data = {
    businessName: text(form.businessName),
    contactName: text(form.contactName),
    email: text(form.email).toLowerCase(),
    phone: text(form.phone),
    website: text(form.website),
    serviceArea: text(form.serviceArea),
    businessHours: text(form.businessHours),
    services: text(form.services),
    excludedServices: text(form.excludedServices),
    leadEmail: text(form.leadEmail).toLowerCase(),
    backupLeadEmail: text(form.backupLeadEmail).toLowerCase(),
    websitePlatform: text(form.websitePlatform),
    languages: text(form.languages),
    assistantRestrictions: text(form.assistantRestrictions),
    notes: text(form.notes),
  };

  if (!data.businessName || !data.contactName || !validEmail(data.email) || !data.phone || !data.website || !data.serviceArea || !data.services || !validEmail(data.leadEmail)) {
    return json({ error: "Please complete all required fields" }, 400, origin);
  }

  if (data.backupLeadEmail && !validEmail(data.backupLeadEmail)) {
    return json({ error: "Backup lead email is invalid" }, 400, origin);
  }

  const summaryText = `
LOCAL LEAD FORGE — CLIENT INTAKE RECEIVED

Business: ${data.businessName}
Authorized contact: ${data.contactName}
Contact email: ${data.email}
Phone: ${data.phone}
Website: ${data.website}
Service area: ${data.serviceArea}
Business hours: ${data.businessHours || "Not provided"}
Services: ${data.services}
Services not offered: ${data.excludedServices || "Not provided"}
Lead delivery email: ${data.leadEmail}
Backup lead email: ${data.backupLeadEmail || "None"}
Website platform: ${data.websitePlatform || "Unknown"}
Languages: ${data.languages || "Not provided"}
Assistant restrictions: ${data.assistantRestrictions || "None provided"}
Notes: ${data.notes || "None"}
`;

  try {
    await sendResendEmail(
      env,
      {
        from: "Local Lead Forge Intake <info@localleadforge.com>",
        to: ["localleadforgeagency@gmail.com"],
        reply_to: data.email,
        subject: `Client Intake Received — ${data.businessName}`,
        text: summaryText,
      },
      `llf-intake-internal/${data.email}/${data.businessName}`.slice(0, 256),
    );

    await sendResendEmail(
      env,
      {
        from: "Local Lead Forge <info@localleadforge.com>",
        to: [data.email],
        reply_to: "info@localleadforge.com",
        subject: "We Received Your Local Lead Forge Setup Information",
        text: `Hi ${data.contactName},\n\nWe received your business intake for ${data.businessName}. Your project is now moving into review and configuration. If anything essential is missing, we’ll contact you before the production clock starts.\n\nLocal Lead Forge\nTurn more visitors into booked jobs.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#172033"><h2 style="color:#0b1728">Information received</h2><p>Hi ${clean(data.contactName)},</p><p>We received your business intake for <strong>${clean(data.businessName)}</strong>. Your project is now moving into review and configuration.</p><p>If anything essential is missing, we’ll contact you before the production clock starts.</p><p style="margin-top:28px"><strong>Local Lead Forge</strong><br><span style="color:#ff6a00">Turn more visitors into booked jobs.</span></p></div>`,
      },
      `llf-intake-confirmation/${data.email}/${data.businessName}`.slice(0, 256),
    );
  } catch (error) {
    console.error(error);
    return json({ error: "Unable to process intake" }, 500, origin);
  }

  return json({ success: true, stage: "information-received" }, 200, origin);
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
