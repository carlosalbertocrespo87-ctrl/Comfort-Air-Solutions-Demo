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
  ['companyName: "PROSPECT HVAC COMPANY"', 'companyName: "Bob\'s Heating & Air"'],
  ['shortName: "PROSPECT HVAC"', 'shortName: "Bob\'s Heating & Air"'],
  ['emailDomain: "prospectcompany.com"', 'emailDomain: "bobsheatingandair.com"'],
  ['phoneDisplay: "(000) 000-0000"', 'phoneDisplay: "404-606-0548"'],
  ['serviceArea: "TARGET SERVICE AREA"', 'serviceArea: "North Metro Atlanta"'],
  ['sinceYear: "20XX"', 'sinceYear: "30+ years"'],
  ['since: `Serving ${prospectConfig.serviceArea} since`', 'since: `Serving ${prospectConfig.serviceArea} with`'],
  ['El equipo local de confort del oeste metropolitano de Georgia', 'El equipo local de calefacción y aire de North Metro Atlanta'],
  ['en el oeste metropolitano de Georgia', 'en North Metro Atlanta'],
  ['Servicio HVAC confiable en el oeste metropolitano de Georgia.', 'Servicio HVAC local para North Metro Atlanta.'],
  ['Nos enorgullece servir comunidades en todo el oeste metropolitano de Georgia.', 'Nos enorgullece servir comunidades de North Metro Atlanta.'],
  ['body: "You should never need an engineering degree to understand your own home. We pair technical excellence with the kind of human service that makes a stressful day feel manageable."', 'copy: "HVAC service should be easy to understand and easy to request. This demo emphasizes clear mobile qualification, direct communication, and a simple path to the right service."'],
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
const verifiedHighlights = `    reviews: {\n      eyebrow: "Verified highlights",\n      title1: "Local HVAC experience",\n      title2: "for North Metro Atlanta.",\n      items: [\n        {\n          quote: "The official site identifies Bob Roy as founder and highlights 30+ years of HVAC experience.",\n          name: "Founder + experience",\n          location: "Official website",\n          initials: "BR",\n        },\n        {\n          quote: "Public service information covers repair, installation, maintenance, and indoor air quality.",\n          name: "Service scope",\n          location: "Official website",\n          initials: "HV",\n        },\n        {\n          quote: "The company publicly highlights NATE credentials and North Metro Atlanta service positioning.",\n          name: "Credentials + area",\n          location: "Official website",\n          initials: "NA",\n        },\n      ],\n    },\n`;
source = source.slice(0, reviewsStart) + verifiedHighlights + source.slice(contactStart);

const required = [
  'companyName: "Bob\'s Heating & Air"',
  'emailDomain: "bobsheatingandair.com"',
  'phoneDisplay: "404-606-0548"',
  'serviceArea: "North Metro Atlanta"',
  'Verified highlights',
  'placeholderAnswer: "Type your answer..."',
  'doneNote:',
  'phone: prospectConfig.phoneDisplay'
];
for (const marker of required) {
  if (!source.includes(marker)) throw new Error(`Bob's Heating & Air config marker missing after transform: ${marker}`);
}
fs.writeFileSync(appPath, source);

let html = fs.readFileSync(indexPath, "utf8");
html = html.split('PROSPECT HVAC COMPANY').join("Bob's Heating & Air");
html = html.split('Prospect HVAC').join("Bob's Heating & Air");
if (!html.includes('noindex, nofollow, noarchive')) {
  throw new Error('Noindex meta tag missing from index.html');
}
fs.writeFileSync(indexPath, html);

fs.writeFileSync(robotsPath, 'User-agent: *\nDisallow: /\n');

console.log("Applied Bob's Heating & Air configuration, bilingual key normalization, verified highlights, metadata and robots protection.");
