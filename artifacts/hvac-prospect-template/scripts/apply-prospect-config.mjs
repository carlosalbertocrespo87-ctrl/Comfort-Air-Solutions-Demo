import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const templateRoot = path.resolve(here, "..");
const repoRoot = path.resolve(templateRoot, "../..");
const [slug] = process.argv.slice(2);

if (!slug) {
  throw new Error("Usage: node scripts/apply-prospect-config.mjs <prospect-slug>");
}

const configPath = path.join(repoRoot, "artifacts", "prospect-configs", `${slug}.json`);
if (!fs.existsSync(configPath)) {
  throw new Error(`Missing config ${configPath}`);
}

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const required = [
  "companyName",
  "shortName",
  "website",
  "phoneDisplay",
  "serviceArea",
];

for (const key of required) {
  if (config[key] === undefined || config[key] === null || config[key] === "") {
    throw new Error(`Config field missing: ${key}`);
  }
}

let emailDomain = config.emailDomain;
if (!emailDomain) {
  try {
    emailDomain = new URL(config.website).hostname.replace(/^www\./, "");
  } catch {
    throw new Error("emailDomain is missing and could not be derived from website");
  }
}

const appPath = path.join(templateRoot, "src/App.tsx");
const indexPath = path.join(templateRoot, "index.html");
const robotsPath = path.join(templateRoot, "public/robots.txt");
let source = fs.readFileSync(appPath, "utf8");

const esc = (value) =>
  String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"')
    .replaceAll("`", "\\`");

const positioning = config.sinceYear || config.positioningLabel || "Local HVAC";
const replacements = [
  ['companyName: "PROSPECT HVAC COMPANY"', `companyName: "${esc(config.companyName)}"`],
  ['shortName: "PROSPECT HVAC"', `shortName: "${esc(config.shortName)}"`],
  ['emailDomain: "prospectcompany.com"', `emailDomain: "${esc(emailDomain)}"`],
  ['phoneDisplay: "(000) 000-0000"', `phoneDisplay: "${esc(config.phoneDisplay)}"`],
  ['serviceArea: "TARGET SERVICE AREA"', `serviceArea: "${esc(config.serviceArea)}"`],
  ['sinceYear: "20XX"', `sinceYear: "${esc(positioning)}"`],
];

for (const [from, to] of replacements) {
  if (source.includes(from)) {
    source = source.replace(from, to);
    continue;
  }
  if (!source.includes(to)) {
    throw new Error(`Demo master marker missing: ${from}`);
  }
}

// Intake/config-driven service choices. Existing prospect configs already carry
// verifiedServices; use up to four verified labels instead of a fixed HVAC list.
const defaultServices = ["AC not cooling", "Heating issue", "Maintenance", "New system"];
const configuredServices = Array.isArray(config.verifiedServices) && config.verifiedServices.length
  ? config.verifiedServices.slice(0, 4).map(String)
  : defaultServices;
const defaultServiceLiteral = '["AC not cooling", "Heating issue", "Maintenance", "New system"]';
const configuredServiceLiteral = JSON.stringify(configuredServices);
if (source.includes(defaultServiceLiteral)) {
  source = source.replace(defaultServiceLiteral, configuredServiceLiteral);
}

// Private sales demos may show a verified public number as text, but must not
// provide a live call action that could be confused with the prospect's site.
source = source.replace(
  /<a href=\{`tel:\$\{prospectConfig\.phoneDisplay\.replace\(\/\[\^\+\\d\]\/g, ""\)\}`\} className="([^"]+)">\s*<MailCheck className="h-3\.5 w-3\.5" \/> Send to \{prospectConfig\.shortName\} Team\s*<\/a>/m,
  '<div className="$1" aria-label={`Demo lead delivery preview for ${prospectConfig.shortName}`}>\n        <MailCheck className="h-3.5 w-3.5" /> Send to {prospectConfig.shortName} Team\n      </div>'
);

fs.writeFileSync(appPath, source);

let html = fs.readFileSync(indexPath, "utf8");
html = html.split("PROSPECT HVAC COMPANY").join(config.companyName);
html = html.split("Prospect HVAC").join(config.shortName);

if (!html.includes("noindex, nofollow, noarchive")) {
  throw new Error("Noindex meta tag missing from index.html");
}

fs.writeFileSync(indexPath, html);
fs.writeFileSync(robotsPath, "User-agent: *\nDisallow: /\n");

console.log(`Applied private-demo configuration for ${config.companyName} (${slug}).`);
console.log(`Configured service choices: ${configuredServices.join(" | ")}`);
