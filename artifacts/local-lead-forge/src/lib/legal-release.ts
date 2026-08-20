// GitHub Pages stages physical index files for the registered SPA routes below so deep links return HTTP 200 before React applies the legal release gate.
export const LEGAL_RELEASED = false;

export const LEGAL_VERSION = "DRAFT-2026-08-20";
export const LEGAL_EFFECTIVE_DATE = "Pending final legal/entity approval";

export const LEGAL_CONTACT_EMAIL = "info@localleadforge.com";

export const LEGAL_PATHS = {
  privacy: "/privacy/",
  terms: "/terms/",
  dpa: "/dpa/",
  start: "/start/",
} as const;

export const CHECKOUT_URLS = {
  setup: "",
  monthly: "",
} as const;
