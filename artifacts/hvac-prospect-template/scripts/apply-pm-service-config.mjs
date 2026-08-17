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
  ['companyName: "PROSPECT HVAC COMPANY"', 'companyName: "PM Service Company LLC"'],
  ['shortName: "PROSPECT HVAC"', 'shortName: "PM Service Company"'],
  ['emailDomain: "prospectcompany.com"', 'emailDomain: "pmservicecompany.net"'],
  ['phoneDisplay: "(000) 000-0000"', 'phoneDisplay: "470-757-3300"'],
  ['serviceArea: "TARGET SERVICE AREA"', 'serviceArea: "Stonecrest & Atlanta"'],
  ['sinceYear: "20XX"', 'sinceYear: "2021"'],
  ['El equipo local de confort del oeste metropolitano de Georgia', 'El equipo local de confort de Stonecrest y Atlanta'],
  ['en el oeste metropolitano de Georgia', 'en Stonecrest y Atlanta'],
  ['Servicio HVAC confiable en el oeste metropolitano de Georgia.', 'Servicio HVAC confiable en Stonecrest y Atlanta.'],
  ['Nos enorgullece servir comunidades en todo el oeste metropolitano de Georgia.', 'Nos enorgullece servir Stonecrest, Atlanta y comunidades cercanas.'],
  ['body: "You should never need an engineering degree to understand your own home. We pair technical excellence with the kind of human service that makes a stressful day feel manageable."', 'copy: "You should never need an engineering degree to understand your own home. We pair technical excellence with the kind of human service that makes a stressful day feel manageable."'],
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
const verifiedHighlights = `    reviews: {\n      eyebrow: "Verified highlights",\n      title1: "Local HVAC service",\n      title2: "for Stonecrest & Atlanta.",\n      items: [\n        {\n          quote: "The official site publicly lists HVAC installation, heat-pump and maintenance services.",\n          name: "Service scope",\n          location: "Official website",\n          initials: "HV",\n        },\n        {\n          quote: "Public contact information lists 470-757-3300 and pmservicecompany@gmail.com.",\n          name: "Public contact",\n          location: "Official website",\n          initials: "PM",\n        },\n        {\n          quote: "Georgia public records list PM Service Company LLC as active/compliant, formed in 2021.",\n          name: "Business record",\n          location: "Georgia public record",\n          initials: "GA",\n        },\n      ],\n    },\n`;
source = source.slice(0, reviewsStart) + verifiedHighlights + source.slice(contactStart);

const required = [
  'companyName: "PM Service Company LLC"',
  'emailDomain: "pmservicecompany.net"',
  'phoneDisplay: "470-757-3300"',
  'serviceArea: "Stonecrest & Atlanta"',
  'Verified highlights',
  'placeholderAnswer: "Type your answer..."',
  'doneNote:',
  'phone: prospectConfig.phoneDisplay'
];
for (const marker of required) {
  if (!source.includes(marker)) throw new Error(`PM Service config marker missing after transform: ${marker}`);
}
fs.writeFileSync(appPath, source);

let html = fs.readFileSync(indexPath, "utf8");
html = html.split('PROSPECT HVAC COMPANY').join('PM Service Company LLC');
html = html.split('Prospect HVAC').join('PM Service Company LLC');
if (!html.includes('noindex, nofollow, noarchive')) {
  throw new Error('Noindex meta tag missing from index.html');
}
fs.writeFileSync(indexPath, html);

fs.writeFileSync(robotsPath, 'User-agent: *\nDisallow: /\n');

console.log("Applied PM Service Company configuration, bilingual key normalization, verified highlights, metadata and robots protection.");
