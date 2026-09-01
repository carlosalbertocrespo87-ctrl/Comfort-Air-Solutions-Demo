import { FormEvent, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Globe2, Languages, ShieldCheck, Workflow, Wrench, X } from 'lucide-react';

type Lang = 'en' | 'es';

const copy = {
  en: {
    nav: ['Solutions', 'How It Works', 'Engagement', 'What We Measure', 'About'],
    request: 'Request a Demo',
    eyebrow: 'Lead Capture & Follow-Up Systems for HVAC Companies',
    headline: 'Turn More HVAC Website Traffic Into Qualified Opportunities.',
    intro: 'Local Lead Forge helps HVAC companies reduce friction between website visit and real conversation with structured intake, bilingual capture, qualification, routing and follow-up.',
    primary: 'Request a Demo',
    secondary: 'See How It Works',
    proof: ['Bilingual EN/ES intake', 'HVAC-focused lead qualification', 'Structured routing & follow-up', 'Built to reduce owner babysitting'],
    solutionsTitle: 'Built around the parts of the lead journey that usually break.',
    solutionsIntro: 'We focus on the handoff between interest and action—not vanity features.',
    solutions: [
      ['Capture', 'Give prospects a clear path to ask for help, including after-hours and bilingual intake.'],
      ['Qualify', 'Collect the practical details your team needs before deciding the next step.'],
      ['Route', 'Send the opportunity to the right place with the context needed to respond.'],
      ['Follow Up', 'Create a consistent next-step process so good inquiries do not depend on memory.'],
    ],
    howTitle: 'Simple process. No giant rebuild required.',
    how: [
      ['1. Review', 'We inspect the current customer path and identify visible conversion friction.'],
      ['2. Focus', 'We agree on the highest-value problem to solve first.'],
      ['3. Implement', 'We build the smallest useful system that improves capture, qualification or follow-up.'],
      ['4. Measure', 'We track lead-flow activity and refine what is actually being used.'],
    ],
    engagementTitle: 'A focused pilot before unnecessary complexity.',
    engagementCopy: 'Scope, price and timeline are defined before work begins. We do not force a full website rebuild when a smaller conversion improvement can solve the problem.',
    engagementPoints: ['Clear written scope', 'Defined implementation window', 'No fabricated ROI promises', 'Expansion only when evidence supports it'],
    measureTitle: 'What we care about',
    measureCopy: 'We measure the customer path and operating flow—not made-up growth claims.',
    metrics: ['Inquiry volume', 'Qualified lead details captured', 'Response / routing completion', 'Follow-up status', 'Booked-job outcomes when client data is available'],
    aboutTitle: 'Local Lead Forge',
    aboutCopy: 'A specialized conversion and lead-handling partner for HVAC businesses. The goal is practical: make it easier for the right prospects to become real conversations without creating another system the owner has to babysit all day.',
    disclaimer: 'Any examples or interface previews shown by Local Lead Forge are illustrative unless explicitly identified as verified client data. Results depend on traffic, market conditions, sales follow-up and business performance.',
    footer: '© 2026 Local Lead Forge. All rights reserved.',
    formTitle: 'Request an LLF demo',
    formIntro: 'Tell us a little about your HVAC business. This private preview still stores the submission locally only; live routing will be connected after final review.',
    name: 'Name', business: 'Business', email: 'Email', phone: 'Phone', need: 'What part of your lead flow would you like to improve?', submit: 'Save Preview Request', success: 'Preview request saved locally. No data was transmitted.',
  },
  es: {
    nav: ['Soluciones', 'Cómo Funciona', 'Modalidad', 'Qué Medimos', 'Nosotros'],
    request: 'Solicitar Demo',
    eyebrow: 'Captación y Seguimiento de Leads para Empresas HVAC',
    headline: 'Convierte Más Tráfico Web de HVAC en Oportunidades Calificadas.',
    intro: 'Local Lead Forge ayuda a empresas HVAC a reducir fricción entre la visita al sitio y una conversación real mediante intake estructurado, captación bilingüe, calificación, routing y seguimiento.',
    primary: 'Solicitar Demo',
    secondary: 'Ver Cómo Funciona',
    proof: ['Intake bilingüe EN/ES', 'Calificación enfocada en HVAC', 'Routing y seguimiento estructurado', 'Diseñado para reducir trabajo manual del dueño'],
    solutionsTitle: 'Nos enfocamos en las partes del recorrido del lead que suelen romperse.',
    solutionsIntro: 'Trabajamos el paso entre interés y acción, no funciones decorativas.',
    solutions: [
      ['Captar', 'Dar al prospecto una ruta clara para pedir ayuda, incluso fuera de horario y en dos idiomas.'],
      ['Calificar', 'Recoger los datos prácticos que el equipo necesita antes de decidir el siguiente paso.'],
      ['Dirigir', 'Enviar la oportunidad al lugar correcto con el contexto necesario para responder.'],
      ['Dar seguimiento', 'Crear un siguiente paso consistente para que una buena consulta no dependa de la memoria.'],
    ],
    howTitle: 'Proceso simple. Sin obligarte a reconstruir todo.',
    how: [
      ['1. Revisar', 'Analizamos el recorrido actual del cliente y detectamos fricción visible.'],
      ['2. Enfocar', 'Acordamos el problema de mayor valor que conviene resolver primero.'],
      ['3. Implementar', 'Construimos el sistema mínimo útil para mejorar captación, calificación o seguimiento.'],
      ['4. Medir', 'Observamos el flujo real y refinamos lo que sí se está usando.'],
    ],
    engagementTitle: 'Primero un piloto enfocado; complejidad solo cuando haga falta.',
    engagementCopy: 'Alcance, precio y plazo se definen antes de empezar. No forzamos una reconstrucción completa del sitio cuando una mejora puntual de conversión puede resolver el problema.',
    engagementPoints: ['Alcance escrito y claro', 'Ventana de implementación definida', 'Sin promesas inventadas de ROI', 'Expansión solo cuando la evidencia lo justifique'],
    measureTitle: 'Qué nos importa medir',
    measureCopy: 'Medimos el recorrido del cliente y el flujo operativo, no crecimiento inventado.',
    metrics: ['Volumen de consultas', 'Datos de leads calificados capturados', 'Respuesta / routing completado', 'Estado del seguimiento', 'Trabajos reservados cuando el cliente comparte esos datos'],
    aboutTitle: 'Local Lead Forge',
    aboutCopy: 'Un socio especializado en conversión y manejo de leads para empresas HVAC. La meta es práctica: facilitar que los prospectos correctos se conviertan en conversaciones reales sin crear otro sistema que el dueño tenga que vigilar todo el día.',
    disclaimer: 'Cualquier ejemplo o vista de interfaz mostrada por Local Lead Forge es ilustrativa salvo que se identifique explícitamente como dato verificado de un cliente. Los resultados dependen del tráfico, mercado, seguimiento comercial y desempeño del negocio.',
    footer: '© 2026 Local Lead Forge. Todos los derechos reservados.',
    formTitle: 'Solicita una demo de LLF',
    formIntro: 'Cuéntanos un poco sobre tu empresa HVAC. Esta vista privada todavía guarda la solicitud solo localmente; el routing real se conectará después de la revisión final.',
    name: 'Nombre', business: 'Negocio', email: 'Correo', phone: 'Teléfono', need: '¿Qué parte de tu flujo de leads te gustaría mejorar?', submit: 'Guardar Solicitud de Prueba', success: 'Solicitud guardada localmente. No se transmitieron datos.',
  },
} as const;

function Mark({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#top" className="inline-flex items-center gap-3" aria-label="Local Lead Forge home">
      <svg viewBox="0 0 64 64" className={compact ? 'h-9 w-9' : 'h-11 w-11'} role="img" aria-label="LLF monogram">
        <rect x="2" y="2" width="60" height="60" rx="14" fill="#07111f" stroke="#ff6a00" strokeWidth="2" />
        <path d="M14 16h10l-6 31H8z" fill="#fff" /><path d="M26 16h10l-6 31H20z" fill="#e5e7eb" /><path d="M39 14h12l-3 14h8L36 52l4-18h-8z" fill="#ff6a00" />
      </svg>
      {!compact && <div><div className="text-[14px] font-black tracking-[0.16em] text-white">LOCAL LEAD FORGE</div><div className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-orange-500">Turn more visitors into booked jobs.</div></div>}
    </a>
  );
}

function DemoModal({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const t = copy[lang];
  const [saved, setSaved] = useState(false);
  const onSubmit = (e: FormEvent) => { e.preventDefault(); setSaved(true); };
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
    <div className="w-full max-w-xl rounded-2xl border border-orange-500/30 bg-[#07111f] p-6 shadow-2xl sm:p-8">
      <div className="flex justify-between gap-4"><div><div className="text-sm font-black uppercase tracking-[0.16em] text-orange-400">Local Lead Forge</div><h2 className="mt-2 text-2xl font-black">{t.formTitle}</h2><p className="mt-2 text-sm leading-6 text-slate-300">{t.formIntro}</p></div><button onClick={onClose} aria-label="Close" className="h-fit rounded-lg border border-white/10 p-2 text-slate-300"><X className="h-5 w-5" /></button></div>
      {saved ? <div className="mt-6 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-200">{t.success}</div> : <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
        {[t.name,t.business,t.email,t.phone].map((label,i)=><label key={label} className="text-sm font-semibold text-slate-200">{label}<input required={i<3} type={i===2?'email':i===3?'tel':'text'} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-base text-white outline-none focus:border-orange-500/60" /></label>)}
        <label className="text-sm font-semibold text-slate-200 sm:col-span-2">{t.need}<textarea rows={4} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-base text-white outline-none focus:border-orange-500/60" /></label>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 text-sm font-black hover:bg-orange-500 sm:col-span-2">{t.submit}<ArrowRight className="h-4 w-4" /></button>
      </form>}
    </div>
  </div>;
}

export default function HomePreviewV2Page() {
  const [lang,setLang] = useState<Lang>('en');
  const [demoOpen,setDemoOpen] = useState(false);
  const t = copy[lang];
  const navTargets = useMemo(()=>['solutions','how-it-works','pricing','results','about'],[]);
  return <main id="top" className="min-h-screen scroll-smooth bg-[#030914] text-white selection:bg-orange-500">
    {demoOpen && <DemoModal lang={lang} onClose={()=>setDemoOpen(false)} />}
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#030914]/95 backdrop-blur-xl"><div className="mx-auto flex min-h-[82px] max-w-[1450px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12"><Mark/><nav className="hidden items-center gap-7 text-[15px] font-bold text-slate-200 lg:flex">{t.nav.map((x,i)=><a key={x} href={`#${navTargets[i]}`} className="hover:text-orange-400">{x}</a>)}</nav><div className="flex items-center gap-2"><button onClick={()=>setDemoOpen(true)} className="hidden rounded-lg bg-orange-600 px-5 py-3 text-sm font-black hover:bg-orange-500 sm:inline-flex">{t.request}</button><button onClick={()=>setLang(lang==='en'?'es':'en')} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-3 text-sm font-bold"><Globe2 className="h-4 w-4"/>{lang.toUpperCase()}</button></div></div></header>

    <section className="mx-auto max-w-[1250px] px-5 pb-20 pt-16 text-center sm:px-8 lg:pt-24"><div className="mx-auto inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/[0.08] px-4 py-2 text-[12px] font-black uppercase tracking-[0.12em] text-orange-400"><Languages className="h-4 w-4"/>{t.eyebrow}</div><h1 className="mx-auto mt-7 max-w-[1050px] text-[44px] font-black leading-[1.03] tracking-[-0.04em] sm:text-[60px] lg:text-[72px]">{t.headline}</h1><p className="mx-auto mt-7 max-w-[820px] text-[18px] leading-8 text-slate-300">{t.intro}</p><div className="mt-9 flex flex-wrap justify-center gap-3"><button onClick={()=>setDemoOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-3.5 text-[15px] font-black hover:bg-orange-500">{t.primary}<ArrowRight className="h-4 w-4"/></button><a href="#how-it-works" className="rounded-lg border border-white/15 bg-white/[0.03] px-6 py-3.5 text-[15px] font-bold">{t.secondary}</a></div><div className="mx-auto mt-10 grid max-w-[980px] gap-3 sm:grid-cols-2 lg:grid-cols-4">{t.proof.map(x=><div key={x} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-[14px] font-semibold text-slate-300"><CheckCircle2 className="h-4 w-4 shrink-0 text-orange-500"/>{x}</div>)}</div></section>

    <section id="solutions" className="border-y border-white/[0.07] bg-[#07111f] px-5 py-20 sm:px-8"><div className="mx-auto max-w-[1200px]"><h2 className="max-w-[850px] text-3xl font-black sm:text-4xl">{t.solutionsTitle}</h2><p className="mt-4 max-w-[760px] text-[17px] leading-7 text-slate-300">{t.solutionsIntro}</p><div className="mt-10 grid gap-4 md:grid-cols-2">{t.solutions.map(([title,desc])=><div key={title} className="rounded-2xl border border-white/10 bg-[#030914] p-6"><Wrench className="h-6 w-6 text-orange-500"/><h3 className="mt-4 text-xl font-black">{title}</h3><p className="mt-3 text-[16px] leading-7 text-slate-300">{desc}</p></div>)}</div></div></section>

    <section id="how-it-works" className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-[1200px]"><h2 className="text-3xl font-black sm:text-4xl">{t.howTitle}</h2><div className="mt-10 grid gap-4 md:grid-cols-2">{t.how.map(([title,desc])=><div key={title} className="rounded-2xl border border-white/10 p-6"><Workflow className="h-6 w-6 text-orange-500"/><h3 className="mt-4 text-xl font-black">{title}</h3><p className="mt-3 text-[16px] leading-7 text-slate-300">{desc}</p></div>)}</div></div></section>

    <section id="pricing" className="border-y border-white/[0.07] bg-[#07111f] px-5 py-20 sm:px-8"><div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-center"><div><h2 className="text-3xl font-black sm:text-4xl">{t.engagementTitle}</h2><p className="mt-5 max-w-[780px] text-[17px] leading-8 text-slate-300">{t.engagementCopy}</p><button onClick={()=>setDemoOpen(true)} className="mt-7 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-3.5 text-[15px] font-black hover:bg-orange-500">{t.request}<ArrowRight className="h-4 w-4"/></button></div><div className="rounded-2xl border border-orange-500/25 bg-[#030914] p-6">{t.engagementPoints.map(x=><div key={x} className="flex items-start gap-3 border-b border-white/[0.07] py-4 last:border-0"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-orange-500"/><span className="text-[15px] font-semibold text-slate-200">{x}</span></div>)}</div></div></section>

    <section id="results" className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-[1200px]"><h2 className="text-3xl font-black sm:text-4xl">{t.measureTitle}</h2><p className="mt-4 max-w-[760px] text-[17px] leading-7 text-slate-300">{t.measureCopy}</p><div className="mt-9 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{t.metrics.map(x=><div key={x} className="rounded-xl border border-white/10 bg-white/[0.025] p-5 text-[15px] font-semibold text-slate-200"><CheckCircle2 className="mb-3 h-5 w-5 text-orange-500"/>{x}</div>)}</div><p className="mt-8 max-w-[950px] rounded-xl border border-white/10 bg-white/[0.025] p-5 text-[13px] leading-6 text-slate-400">{t.disclaimer}</p></div></section>

    <section id="about" className="border-t border-white/[0.07] bg-[#07111f] px-5 py-16 sm:px-8"><div className="mx-auto max-w-[1200px]"><h2 className="text-3xl font-black">{t.aboutTitle}</h2><p className="mt-4 max-w-[850px] text-[17px] leading-8 text-slate-300">{t.aboutCopy}</p></div></section>
    <footer className="border-t border-white/[0.07] px-5 py-8 sm:px-8"><div className="mx-auto flex max-w-[1200px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><Mark compact/><div className="text-[13px] text-slate-500">{t.footer}</div></div></footer>
  </main>;
}
