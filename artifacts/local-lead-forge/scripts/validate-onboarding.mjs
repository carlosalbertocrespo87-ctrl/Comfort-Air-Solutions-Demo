import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd(), "artifacts/local-lead-forge");
const pagePath = resolve(root, "src/pages/onboarding.tsx");
const mainPath = resolve(root, "src/main.tsx");
const headersPath = resolve(root, "public/_headers");
const staleStaticPath = resolve(root, "public/onboarding/index.html");

const page = readFileSync(pagePath, "utf8");
const main = readFileSync(mainPath, "utf8");
const headers = readFileSync(headersPath, "utf8");
const failures = [];
function requireText(sourceName, source, needle, reason) { if (!source.includes(needle)) failures.push(`${sourceName}: missing ${needle} — ${reason}`); }

const requiredFormFields = ["legalBusinessName","dbaName","businessAddress","authorizedContactName","authorizedContactTitle","authorizedContactEmail","authorizedContactPhone","websiteUrl","professionalLicense","socialProfiles","brandColors","brandMessage","assetLinks","approvedPhotos","approvedReviews","brandUseAuthorized","servicesOffered","servicesNotOffered","equipmentBrands","customerType","customerLanguages","areasServed","businessHours","afterHoursProtocol","emergencyService","promotions","financing","faqs","schedulingDetails","assistantLanguage","minimumLeadInfo","priorityJobs","unwantedJobs","urgencyDefinition","forbiddenQuestions","forbiddenClaims","pricingPermission","arrivalTimePermission","schedulingPermission","leadDeliveryEmail","backupLeadEmail","crmDestination","leadReviewHours","followupOwner","requiredLeadData","sensitiveDataRestrictions","retentionPreference","privacyContact","websitePlatform","websiteAdminContact","dnsHostingController","installationCoordination","accuracyConfirmed","configurationAuthorized"];
for (const field of requiredFormFields) requireText("onboarding.tsx", page, field, "required by the LLF client onboarding intake contract");

const requiredSafetyAndUx = [
["VITE_ONBOARDING_ENDPOINT","submission must use an explicitly configured endpoint"],["schemaVersion: 3","the current Worker submission contract must remain versioned"],["localleadforge.com/onboarding","submission source must remain attributable"],["llf-client-onboarding-save-enabled","persistent browser storage must remain opt-in"],["Avoid enabling this on a shared computer","saved-progress privacy warning must remain visible"],["Do not submit passwords, API keys","sensitive-credential warning must remain visible"],["Do not invent prices, guarantees, appointment confirmations, arrival times, licenses, promotions or services.","assistant guardrails must retain safe defaults"],["No — do not quote or estimate prices unless separately approved.","pricing must remain opt-in"],["No — do not promise arrival times without real-time data.","arrival-time promises must remain opt-in"],["No — do not confirm appointments without a live scheduling integration.","appointment confirmation must remain opt-in"],["brandUseAuthorized","brand/material use must require explicit authorization"],["accuracyConfirmed","business facts must be explicitly confirmed"],["configurationAuthorized","configuration must be explicitly authorized"]];
for (const [needle, reason] of requiredSafetyAndUx) requireText("onboarding.tsx", page, needle, reason);
requireText("main.tsx", main, "const isOnboarding = normalizedPath === '/onboarding';", "the canonical React onboarding route must remain wired");
requireText("_headers", headers, "/onboarding", "onboarding must keep scoped response headers");
requireText("_headers", headers, "X-Robots-Tag: noindex, nofollow, noarchive", "private intake must not be indexed");
requireText("_headers", headers, "Referrer-Policy: strict-origin-when-cross-origin", "onboarding must retain its referrer policy");
requireText("_headers", headers, "X-Content-Type-Options: nosniff", "onboarding must retain MIME sniffing protection");
if (existsSync(staleStaticPath)) failures.push("public/onboarding/index.html exists — keep one canonical React /onboarding implementation only");
if (failures.length) { console.error("LLF onboarding regression contract failed:\n"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log(`LLF onboarding regression contract passed (${requiredFormFields.length} intake fields + safety/routing checks).`);
