import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const appPath = path.join(root, "src/App.tsx");
const indexPath = path.join(root, "index.html");
const robotsPath = path.join(root, "public/robots.txt");

let source = fs.readFileSync(appPath, "utf8");

const replacements = [
  ['companyName: "PROSPECT HVAC COMPANY"', 'companyName: "Affordable Air Repair Inc."'],
  ['shortName: "PROSPECT HVAC"', 'shortName: "Affordable Air Repair"'],
  ['emailDomain: "prospectcompany.com"', 'emailDomain: "affordableairrepair.com"'],
  ['phoneDisplay: "(000) 000-0000"', 'phoneDisplay: "770-652-4040"'],
  ['serviceArea: "TARGET SERVICE AREA"', 'serviceArea: "Smyrna, Cartersville & Metro Atlanta"'],
  ['sinceYear: "20XX"', 'sinceYear: "Residential HVAC"'],
  ['since: `Serving ${prospectConfig.serviceArea} since`', 'since: `Serving ${prospectConfig.serviceArea} ·`'],
  ['El equipo local de confort del oeste metropolitano de Georgia', 'El equipo local de calefacción y aire de Smyrna y Metro Atlanta'],
  ['en el oeste metropolitano de Georgia', 'en Smyrna, Cartersville y Metro Atlanta'],
  ['Servicio HVAC confiable en el oeste metropolitano de Georgia.', 'Servicio HVAC residencial para Smyrna, Cartersville y Metro Atlanta.'],
  ['Nos enorgullece servir comunidades en todo el oeste metropolitano de Georgia.', 'Nos enorgullece servir hogares en Smyrna, Cartersville y Metro Atlanta.'],
  ['body: "You should never need an engineering degree to understand your own home. We pair technical excellence with the kind of human service that makes a stressful day feel manageable."', 'copy: "HVAC service should be easy to understand and easy to request. This demo turns Affordable Air Repair\'s content-led local presence into a clearer mobile-first bilingual qualification experience while preserving verified service positioning."'],
  ['answerPlaceholder: "Type your answer..."', 'placeholderAnswer: "Type your answer..."'],
  ['closeNote:\n        "You can close this window — your summary is ready for the team."', 'doneNote:\n        "You can close this window — your summary is ready for the team."'],
  ['talk: "Talk to us",\n      hours: "Mon–Fri · 8:00am–5:00pm"', 'talk: "Talk to us",\n      phone: prospectConfig.phoneDisplay,\n      hours: "Contact for current hours"']
];

for (const [from, to] of replacements) {
  if (source.includes(from)) source = source.split(from).join(to);
}

const reviewsStart = source.indexOf('    reviews: {', source.indexOf('  en: {'));
const contactStart = source.indexOf('    contact: {', reviewsStart);
if (reviewsStart === -1 || contactStart === -1) throw new Error('English reviews block not found');

const verifiedHighlights = `    reviews: {\n      eyebrow: "Verified highlights",\n      title1: "Residential HVAC expertise",\n      title2: "with a clearer conversion opportunity.",\n      items: [\n        {\n          quote: "The official site currently publishes HVAC guidance for homeowners in Smyrna, Marietta and Cartersville, Georgia.",\n          name: "Local market presence",\n          location: "Official website",\n          initials: "AR",\n        },\n        {\n          quote: "The official site describes residential HVAC repair, replacement, maintenance and indoor air quality services.",\n          name: "Verified service scope",\n          location: "Official website",\n          initials: "HV",\n        },\n        {\n          quote: "CRM verification identifies Brian Goolsby as CEO from a Georgia filing and records the public phone number 770-652-4040.",\n          name: "Verified business contact",\n          location: "LLF CRM verification",\n          initials: "BG",\n        },\n      ],\n    },\n`;
source = source.slice(0, reviewsStart) + verifiedHighlights + source.slice(contactStart);

const required = [
  'companyName: "Affordable Air Repair Inc."',
  'emailDomain: "affordableairrepair.com"',
  'phoneDisplay: "770-652-4040"',
  'serviceArea: "Smyrna, Cartersville & Metro Atlanta"',
  'Verified highlights',
  'placeholderAnswer: "Type your answer..."',
  'doneNote:',
  'phone: prospectConfig.phoneDisplay'
];
for (const marker of required) {
  if (!source.includes(marker)) throw new Error(`Affordable Air Repair config marker missing after transform: ${marker}`);
}
fs.writeFileSync(appPath, source);

let html = fs.readFileSync(indexPath, "utf8");
html = html.split('PROSPECT HVAC COMPANY').join("Affordable Air Repair Inc.");
html = html.split('Prospect HVAC').join("Affordable Air Repair");
if (!html.includes('noindex, nofollow, noarchive')) throw new Error('Noindex meta tag missing from index.html');
fs.writeFileSync(indexPath, html);
fs.writeFileSync(robotsPath, 'User-agent: *\nDisallow: /\n');

console.log("Applied Affordable Air Repair configuration, bilingual key normalization, verified highlights, metadata and robots protection.");
