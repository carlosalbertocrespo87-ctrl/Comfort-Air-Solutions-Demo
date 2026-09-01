import { FormEvent, useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Globe2,
  Headphones,
  Languages,
  MessageSquareText,
  TrendingUp,
  Users,
  Wrench,
  X,
} from 'lucide-react';

type Lang = 'en' | 'es';

const copy = {
  en: {
    nav: ['Solutions', 'How It Works', 'Pricing', 'Results', 'About'],
    request: 'Request a Demo',
    eyebrow: 'AI-Powered Lead Capture for Local Service Businesses',
    headlineA: 'Turn More Visitors Into',
    headlineB: 'Qualified Leads.',
    intro:
      'Local Lead Forge combines bilingual AI, smart automation and high-converting lead flows to help local service businesses capture and route more opportunities.',
    seeHow: 'See How It Works',
    explore: 'Explore the Lead Flow',
    featureStrip: ['Bilingual (EN/ES)', 'AI-Powered', 'Structured Lead Delivery', 'Built for Local Services'],
    offer: 'Founding Client Offer',
    limited: 'Limited to the first 5 clients',
    offerTitle: 'Everything you need to capture more leads.',
    offerIntro: 'Launch with a complete lead-capture system built to engage, qualify and route opportunities automatically.',
    setup: 'Setup',
    oneTime: 'One-time setup',
    monthly: 'Monthly',
    month: '/month',
    monthlySub: 'Hosting, AI capture & optimization',
    bullets: ['Bilingual AI assistant', 'Lead qualification flow', 'Automated lead delivery', 'Lead reporting & visibility', 'Hosting and maintenance', 'Ongoing optimization'],
    start: 'Start With Local Lead Forge',
    questions: 'Questions?',
    snapshot: 'Illustrative Performance Snapshot',
    track: 'See how performance can be tracked.',
    disclaimer: 'Interface figures shown here are illustrative placeholders only. They are not Local Lead Forge performance claims, guarantees, or actual client results.',
    sample: 'Sample dashboard data shown for illustration only. Actual client outcomes depend on traffic, follow-up and business performance.',
    builtFor: 'Built for service businesses',
    growth: 'Sample growth (example)',
    growthSub: 'Example weekly lead growth shown for dashboard illustration.',
    serviceTypes: ['HVAC', 'Plumbing', 'Electrical', 'Roofing', 'Landscaping', 'And More'],
    strip: [
      ['Terms Defined in Agreement', 'Clear scope, no surprises.'],
      ['Flexible Monthly Service', 'Pause or adjust anytime.'],
      ['Focused on Lead Visibility', 'Track what matters, weekly.'],
      ['U.S.-Based Support', 'Real support when you need it.'],
    ],
    aboutTitle: 'Local Lead Forge',
    aboutCopy: 'A focused lead-capture and conversion system for local service businesses, built around visibility, structured follow-up and bilingual customer intake.',
    footer: '© 2026 Local Lead Forge. All rights reserved.',
    formTitle: 'Request your LLF demo',
    formIntro: 'Tell us a little about your business. This preview does not send data yet; submission wiring will be connected only after review.',
    name: 'Name',
    business: 'Business',
    email: 'Email',
    phone: 'Phone',
    need: 'What would you like to improve?',
    submit: 'Save Preview Request',
    success: 'Preview request captured locally. No data was transmitted.',
  },
  es: {
    nav: ['Soluciones', 'Cómo Funciona', 'Precios', 'Resultados', 'Nosotros'],
    request: 'Solicitar Demo',
    eyebrow: 'Captación de Leads con IA para Negocios de Servicios Locales',
    headlineA: 'Convierte Más Visitas en',
    headlineB: 'Leads Calificados.',
    intro:
      'Local Lead Forge combina IA bilingüe, automatización inteligente y flujos de conversión para ayudar a negocios de servicios locales a captar y dirigir más oportunidades.',
    seeHow: 'Ver Cómo Funciona',
    explore: 'Explorar el Flujo de Leads',
    featureStrip: ['Bilingüe (EN/ES)', 'Impulsado por IA', 'Entrega Estructurada de Leads', 'Para Servicios Locales'],
    offer: 'Oferta para Clientes Fundadores',
    limited: 'Limitado a los primeros 5 clientes',
    offerTitle: 'Todo lo que necesitas para captar más leads.',
    offerIntro: 'Lanza un sistema completo para atraer, calificar y dirigir oportunidades automáticamente.',
    setup: 'Configuración',
    oneTime: 'Pago único',
    monthly: 'Mensual',
    month: '/mes',
    monthlySub: 'Hosting, captación con IA y optimización',
    bullets: ['Asistente bilingüe con IA', 'Flujo de calificación de leads', 'Entrega automatizada de leads', 'Reportes y visibilidad', 'Hosting y mantenimiento', 'Optimización continua'],
    start: 'Comenzar con Local Lead Forge',
    questions: '¿Preguntas?',
    snapshot: 'Muestra Ilustrativa de Rendimiento',
    track: 'Así se puede visualizar el rendimiento.',
    disclaimer: 'Las cifras mostradas son ejemplos ilustrativos. No representan resultados reales, garantías ni promesas de Local Lead Forge.',
    sample: 'Datos de muestra únicamente para ilustración. Los resultados reales dependen del tráfico, seguimiento y desempeño del negocio.',
    builtFor: 'Creado para negocios de servicios',
    growth: 'Crecimiento de muestra (ejemplo)',
    growthSub: 'Ejemplo de crecimiento semanal mostrado solo para ilustración.',
    serviceTypes: ['HVAC', 'Plomería', 'Electricidad', 'Techos', 'Jardinería', 'Y Más'],
    strip: [
      ['Términos Definidos en Acuerdo', 'Alcance claro, sin sorpresas.'],
      ['Servicio Mensual Flexible', 'Ajusta según necesidad.'],
      ['Enfoque en Visibilidad', 'Mide lo que importa.'],
      ['Soporte en EE. UU.', 'Soporte real cuando lo necesitas.'],
    ],
    aboutTitle: 'Local Lead Forge',
    aboutCopy: 'Un sistema enfocado en captación y conversión para negocios de servicios locales, con visibilidad, seguimiento estructurado y atención bilingüe.',
    footer: '© 2026 Local Lead Forge. Todos los derechos reservados.',
    formTitle: 'Solicita tu demo de LLF',
    formIntro: 'Cuéntanos un poco sobre tu negocio. Esta vista previa todavía no envía datos; la conexión final se hará solo después de aprobación.',
    name: 'Nombre',
    business: 'Negocio',
    email: 'Correo',
    phone: 'Teléfono',
    need: '¿Qué te gustaría mejorar?',
    submit: 'Guardar Solicitud de Prueba',
    success: 'Solicitud guardada localmente en la vista previa. No se transmitieron datos.',
  },
} as const;

function Mark({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#top" className="inline-flex items-center gap-3" aria-label="Local Lead Forge home">
      <svg viewBox="0 0 64 64" className={compact ? 'h-10 w-10' : 'h-12 w-12'} role="img" aria-label="LLF monogram">
        <rect x="2" y="2" width="60" height="60" rx="14" fill="#07111f" stroke="#ff6a00" strokeWidth="2" />
        <path d="M14 16h10l-6 31H8z" fill="#fff" />
        <path d="M26 16h10l-6 31H20z" fill="#e5e7eb" />
        <path d="M39 14h12l-3 14h8L36 52l4-18h-8z" fill="#ff6a00" />
      </svg>
      {!compact && (
        <div className="leading-none">
          <div className="text-[14px] font-black tracking-[0.16em] text-white">LOCAL LEAD FORGE</div>
          <div className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-orange-500">Turn more visitors into booked jobs.</div>
        </div>
      )}
    </a>
  );
}

function DemoModal({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const t = copy[lang];
  const [saved, setSaved] = useState(false);
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-xl rounded-2xl border border-orange-500/25 bg-[#07111f] p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.18em] text-orange-400">Local Lead Forge</div>
            <h2 className="mt-2 text-2xl font-black text-white">{t.formTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{t.formIntro}</p>
          </div>
          <button onClick={onClose} className="rounded-lg border border-white/10 p-2 text-slate-300 hover:text-white" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>

        {saved ? (
          <div className="mt-6 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-200">{t.success}</div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
            {[t.name, t.business, t.email, t.phone].map((label, index) => (
              <label key={label} className="text-sm font-semibold text-slate-200">
                {label}
                <input required={index < 3} type={index === 2 ? 'email' : index === 3 ? 'tel' : 'text'} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-base text-white outline-none focus:border-orange-500/60" />
              </label>
            ))}
            <label className="text-sm font-semibold text-slate-200 sm:col-span-2">
              {t.need}
              <textarea rows={4} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-base text-white outline-none focus:border-orange-500/60" />
            </label>
            <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 text-sm font-black text-white shadow-[0_0_26px_rgba(255,106,0,.25)] hover:bg-orange-500 sm:col-span-2">
              {t.submit}<ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function HomePreviewPage() {
  const [lang, setLang] = useState<Lang>('en');
  const [demoOpen, setDemoOpen] = useState(false);
  const t = copy[lang];
  const navTargets = useMemo(() => ['solutions', 'how-it-works', 'pricing', 'results', 'about'], []);

  return (
    <main id="top" className="min-h-screen scroll-smooth bg-[#030914] text-white selection:bg-orange-500 selection:text-white">
      {demoOpen && <DemoModal lang={lang} onClose={() => setDemoOpen(false)} />}

      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#030914]/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[86px] max-w-[1500px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
          <Mark />
          <nav className="hidden items-center gap-7 text-[15px] font-bold text-slate-200 lg:flex">
            {t.nav.map((label, index) => <a key={label} href={`#${navTargets[index]}`} className="transition hover:text-orange-400">{label}</a>)}
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={() => setDemoOpen(true)} className="hidden rounded-lg bg-orange-600 px-5 py-3 text-sm font-black shadow-[0_0_24px_rgba(255,106,0,.22)] hover:bg-orange-500 sm:inline-flex">{t.request}</button>
            <button onClick={() => setLang(lang === 'en' ? 'es' : 'en')} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-sm font-bold text-slate-100"><Globe2 className="h-4 w-4" />{lang.toUpperCase()}</button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1500px] gap-12 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-12 lg:pt-20">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/[0.08] px-4 py-2 text-[12px] font-black uppercase tracking-[0.13em] text-orange-400"><Languages className="h-4 w-4" />{t.eyebrow}</div>
          <h1 className="mt-7 text-[46px] font-black leading-[1.02] tracking-[-0.045em] sm:text-[62px] lg:text-[72px]">{t.headlineA} <span className="text-orange-500">{t.headlineB}</span></h1>
          <p className="mt-7 max-w-[640px] text-[17px] leading-8 text-slate-300">{t.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#how-it-works" className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-3.5 text-[15px] font-black hover:bg-orange-500">{t.seeHow}<ArrowRight className="h-4 w-4" /></a>
            <a href="#solutions" className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-6 py-3.5 text-[15px] font-bold text-slate-100 hover:border-orange-500/40">{t.explore}</a>
          </div>
          <div className="mt-9 grid gap-3 text-[14px] font-semibold text-slate-300 sm:grid-cols-2 xl:grid-cols-4">
            {t.featureStrip.map((label) => <div key={label} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-orange-500" />{label}</div>)}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#07111f] p-5 shadow-[0_28px_90px_rgba(0,0,0,.45)] sm:p-7">
          <div className="flex items-center justify-between">
            <div><div className="text-[13px] font-black text-orange-400">LLF PERFORMANCE VIEW</div><div className="mt-2 text-[20px] font-black">Lead Visibility Dashboard</div></div>
            <BarChart3 className="h-8 w-8 text-orange-500" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[['158+', 'New Leads'], ['97', 'Qualified'], ['32', 'Appointments'], ['14', 'Jobs Closed']].map(([value, label]) => <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-4"><div className="text-[28px] font-black text-orange-400">{value}</div><div className="mt-1 text-[13px] font-bold text-white">{label}</div><div className="mt-1 text-[12px] text-slate-400">Example</div></div>)}
          </div>
          <div className="mt-4 rounded-xl border border-orange-500/20 bg-orange-500/[0.04] p-4 text-[13px] leading-6 text-slate-300">{t.disclaimer}</div>
          <div className="mt-4 h-[180px] rounded-xl border border-white/10 bg-[radial-gradient(circle_at_60%_30%,rgba(255,106,0,.18),transparent_50%),linear-gradient(180deg,#07111f,#040a12)] p-5">
            <svg viewBox="0 0 500 150" className="h-full w-full" role="img" aria-label="Illustrative lead trend">
              <path d="M10 128 C80 118 95 86 150 95 C205 105 235 62 300 71 C360 80 395 40 490 26" fill="none" stroke="#ff6a00" strokeWidth="5" strokeLinecap="round" />
              <path d="M10 128 C80 118 95 86 150 95 C205 105 235 62 300 71 C360 80 395 40 490 26 L490 150 L10 150 Z" fill="rgba(255,106,0,.10)" />
            </svg>
          </div>
        </div>
      </section>

      <section id="solutions" className="scroll-mt-28 mx-auto max-w-[1500px] px-5 pb-16 sm:px-8 lg:px-12">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['01', 'Bilingual AI Assistant', 'Engages visitors in English or Spanish with a clear lead-capture flow.'],
            ['02', 'Lead Qualification', 'Collects the details needed to identify and route real opportunities.'],
            ['03', 'Structured Follow-Up', 'Keeps lead handling organized so opportunities do not disappear into an inbox.'],
          ].map(([n, title, body]) => <article key={n} className="rounded-2xl border border-white/10 bg-[#07111f] p-6"><div className="text-[13px] font-black text-orange-400">{n}</div><h2 className="mt-4 text-[21px] font-black">{title}</h2><p className="mt-3 text-[15px] leading-7 text-slate-300">{body}</p></article>)}
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-28 border-y border-white/[0.08] bg-[#040c18]">
        <div className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:px-12">
          <div className="text-[13px] font-black uppercase tracking-[0.18em] text-orange-400">{t.nav[1]}</div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[['1', 'Capture', 'Website visitors start a structured conversation or request.'], ['2', 'Qualify', 'The flow captures service need, location, urgency and contact details.'], ['3', 'Route', 'The opportunity is organized for follow-up instead of being lost in a generic inbox.']].map(([n, title, body]) => <div key={n} className="rounded-xl border border-white/10 bg-[#07111f] p-6"><div className="text-[30px] font-black text-orange-500">{n}</div><div className="mt-2 text-[20px] font-black">{title}</div><div className="mt-2 text-[15px] leading-7 text-slate-300">{body}</div></div>)}
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-28 mx-auto grid max-w-[1500px] gap-7 px-5 py-16 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:px-12">
        <article className="rounded-2xl border border-orange-500/30 bg-[#07111f] p-7 sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-3"><div className="text-[12px] font-black uppercase tracking-[0.18em] text-orange-400">{t.offer}</div><div className="rounded-full border border-orange-500/30 px-3 py-1.5 text-[11px] font-black uppercase text-orange-300">{t.limited}</div></div>
          <h2 className="mt-5 text-[38px] font-black tracking-[-.03em]">{t.offerTitle}</h2>
          <p className="mt-3 text-[15px] leading-7 text-slate-300">{t.offerIntro}</p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2"><div className="rounded-xl border border-white/10 bg-black/20 p-5"><div className="text-[12px] font-black uppercase text-slate-400">{t.setup}</div><div className="mt-2 text-[44px] font-black">$299</div><div className="text-[13px] text-slate-300">{t.oneTime}</div></div><div className="rounded-xl border border-orange-500/25 bg-orange-500/[0.04] p-5"><div className="text-[12px] font-black uppercase text-orange-400">{t.monthly}</div><div className="mt-2 text-[44px] font-black">$199<span className="ml-1 text-[14px] text-slate-300">{t.month}</span></div><div className="text-[13px] text-slate-300">{t.monthlySub}</div></div></div>
          <div className="mt-6 grid gap-3 text-[14px] text-slate-200 sm:grid-cols-2">{t.bullets.map((item) => <div key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-orange-500" />{item}</div>)}</div>
          <button onClick={() => setDemoOpen(true)} className="mt-7 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-3.5 text-[15px] font-black hover:bg-orange-500">{t.start}<ArrowRight className="h-4 w-4" /></button>
        </article>

        <article id="results" className="scroll-mt-28 rounded-2xl border border-white/10 bg-[#07111f] p-7 sm:p-9">
          <div className="text-[12px] font-black uppercase tracking-[0.18em] text-orange-400">{t.snapshot}</div><h2 className="mt-3 text-[34px] font-black">{t.track}</h2><p className="mt-3 text-[14px] leading-7 text-slate-300">{t.sample}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['158+', 'New Leads'], ['32', 'Appointments'], ['14', 'Jobs Closed'], ['$28,450', 'Revenue']].map(([value, label]) => <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-4"><div className="text-[25px] font-black text-orange-400">{value}</div><div className="mt-1 text-[12px] font-black">{label}</div><div className="mt-1 text-[12px] text-slate-400">Example</div></div>)}</div>
          <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_.8fr]"><div className="rounded-xl border border-white/10 bg-black/20 p-5"><div className="text-[12px] font-black uppercase tracking-[.14em] text-slate-400">{t.builtFor}</div><div className="mt-4 grid grid-cols-2 gap-3 text-[14px] font-semibold">{t.serviceTypes.map((item) => <span key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-orange-500" />{item}</span>)}</div></div><div className="rounded-xl border border-orange-500/20 bg-orange-500/[0.04] p-5"><div className="text-[12px] font-black uppercase text-orange-400">{t.growth}</div><div className="mt-4 text-[38px] font-black">18.4%</div><div className="mt-2 text-[13px] leading-6 text-slate-300">{t.growthSub}</div></div></div>
        </article>
      </section>

      <section id="about" className="scroll-mt-28 border-t border-white/[0.08] bg-[#020711]">
        <div className="mx-auto max-w-[1500px] px-5 py-10 sm:px-8 lg:px-12">
          <div className="grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] md:grid-cols-4">{t.strip.map(([title, body], index) => { const Icon = [Wrench, MessageSquareText, TrendingUp, Headphones][index]; return <div key={title} className="bg-[#050d19] p-5"><div className="flex items-center gap-3 text-[14px] font-black"><Icon className="h-5 w-5 text-orange-500" />{title}</div><div className="mt-2 pl-8 text-[13px] text-slate-300">{body}</div></div>; })}</div>
          <div className="mt-10 grid gap-8 border-t border-white/10 pt-8 lg:grid-cols-[1fr_1.2fr] lg:items-end"><div><Mark compact /><div className="mt-4 text-[18px] font-black">{t.aboutTitle}</div><p className="mt-3 max-w-xl text-[14px] leading-7 text-slate-300">{t.aboutCopy}</p></div><div className="lg:text-right"><div className="text-[12px] text-slate-400">{t.footer}</div><button onClick={() => setDemoOpen(true)} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-orange-500/40 px-5 py-3 text-[14px] font-black text-orange-300 hover:bg-orange-500/10">{t.request}<ArrowRight className="h-4 w-4" /></button></div></div>
        </div>
      </section>
    </main>
  );
}
