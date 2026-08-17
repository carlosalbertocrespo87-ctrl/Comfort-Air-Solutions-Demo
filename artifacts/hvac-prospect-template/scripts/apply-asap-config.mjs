import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appPath = path.resolve(here, "../src/App.tsx");

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

const required = [
  'companyName: "ASAP Heating & Air Conditioning"',
  'emailDomain: "fixacasap.com"',
  'phoneDisplay: "770-717-2727"',
  'sinceYear: "1997"'
];

for (const marker of required) {
  if (!source.includes(marker)) throw new Error(`ASAP config marker missing after transform: ${marker}`);
}

fs.writeFileSync(appPath, source);
console.log("Applied ASAP Heating & Air Conditioning demo configuration.");
