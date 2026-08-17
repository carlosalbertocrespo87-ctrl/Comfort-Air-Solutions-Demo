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

const requiredConfig = ["companyName", "shortName", "emailDomain", "phoneDisplay", "serviceArea", "verifiedServices", "verifiedHighlights", "demoRules", "sourceReviewDate"];
for (const key of requiredConfig) {
  if (config[key] === undefined || config[key] === null || config[key] === "") {
    throw new Error(`Config field missing: ${key}`);
  }
}

const requiredMarkers = [config.shortName, config.emailDomain, config.phoneDisplay];
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
if (config.demoRules?.noFakeReviews !== true) throw new Error("demoRules.noFakeReviews must be true");
if (config.demoRules?.noRealServiceRequest !== true) throw new Error("demoRules.noRealServiceRequest must be true");
if (config.demoRules?.unofficialDemo !== true) throw new Error("demoRules.unofficialDemo must be true");

console.log(`Generic demo validation passed for ${config.companyName} (${slug}).`);
