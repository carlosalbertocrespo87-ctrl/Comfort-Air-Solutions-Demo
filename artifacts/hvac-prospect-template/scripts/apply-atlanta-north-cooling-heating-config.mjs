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
  ['companyName: "PROSPECT HVAC COMPANY"', 'companyName: "Atlanta North Cooling and Heating Inc"'],
  ['shortName: "PROSPECT HVAC"', 'shortName: "Atlanta North Cooling & Heating"'],
  ['emailDomain: "prospectcompany.com"', 'emailDomain: "metrocomfortsolution.com"'],
  ['phoneDisplay: "(000) 000-0000"', 'phoneDisplay: "770-591-0901"'],
  ['serviceArea: "TARGET SERVICE AREA"', 'serviceArea: "Woodstock & North Metro Atlanta"'],
  ['sinceYear: "20XX"', 'sinceYear: "30+ years"'],
  ['since: `Serving ${prospectConfig.serviceArea} since`', 'since: `Serving ${prospectConfig.serviceArea} ·`'],
  ['El equipo local de confort del oeste metropolitano de Georgia', 'El equipo local de calefacción y aire de Woodstock y North Metro Atlanta'],
  ['en el oeste metropolitano de Georgia', 'en Woodstock y North Metro Atlanta'],
  ['Servicio HVAC confiable en el oeste metropolitano de Georgia.', 'Servicio HVAC residencial para Woodstock y North Metro Atlanta.'],
  ['Nos enorgullece servir comunidades en todo el oeste metropolitano de Georgia.', 'Nos enorgullece servir Woodstock y comunidades del norte metropolitano de Atlanta.'],
  ['body: "You should never need an engineering degree to understand your own home. We pair technical excellence with the kind of human service that makes a stressful day feel manageable."', 'copy: "HVAC service should be easy to understand and easy to request. This demo modernizes a simple form-led experience with a clearer mobile-first bilingual qualification path while preserving Atlanta North\'s local family-owned positioning."'],
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

const verifiedHighlights = `    reviews: {\n      eyebrow: "Verified highlights",\n      title1: "Family-owned local HVAC",\n      title2: "with a clear modernization opportunity.",\n      items: [\n        {\n          quote: "The official site states over 30 years of HVAC experience and identifies Atlanta North Cooling and Heating as family owned and locally based.",\n          name: "Experience + local positioning",\n          location: "Official website",\n          initials: "AN",\n        },\n        {\n          quote: "The official site publishes 770-591-0901, text number 770-480-4179 and Georgia license CN210377.",\n          name: "Verified contact + license",\n          location: "Official website",\n          initials: "GA",\n        },\n        {\n          quote: "The site lists AC and furnace service/repair, replacement estimates, planned service agreements, indoor air quality and service across multiple North Metro Atlanta communities.",\n          name: "Service scope",\n          location: "Official website",\n          initials: "HV",\n        },\n      ],\n    },\n`;
source = source.slice(0, reviewsStart) + verifiedHighlights + source.slice(contactStart);

const required = [
  'companyName: "Atlanta North Cooling and Heating Inc"',
  'emailDomain: "metrocomfortsolution.com"',
  'phoneDisplay: "770-591-0901"',
  'serviceArea: "Woodstock & North Metro Atlanta"',
  'Verified highlights',
  'placeholderAnswer: "Type your answer..."',
  'doneNote:',
  'phone: prospectConfig.phoneDisplay'
];
for (const marker of required) {
  if (!source.includes(marker)) throw new Error(`Atlanta North config marker missing after transform: ${marker}`);
}
fs.writeFileSync(appPath, source);

let html = fs.readFileSync(indexPath, "utf8");
html = html.split('PROSPECT HVAC COMPANY').join("Atlanta North Cooling and Heating Inc");
html = html.split('Prospect HVAC').join("Atlanta North Cooling & Heating");
if (!html.includes('noindex, nofollow, noarchive')) throw new Error('Noindex meta tag missing from index.html');
fs.writeFileSync(indexPath, html);
fs.writeFileSync(robotsPath, 'User-agent: *\nDisallow: /\n');

console.log("Applied Atlanta North Cooling & Heating configuration, bilingual key normalization, verified highlights, metadata and robots protection.");
