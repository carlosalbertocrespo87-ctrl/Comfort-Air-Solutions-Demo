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
  ['companyName: "PROSPECT HVAC COMPANY"', 'companyName: "Pro Cool Heating and Air Inc."'],
  ['shortName: "PROSPECT HVAC"', 'shortName: "Pro Cool Heating & Air"'],
  ['emailDomain: "prospectcompany.com"', 'emailDomain: "procoolheatingandair.com"'],
  ['phoneDisplay: "(000) 000-0000"', 'phoneDisplay: "678-927-1262"'],
  ['serviceArea: "TARGET SERVICE AREA"', 'serviceArea: "Marietta, Cobb County & Metro Atlanta"'],
  ['sinceYear: "20XX"', 'sinceYear: "Local residential HVAC"'],
  ['since: `Serving ${prospectConfig.serviceArea} since`', 'since: `Serving ${prospectConfig.serviceArea} ·`'],
  ['El equipo local de confort del oeste metropolitano de Georgia', 'El equipo local de calefacción y aire de Marietta y Cobb County'],
  ['en el oeste metropolitano de Georgia', 'en Marietta, Cobb County y Metro Atlanta'],
  ['Servicio HVAC confiable en el oeste metropolitano de Georgia.', 'Servicio HVAC residencial para Marietta, Cobb County y Metro Atlanta.'],
  ['Nos enorgullece servir comunidades en todo el oeste metropolitano de Georgia.', 'Nos enorgullece servir hogares de Marietta, Cobb County y Metro Atlanta.'],
  ['body: "You should never need an engineering degree to understand your own home. We pair technical excellence with the kind of human service that makes a stressful day feel manageable."', 'copy: "HVAC service should be easy to understand and easy to request. This demo modernizes a text-heavy experience with a clearer mobile qualification path and direct local-service messaging."'],
  ['answerPlaceholder: "Type your answer..."', 'placeholderAnswer: "Type your answer..."'],
  ['closeNote:\n        "You can close this window — your summary is ready for the team."', 'doneNote:\n        "You can close this window — your summary is ready for the team."'],
  ['talk: "Talk to us",\n      hours: "Mon–Fri · 8:00am–5:00pm"', 'talk: "Talk to us",\n      phone: prospectConfig.phoneDisplay,\n      hours: "Mon–Fri · 8:00am–5:00pm"']
];

for (const [from, to] of replacements) {
  if (source.includes(from)) source = source.split(from).join(to);
}

const reviewsStart = source.indexOf('    reviews: {', source.indexOf('  en: {'));
const contactStart = source.indexOf('    contact: {', reviewsStart);
if (reviewsStart === -1 || contactStart === -1) {
  throw new Error('English reviews block not found');
}
const verifiedHighlights = `    reviews: {\n      eyebrow: "Verified highlights",\n      title1: "Local residential HVAC",\n      title2: "with a clear modernization opportunity.",\n      items: [\n        {\n          quote: "The official site identifies Pro Cool as a licensed and insured residential HVAC company in Marietta and publishes Georgia license CR110067.",\n          name: "License + local positioning",\n          location: "Official website",\n          initials: "PC",\n        },\n        {\n          quote: "The official site publishes 678-927-1262 and describes residential repair, service and installation.",\n          name: "Service scope",\n          location: "Official website",\n          initials: "HV",\n        },\n        {\n          quote: "The current site still relies on a basic email form and coupon pages with 2025 expiration dates, creating a concrete modernization opportunity.",\n          name: "Conversion opportunity",\n          location: "Official website",\n          initials: "UX",\n        },\n      ],\n    },\n`;
source = source.slice(0, reviewsStart) + verifiedHighlights + source.slice(contactStart);

const required = [
  'companyName: "Pro Cool Heating and Air Inc."',
  'emailDomain: "procoolheatingandair.com"',
  'phoneDisplay: "678-927-1262"',
  'serviceArea: "Marietta, Cobb County & Metro Atlanta"',
  'Verified highlights',
  'placeholderAnswer: "Type your answer..."',
  'doneNote:',
  'phone: prospectConfig.phoneDisplay'
];
for (const marker of required) {
  if (!source.includes(marker)) throw new Error(`Pro Cool config marker missing after transform: ${marker}`);
}
fs.writeFileSync(appPath, source);

let html = fs.readFileSync(indexPath, "utf8");
html = html.split('PROSPECT HVAC COMPANY').join("Pro Cool Heating and Air Inc.");
html = html.split('Prospect HVAC').join("Pro Cool Heating & Air");
if (!html.includes('noindex, nofollow, noarchive')) {
  throw new Error('Noindex meta tag missing from index.html');
}
fs.writeFileSync(indexPath, html);

fs.writeFileSync(robotsPath, 'User-agent: *\nDisallow: /\n');

console.log("Applied Pro Cool Heating & Air configuration, bilingual key normalization, verified highlights, metadata and robots protection.");
