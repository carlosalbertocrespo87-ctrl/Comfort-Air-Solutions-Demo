import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Languages,
  MailCheck,
  Settings2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type Language = "en" | "es";

function getPreparedCompany() {
  if (typeof document === "undefined") return "your business";
  const candidates = Array.from(document.querySelectorAll("header *"));
  const node = candidates.find((element) => element.textContent?.trim().startsWith("Prepared for "));
  return node?.textContent?.trim().replace(/^Prepared for\s+/, "") || "your business";
}

export function DemoConversionLayer() {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [companyName, setCompanyName] = useState("your business");

  useEffect(() => {
    setCompanyName(getPreparedCompany());
    const features = document.getElementById("features");
    if (!features?.parentElement) return;

    const existing = document.getElementById("llf-conversion-layer-host");
    if (existing) {
      setHost(existing);
      return;
    }

    const mount = document.createElement("div");
    mount.id = "llf-conversion-layer-host";
    features.insertAdjacentElement("afterend", mount);
    setHost(mount);

    return () => {
      if (mount.parentElement) mount.remove();
    };
  }, []);

  const copy = useMemo(
    () =>
      language === "en"
        ? {
            eyebrow: "How Local Lead Forge works",
            title: `A simple path from website visit to organized service opportunity for ${companyName}.`,
            intro:
              "The goal is not to replace your team. It is to make it easier for a potential customer to explain what they need, leave the right details and give your team a cleaner request to follow up on.",
            steps: [
              ["1", "A visitor starts a conversation", "Your website gives the customer a clear way to request help without waiting on hold or searching for the right form."],
              ["2", "The assistant gathers the important details", "It collects the HVAC issue, location, urgency and contact information in English or Spanish."],
              ["3", "Your team gets an organized request", "The information is packaged so your team can quickly understand the opportunity and decide the next action."],
              ["4", "Local Lead Forge keeps the system running", "We configure, test, maintain and improve the lead-capture experience while your team stays focused on service."],
            ],
            nextEyebrow: "If you decide to move forward",
            nextTitle: "From yes to launch — without a complicated handoff.",
            nextSteps: ["Confirm your business details", "Customize the experience", "QA in English + Spanish", "Your approval", "Activate the live system"],
            note: "This is a private, unofficial concept demo. It does not send a real service request or guarantee lead volume, appointments, revenue or ROI.",
            cta: "See the founding-client setup",
          }
        : {
            eyebrow: "Cómo funciona Local Lead Forge",
            title: `Un camino sencillo desde la visita a la web hasta una oportunidad de servicio organizada para ${companyName}.`,
            intro:
              "La meta no es reemplazar a tu equipo. Es facilitar que un posible cliente explique lo que necesita, deje los datos correctos y entregue a tu equipo una solicitud más clara para darle seguimiento.",
            steps: [
              ["1", "El visitante inicia una conversación", "La página le ofrece una forma clara de pedir ayuda sin esperar en línea ni buscar el formulario correcto."],
              ["2", "El asistente recopila los datos importantes", "Captura el problema HVAC, ubicación, urgencia y datos de contacto en inglés o español."],
              ["3", "Tu equipo recibe una solicitud organizada", "La información llega estructurada para que el equipo entienda rápidamente la oportunidad y decida el siguiente paso."],
              ["4", "Local Lead Forge mantiene el sistema", "Configuramos, probamos, mantenemos y mejoramos la experiencia de captura mientras tu equipo se concentra en el servicio."],
            ],
            nextEyebrow: "Si decides avanzar",
            nextTitle: "De tu sí al lanzamiento — sin una entrega complicada.",
            nextSteps: ["Confirmar datos del negocio", "Personalizar la experiencia", "QA en inglés + español", "Tu aprobación", "Activar el sistema"],
            note: "Esta es una demo privada y no oficial. No envía una solicitud real de servicio ni garantiza volumen de leads, citas, ingresos o ROI.",
            cta: "Ver la oferta de cliente fundador",
          },
    [companyName, language],
  );

  if (!host) return null;

  const icons = [Bot, Languages, MailCheck, Settings2];

  return createPortal(
    <section id="llf-process" className="relative border-y border-white/[0.055] bg-[#050d19]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,106,0,.08),transparent_48%)]" />
      <div className="relative mx-auto max-w-[1500px] px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[850px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/[0.07] px-3 py-2 text-[8px] font-black uppercase tracking-[.18em] text-orange-400">
              <Sparkles className="h-3 w-3" /> {copy.eyebrow}
            </div>
            <h2 className="mt-5 text-[30px] font-black leading-tight tracking-[-.035em] text-white sm:text-[38px]">{copy.title}</h2>
            <p className="mt-4 max-w-[780px] text-[11px] leading-6 text-slate-400 sm:text-[12px]">{copy.intro}</p>
          </div>

          <div className="flex w-fit rounded-lg border border-white/[0.09] bg-black/20 p-1 text-[9px] font-black">
            <button type="button" onClick={() => setLanguage("en")} className={`rounded-md px-3 py-2 transition ${language === "en" ? "bg-orange-500 text-white" : "text-slate-500 hover:text-white"}`}>EN</button>
            <button type="button" onClick={() => setLanguage("es")} className={`rounded-md px-3 py-2 transition ${language === "es" ? "bg-orange-500 text-white" : "text-slate-500 hover:text-white"}`}>ES</button>
          </div>
        </div>

        <div className="mt-9 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {copy.steps.map(([number, title, description], index) => {
            const Icon = icons[index];
            return (
              <article key={number} className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[#07111f] p-5 shadow-[0_18px_60px_rgba(0,0,0,.24)]">
                <div className="absolute right-4 top-3 text-[42px] font-black leading-none text-white/[0.035]">{number}</div>
                <div className="grid h-9 w-9 place-items-center rounded-lg border border-orange-500/20 bg-orange-500/[0.08] text-orange-500"><Icon className="h-4 w-4" /></div>
                <h3 className="mt-5 text-[12px] font-extrabold text-white">{title}</h3>
                <p className="mt-2 text-[9px] leading-[1.8] text-slate-500">{description}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 rounded-2xl border border-orange-500/20 bg-orange-500/[0.035] p-5 sm:p-6 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[.18em] text-orange-400"><CheckCircle2 className="h-3.5 w-3.5" /> {copy.nextEyebrow}</div>
            <h3 className="mt-3 text-[22px] font-black tracking-[-.025em] text-white sm:text-[26px]">{copy.nextTitle}</h3>
          </div>
          <div>
            <div className="flex flex-wrap gap-2">
              {copy.nextSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-2 rounded-full border border-white/[0.09] bg-black/20 px-3 py-2 text-[8px] font-semibold text-slate-300">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-orange-500 text-[7px] font-black text-white">{index + 1}</span>{step}
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex max-w-[680px] items-start gap-2 text-[8px] leading-4 text-slate-600"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500" />{copy.note}</div>
              <a href="#pricing" className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-orange-400/90 bg-orange-600 px-4 py-2.5 text-[9px] font-extrabold text-white shadow-[0_0_24px_rgba(255,106,0,.22)] transition hover:bg-orange-500">
                {copy.cta}<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>,
    host,
  );
}
