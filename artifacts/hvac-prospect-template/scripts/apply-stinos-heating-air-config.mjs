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
  ['companyName: "PROSPECT HVAC COMPANY"', 'companyName: "Stinos Heating & Air Services LLC"'],
  ['shortName: "PROSPECT HVAC"', 'shortName: "Stinos Heating & Air"'],
  ['emailDomain: "prospectcompany.com"', 'emailDomain: "stinosheatingair.com"'],
  ['phoneDisplay: "(000) 000-0000"', 'phoneDisplay: "706-908-7616"'],
  ['serviceArea: "TARGET SERVICE AREA"', 'serviceArea: "Conyers, Georgia"'],
  ['sinceYear: "20XX"', 'sinceYear: "2018"'],
  ['El equipo local de confort del oeste metropolitano de Georgia', 'El equipo local de calefacción y aire de Conyers'],
  ['en el oeste metropolitano de Georgia', 'en Conyers, Georgia'],
  ['Servicio HVAC confiable en el oeste metropolitano de Georgia.', 'Servicio HVAC para hogares y negocios de Conyers, Georgia.'],
  ['Nos enorgullece servir comunidades en todo el oeste metropolitano de Georgia.', 'Nos enorgullece servir a la comunidad de Conyers, Georgia.'],
  ['body: "You should never need an engineering degree to understand your own home. We pair technical excellence with the kind of human service that makes a stressful day feel manageable."', 'copy: "HVAC service should be easy to understand and easy to request. This demo creates a clearer mobile-first bilingual qualification path while preserving Stinos\' local service positioning."'],
  ['answerPlaceholder: "Type your answer..."', 'placeholderAnswer: "Type your answer..."'],
  ['closeNote:\n        "You can close this window — your summary is ready for the team."', 'doneNote:\n        "You can close this window — your summary is ready for the team."'],
  ['talk: "Talk to us",\n      hours: "Mon–Fri · 8:00am–5:00pm"', 'talk: "Talk to us",\n      phone: prospectConfig.phoneDisplay,\n      hours: "Mon–Sat · hours vary"']
];

for (const [from, to] of replacements) {
  if (source.includes(from)) source = source.split(from).join(to);
}

const reviewsStart = source.indexOf('    reviews: {', source.indexOf('  en: {'));
const contactStart = source.indexOf('    contact: {', reviewsStart);
if (reviewsStart === -1 || contactStart === -1) {
  throw new Error('English reviews block not found');
}
const verifiedHighlights = `    reviews: {\n      eyebrow: "Verified highlights",\n      title1: "Local HVAC service",\n      title2: "with a strong mobile upgrade opportunity.",\n      items: [\n        {\n          quote: "The official site identifies Stinos Heating & Air Services LLC as a Conyers, Georgia HVAC company established in 2018.",\n          name: "Local positioning",\n          location: "Official website",\n          initials: "ST",\n        },\n        {\n          quote: "The official site publishes 706-908-7616 and info@stinosheatingair.com and lists AC installation, heating repair, maintenance, system upgrades and emergency repairs.",\n          name: "Service scope",\n          location: "Official website",\n          initials: "HV",\n        },\n        {\n          quote: "BBB identifies Austin Ugboma as business management and principal contact for the company.",\n          name: "Public business contact",\n          location: "BBB profile",\n          initials: "AU",\n        },\n      ],\n    },\n`;
source = source.slice(0, reviewsStart) + verifiedHighlights + source.slice(contactStart);

const required = [
  'companyName: "Stinos Heating & Air Services LLC"',
  'emailDomain: "stinosheatingair.com"',
  'phoneDisplay: "706-908-7616"',
  'serviceArea: "Conyers, Georgia"',
  'Verified highlights',
  'placeholderAnswer: "Type your answer..."',
  'doneNote:',
  'phone: prospectConfig.phoneDisplay'
];
for (const marker of required) {
  if (!source.includes(marker)) throw new Error(`Stinos config marker missing after transform: ${marker}`);
}
fs.writeFileSync(appPath, source);

let html = fs.readFileSync(indexPath, "utf8");
html = html.split('PROSPECT HVAC COMPANY').join("Stinos Heating & Air Services LLC");
html = html.split('Prospect HVAC').join("Stinos Heating & Air");
if (!html.includes('noindex, nofollow, noarchive')) {
  throw new Error('Noindex meta tag missing from index.html');
}
fs.writeFileSync(indexPath, html);

fs.writeFileSync(robotsPath, 'User-agent: *\nDisallow: /\n');

console.log("Applied Stinos Heating & Air configuration, bilingual key normalization, verified highlights, metadata and robots protection.");
