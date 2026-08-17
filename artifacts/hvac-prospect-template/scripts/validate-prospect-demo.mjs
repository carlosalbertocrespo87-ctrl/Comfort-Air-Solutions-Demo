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

const requiredConfig = ["companyName", "shortName", "website", "phoneDisplay", "serviceArea", "verifiedHighlights", "sourceReviewDate"];
for (const key of requiredConfig) {
  if (config[key] === undefined || config[key] === null || config[key] === "") {
    throw new Error(`Config field missing: ${key}`);
  }
}
if (!Array.isArray(config.verifiedHighlights) || config.verifiedHighlights.length < 3) throw new Error("At least three verifiedHighlights are required");

let emailDomain = config.emailDomain;
if (!emailDomain) {
  try {
    emailDomain = new URL(config.website).hostname.replace(/^www\./, "");
  } catch {
    throw new Error("emailDomain is missing and could not be derived from website");
  }
}

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

const rules = {
  unofficialDemo: true,
  noRealServiceRequest: true,
  noFakeReviews: true,
  ...config.demoRules,
};
if (rules.noFakeReviews !== true) throw new Error("demoRules.noFakeReviews must be true");
if (rules.noRealServiceRequest !== true) throw new Error("demoRules.noRealServiceRequest must be true");
if (rules.unofficialDemo !== true) throw new Error("demoRules.unofficialDemo must be true");

console.log(`Generic demo validation passed for ${config.companyName} (${slug}).`);
