import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const componentPath = path.join(root, "src/components/demo-conversion-layer.tsx");
const mainPath = path.join(root, "src/main.tsx");

const component = fs.readFileSync(componentPath, "utf8");
const main = fs.readFileSync(mainPath, "utf8");

const requiredComponentMarkers = [
  'id="llf-process"',
  'How Local Lead Forge works',
  'Cómo funciona Local Lead Forge',
  'A visitor starts a conversation',
  'El visitante inicia una conversación',
  'If you decide to move forward',
  'Si decides avanzar',
  'href="#pricing"',
  'private, unofficial concept demo',
  'demo privada y no oficial',
  'does not send a real service request or guarantee lead volume, appointments, revenue or ROI',
  'No envía una solicitud real de servicio ni garantiza volumen de leads, citas, ingresos o ROI',
  'Local Lead Forge keeps the system running',
  'Local Lead Forge mantiene el sistema',
];

for (const marker of requiredComponentMarkers) {
  if (!component.includes(marker)) throw new Error(`Stage 7 marker missing: ${marker}`);
}

const requiredMainMarkers = [
  "import { DemoConversionLayer } from '@/components/demo-conversion-layer';",
  '<DemoConversionLayer />',
];
for (const marker of requiredMainMarkers) {
  if (!main.includes(marker)) throw new Error(`Stage 7 mount marker missing: ${marker}`);
}

const safeNegativeContext = component
  .split("\n")
  .filter((line) => !/does not send a real service request or guarantee|No envía una solicitud real de servicio ni garantiza/i.test(line))
  .join("\n");
const forbiddenPatterns = [
  /guarantee(?:d|s)?\s+(?:leads?|sales?|revenue|appointments?|roi)/i,
  /we guarantee/i,
  /guaranteed results/i,
];
for (const pattern of forbiddenPatterns) {
  if (pattern.test(safeNegativeContext)) throw new Error(`Unsafe Stage 7 claim detected: ${pattern}`);
}

const enButton = component.includes('setLanguage("en")');
const esButton = component.includes('setLanguage("es")');
if (!enButton || !esButton) throw new Error("Stage 7 EN/ES toggle contract is incomplete");

console.log("Stage 7 conversion contract passed.");
