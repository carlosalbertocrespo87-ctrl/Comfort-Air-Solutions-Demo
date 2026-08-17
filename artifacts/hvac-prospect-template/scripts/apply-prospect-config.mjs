import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const templateRoot = path.resolve(here, "..");
const repoRoot = path.resolve(templateRoot, "../..");
const [slug] = process.argv.slice(2);
if (!slug) throw new Error("Usage: node scripts/apply-prospect-config.mjs <prospect-slug>");

const configPath = path.join(repoRoot, "artifacts", "prospect-configs", `${slug}.json`);
if (!fs.existsSync(configPath)) throw new Error(`Missing config ${configPath}`);
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const appPath = path.join(templateRoot, "src/App.tsx");
const indexPath = path.join(templateRoot, "index.html");
const robotsPath = path.join(templateRoot, "public/robots.txt");
let source = fs.readFileSync(appPath, "utf8");

const esc = (value) => String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"').replaceAll("`", "\\`");
const area = config.serviceArea;
const positioning = config.sinceYear || config.positioningLabel || "Local HVAC";
const opportunity = config.opportunity || `A clearer mobile-first bilingual lead qualification experience for ${config.shortName}.`;

const replacements = [
  ['companyName: "PROSPECT HVAC COMPANY"', `companyName: "${esc(config.companyName)}"`],
  ['shortName: "PROSPECT HVAC"', `shortName: "${esc(config.shortName)}"`],
  ['emailDomain: "prospectcompany.com"', `emailDomain: "${esc(config.emailDomain)}"`],
  ['phoneDisplay: "(000) 000-0000"', `phoneDisplay: "${esc(config.phoneDisplay)}"`],
  ['serviceArea: "TARGET SERVICE AREA"', `serviceArea: "${esc(area)}"`],
  ['sinceYear: "20XX"', `sinceYear: "${esc(positioning)}"`],
  ['since: `Serving ${prospectConfig.serviceArea} since`', 'since: `Serving ${prospectConfig.serviceArea} ·`'],
  ['El equipo local de confort del oeste metropolitano de Georgia', `El equipo local de calefacción y aire de ${esc(area)}`],
  ['en el oeste metropolitano de Georgia', `en ${esc(area)}`],
  ['Servicio HVAC confiable en el oeste metropolitano de Georgia.', `Servicio HVAC para ${esc(area)}.`],
  ['Nos enorgullece servir comunidades en todo el oeste metropolitano de Georgia.', `Nos enorgullece servir ${esc(area)}.`],
  ['body: "You should never need an engineering degree to understand your own home. We pair technical excellence with the kind of human service that makes a stressful day feel manageable."', `copy: "${esc(opportunity)}"`],
  ['answerPlaceholder: "Type your answer..."', 'placeholderAnswer: "Type your answer..."'],
  ['closeNote:\n        "You can close this window — your summary is ready for the team."', 'doneNote:\n        "You can close this window — your summary is ready for the team."'],
  ['talk: "Talk to us",\n      hours: "Mon–Fri · 8:00am–5:00pm"', 'talk: "Talk to us",\n      phone: prospectConfig.phoneDisplay,\n      hours: "Contact for current hours"']
];
for (const [from, to] of replacements) {
  if (source.includes(from)) source = source.split(from).join(to);
}

const highlights = Array.isArray(config.verifiedHighlights) ? config.verifiedHighlights.slice(0, 3) : [];
if (highlights.length < 3) throw new Error("At least three verifiedHighlights are required for generic demo generation");
const reviewsStart = source.indexOf('    reviews: {', source.indexOf('  en: {'));
const contactStart = source.indexOf('    contact: {', reviewsStart);
if (reviewsStart === -1 || contactStart === -1) throw new Error("English reviews block not found");
const items = highlights.map((quote, i) => `        {\n          quote: "${esc(quote)}",\n          name: "Verified highlight ${i + 1}",\n          location: "Public-source review",\n          initials: "V${i + 1}",\n        }`).join(',\n');
const verifiedBlock = `    reviews: {\n      eyebrow: "Verified highlights",\n      title1: "${esc(config.shortName)}",\n      title2: "public facts, clearly presented.",\n      items: [\n${items}\n      ],\n    },\n`;
source = source.slice(0, reviewsStart) + verifiedBlock + source.slice(contactStart);

fs.writeFileSync(appPath, source);
let html = fs.readFileSync(indexPath, "utf8");
html = html.split("PROSPECT HVAC COMPANY").join(config.companyName);
html = html.split("Prospect HVAC").join(config.shortName);
fs.writeFileSync(indexPath, html);
fs.writeFileSync(robotsPath, "User-agent: *\nDisallow: /\n");

console.log(`Applied generic prospect configuration for ${config.companyName} (${slug}).`);
