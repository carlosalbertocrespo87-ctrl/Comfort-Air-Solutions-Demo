import worker from "../../../infrastructure/cloudflare/local-lead-forge-demo-mailer.worker.js";

const originalFetch = globalThis.fetch;
const sends = [];

globalThis.fetch = async (input, init = {}) => {
  const url = typeof input === "string" ? input : input.url;
  if (url !== "https://api.resend.com/emails") {
    throw new Error(`Unexpected outbound request during test: ${url}`);
  }

  const payload = JSON.parse(init.body || "{}");
  sends.push({ url, payload, headers: init.headers || {} });
  return new Response(JSON.stringify({ id: `test-email-${sends.length}` }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function makePayload(overrides = {}) {
  return {
    schemaVersion: 3,
    source: "localleadforge.com/onboarding",
    submittedAt: "2026-08-18T08:00:00.000Z",
    legalBusinessName: "LLF Test HVAC LLC",
    dbaName: "LLF Test HVAC",
    businessAddress: "123 Test Ave, Atlanta, GA 30303",
    authorizedContactName: "Test Client",
    authorizedContactTitle: "Owner",
    authorizedContactEmail: "info@localleadforge.com",
    authorizedContactPhone: "404-555-0100",
    websiteUrl: "https://example.com",
    professionalLicense: "",
    socialProfiles: "https://example.com/social",
    brandColors: "Navy and orange",
    brandMessage: "Approved test message",
    assetLinks: "https://example.com/logo.png",
    approvedPhotos: "https://example.com/photo.jpg",
    approvedReviews: "Approved test review",
    brandUseAuthorized: true,
    servicesOffered: "AC repair, heating repair, maintenance",
    servicesNotOffered: "Plumbing",
    equipmentBrands: "Carrier, Trane",
    customerType: "Residential",
    customerLanguages: "English, Spanish",
    areasServed: "Atlanta, GA 30303",
    businessHours: "Mon-Fri 8am-6pm",
    afterHoursProtocol: "Capture lead and flag urgency; do not promise dispatch.",
    emergencyService: "Emergency requests are reviewed by the team; availability is not guaranteed.",
    promotions: "None",
    financing: "None",
    faqs: "Q: Do you service Atlanta? A: Yes, within approved service areas.",
    schedulingDetails: "Team confirms appointments manually.",
    assistantLanguage: "en-es",
    minimumLeadInfo: "Name, phone, service needed, city/ZIP, urgency",
    priorityJobs: "No-cool and replacement opportunities",
    unwantedJobs: "Plumbing",
    urgencyDefinition: "No cooling with vulnerable occupant or safety concern",
    forbiddenQuestions: "Do not ask for payment-card or SSN data.",
    forbiddenClaims: "Do not invent prices, guarantees, appointments, arrival times, licenses, promotions or services.",
    pricingPermission: "No — do not quote or estimate prices unless separately approved.",
    arrivalTimePermission: "No — do not promise arrival times without real-time data.",
    schedulingPermission: "No — do not confirm appointments without a live scheduling integration.",
    leadDeliveryEmail: "localleadforgeagency@gmail.com",
    backupLeadEmail: "info@localleadforge.com",
    crmDestination: "None",
    leadReviewHours: "Mon-Fri 8am-6pm",
    followupOwner: "Test Client",
    requiredLeadData: "Name, phone, issue, location, timing",
    sensitiveDataRestrictions: "Passwords, API keys, SSNs, payment-card data",
    retentionPreference: "Not specified",
    privacyContact: "info@localleadforge.com",
    websitePlatform: "WordPress",
    websiteAdminContact: "Test Client",
    dnsHostingController: "Test Client",
    installationCoordination: "Delegated access with minimum required permissions",
    accuracyConfirmed: true,
    configurationAuthorized: true,
    ...overrides,
  };
}

async function callOnboarding(payload, origin = "https://localleadforge.com") {
  const request = new Request("https://worker.test/onboarding", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Origin: origin,
    },
    body: JSON.stringify(payload),
  });
  return worker.fetch(request, { RESEND_API_KEY: "test-only-key" });
}

try {
  const initialSendCount = sends.length;
  const successResponse = await callOnboarding(makePayload());
  const successJson = await successResponse.json();

  assert(successResponse.status === 200, `Expected schema v3 success status 200, received ${successResponse.status}`);
  assert(successJson.success === true, "Expected schema v3 success=true");
  assert(successJson.schemaVersion === 3, "Expected response to report schemaVersion 3");
  assert(sends.length === initialSendCount + 2, "Expected exactly two simulated Resend messages for valid intake");

  const internalMessage = sends[initialSendCount].payload;
  const confirmationMessage = sends[initialSendCount + 1].payload;
  assert(internalMessage.to?.[0] === "localleadforgeagency@gmail.com", "Internal intake must route only to the approved LLF inbox");
  assert(confirmationMessage.to?.[0] === "info@localleadforge.com", "Confirmation must route to the authorized contact email from the test payload");
  assert(internalMessage.text?.includes("AC repair, heating repair, maintenance"), "Internal summary must include services offered");
  assert(internalMessage.text?.includes("Do not invent prices"), "Internal summary must preserve assistant guardrails");
  assert(internalMessage.text?.includes("Brand use authorized: Yes"), "Internal summary must preserve brand-use authorization");

  const beforeInvalid = sends.length;
  const invalidAuthorizationResponse = await callOnboarding(makePayload({ brandUseAuthorized: false }));
  const invalidAuthorizationJson = await invalidAuthorizationResponse.json();
  assert(invalidAuthorizationResponse.status === 400, "Missing brand authorization must be rejected");
  assert(/authorization/i.test(invalidAuthorizationJson.error || ""), "Rejected brand authorization should return a clear error");
  assert(sends.length === beforeInvalid, "Rejected intake must not trigger any email send");

  const unsupportedResponse = await callOnboarding(makePayload({ schemaVersion: 99 }));
  assert(unsupportedResponse.status === 400, "Unsupported schema version must be rejected");
  assert(sends.length === beforeInvalid, "Unsupported schema must not trigger any email send");

  const forbiddenOriginResponse = await callOnboarding(makePayload(), "https://malicious.example");
  assert(forbiddenOriginResponse.status === 403, "Unapproved origin must be rejected");
  assert(sends.length === beforeInvalid, "Forbidden origin must not trigger any email send");

  const oversizedResponse = await callOnboarding(makePayload({ faqs: "x".repeat(70 * 1024) }));
  assert(oversizedResponse.status === 413, "Oversized onboarding body must be rejected");
  assert(sends.length === beforeInvalid, "Oversized request must not trigger any email send");

  console.log("LLF onboarding Worker contract test passed.");
  console.log(`Simulated Resend calls: ${sends.length}`);
} finally {
  globalThis.fetch = originalFetch;
}
