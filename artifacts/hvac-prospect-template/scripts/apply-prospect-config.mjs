import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const templateRoot = path.resolve(here, "..");
const repoRoot = path.resolve(templateRoot, "../..");
const [slug] = process.argv.slice(2);

if (!slug) throw new Error("Usage: node scripts/apply-prospect-config.mjs <prospect-slug>");

const configPath = path.join(repoRoot, "artifacts", "prospect-configs", `${slug}.json`);
if (!fs.existsSync(configPath)) throw new Error(`Missing config ${configPath}`);

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const required = ["companyName", "shortName", "website", "phoneDisplay", "serviceArea"];
for (const key of required) {
  if (config[key] === undefined || config[key] === null || config[key] === "") throw new Error(`Config field missing: ${key}`);
}

let emailDomain = config.emailDomain;
if (!emailDomain) {
  try {
    emailDomain = new URL(config.website).hostname.replace(/^www\./, "");
  } catch {
    throw new Error("emailDomain is missing and could not be derived from website");
  }
}

const appPath = path.join(templateRoot, "src/App.tsx");
const indexPath = path.join(templateRoot, "index.html");
const robotsPath = path.join(templateRoot, "public/robots.txt");
let source = fs.readFileSync(appPath, "utf8");

const esc = (value) => String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"').replaceAll("`", "\\`");
const positioning = config.sinceYear || config.positioningLabel || "Local HVAC";
const replacements = [
  ['companyName: "PROSPECT HVAC COMPANY"', `companyName: "${esc(config.companyName)}"`],
  ['shortName: "PROSPECT HVAC"', `shortName: "${esc(config.shortName)}"`],
  ['emailDomain: "prospectcompany.com"', `emailDomain: "${esc(emailDomain)}"`],
  ['phoneDisplay: "(000) 000-0000"', `phoneDisplay: "${esc(config.phoneDisplay)}"`],
  ['serviceArea: "TARGET SERVICE AREA"', `serviceArea: "${esc(config.serviceArea)}"`],
  ['sinceYear: "20XX"', `sinceYear: "${esc(positioning)}"`],
];
for (const [from, to] of replacements) {
  if (source.includes(from)) source = source.replace(from, to);
  else if (!source.includes(to)) throw new Error(`Demo master marker missing: ${from}`);
}

const defaultServices = ["AC not cooling", "Heating issue", "Maintenance", "New system"];
const serviceSource = config.primaryServices || config.verifiedServices;
const configuredServices = Array.isArray(serviceSource) && serviceSource.length ? serviceSource.slice(0, 4).map(String) : defaultServices;
const defaultServiceLiteral = '["AC not cooling", "Heating issue", "Maintenance", "New system"]';
if (source.includes(defaultServiceLiteral)) source = source.replace(defaultServiceLiteral, JSON.stringify(configuredServices));

const operationalConfig = {
  schemaVersion: Number(config.schemaVersion || 1),
  businessHours: config.businessHours || null,
  languages: Array.isArray(config.languages) && config.languages.length ? config.languages : (config.demoRules?.bilingual || ["en", "es"]),
  faqs: Array.isArray(config.faqs) ? config.faqs : [],
  leadRouting: config.leadRouting || { primaryEmail: config.publicEmail || null, backupEmail: null },
  guardrails: config.guardrails || {
    pricingPromises: false,
    appointmentPromises: false,
    serviceAvailabilityPromises: false,
    emergencyAdvice: "Direct emergencies to 911 or the appropriate emergency service; do not provide technical safety instructions beyond approved business guidance."
  }
};
const opLiteral = `const clientOperationalConfig = ${JSON.stringify(operationalConfig, null, 2)} as const;`;
if (/const clientOperationalConfig = [\s\S]*? as const;\n\nconst featureCards/.test(source)) {
  source = source.replace(/const clientOperationalConfig = [\s\S]*? as const;\n\nconst featureCards/, `${opLiteral}\n\nconst featureCards`);
} else {
  const anchor = "} as const;\n\nconst featureCards";
  if (!source.includes(anchor)) throw new Error("Unable to inject operational client configuration");
  source = source.replace(anchor, `} as const;\n\n${opLiteral}\n\nconst featureCards`);
}

source = source.replace(
  /<a href=\{`tel:\$\{prospectConfig\.phoneDisplay\.replace\(\/\[\^\+\\d\]\/g, ""\)\}`\} className="([^"]+)">\s*<MailCheck className="h-3\.5 w-3\.5" \/> Send to \{prospectConfig\.shortName\} Team\s*<\/a>/m,
  '<div className="$1" aria-label={`Demo lead delivery preview for ${prospectConfig.shortName}`}>\n        <MailCheck className="h-3.5 w-3.5" /> Send to {prospectConfig.shortName} Team\n      </div>'
);

const stage7Component = `function Stage7ConversionLayer() {
  const [language, setLanguage] = useState<Language>("en");
  const text = language === "en"
    ? {
        howTitle: "How Local Lead Forge works for your business",
        steps: [
          ["1", "A visitor needs HVAC help", "They can start a service request from the website without having to call first."],
          ["2", "The system captures the important details", "It collects the HVAC problem, location, urgency and contact information in English or Spanish."],
          ["3", "Your team receives an organized request", "The request is packaged so your team can quickly understand what the customer needs and follow up using your normal workflow."],
          ["4", "Local Lead Forge keeps the system configured", "We customize the experience for your business, test it before launch and maintain the lead-capture flow as part of the service."],
        ],
        nextTitle: "What happens if you decide to move forward?",
        next: [
          ["1", "Setup", "We confirm the service and activation details."],
          ["2", "Business information", "You provide the facts, services, service area and routing preferences we need."],
          ["3", "Customization", "We configure the experience for your business."],
          ["4", "QA & approval", "We test desktop/mobile, English/Spanish, forms and lead routing before activation."],
          ["5", "Activation", "After approval, the live version is turned on for your business."],
        ],
        ctaTitle: "Want this configured for your business?",
        ctaCopy: "Reply to the message that brought you here or contact Local Lead Forge to review the setup details.",
        cta: "Contact Local Lead Forge",
      }
    : {
        howTitle: "Cómo funciona Local Lead Forge para tu negocio",
        steps: [
          ["1", "Un visitante necesita ayuda de HVAC", "Puede iniciar una solicitud de servicio desde la página sin tener que llamar primero."],
          ["2", "El sistema captura los datos importantes", "Recopila el problema de HVAC, ubicación, urgencia y datos de contacto en inglés o español."],
          ["3", "Tu equipo recibe una solicitud organizada", "La información se presenta de forma clara para que tu equipo entienda qué necesita el cliente y pueda darle seguimiento con su proceso habitual."],
          ["4", "Local Lead Forge mantiene el sistema configurado", "Personalizamos la experiencia para tu empresa, la probamos antes de activarla y mantenemos el flujo de captación como parte del servicio."],
        ],
        nextTitle: "¿Qué pasa si decides avanzar?",
        next: [
          ["1", "Configuración inicial", "Confirmamos el servicio y los detalles de activación."],
          ["2", "Información del negocio", "Nos das los datos, servicios, zona de atención y preferencias de entrega que necesitamos."],
          ["3", "Personalización", "Configuramos la experiencia para tu empresa."],
          ["4", "QA y aprobación", "Probamos desktop/móvil, inglés/español, formularios y entrega de leads antes de activar."],
          ["5", "Activación", "Luego de tu aprobación, se activa la versión live para tu negocio."],
        ],
        ctaTitle: "¿Quieres esto configurado para tu empresa?",
        ctaCopy: "Responde al mensaje que te trajo hasta aquí o contacta a Local Lead Forge para revisar los detalles de configuración.",
        cta: "Contactar a Local Lead Forge",
      };

  return (
    <section id="stage7-conversion" data-stage7-conversion="v1" className="relative border-y border-white/[0.055] bg-[#040c18]/80">
      <div className="mx-auto max-w-[1500px] px-5 py-14 sm:px-8 lg:px-12">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[.18em] text-orange-400">Local Lead Forge</div>
            <h2 className="mt-3 max-w-[780px] text-[27px] font-black tracking-[-.035em] sm:text-[36px]">{text.howTitle}</h2>
          </div>
          <div className="flex rounded-lg border border-white/[0.09] bg-black/20 p-1 text-[8px] font-black">
            <button type="button" onClick={() => setLanguage("en")} className={\`rounded px-3 py-2 \${language === "en" ? "bg-orange-500 text-white" : "text-slate-500"}\`}>EN</button>
            <button type="button" onClick={() => setLanguage("es")} className={\`rounded px-3 py-2 \${language === "es" ? "bg-orange-500 text-white" : "text-slate-500"}\`}>ES</button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {text.steps.map(([number, title, copy]) => (
            <article key={number} className="rounded-xl border border-white/[0.09] bg-[#07111f] p-5">
              <div className="grid h-8 w-8 place-items-center rounded-full border border-orange-500/25 bg-orange-500/[0.08] text-[9px] font-black text-orange-400">{number}</div>
              <h3 className="mt-4 text-[11px] font-extrabold text-white">{title}</h3>
              <p className="mt-2 text-[9px] leading-5 text-slate-500">{copy}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-white/[0.09] bg-[#07111f] p-6 sm:p-8">
          <h2 className="text-[23px] font-black tracking-[-.03em] sm:text-[30px]">{text.nextTitle}</h2>
          <div className="mt-6 grid gap-3 lg:grid-cols-5">
            {text.next.map(([number, title, copy]) => (
              <div key={number} className="rounded-xl border border-white/[0.075] bg-black/20 p-4">
                <div className="text-[8px] font-black text-orange-400">{number}</div>
                <div className="mt-2 text-[10px] font-extrabold text-white">{title}</div>
                <div className="mt-2 text-[8px] leading-4 text-slate-600">{copy}</div>
              </div>
            ))}
          </div>
        </div>

        <div id="stage7-next-step" className="mt-8 rounded-2xl border border-orange-500/25 bg-orange-500/[0.045] p-6 text-center sm:p-8">
          <h2 className="text-[25px] font-black tracking-[-.03em]">{text.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-[650px] text-[10px] leading-5 text-slate-400">{text.ctaCopy}</p>
          <a href={\`mailto:info@localleadforge.com?subject=Local%20Lead%20Forge%20Setup%20-%20\${encodeURIComponent(prospectConfig.companyName)}\`} className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg border border-orange-400/90 bg-orange-600 px-5 py-3 text-[12px] font-extrabold text-white shadow-[0_0_28px_rgba(255,106,0,.28)] transition hover:bg-orange-500">
            {text.cta} <ArrowRight className="h-4 w-4" />
          </a>
          <div className="mt-4 text-[8px] font-bold text-slate-600">Local Lead Forge — localleadforge.com</div>
        </div>
      </div>
    </section>
  );
}

`;

if (!source.includes("function Stage7ConversionLayer()")) {
  const componentAnchor = "function IconBenefit";
  if (!source.includes(componentAnchor)) throw new Error("Stage 7 component insertion anchor missing");
  source = source.replace(componentAnchor, `${stage7Component}${componentAnchor}`);
}

if (!source.includes('data-stage7-conversion="v1"')) {
  throw new Error("Stage 7 component definition missing after injection");
}

if (!source.includes("<Stage7ConversionLayer />")) {
  const sectionAnchor = '      <section id="how"';
  if (!source.includes(sectionAnchor)) throw new Error("Stage 7 placement anchor missing");
  source = source.replace(sectionAnchor, `      <Stage7ConversionLayer />\n\n${sectionAnchor}`);
}

source = source.replace(
  '<PrimaryButton href="#pricing">Book Your Strategy Call</PrimaryButton>',
  '<a href="#stage7-next-step" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.13] bg-white/[0.025] px-5 py-3 text-[12px] font-bold text-slate-300 transition hover:border-orange-500/35 hover:text-white">Review Next Steps <ChevronRight className="h-4 w-4" /></a>'
);
source = source.replace(
  '<div className="mt-5"><PrimaryButton href={`mailto:hello@localleadforge.com?subject=Strategy%20Call%20-%20${encodeURIComponent(prospectConfig.companyName)}`}>Book Your Strategy Call</PrimaryButton></div>',
  '<div className="mt-5 rounded-lg border border-white/[0.08] bg-black/20 px-4 py-3 text-[8px] leading-4 text-slate-500">See the exact setup and activation steps below before deciding whether to move forward.</div>'
);

for (const requiredMarker of [
  'data-stage7-conversion="v1"',
  "How Local Lead Forge works for your business",
  "What happens if you decide to move forward?",
  "Cómo funciona Local Lead Forge para tu negocio",
  "¿Qué pasa si decides avanzar?",
  "Local Lead Forge — localleadforge.com",
  "<Stage7ConversionLayer />",
]) {
  if (!source.includes(requiredMarker)) throw new Error(`Stage 7 marker missing: ${requiredMarker}`);
}

fs.writeFileSync(appPath, source);

let html = fs.readFileSync(indexPath, "utf8");
html = html.split("PROSPECT HVAC COMPANY").join(config.companyName);
html = html.split("Prospect HVAC").join(config.shortName);
if (!html.includes("noindex, nofollow, noarchive")) throw new Error("Noindex meta tag missing from index.html");
fs.writeFileSync(indexPath, html);
fs.writeFileSync(robotsPath, "User-agent: *\nDisallow: /\n");

console.log(`Applied private-demo configuration for ${config.companyName} (${slug}).`);
console.log(`Configured service choices: ${configuredServices.join(" | ")}`);
console.log(`Operational config embedded: hours=${Boolean(operationalConfig.businessHours)} faqs=${operationalConfig.faqs.length} languages=${operationalConfig.languages.join(",")} leadRouting=${Boolean(operationalConfig.leadRouting?.primaryEmail)}`);
console.log("Stage 7 conversion layer injected: EN/ES explanation + next steps + one final commercial CTA.");
