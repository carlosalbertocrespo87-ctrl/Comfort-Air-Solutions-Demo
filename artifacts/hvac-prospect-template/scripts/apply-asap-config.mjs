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
  ['companyName: "PROSPECT HVAC COMPANY"', 'companyName: "ASAP Heating & Air Conditioning"'],
  ['shortName: "PROSPECT HVAC"', 'shortName: "ASAP Heating & Air"'],
  ['emailDomain: "prospectcompany.com"', 'emailDomain: "fixacasap.com"'],
  ['phoneDisplay: "(000) 000-0000"', 'phoneDisplay: "770-717-2727"'],
  ['serviceArea: "TARGET SERVICE AREA"', 'serviceArea: "Alpharetta, Johns Creek, Roswell & Milton"'],
  ['sinceYear: "20XX"', 'sinceYear: "1997"'],
  ['El equipo local de confort del oeste metropolitano de Georgia', 'El equipo local de confort de Alpharetta, Johns Creek, Roswell y Milton'],
  ['en el oeste metropolitano de Georgia', 'en Alpharetta, Johns Creek, Roswell y Milton'],
  ['Servicio HVAC confiable en el oeste metropolitano de Georgia.', 'Servicio HVAC confiable en Alpharetta, Johns Creek, Roswell y Milton.'],
  ['Nos enorgullece servir comunidades en todo el oeste metropolitano de Georgia.', 'Nos enorgullece servir Alpharetta, Johns Creek, Roswell, Milton y comunidades cercanas.']
];

for (const [from, to] of replacements) {
  if (source.includes(from)) source = source.split(from).join(to);
}

const reviewsStart = source.indexOf('    reviews: {', source.indexOf('  en: {'));
const contactStart = source.indexOf('    contact: {', reviewsStart);
if (reviewsStart === -1 || contactStart === -1) {
  throw new Error('English reviews block not found');
}
const verifiedHighlights = `    reviews: {\n      eyebrow: "Verified highlights",\n      title1: "Local service",\n      title2: "since 1997.",\n      items: [\n        {\n          quote: "Locally owned and operated since 1997.",\n          name: "Company profile",\n          location: "Official website",\n          initials: "97",\n        },\n        {\n          quote: "Public service coverage includes Alpharetta, Johns Creek, Roswell and Milton.",\n          name: "Service area",\n          location: "Official website",\n          initials: "GA",\n        },\n        {\n          quote: "Publicly listed services include AC and heating installation, repair, maintenance and replacement.",\n          name: "Service scope",\n          location: "Official website",\n          initials: "HV",\n        },\n      ],\n    },\n`;
source = source.slice(0, reviewsStart) + verifiedHighlights + source.slice(contactStart);

const required = [
  'companyName: "ASAP Heating & Air Conditioning"',
  'emailDomain: "fixacasap.com"',
  'phoneDisplay: "770-717-2727"',
  'sinceYear: "1997"',
  'Verified highlights'
];
for (const marker of required) {
  if (!source.includes(marker)) throw new Error(`ASAP config marker missing after transform: ${marker}`);
}
fs.writeFileSync(appPath, source);

let html = fs.readFileSync(indexPath, "utf8");
html = html.split('PROSPECT HVAC COMPANY').join('ASAP Heating & Air Conditioning');
html = html.split('Prospect HVAC').join('ASAP Heating & Air Conditioning');
if (!html.includes('noindex, nofollow, noarchive')) {
  throw new Error('Noindex meta tag missing from index.html');
}
fs.writeFileSync(indexPath, html);

fs.writeFileSync(robotsPath, 'User-agent: *\nDisallow: /\n');

console.log("Applied ASAP configuration, verified highlights, metadata and robots protection.");
