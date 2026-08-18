import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const templateRoot = path.resolve(here, "..");
const repoRoot = path.resolve(templateRoot, "../..");

const [slug] = process.argv.slice(2);
if (!slug) throw new Error("Usage: node scripts/validate-prospect-demo.mjs <prospect-slug>");

const configPath = path.join(repoRoot, "artifacts", "prospect-configs", `${slug}.json`);
if (!fs.existsSync(configPath)) throw new Error(`Missing prospect config: ${configPath}`);

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const app = fs.readFileSync(path.join(templateRoot, "src/App.tsx"), "utf8");
const html = fs.readFileSync(path.join(templateRoot, "index.html"), "utf8");
const robots = fs.readFileSync(path.join(templateRoot, "public/robots.txt"), "utf8");

const requiredConfig = ["companyName", "shortName", "website", "phoneDisplay", "serviceArea"];
for (const key of requiredConfig) {
  if (config[key] === undefined || config[key] === null || config[key] === "") throw new Error(`Config field missing: ${key}`);
}

let emailDomain = config.emailDomain;
if (!emailDomain) {
  try {
    emailDomain = new URL(config.website).hostname.replace(/^www\./, "");
  } catch {
    throw new Error("emailDomain is missing and could not be derived from website");
  }
}

const requiredMarkers = [config.companyName, config.shortName, emailDomain, config.phoneDisplay, config.serviceArea];
for (const marker of requiredMarkers) {
  if (!app.includes(String(marker))) throw new Error(`Configured marker missing from App.tsx: ${marker}`);
}

const forbidden = ["PROSPECT HVAC COMPANY", "TARGET SERVICE AREA", "prospectcompany.com", "Marianne R.", "Daniel K.", "Priya S."];
for (const marker of forbidden) {
  if (app.includes(marker)) throw new Error(`Forbidden template marker remains: ${marker}`);
}

if (!html.includes("noindex, nofollow, noarchive")) throw new Error("Noindex meta tag missing");
if (!robots.includes("Disallow: /")) throw new Error("robots.txt must disallow crawling");
if (/href\s*=\s*{?`?tel:/i.test(app) || /href\s*=\s*["']tel:/i.test(app)) throw new Error("Clickable tel: link detected. Prospect demos must display phone numbers as non-clickable text only.");

const rules = { unofficialDemo: true, noRealServiceRequest: true, noFakeReviews: true, noClickableProspectPhone: true, ...config.demoRules };
if (rules.noFakeReviews !== true) throw new Error("demoRules.noFakeReviews must be true");
if (rules.noRealServiceRequest !== true) throw new Error("demoRules.noRealServiceRequest must be true");
if (rules.unofficialDemo !== true) throw new Error("demoRules.unofficialDemo must be true");
if (rules.noClickableProspectPhone !== true) throw new Error("demoRules.noClickableProspectPhone must be true");

if (Number(config.schemaVersion) === 3) {
  const requiredV3 = ["businessHours", "languages", "faqs", "leadRouting", "guardrails"];
  for (const key of requiredV3) {
    const value = config[key];
    if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) throw new Error(`schemaVersion 3 field missing: ${key}`);
  }
  if (!Array.isArray(config.primaryServices) || config.primaryServices.length === 0) throw new Error("schemaVersion 3 requires primaryServices");
  if (!config.leadRouting.primaryEmail) throw new Error("schemaVersion 3 requires leadRouting.primaryEmail");
  if (!app.includes("const clientOperationalConfig =")) throw new Error("Operational client config was not embedded into App.tsx");

  const v3Markers = [
    config.businessHours,
    ...config.languages,
    ...config.primaryServices.slice(0, 4),
    config.leadRouting.primaryEmail,
    ...config.faqs.flatMap((faq) => [faq.question, faq.answer]).slice(0, 6),
  ].filter(Boolean);
  for (const marker of v3Markers) {
    if (!app.includes(String(marker))) throw new Error(`Intake v3 marker missing from generated App.tsx: ${marker}`);
  }
}

console.log(`Generic private-demo validation passed for ${config.companyName} (${slug}).`);
