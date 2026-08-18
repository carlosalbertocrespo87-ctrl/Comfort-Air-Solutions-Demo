import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const templateRoot = path.resolve(here, "..");
const appPath = path.join(templateRoot, "src/App.tsx");
const source = fs.readFileSync(appPath, "utf8");

const required = [
  'data-stage7-conversion="v1"',
  "How Local Lead Forge works for your business",
  "What happens if you decide to move forward?",
  "Cómo funciona Local Lead Forge para tu negocio",
  "¿Qué pasa si decides avanzar?",
  "Local Lead Forge — localleadforge.com",
  "mailto:info@localleadforge.com",
  "<Stage7ConversionLayer />",
];

for (const marker of required) {
  if (!source.includes(marker)) throw new Error(`Stage 7 validation failed; missing marker: ${marker}`);
}

if (source.includes("Book Your Strategy Call")) throw new Error("Stage 7 validation failed; legacy competing commercial CTA remains");
if (/href=\{`tel:\$\{prospectConfig\.phoneDisplay/.test(source)) throw new Error("Stage 7 validation failed; clickable prospect phone remains");

const finalCtaCount = (source.match(/mailto:info@localleadforge\.com/g) || []).length;
if (finalCtaCount !== 1) throw new Error(`Stage 7 validation failed; expected exactly one final commercial CTA, found ${finalCtaCount}`);

console.log("Stage 7 conversion validation PASS");
