import { useState } from "react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  Mail,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

export default function App() {
  const [lang, setLang] = useState<"en" | "es">("en");

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <div className="text-lg font-bold">
            Local Lead Forge
          </div>

          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#how" className="transition hover:text-white">{lang === "en" ? "How It Works" : "Cómo Funciona"}</a>
            <a href="#demo" className="transition hover:text-white">Demo</a>
            <a href="#pricing" className="transition hover:text-white">{lang === "en" ? "Pricing" : "Precios"}</a>
            <a href="#faq" className="transition hover:text-white">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-slate-700 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`rounded-md px-2 py-1 transition ${
                  lang === "en"
                    ? "bg-sky-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                EN
              </button>

              <button
                type="button"
                onClick={() => setLang("es")}
                className={`rounded-md px-2 py-1 transition ${
                  lang === "es"
                    ? "bg-sky-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ES
              </button>
            </div>

            <a
              href="#contact"
              className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold transition hover:bg-sky-400"
            >
              {lang === "en" ? "Get Started" : "Comenzar"}
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm text-sky-300">
            <Sparkles className="h-4 w-4" />
            {lang === "en" ? "AI Lead Capture for HVAC Companies" : "Captura de Leads con IA para Empresas HVAC"}
          </div>

          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            {lang === "en" ? "Never Miss Another HVAC Lead" : "No Pierdas Otro Lead de HVAC"}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            {lang === "en" ? "Local Lead Forge helps HVAC companies capture, qualify, and organize website leads 24/7 — even when you're busy or after hours." : "Local Lead Forge ayuda a empresas HVAC a capturar, calificar y organizar leads desde su sitio web 24/7, incluso cuando están ocupadas o fuera de horario."}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#demo"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400"
            >
              {lang === "en" ? "See Live Demo" : "Ver Demo en Vivo"}
              <ArrowRight className="h-5 w-5" />
            </a>

            <a
              href="#contact"
              className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white transition hover:border-slate-500"
            >
              {lang === "en" ? "Get Started" : "Comenzar"}
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-300">
            <span className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-sky-400" />
              {lang === "en" ? "24/7 Lead Capture" : "Captura de Leads 24/7"}
            </span>

            <span className="flex items-center gap-2">
              <MessageSquareText className="h-4 w-4 text-sky-400" />
              {lang === "en" ? "Bilingual EN / ES" : "Bilingüe EN / ES"}
            </span>

            <span className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-sky-400" />
              {lang === "en" ? "Leads Delivered Directly to You" : "Leads Enviados Directamente a Ti"}
            </span>
          </div>
        </div>
      </section>

      <section id="how" className="border-t border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-400">
              {lang === "en" ? "How It Works" : "Cómo Funciona"}
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {lang === "en"
                ? "More Leads. Less Follow-Up Work."
                : "Más Leads. Menos Trabajo de Seguimiento."}
            </h2>
            <p className="mt-4 text-slate-300">
              {lang === "en"
                ? "Your website visitor gets a fast response, you get a qualified lead, and nobody has to wait for business hours."
                : "El visitante de tu sitio recibe una respuesta rápida, tú recibes un lead calificado y nadie tiene que esperar al horario comercial."}
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {(lang === "en"
              ? [
                  ["01", "Visitor Arrives", "A potential customer visits your website."],
                  ["02", "AI Engages", "The assistant starts the conversation instantly."],
                  ["03", "Lead Qualified", "We collect the details your team actually needs."],
                  ["04", "Lead Delivered", "The lead is sent directly to your team for follow-up."],
                ]
              : [
                  ["01", "Llega el Visitante", "Un posible cliente visita tu sitio web."],
                  ["02", "La IA Interactúa", "El asistente inicia la conversación al instante."],
                  ["03", "Lead Calificado", "Recopilamos los datos que tu equipo realmente necesita."],
                  ["04", "Lead Entregado", "El lead se envía directamente a tu equipo para darle seguimiento."],
                ]
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
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-400">
              {lang === "en" ? "See It In Action" : "Míralo en Acción"}
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {lang === "en" ? "Watch How Local Lead Forge Captures a Lead" : "Mira Cómo Local Lead Forge Captura un Lead"}
            </h2>

            <p className="mt-5 max-w-xl text-slate-300">
              {lang === "en" ? "See how an HVAC website visitor can go from a simple question to a qualified lead your team can follow up with." : "Mira cómo un visitante de un sitio HVAC puede pasar de una simple pregunta a un lead calificado al que tu equipo puede dar seguimiento."}
            </p>

            <a
              href="https://symphonious-travesseiro-c9bae1.netlify.app/"
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 font-semibold transition hover:bg-sky-400"
            >
              {lang === "en" ? "Open Live Demo" : "Abrir Demo en Vivo"}
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">
                    {lang === "en" ? "AI Lead Assistant" : "Asistente de Leads con IA"}
                  </div>
                  <div className="text-xs text-slate-400">
                    {lang === "en" ? "HVAC lead capture example" : "Ejemplo de captura de leads HVAC"}
                  </div>
                </div>

                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  {lang === "en" ? "Online 24/7" : "En línea 24/7"}
                </span>
              </div>

              <div className="space-y-4 text-sm">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-800 p-4 text-slate-200">
                  {lang === "en" ? "Hi — what can we help you with today?" : "Hola — ¿en qué podemos ayudarte hoy?"}
                </div>

                <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-sky-500 p-4 text-white">
                  {lang === "en" ? "My AC is blowing warm air." : "Mi aire acondicionado está soplando aire tibio."}
                </div>

                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-800 p-4 text-slate-200">
                  {lang === "en" ? "What city or ZIP code is the home in?" : "¿En qué ciudad o código postal está la casa?"}
                </div>

                <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-sky-500 p-4 text-white">
                  Lawrenceville, GA 30044
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-slate-700 bg-slate-900 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  {lang === "en" ? "Qualified Lead" : "Lead Calificado"}
                </div>
                <div className="mt-2 font-semibold text-white">
                  {lang === "en" ? "Ready for your team to follow up" : "Listo para que tu equipo le dé seguimiento"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="border-t border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-400">
              {lang === "en" ? "Simple Pricing" : "Precios Simples"}
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {lang === "en"
                ? "Straightforward Pricing for HVAC Companies"
                : "Precios Claros para Empresas HVAC"}
            </h2>

            <p className="mt-4 text-slate-300">
              {lang === "en"
                ? "Start with a one-time setup, then keep your lead capture system running with a simple monthly plan."
                : "Comienza con una configuración inicial y mantén tu sistema de captura de leads funcionando con un plan mensual simple."}
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
              <p className="text-sm font-semibold text-sky-400">{lang === "en" ? "ONE-TIME SETUP" : "CONFIGURACIÓN INICIAL"}</p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-5xl font-bold">$299</span>
                <span className="pb-1 text-slate-400">{lang === "en" ? "one time" : "pago único"}</span>
              </div>

              <ul className="mt-8 space-y-4 text-sm text-slate-300">
                {(lang === "en"
                  ? [
                      "Initial assistant setup",
                      "Brand customization",
                      "Lead qualification flow",
                      "Lead delivery configuration",
                      "Launch testing",
                    ]
                  : [
                      "Configuración inicial del asistente",
                      "Personalización de marca",
                      "Flujo de calificación de leads",
                      "Configuración de entrega de leads",
                      "Pruebas de lanzamiento",
                    ]
                ).map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-sky-400/40 bg-slate-950 p-8 shadow-2xl shadow-sky-950/20">
              <p className="text-sm font-semibold text-sky-400">{lang === "en" ? "MONTHLY SERVICE" : "SERVICIO MENSUAL"}</p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-5xl font-bold">$199</span>
                <span className="pb-1 text-slate-400">{lang === "en" ? "/ month" : "/ mes"}</span>
              </div>

              <ul className="mt-8 space-y-4 text-sm text-slate-300">
                {(lang === "en"
                  ? [
                      "24/7 AI lead capture",
                      "Bilingual EN / ES support",
                      "Lead delivery to your team",
                      "Hosting and maintenance",
                      "Ongoing support and reasonable updates",
                    ]
                  : [
                      "Captura de leads con IA 24/7",
                      "Soporte bilingüe EN / ES",
                      "Entrega de leads a tu equipo",
                      "Hosting y mantenimiento",
                      "Soporte continuo y actualizaciones razonables",
                    ]
                ).map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 text-center">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-7 py-3 font-semibold text-white transition hover:bg-sky-400"
            >
              {lang === "en" ? "Get Started" : "Comenzar"}
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-slate-800">
        <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-400">
              FAQ
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {lang === "en" ? "Common Questions" : "Preguntas Frecuentes"}
            </h2>

            <p className="mt-4 text-slate-300">
              {lang === "en"
                ? "Clear answers before you get started."
                : "Respuestas claras antes de comenzar."}
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {(lang === "en"
              ? [
                  [
                    "How long does setup take?",
                    "Most setups can be prepared within a few business days once we receive your business information, branding, service details, and lead delivery preferences."
                  ],
                  [
                    "Do I need a new website?",
                    "No. Local Lead Forge is designed to work with your existing website. We configure the lead capture experience around your current business."
                  ],
                  [
                    "Where do the leads go?",
                    "Qualified lead information can be delivered directly to the contact destination we configure with you, such as your business email."
                  ],
                  [
                    "Does it work in English and Spanish?",
                    "Yes. The system can support both English and Spanish so your business can capture more opportunities from bilingual customers."
                  ],
                  [
                    "Can I cancel the monthly service?",
                    "Yes. The service is intended to be simple and month-to-month, subject to the terms in your service agreement."
                  ],
                ]
              : [
                  [
                    "¿Cuánto tarda la configuración?",
                    "La mayoría de las configuraciones pueden prepararse en pocos días laborables una vez que recibimos la información de tu negocio, marca, servicios y preferencias de entrega de leads."
                  ],
                  [
                    "¿Necesito un sitio web nuevo?",
                    "No. Local Lead Forge está diseñado para funcionar con tu sitio web actual. Configuramos la experiencia de captura de leads alrededor de tu negocio."
                  ],
                  [
                    "¿Dónde llegan los leads?",
                    "La información de los leads calificados puede enviarse directamente al destino de contacto que configuremos contigo, como el correo electrónico de tu negocio."
                  ],
                  [
                    "¿Funciona en inglés y español?",
                    "Sí. El sistema puede funcionar en inglés y español para ayudar a tu negocio a capturar más oportunidades de clientes bilingües."
                  ],
                  [
                    "¿Puedo cancelar el servicio mensual?",
                    "Sí. El servicio está pensado para ser simple y mes a mes, sujeto a los términos de tu acuerdo de servicio."
                  ],
                ]
            ).map(([question, answer]) => (
              <div
                key={question}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
              >
                <h3 className="text-lg font-semibold text-white">{question}</h3>
                <p className="mt-3 leading-7 text-slate-400">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
          <div className="rounded-3xl border border-sky-400/20 bg-slate-950 p-8 text-center sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-400">
              {lang === "en" ? "Ready to Capture More Leads?" : "¿Listo para Capturar Más Leads?"}
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {lang === "en" ? "Turn More Website Visitors Into Real HVAC Opportunities" : "Convierte Más Visitantes de tu Sitio en Oportunidades Reales para HVAC"}
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-slate-300">
              {lang === "en" ? "Let us show you how Local Lead Forge can help your HVAC business capture, qualify, and organize more website leads without adding more follow-up work." : "Déjanos mostrarte cómo Local Lead Forge puede ayudar a tu empresa HVAC a capturar, calificar y organizar más leads desde tu sitio web sin añadir más trabajo de seguimiento."}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="mailto:info@localleadforge.com"
                className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400"
              >
                {lang === "en" ? "Contact Local Lead Forge" : "Contactar a Local Lead Forge"}
                <ArrowRight className="h-5 w-5" />
              </a>

              <a
                href="#demo"
                className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white transition hover:border-slate-500"
              >
                {lang === "en" ? "View Demo" : "Ver Demo"}
              </a>
            </div>
          </div>

          <footer className="mt-12 flex flex-col gap-4 border-t border-slate-800 pt-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-semibold text-slate-300">Local Lead Forge</span>
              <span className="ml-2">{lang === "en" ? "AI-powered lead capture for HVAC companies." : "Captura de leads con IA para empresas HVAC."}</span>
            </div>

            <div>
              © 2026 Local Lead Forge
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}
