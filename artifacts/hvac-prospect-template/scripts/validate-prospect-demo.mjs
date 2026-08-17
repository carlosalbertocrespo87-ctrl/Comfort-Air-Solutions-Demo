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
const websiteHost = config.website ? new URL(config.website).hostname.replace(/^www\./, "") : "";
const emailDomain = config.emailDomain || websiteHost;

const requiredConfig = ["companyName", "shortName", "website", "phoneDisplay", "serviceArea", "verifiedServices", "verifiedHighlights", "sourceReviewDate"];
for (const key of requiredConfig) {
  if (config[key] === undefined || config[key] === null || config[key] === "") {
    throw new Error(`Config field missing: ${key}`);
  }
}
if (!emailDomain) throw new Error("emailDomain could not be inferred from website");
if (!Array.isArray(config.verifiedHighlights) || config.verifiedHighlights.length < 3) throw new Error("At least three verifiedHighlights are required");
if (!Array.isArray(config.verifiedServices) || config.verifiedServices.length < 1) throw new Error("At least one verified service is required");

const requiredMarkers = [config.shortName, emailDomain, config.phoneDisplay];
for (const marker of requiredMarkers) {
  if (!app.includes(String(marker))) throw new Error(`Configured marker missing from App.tsx: ${marker}`);
}

const forbidden = [
  "PROSPECT HVAC COMPANY",
  "TARGET SERVICE AREA",
  "prospectcompany.com",
  "Marianne R.",
  "Daniel K.",
  "Priya S."
];
for (const marker of forbidden) {
  if (app.includes(marker)) throw new Error(`Forbidden template marker remains: ${marker}`);
}

if (!html.includes("noindex, nofollow, noarchive")) throw new Error("Noindex meta tag missing");
if (!robots.includes("Disallow: /")) throw new Error("robots.txt must disallow crawling");
if (config.demoRules) {
  if (config.demoRules.noFakeReviews !== true) throw new Error("demoRules.noFakeReviews must be true when supplied");
  if (config.demoRules.noRealServiceRequest !== true) throw new Error("demoRules.noRealServiceRequest must be true when supplied");
  if (config.demoRules.unofficialDemo !== true) throw new Error("demoRules.unofficialDemo must be true when supplied");
}

console.log(`Generic demo validation passed for ${config.companyName} (${slug}).`);
