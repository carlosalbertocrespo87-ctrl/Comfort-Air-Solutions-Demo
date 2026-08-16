import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Mail,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

type FunnelLanguage = "en" | "es";

type SelfClosingFunnelProps = {
  companyName: string;
  website: string;
  setupPrice?: number;
  monthlyPrice?: number;
  contactEmail?: string;
};

const copy = {
  en: {
    launcher: "See the offer",
    eyebrow: "LOCAL LEAD FORGE · ACTIVATION",
    titlePrefix: "Put this lead assistant to work for",
    body:
      "The same experience you just tested can capture and qualify website leads, support English and Spanish visitors, and deliver the details your team needs for follow-up.",
    included: "Included",
    features: [
      "AI-assisted website lead capture",
      "English + Spanish visitor flow",
      "Name, phone, issue, location & timing captured",
      "Qualified lead delivery to your team inbox",
      "Initial setup and configuration",
    ],
    pricing: "Simple starting price",
    setup: "one-time setup",
    monthly: "per month",
    cta: "Request activation by email",
    noCall: "No sales call required",
    noCharge:
      "This demo does not charge you. Requesting activation only starts the setup conversation by email.",
    faqTitle: "Quick answers",
    faq: [
      {
        q: "What happens after I request activation?",
        a: "We confirm the website, the lead-delivery email, and the details needed to configure your version. The activation process can continue by email.",
      },
      {
        q: "Does this book appointments automatically?",
        a: "Not in this initial package. It captures and qualifies the lead so your team can follow up with the right context. Appointment automation can be added later if it fits your workflow.",
      },
      {
        q: "Will this replace my current website?",
        a: "No. The lead assistant is designed to work alongside your existing website experience.",
      },
    ],
  },
  es: {
    launcher: "Ver la oferta",
    eyebrow: "LOCAL LEAD FORGE · ACTIVACIÓN",
    titlePrefix: "Pon este asistente de leads a trabajar para",
    body:
      "La misma experiencia que acabas de probar puede capturar y calificar leads del sitio web, atender visitantes en inglés y español y entregar a tu equipo los datos necesarios para el seguimiento.",
    included: "Incluye",
    features: [
      "Captura de leads asistida por IA",
      "Flujo para visitantes en inglés + español",
      "Nombre, teléfono, problema, ubicación y urgencia",
      "Entrega del lead calificado al correo de tu equipo",
      "Configuración e instalación inicial",
    ],
    pricing: "Precio inicial simple",
    setup: "configuración única",
    monthly: "por mes",
    cta: "Solicitar activación por email",
    noCall: "No necesitas una llamada de ventas",
    noCharge:
      "Esta demo no realiza ningún cobro. Solicitar la activación solo inicia el proceso por correo electrónico.",
    faqTitle: "Respuestas rápidas",
    faq: [
      {
        q: "¿Qué pasa después de solicitar la activación?",
        a: "Confirmamos el sitio web, el correo donde recibirán los leads y los datos necesarios para configurar su versión. El proceso puede continuar por email.",
      },
      {
        q: "¿Agenda citas automáticamente?",
        a: "No en este paquete inicial. Captura y califica el lead para que tu equipo pueda hacer seguimiento con el contexto correcto. La automatización de citas se puede agregar más adelante si encaja con tu operación.",
      },
      {
        q: "¿Reemplaza mi sitio web actual?",
        a: "No. El asistente está diseñado para funcionar junto con la experiencia de tu sitio web actual.",
      },
    ],
  },
} as const;

export function SelfClosingFunnel({
  companyName,
  website,
  setupPrice = 299,
  monthlyPrice = 199,
  contactEmail = "info@localleadforge.com",
}: SelfClosingFunnelProps) {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<FunnelLanguage>("en");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const t = copy[language];

  const mailtoHref = useMemo(() => {
    const subject = `Activate Local Lead Forge for ${companyName}`;
    const body = [
      "Hi Carlos,",
      "",
      `I'd like to start activation for ${companyName}.`,
      `Website: ${website}`,
      `Plan: $${setupPrice} setup + $${monthlyPrice}/month`,
      "",
      "Please send me the next step by email. No call needed.",
    ].join("\n");

    return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [companyName, contactEmail, monthlyPrice, setupPrice, website]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="button-self-close-open"
        className="fixed bottom-20 left-5 z-30 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-white shadow-xl transition hover:-translate-y-0.5 sm:bottom-5"
      >
        <Sparkles size={16} className="text-[hsl(var(--accent))]" />
        {t.launcher}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label={`${companyName} activation offer`}
          data-testid="dialog-self-close"
        >
          <div className="max-h-[94dvh] w-full max-w-4xl overflow-y-auto rounded-t-[2rem] bg-[hsl(var(--background))] shadow-2xl sm:rounded-[2rem]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.96)] px-5 py-4 backdrop-blur sm:px-7">
              <div className="flex items-center gap-2 font-mono-ui text-[10px] font-bold tracking-[.16em] text-[hsl(var(--primary))]">
                <ShieldCheck size={15} className="text-[hsl(var(--accent))]" />
                {t.eyebrow}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 rounded-full bg-[hsl(var(--secondary))] p-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={`rounded-full px-2.5 py-1 ${language === "en" ? "bg-[hsl(var(--primary))] text-white" : "text-[hsl(var(--muted-foreground))]"}`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("es")}
                    className={`rounded-full px-2.5 py-1 ${language === "es" ? "bg-[hsl(var(--primary))] text-white" : "text-[hsl(var(--muted-foreground))]"}`}
                  >
                    ES
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close offer"
                  className="grid size-9 place-items-center rounded-full border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1.15fr_.85fr] lg:p-10">
              <div>
                <h2 className="max-w-2xl font-display text-5xl leading-[.93] tracking-tight text-[hsl(var(--foreground))] sm:text-6xl">
                  {t.titlePrefix}{" "}
                  <em className="text-[hsl(var(--primary))]">{companyName}.</em>
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {t.body}
                </p>

                <div className="mt-8">
                  <p className="font-mono-ui text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--accent-foreground))]">
                    {t.included}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {t.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.45)] p-4 text-sm font-semibold text-[hsl(var(--foreground))]"
                      >
                        <Check
                          size={17}
                          className="mt-0.5 shrink-0 text-[hsl(var(--accent-foreground))]"
                        />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-9">
                  <p className="font-mono-ui text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--accent-foreground))]">
                    {t.faqTitle}
                  </p>
                  <div className="mt-3 divide-y divide-[hsl(var(--border))] border-y border-[hsl(var(--border))]">
                    {t.faq.map((item, index) => {
                      const expanded = expandedFaq === index;
                      return (
                        <button
                          key={item.q}
                          type="button"
                          onClick={() => setExpandedFaq(expanded ? null : index)}
                          className="block w-full py-4 text-left"
                        >
                          <span className="flex items-center justify-between gap-4 font-bold text-[hsl(var(--foreground))]">
                            {item.q}
                            <ChevronDown
                              size={17}
                              className={`shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
                            />
                          </span>
                          {expanded ? (
                            <span className="mt-2 block pr-7 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                              {item.a}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <aside className="h-fit rounded-[1.75rem] bg-[hsl(var(--primary))] p-6 text-white sm:p-7 lg:sticky lg:top-24">
                <div className="flex items-center gap-2 text-[hsl(var(--accent))]">
                  <MessageSquareText size={18} />
                  <span className="font-mono-ui text-[10px] font-bold uppercase tracking-[.18em]">
                    {t.pricing}
                  </span>
                </div>

                <div className="mt-7 border-b border-white/15 pb-6">
                  <div className="flex items-end gap-2">
                    <span className="font-display text-6xl leading-none">${setupPrice}</span>
                    <span className="pb-1 text-sm text-white/65">{t.setup}</span>
                  </div>
                  <div className="mt-5 flex items-end gap-2">
                    <span className="font-display text-5xl leading-none">${monthlyPrice}</span>
                    <span className="pb-1 text-sm text-white/65">{t.monthly}</span>
                  </div>
                </div>

                <a
                  href={mailtoHref}
                  data-testid="link-self-close-activate"
                  className="mt-6 flex w-full items-center justify-between rounded-full bg-[hsl(var(--accent))] px-5 py-4 text-sm font-bold text-[hsl(var(--accent-foreground))] transition hover:-translate-y-0.5"
                >
                  <span className="flex items-center gap-2">
                    <Mail size={17} /> {t.cta}
                  </span>
                  <ArrowRight size={17} />
                </a>

                <p className="mt-4 flex items-center gap-2 text-sm font-bold text-white">
                  <Check size={15} className="text-[hsl(var(--accent))]" />
                  {t.noCall}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-white/55">
                  {t.noCharge}
                </p>
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
