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
  ['companyName: "PROSPECT HVAC COMPANY"', 'companyName: "AB Refrigeration Heating & Cooling LLC"'],
  ['shortName: "PROSPECT HVAC"', 'shortName: "AB Refrigeration"'],
  ['emailDomain: "prospectcompany.com"', 'emailDomain: "abrefrigeration.org"'],
  ['phoneDisplay: "(000) 000-0000"', 'phoneDisplay: "470-443-4090"'],
  ['serviceArea: "TARGET SERVICE AREA"', 'serviceArea: "Metro Atlanta"'],
  ['sinceYear: "20XX"', 'sinceYear: "15+ years"'],
  ['since: `Serving ${prospectConfig.serviceArea} since`', 'since: `Serving ${prospectConfig.serviceArea} for`'],
  ['El equipo local de confort del oeste metropolitano de Georgia', 'El equipo local de refrigeración y climatización de Metro Atlanta'],
  ['en el oeste metropolitano de Georgia', 'en Metro Atlanta'],
  ['Servicio HVAC confiable en el oeste metropolitano de Georgia.', 'Servicio de refrigeración comercial ligera y HVAC en Metro Atlanta.'],
  ['Nos enorgullece servir comunidades en todo el oeste metropolitano de Georgia.', 'Nos enorgullece servir negocios y comunidades de Metro Atlanta.'],
  ['body: "You should never need an engineering degree to understand your own home. We pair technical excellence with the kind of human service that makes a stressful day feel manageable."', 'copy: "Light-commercial refrigeration and HVAC service should be easy to understand. This demo emphasizes clear qualification, direct communication, and fast mobile access to the right service path."'],
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
const verifiedHighlights = `    reviews: {\n      eyebrow: "Verified highlights",\n      title1: "Refrigeration + HVAC",\n      title2: "for Metro Atlanta.",\n      items: [\n        {\n          quote: "The official site publicly positions AB Refrigeration around light-commercial refrigeration and HVAC service.",\n          name: "Service focus",\n          location: "Official website",\n          initials: "AB",\n        },\n        {\n          quote: "Public service information lists installation, repair, maintenance, and 24/7 emergency service.",\n          name: "Service scope",\n          location: "Official website",\n          initials: "24",\n        },\n        {\n          quote: "The company publicly states 15+ years of experience serving the market.",\n          name: "Experience",\n          location: "Official website",\n          initials: "15",\n        },\n      ],\n    },\n`;
source = source.slice(0, reviewsStart) + verifiedHighlights + source.slice(contactStart);

const required = [
  'companyName: "AB Refrigeration Heating & Cooling LLC"',
  'emailDomain: "abrefrigeration.org"',
  'phoneDisplay: "470-443-4090"',
  'serviceArea: "Metro Atlanta"',
  'Verified highlights',
  'placeholderAnswer: "Type your answer..."',
  'doneNote:',
  'phone: prospectConfig.phoneDisplay'
];
for (const marker of required) {
  if (!source.includes(marker)) throw new Error(`AB Refrigeration config marker missing after transform: ${marker}`);
}
fs.writeFileSync(appPath, source);

let html = fs.readFileSync(indexPath, "utf8");
html = html.split('PROSPECT HVAC COMPANY').join('AB Refrigeration Heating & Cooling LLC');
html = html.split('Prospect HVAC').join('AB Refrigeration Heating & Cooling LLC');
if (!html.includes('noindex, nofollow, noarchive')) {
  throw new Error('Noindex meta tag missing from index.html');
}
fs.writeFileSync(indexPath, html);

fs.writeFileSync(robotsPath, 'User-agent: *\nDisallow: /\n');

console.log("Applied AB Refrigeration configuration, bilingual key normalization, verified highlights, metadata and robots protection.");
