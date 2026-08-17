import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
  Zap,
} from "lucide-react";

export default function App() {
  const [lang, setLang] = useState<"en" | "es">("en");

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="llf-brand" aria-label="Local Lead Forge">
            <span className="llf-mark">LLF</span>
            <span className="llf-flare">✦</span>
            <span className="llf-brand-name">LOCAL LEAD FORGE</span>
          </div>

          <nav className="hidden items-center gap-7 text-sm text-slate-300 lg:flex">
            <a href="#how" className="transition hover:text-white">{lang === "en" ? "Solutions" : "Soluciones"}</a>
            <a href="#how" className="transition hover:text-white">{lang === "en" ? "How It Works" : "Cómo Funciona"}</a>
            <a href="#pricing" className="transition hover:text-white">{lang === "en" ? "Pricing" : "Precios"}</a>
            <a href="#demo" className="transition hover:text-white">{lang === "en" ? "Results" : "Resultados"}</a>
            <a href="#faq" className="transition hover:text-white">{lang === "en" ? "About" : "Acerca"}</a>
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-slate-700 p-1 text-xs font-semibold">
              <button type="button" onClick={() => setLang("en")} className={`rounded-md px-2 py-1 transition ${lang === "en" ? "bg-sky-500 text-white" : "text-slate-400 hover:text-white"}`}>EN</button>
              <button type="button" onClick={() => setLang("es")} className={`rounded-md px-2 py-1 transition ${lang === "es" ? "bg-sky-500 text-white" : "text-slate-400 hover:text-white"}`}>ES</button>
            </div>

            <a href="#contact" className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold transition hover:bg-sky-400">
              {lang === "en" ? "Book a Demo" : "Ver Demo"}
            </a>
          </div>
        </div>
      </header>

      <section className="llf-hero mx-auto max-w-7xl px-6 pb-8 pt-12 lg:px-8 lg:pt-16">
        <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-sky-300">
              <Sparkles className="h-4 w-4" />
              {lang === "en" ? "AI-Powered Lead Capture for Local Service Businesses" : "Captura de Leads con IA para Negocios de Servicios Locales"}
            </div>

            <h1 className="llf-hero-title text-5xl font-bold tracking-tight sm:text-6xl lg:text-[4.35rem]">
              {lang === "en" ? (
                <>Turn More Visitors Into <span className="llf-accent">Qualified Leads.</span></>
              ) : (
                <>Convierte Más Visitantes en <span className="llf-accent">Leads Calificados.</span></>
              )}
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              {lang === "en"
                ? "Local Lead Forge helps local service businesses capture, qualify, and convert more website leads with bilingual AI, automation, and high-converting demo experiences."
                : "Local Lead Forge ayuda a negocios de servicios locales a capturar, calificar y convertir más leads con IA bilingüe, automatización y experiencias de demo enfocadas en conversión."}
            </p>

            <p className="mt-3 text-sm font-semibold text-slate-300">
              {lang === "en" ? "A clearer path from website visit to qualified opportunity." : "Un camino más claro desde la visita web hasta una oportunidad calificada."}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#how" className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400">
                {lang === "en" ? "See How It Works" : "Ver Cómo Funciona"}
                <ArrowRight className="h-5 w-5" />
              </a>
              <a href="#demo" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white transition hover:border-slate-500">
                <span className="llf-play">▶</span>{lang === "en" ? "Watch the Demo" : "Ver la Demo"}
              </a>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-300">
              <span className="flex items-center gap-2"><MessageSquareText className="h-4 w-4 text-sky-400" />{lang === "en" ? "Bilingual EN / ES" : "Bilingüe EN / ES"}</span>
              <span className="flex items-center gap-2"><Bot className="h-4 w-4 text-sky-400" />{lang === "en" ? "AI-Powered" : "Impulsado por IA"}</span>
              <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-sky-400" />{lang === "en" ? "Automated Follow-Up" : "Seguimiento Automatizado"}</span>
              <span className="flex items-center gap-2"><Wrench className="h-4 w-4 text-sky-400" />{lang === "en" ? "Built for Local Services" : "Hecho para Servicios Locales"}</span>
            </div>
          </div>

          <div className="llf-dashboard rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-2xl sm:p-5">
            <div className="llf-dashboard-grid">
              <aside className="llf-dashboard-side hidden md:block">
                <div className="llf-dashboard-logo">LLF</div>
                {(lang === "en" ? ["Overview", "Leads", "Conversations", "Appointments", "ROI Tracking", "Funnels"] : ["Resumen", "Leads", "Conversaciones", "Citas", "Seguimiento ROI", "Funnels"]).map((item, index) => (
                  <div key={item} className={`llf-side-item ${index === 0 ? "is-active" : ""}`}>{item}</div>
                ))}
              </aside>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">{lang === "en" ? "Dashboard" : "Panel"}</div>
                    <div className="mt-1 text-sm font-semibold">{lang === "en" ? "Client Portal Preview" : "Vista Previa del Portal"}</div>
                  </div>
                  <span className="rounded-lg border border-slate-700 px-3 py-1 text-[11px] text-slate-400">{lang === "en" ? "Illustrative preview" : "Vista ilustrativa"}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
                  {[
                    [Users, lang === "en" ? "New Leads" : "Nuevos Leads"],
                    [CheckCircle2, lang === "en" ? "Qualified" : "Calificados"],
                    [CalendarDays, lang === "en" ? "Appointments" : "Citas"],
                    [BarChart3, lang === "en" ? "Closed Jobs" : "Trabajos Cerrados"],
                  ].map(([Icon, title]) => (
                    <div key={String(title)} className="llf-metric-card rounded-2xl border border-slate-800 bg-slate-950 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-slate-300">{String(title)}</span>
                        <Icon className="h-4 w-4 text-sky-400" />
                      </div>
                      <div className="mt-3 text-xl font-bold text-slate-400">—</div>
                      <div className="mt-1 text-[10px] text-slate-500">{lang === "en" ? "Live after launch" : "Activo al lanzar"}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-[1.65fr_0.85fr]">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold">{lang === "en" ? "Leads Over Time" : "Leads en el Tiempo"}</div>
                        <div className="mt-1 text-[10px] text-slate-500">{lang === "en" ? "Visual preview — not client results" : "Vista visual — no son resultados reales"}</div>
                      </div>
                      <span className="rounded-md border border-slate-700 px-2 py-1 text-[10px] text-slate-400">30D</span>
                    </div>
                    <div className="mt-4 flex h-28 items-end gap-2" aria-hidden="true">
                      {[25, 38, 34, 48, 45, 58, 54, 67, 63, 75, 72, 88].map((height, index) => (
                        <div key={index} className="llf-chart-bar flex-1 rounded-t-sm" style={{ height: `${height}%` }} />
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <div className="text-xs font-semibold">{lang === "en" ? "Lead Sources" : "Fuentes de Leads"}</div>
                    <div className="mt-4 flex justify-center">
                      <div className="llf-donut" aria-hidden="true"><span>LLF</span></div>
                    </div>
                    <div className="mt-4 space-y-2 text-[10px] text-slate-400">
                      <div className="flex justify-between"><span>{lang === "en" ? "Website" : "Sitio web"}</span><span>—</span></div>
                      <div className="flex justify-between"><span>{lang === "en" ? "AI Assistant" : "Asistente IA"}</span><span>—</span></div>
                      <div className="flex justify-between"><span>{lang === "en" ? "Referrals" : "Referidos"}</span><span>—</span></div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-[10px] text-slate-500">
                  {lang === "en" ? "Dashboard shown for product visualization only. Real metrics appear only after a client is live." : "Panel mostrado solo para visualizar el producto. Las métricas reales aparecen cuando el cliente está activo."}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="llf-feature-strip mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {[
            [MessageSquareText, "1", lang === "en" ? "Bilingual AI Assistant" : "Asistente IA Bilingüe", lang === "en" ? "English or Spanish, instant answers." : "Inglés o español, respuestas al instante."],
            [Users, "2", lang === "en" ? "Lead Capture & Qualification" : "Captura y Calificación", lang === "en" ? "Collects the details your team needs." : "Recopila los datos que tu equipo necesita."],
            [Zap, "3", lang === "en" ? "Self-Closing Funnel" : "Funnel de Conversión", lang === "en" ? "Guides prospects toward the next step." : "Guía al prospecto al siguiente paso."],
            [BarChart3, "4", lang === "en" ? "Client Portal / ROI" : "Portal / ROI", lang === "en" ? "One place for leads and performance." : "Un lugar para leads y rendimiento."],
            [Clock3, "5", lang === "en" ? "Faster Response" : "Respuesta Más Rápida", lang === "en" ? "Reduce delay between interest and follow-up." : "Reduce la espera entre interés y seguimiento."],
          ].map(([Icon, number, title, copy]) => (
            <div key={String(number)} className="llf-feature-card rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-start gap-3">
                <div className="llf-icon-box"><Icon className="h-5 w-5" /></div>
                <div><div className="text-sm font-semibold"><span className="mr-2 text-sky-400">{String(number)}</span>{String(title)}</div><div className="mt-1 text-xs leading-5 text-slate-400">{String(copy)}</div></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1.15fr]">
          <div className="llf-offer-card rounded-3xl border border-sky-400/40 bg-slate-950 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-bold uppercase tracking-[0.12em] text-sky-400">{lang === "en" ? "Founding Client Offer" : "Oferta Cliente Fundador"}</div>
              <div className="rounded-full border border-slate-700 px-3 py-1 text-[10px] font-semibold text-slate-300">{lang === "en" ? "LIMITED TO THE FIRST 5 CLIENTS" : "LIMITADO A LOS PRIMEROS 5"}</div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="border-slate-800 sm:border-r sm:pr-4"><div className="flex items-end gap-2"><span className="text-4xl font-bold">$299</span><span className="pb-1 font-semibold text-sky-400">SETUP</span></div><div className="mt-2 text-xs text-slate-400">{lang === "en" ? "AI lead capture & automation setup" : "Configuración de captura y automatización"}</div></div>
              <div><div className="flex items-end gap-2"><span className="text-4xl font-bold">$199</span><span className="pb-1 font-semibold text-sky-400">/MONTH</span></div><div className="mt-2 text-xs text-slate-400">{lang === "en" ? "Founding rate while active and in good standing" : "Tarifa fundadora mientras la cuenta siga activa"}</div></div>
            </div>
            <a href="#pricing" className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold">{lang === "en" ? "Claim Your Founding Client Offer" : "Solicitar Oferta Fundadora"}<ArrowRight className="h-4 w-4" /></a>
          </div>

          <div className="llf-outcomes-card rounded-3xl border border-slate-800 bg-slate-950 p-5">
            <div className="text-sm font-semibold">{lang === "en" ? "Built to Make Lead Performance Easier to See" : "Diseñado para Hacer Visible el Rendimiento"}</div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(lang === "en" ? ["New Leads", "Appointments", "Closed Jobs", "Revenue"] : ["Nuevos Leads", "Citas", "Trabajos", "Ingresos"]).map((item) => (
                <div key={item} className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-center"><div className="text-lg font-bold text-slate-400">—</div><div className="mt-1 text-[10px] text-slate-400">{item}</div></div>
              ))}
            </div>
            <div className="mt-4 text-[10px] text-slate-500">{lang === "en" ? "Real client metrics are displayed only after data exists — no invented results." : "Las métricas reales se muestran solo cuando existen datos — sin resultados inventados."}</div>
          </div>
        </div>

        <div className="llf-trust-strip mt-3 grid gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4 text-xs text-slate-300 sm:grid-cols-2 lg:grid-cols-4">
          <span className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-sky-400" />{lang === "en" ? "No Long-Term Contracts" : "Sin Contratos a Largo Plazo"}</span>
          <span className="flex items-center gap-2"><Clock3 className="h-5 w-5 text-sky-400" />{lang === "en" ? "Cancel Anytime" : "Cancela Cuando Quieras"}</span>
          <span className="flex items-center gap-2"><Wrench className="h-5 w-5 text-sky-400" />{lang === "en" ? "Built for Local Services" : "Hecho para Servicios Locales"}</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-sky-400" />{lang === "en" ? "U.S.-Based Business" : "Negocio Basado en EE. UU."}</span>
        </div>
      </section>

      <section id="how" className="border-t border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-400">{lang === "en" ? "How It Works" : "Cómo Funciona"}</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{lang === "en" ? "More Leads. Less Follow-Up Work." : "Más Leads. Menos Trabajo de Seguimiento."}</h2>
            <p className="mt-4 text-slate-300">{lang === "en" ? "Your website visitor gets a fast response, you get a qualified lead, and nobody has to wait for business hours." : "El visitante de tu sitio recibe una respuesta rápida, tú recibes un lead calificado y nadie tiene que esperar al horario comercial."}</p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {(lang === "en"
              ? [["01", "Visitor Arrives", "A potential customer visits your website."], ["02", "AI Engages", "The assistant starts the conversation instantly."], ["03", "Lead Qualified", "We collect the details your team actually needs."], ["04", "Lead Delivered", "The lead is sent directly to your team for follow-up."]]
              : [["01", "Llega el Visitante", "Un posible cliente visita tu sitio web."], ["02", "La IA Interactúa", "El asistente inicia la conversación al instante."], ["03", "Lead Calificado", "Recopilamos los datos que tu equipo realmente necesita."], ["04", "Lead Entregado", "El lead se envía directamente a tu equipo para darle seguimiento."]]
            ).map(([step, title, copy]) => (
              <div key={step} className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
                <div className="text-sm font-bold text-sky-400">{step}</div>
                <h3 className="mt-4 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="border-t border-slate-800">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-400">{lang === "en" ? "See It In Action" : "Míralo en Acción"}</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{lang === "en" ? "Watch How Local Lead Forge Captures a Lead" : "Mira Cómo Local Lead Forge Captura un Lead"}</h2>
            <p className="mt-5 max-w-xl text-slate-300">{lang === "en" ? "See how a website visitor can go from a simple question to a qualified lead your team can follow up with." : "Mira cómo un visitante puede pasar de una simple pregunta a un lead calificado al que tu equipo puede dar seguimiento."}</p>
            <a href="https://symphonious-travesseiro-c9bae1.netlify.app/" target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 font-semibold transition hover:bg-sky-400">
              {lang === "en" ? "Open Live Demo" : "Abrir Demo en Vivo"}<ArrowRight className="h-5 w-5" />
            </a>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div><div className="text-sm font-semibold text-white">{lang === "en" ? "AI Lead Assistant" : "Asistente de Leads con IA"}</div><div className="text-xs text-slate-400">{lang === "en" ? "Local-service lead capture example" : "Ejemplo de captura de leads"}</div></div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">{lang === "en" ? "Online 24/7" : "En línea 24/7"}</span>
              </div>
              <div className="space-y-4 text-sm">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-800 p-4 text-slate-200">{lang === "en" ? "Hi — what can we help you with today?" : "Hola — ¿en qué podemos ayudarte hoy?"}</div>
                <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-sky-500 p-4 text-white">{lang === "en" ? "My AC is blowing warm air." : "Mi aire acondicionado está soplando aire tibio."}</div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-800 p-4 text-slate-200">{lang === "en" ? "What city or ZIP code is the home in?" : "¿En qué ciudad o código postal está la casa?"}</div>
                <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-sky-500 p-4 text-white">Lawrenceville, GA 30044</div>
              </div>
              <div className="mt-6 rounded-xl border border-slate-700 bg-slate-900 p-4"><div className="text-xs uppercase tracking-wide text-slate-500">{lang === "en" ? "Qualified Lead" : "Lead Calificado"}</div><div className="mt-2 font-semibold text-white">{lang === "en" ? "Ready for your team to follow up" : "Listo para que tu equipo le dé seguimiento"}</div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="border-t border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-400">{lang === "en" ? "Founding Client Offer" : "Oferta para Clientes Fundadores"}</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{lang === "en" ? "Straightforward Pricing for Local Service Businesses" : "Precios Claros para Negocios de Servicios Locales"}</h2>
            <p className="mt-4 text-slate-300">{lang === "en" ? "Start with a one-time setup, then keep your lead capture system running with a simple monthly plan." : "Comienza con una configuración inicial y mantén tu sistema de captura de leads funcionando con un plan mensual simple."}</p>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
              <p className="text-sm font-semibold text-sky-400">{lang === "en" ? "ONE-TIME SETUP" : "CONFIGURACIÓN INICIAL"}</p>
              <div className="mt-4 flex items-end gap-2"><span className="text-5xl font-bold">$299</span><span className="pb-1 text-slate-400">{lang === "en" ? "one time" : "pago único"}</span></div>
              <ul className="mt-8 space-y-4 text-sm text-slate-300">
                {(lang === "en" ? ["Initial assistant setup", "Brand customization", "Lead qualification flow", "Lead delivery configuration", "Launch testing"] : ["Configuración inicial del asistente", "Personalización de marca", "Flujo de calificación de leads", "Configuración de entrega de leads", "Pruebas de lanzamiento"]).map((item) => <li key={item} className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" /><span>{item}</span></li>)}
              </ul>
            </div>

            <div className="rounded-3xl border border-sky-400/40 bg-slate-950 p-8 shadow-2xl shadow-sky-950/20">
              <p className="text-sm font-semibold text-sky-400">{lang === "en" ? "MONTHLY SERVICE" : "SERVICIO MENSUAL"}</p>
              <div className="mt-4 flex items-end gap-2"><span className="text-5xl font-bold">$199</span><span className="pb-1 text-slate-400">{lang === "en" ? "/ month" : "/ mes"}</span></div>
              <ul className="mt-8 space-y-4 text-sm text-slate-300">
                {(lang === "en" ? ["24/7 AI lead capture", "Bilingual EN / ES support", "Lead delivery to your team", "Hosting and maintenance", "Ongoing support and reasonable updates"] : ["Captura de leads con IA 24/7", "Soporte bilingüe EN / ES", "Entrega de leads a tu equipo", "Hosting y mantenimiento", "Soporte continuo y actualizaciones razonables"]).map((item) => <li key={item} className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" /><span>{item}</span></li>)}
              </ul>
            </div>
          </div>

          <div className="mt-10 text-center"><a href="#contact" className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-7 py-3 font-semibold text-white transition hover:bg-sky-400">{lang === "en" ? "Claim Founding Client Offer" : "Solicitar Oferta Fundadora"}<ArrowRight className="h-5 w-5" /></a></div>
        </div>
      </section>

      <section id="faq" className="border-t border-slate-800">
        <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-400">FAQ</p><h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{lang === "en" ? "Common Questions" : "Preguntas Frecuentes"}</h2><p className="mt-4 text-slate-300">{lang === "en" ? "Clear answers before you get started." : "Respuestas claras antes de comenzar."}</p></div>
          <div className="mt-12 space-y-4">
            {(lang === "en" ? [["How long does setup take?", "Most setups can be prepared within a few business days once we receive your business information, branding, service details, and lead delivery preferences."], ["Do I need a new website?", "No. Local Lead Forge is designed to work with your existing website. We configure the lead capture experience around your current business."], ["Where do the leads go?", "Qualified lead information can be delivered directly to the contact destination we configure with you, such as your business email."], ["Does it work in English and Spanish?", "Yes. The system can support both English and Spanish so your business can capture more opportunities from bilingual customers."], ["Can I cancel the monthly service?", "Yes. The service is intended to be simple and month-to-month, subject to the terms in your service agreement."]] : [["¿Cuánto tarda la configuración?", "La mayoría de las configuraciones pueden prepararse en pocos días laborables una vez que recibimos la información de tu negocio, marca, servicios y preferencias de entrega de leads."], ["¿Necesito un sitio web nuevo?", "No. Local Lead Forge está diseñado para funcionar con tu sitio web actual. Configuramos la experiencia de captura de leads alrededor de tu negocio."], ["¿Dónde llegan los leads?", "La información de los leads calificados puede enviarse directamente al destino de contacto que configuremos contigo, como el correo electrónico de tu negocio."], ["¿Funciona en inglés y español?", "Sí. El sistema puede funcionar en inglés y español para ayudar a tu negocio a capturar más oportunidades de clientes bilingües."], ["¿Puedo cancelar el servicio mensual?", "Sí. El servicio está pensado para ser simple y mes a mes, sujeto a los términos de tu acuerdo de servicio."]]).map(([question, answer]) => <div key={question} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"><h3 className="text-lg font-semibold text-white">{question}</h3><p className="mt-3 leading-7 text-slate-400">{answer}</p></div>)}
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
          <div className="rounded-3xl border border-sky-400/20 bg-slate-950 p-8 text-center sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-400">{lang === "en" ? "Ready to Capture More Leads?" : "¿Listo para Capturar Más Leads?"}</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{lang === "en" ? "Turn More Website Visitors Into Real Opportunities" : "Convierte Más Visitantes de tu Sitio en Oportunidades Reales"}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-slate-300">{lang === "en" ? "Let us show you how Local Lead Forge can help your business capture, qualify, and organize more website leads without adding more follow-up work." : "Déjanos mostrarte cómo Local Lead Forge puede ayudar a tu negocio a capturar, calificar y organizar más leads sin añadir más trabajo de seguimiento."}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a href="mailto:info@localleadforge.com" className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400">{lang === "en" ? "Contact Local Lead Forge" : "Contactar a Local Lead Forge"}<ArrowRight className="h-5 w-5" /></a>
              <a href="#demo" className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white transition hover:border-slate-500">{lang === "en" ? "View Demo" : "Ver Demo"}</a>
            </div>
          </div>

          <footer className="mt-12 flex flex-col gap-4 border-t border-slate-800 pt-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <div><span className="font-semibold text-slate-300">Local Lead Forge</span><span className="ml-2">{lang === "en" ? "AI-powered lead capture for local service businesses." : "Captura de leads con IA para negocios de servicios locales."}</span></div>
            <div>© 2026 Local Lead Forge</div>
          </footer>
        </div>
      </section>
    </main>
  );
}
