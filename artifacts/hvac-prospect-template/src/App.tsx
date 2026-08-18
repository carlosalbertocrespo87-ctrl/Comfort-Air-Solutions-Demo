import { type ComponentType, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  CalendarCheck2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Gauge,
  Headphones,
  Languages,
  LayoutDashboard,
  MailCheck,
  MessageSquareText,
  MousePointerClick,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wrench,
  Zap,
} from "lucide-react";

const ORANGE = "#ff6a00";

type Language = "en" | "es";

// These literal defaults are intentionally kept stable: the demo factory replaces
// them from artifacts/prospect-configs/<slug>.json before each prospect build.
const prospectConfig = {
  companyName: "PROSPECT HVAC COMPANY",
  shortName: "PROSPECT HVAC",
  emailDomain: "prospectcompany.com",
  phoneDisplay: "(000) 000-0000",
  serviceArea: "TARGET SERVICE AREA",
  sinceYear: "20XX",
} as const;

const featureCards = [
  {
    number: "1",
    icon: Languages,
    title: "Bilingual AI Assistant",
    copy: "Engages visitors instantly in English or Spanish, day or night.",
  },
  {
    number: "2",
    icon: Target,
    title: "Lead Capture & Qualification",
    copy: "Collects the problem, location, urgency and contact details automatically.",
  },
  {
    number: "3",
    icon: MousePointerClick,
    title: "Self-Closing Funnel",
    copy: "Guides high-intent homeowners toward the next best action without friction.",
  },
  {
    number: "4",
    icon: Gauge,
    title: "Client Portal & ROI",
    copy: "Makes lead volume, appointments and revenue easier to track in one place.",
  },
  {
    number: "5",
    icon: Zap,
    title: "Faster Response",
    copy: "Responds while prospects are still looking for an HVAC contractor.",
  },
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#top" className="flex items-center gap-3" aria-label="Local Lead Forge home">
      <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-orange-500/45 bg-[#0a1423] shadow-[0_0_24px_rgba(255,106,0,0.15)]">
        <div className="absolute inset-[5px] rounded-md border border-orange-500/25" />
        <span className="relative text-[13px] font-black tracking-[-0.08em] text-orange-500">LLF</span>
      </div>
      {!compact && (
        <div className="leading-none">
          <div className="text-[13px] font-extrabold tracking-[0.19em] text-white">LOCAL LEAD</div>
          <div className="mt-1 text-[13px] font-extrabold tracking-[0.26em] text-orange-500">FORGE</div>
        </div>
      )}
    </a>
  );
}

function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="group inline-flex items-center justify-center gap-2 rounded-lg border border-orange-400/90 bg-orange-600 px-5 py-3 text-[12px] font-extrabold text-white shadow-[0_0_28px_rgba(255,106,0,.28)] transition duration-200 hover:-translate-y-0.5 hover:bg-orange-500 hover:shadow-[0_0_38px_rgba(255,106,0,.38)]"
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}

function BackgroundLines() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute left-1/2 top-16 h-[620px] w-[1200px] -translate-x-1/2 rounded-full bg-orange-600/[0.045] blur-[130px]" />
      <svg className="absolute left-0 top-[170px] h-[470px] w-full opacity-45" viewBox="0 0 1800 470" fill="none" preserveAspectRatio="none">
        <path d="M-60 350 C210 255 322 255 520 295 C760 343 885 118 1130 180 C1390 246 1536 145 1870 -10" stroke="url(#demoLine)" strokeWidth="1.1" />
        <path d="M-45 414 C260 326 372 316 575 342 C805 370 940 174 1180 219 C1420 265 1590 190 1880 63" stroke="rgba(255,106,0,.12)" />
        <path d="M-70 268 C247 177 360 194 547 231 C755 273 879 69 1105 137 C1352 212 1536 103 1868 -32" stroke="rgba(255,106,0,.08)" />
        <defs>
          <linearGradient id="demoLine" x1="0" x2="1800" y1="0" y2="0">
            <stop stopColor={ORANGE} stopOpacity="0" />
            <stop offset=".24" stopColor={ORANGE} stopOpacity=".25" />
            <stop offset=".58" stopColor={ORANGE} stopOpacity=".58" />
            <stop offset="1" stopColor={ORANGE} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function ChatPreview() {
  const [language, setLanguage] = useState<Language>("en");
  const [service, setService] = useState("AC not cooling");
  const [sent, setSent] = useState(false);

  const text = language === "en"
    ? {
        title: `${prospectConfig.shortName} AI Assistant`,
        online: "Online now",
        greeting: `Hi! I’m the AI assistant for ${prospectConfig.shortName}. What can we help you with today?`,
        location: "Thanks — what city or ZIP code is the home in?",
        reply: "Lawrenceville, GA 30044",
        next: "Perfect. I can prepare this request for the team. How urgent is the issue?",
        urgent: "Today if possible",
        placeholder: "Type a message...",
        sent: "Lead ready for the team",
      }
    : {
        title: `Asistente IA de ${prospectConfig.shortName}`,
        online: "En línea",
        greeting: `¡Hola! Soy el asistente IA de ${prospectConfig.shortName}. ¿En qué podemos ayudarte hoy?`,
        location: "Gracias. ¿En qué ciudad o código postal está la propiedad?",
        reply: "Lawrenceville, GA 30044",
        next: "Perfecto. Puedo preparar esta solicitud para el equipo. ¿Qué tan urgente es?",
        urgent: "Hoy si es posible",
        placeholder: "Escribe un mensaje...",
        sent: "Lead listo para el equipo",
      };

  return (
    <div id="assistant" className="overflow-hidden rounded-2xl border border-white/[0.1] bg-[#07111f] shadow-[0_25px_80px_rgba(0,0,0,.48),0_0_65px_rgba(255,106,0,.065)]">
      <div className="flex items-center justify-between border-b border-white/[0.075] px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-orange-500/20 bg-orange-500/[0.08] text-orange-500"><Bot className="h-4 w-4" /></div>
          <div className="min-w-0">
            <div className="truncate text-[10px] font-extrabold text-white">{text.title}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[8px] text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{text.online}</div>
          </div>
        </div>
        <div className="flex rounded-md border border-white/[0.09] bg-black/20 p-0.5 text-[7px] font-black">
          <button type="button" onClick={() => setLanguage("en")} className={`rounded px-2 py-1 ${language === "en" ? "bg-orange-500 text-white" : "text-slate-500"}`}>EN</button>
          <button type="button" onClick={() => setLanguage("es")} className={`rounded px-2 py-1 ${language === "es" ? "bg-orange-500 text-white" : "text-slate-500"}`}>ES</button>
        </div>
      </div>

      <div className="min-h-[278px] space-y-3 p-4 text-[9px] leading-4">
        <div className="max-w-[84%] rounded-xl rounded-tl-sm border border-white/[0.07] bg-white/[0.035] px-3 py-2.5 text-slate-300">{text.greeting}</div>
        <div className="flex flex-wrap gap-1.5">
          {["AC not cooling", "Heating issue", "Maintenance", "New system"].map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => setService(option)}
              className={`rounded-full border px-2.5 py-1.5 text-[7px] font-bold transition ${service === option ? "border-orange-500/45 bg-orange-500/10 text-orange-400" : "border-white/[0.08] bg-black/20 text-slate-500 hover:text-slate-300"}`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="ml-auto max-w-[70%] rounded-xl rounded-tr-sm bg-orange-600 px-3 py-2.5 font-semibold text-white">{service}</div>
        <div className="max-w-[84%] rounded-xl rounded-tl-sm border border-white/[0.07] bg-white/[0.035] px-3 py-2.5 text-slate-300">{text.location}</div>
        <div className="ml-auto max-w-[70%] rounded-xl rounded-tr-sm bg-orange-600 px-3 py-2.5 font-semibold text-white">{text.reply}</div>
        <div className="max-w-[84%] rounded-xl rounded-tl-sm border border-white/[0.07] bg-white/[0.035] px-3 py-2.5 text-slate-300">{text.next}</div>
        <button type="button" onClick={() => setSent(true)} className="ml-auto block rounded-full border border-orange-500/35 bg-orange-500/[0.08] px-3 py-1.5 text-[7px] font-bold text-orange-400">{sent ? `✓ ${text.sent}` : text.urgent}</button>
      </div>

      <div className="flex items-center gap-2 border-t border-white/[0.07] bg-black/15 p-3">
        <div className="flex-1 rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2.5 text-[8px] text-slate-600">{text.placeholder}</div>
        <button type="button" onClick={() => setSent(true)} className="grid h-8 w-8 place-items-center rounded-lg bg-orange-600 text-white shadow-[0_0_18px_rgba(255,106,0,.25)]"><Send className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}

function CapturedLead() {
  const rows = [
    ["Name", "Michael R."],
    ["Phone", "(678) 555-0187"],
    ["Email", "michael@example.com"],
    ["ZIP", "30044"],
    ["Service", "AC Repair"],
    ["Source", "AI Assistant"],
    ["Time", "Just now"],
  ];

  return (
    <div className="rounded-2xl border border-white/[0.1] bg-[#07111f] p-4 shadow-[0_20px_70px_rgba(0,0,0,.42)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] pb-3">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[.13em] text-orange-400">Captured Lead</div>
          <div className="mt-1 text-[8px] text-slate-600">Qualified automatically</div>
        </div>
        <div className="grid h-8 w-8 place-items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"><CheckCircle2 className="h-4 w-4" /></div>
      </div>
      <div className="mt-3 space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 text-[8px]">
            <span className="text-slate-600">{label}</span>
            <span className="truncate font-semibold text-slate-300">{value}</span>
          </div>
        ))}
      </div>
      <a href={`tel:${prospectConfig.phoneDisplay.replace(/[^+\d]/g, "")}`} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-orange-400/90 bg-orange-600 px-3 py-2.5 text-[8px] font-extrabold text-white shadow-[0_0_22px_rgba(255,106,0,.22)] transition hover:bg-orange-500">
        <MailCheck className="h-3.5 w-3.5" /> Send to {prospectConfig.shortName} Team
      </a>
    </div>
  );
}

function PotentialDashboard() {
  const cards = [
    [Users, "158", "New Leads", "+18.4%"],
    [BadgeCheck, "97", "Qualified", "+12.8%"],
    [CalendarCheck2, "32", "Appointments", "+9.3%"],
    [CircleDollarSign, "14", "Closed Jobs", "+21.6%"],
  ] as const;

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.09] bg-[#050c17]">
      <div className="flex h-8 items-center gap-1.5 border-b border-white/[0.07] bg-[#080f1b] px-3">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <div className="mx-auto h-3 w-28 rounded bg-white/[0.035]" />
      </div>
      <div className="grid grid-cols-[90px_1fr] sm:grid-cols-[112px_1fr]">
        <div className="border-r border-white/[0.07] bg-[#050b14] p-2.5">
          <Logo compact />
          <div className="mt-5 space-y-1 text-[6px] text-slate-600">
            {["Overview", "Leads", "Conversations", "Appointments", "ROI Tracking"].map((label, i) => (
              <div key={label} className={`rounded px-2 py-1.5 ${i === 0 ? "border border-orange-500/15 bg-orange-500/[0.08] text-orange-400" : ""}`}>{label}</div>
            ))}
          </div>
        </div>
        <div className="min-w-0 bg-[#060e1b] p-3">
          <div className="text-[9px] font-black text-white">Your Potential Results</div>
          <div className="mt-0.5 text-[6px] text-slate-600">Illustrative performance dashboard</div>
          <div className="mt-3 grid grid-cols-2 gap-1.5 lg:grid-cols-4">
            {cards.map(([Icon, value, label, delta]) => (
              <div key={label} className="rounded-lg border border-white/[0.075] bg-[#071222] p-2">
                <div className="flex items-center justify-between"><Icon className="h-2.5 w-2.5 text-orange-500" /><span className="text-[5px] font-bold text-emerald-400">{delta}</span></div>
                <div className="mt-2 text-[14px] font-black text-white">{value}</div>
                <div className="text-[5px] text-slate-600">{label}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 grid gap-2 lg:grid-cols-[1.65fr_.8fr]">
            <div className="rounded-lg border border-white/[0.075] bg-[#071222] p-2.5">
              <div className="text-[7px] font-bold text-white">Lead Activity</div>
              <svg viewBox="0 0 340 88" className="mt-2 h-[80px] w-full" aria-label="Potential lead activity chart">
                <defs><linearGradient id="potentialFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={ORANGE} stopOpacity=".25" /><stop offset="1" stopColor={ORANGE} stopOpacity="0" /></linearGradient></defs>
                {[17, 42, 67].map((y) => <line key={y} x1="0" x2="340" y1={y} y2={y} stroke="rgba(148,163,184,.08)" />)}
                <path d="M0 75 C35 70 44 55 72 59 C103 64 118 42 146 48 C180 55 193 30 220 36 C247 42 268 23 295 28 C314 31 327 15 340 12 L340 88 L0 88 Z" fill="url(#potentialFill)" />
                <path d="M0 75 C35 70 44 55 72 59 C103 64 118 42 146 48 C180 55 193 30 220 36 C247 42 268 23 295 28 C314 31 327 15 340 12" fill="none" stroke={ORANGE} strokeWidth="2" />
              </svg>
            </div>
            <div className="rounded-lg border border-white/[0.075] bg-[#071222] p-2.5">
              <div className="text-[7px] font-bold text-white">Lead Sources</div>
              <div className="mx-auto mt-3 grid h-[61px] w-[61px] place-items-center rounded-full bg-[conic-gradient(#ff6a00_0_45%,#2563eb_45%_69%,#16a34a_69%_86%,#7c3aed_86%_100%)]"><div className="grid h-[40px] w-[40px] place-items-center rounded-full bg-[#071222] text-[8px] font-black text-white">158</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconBenefit({ icon: Icon, title, copy }: { icon: ComponentType<{ className?: string }>; title: string; copy: string }) {
  return (
    <div className="flex gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-orange-500/20 bg-orange-500/[0.08] text-orange-500"><Icon className="h-4 w-4" /></div>
      <div><div className="text-[10px] font-extrabold text-white">{title}</div><div className="mt-1 text-[8px] leading-4 text-slate-600">{copy}</div></div>
    </div>
  );
}

export default function App() {
  return (
    <main id="top" className="relative min-h-screen overflow-hidden bg-[#030914] font-sans text-white selection:bg-orange-500 selection:text-white">
      <BackgroundLines />

      <header className="relative z-40 border-b border-white/[0.065] bg-[#030914]/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[78px] max-w-[1500px] items-center justify-between gap-6 px-5 py-3 sm:px-8 lg:px-12">
          <div className="flex min-w-0 items-center gap-6">
            <Logo />
            <div className="hidden min-w-0 border-l border-white/[0.09] pl-6 md:block">
              <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[.16em] text-orange-400"><ShieldCheck className="h-3 w-3" /> Private Demo</div>
              <div className="mt-1 max-w-[290px] truncate text-[9px] font-semibold text-slate-500">Prepared for {prospectConfig.companyName}</div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-[11px] font-semibold text-slate-500 xl:flex">
            <a href="#how" className="transition hover:text-orange-400">How It Works</a>
            <a href="#features" className="transition hover:text-orange-400">Features</a>
            <a href="#results" className="transition hover:text-orange-400">Results</a>
            <a href="#pricing" className="transition hover:text-orange-400">Pricing</a>
            <a href="#about" className="transition hover:text-orange-400">About LLF</a>
          </nav>

          <PrimaryButton href="#pricing">Book Your Strategy Call</PrimaryButton>
        </div>
      </header>

      <section className="relative mx-auto grid max-w-[1500px] gap-12 px-5 pb-12 pt-14 sm:px-8 lg:grid-cols-[.82fr_1.18fr] lg:items-center lg:px-12 lg:pb-14 lg:pt-16">
        <div className="relative z-10 max-w-[610px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/[0.07] px-3.5 py-2 text-[9px] font-extrabold uppercase tracking-[0.17em] text-orange-400">
            <Sparkles className="h-3 w-3" /> AI-Powered Lead Capture for HVAC Contractors
          </div>

          <h1 className="mt-6 text-[42px] font-black leading-[1.02] tracking-[-0.045em] text-white sm:text-[54px] xl:text-[65px]">
            A Better Way to Turn Website Visitors Into <span className="text-orange-500">Qualified HVAC Leads.</span>
          </h1>

          <p className="mt-6 max-w-[580px] text-[14px] leading-7 text-slate-400">
            This private concept shows how {prospectConfig.companyName} could engage visitors instantly, qualify service requests, capture contact details and route stronger opportunities to the team — 24/7.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <PrimaryButton href="#assistant">Try the AI Assistant</PrimaryButton>
            <a href="#how" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.13] bg-white/[0.025] px-5 py-3 text-[12px] font-bold text-slate-300 transition hover:border-orange-500/35 hover:text-white">See How It Works <ChevronRight className="h-4 w-4" /></a>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[9px] font-semibold text-slate-500">
            <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-orange-500" /> Bilingual EN / ES</span>
            <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-orange-500" /> 24/7 response</span>
            <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-orange-500" /> Built for {prospectConfig.shortName}</span>
          </div>
        </div>

        <div className="relative z-10 grid gap-3 md:grid-cols-[1.35fr_.78fr] lg:pl-2">
          <ChatPreview />
          <CapturedLead />
        </div>
      </section>

      <section id="features" className="relative mx-auto max-w-[1500px] px-5 pb-14 sm:px-8 lg:px-12">
        <div className="grid gap-3 md:grid-cols-5">
          {featureCards.map(({ number, icon: Icon, title, copy }) => (
            <article key={number} className="group relative min-h-[165px] overflow-hidden rounded-xl border border-white/[0.09] bg-[#07111f]/95 p-5 transition duration-300 hover:-translate-y-1 hover:border-orange-500/35">
              <div className="absolute right-3 top-2 text-[36px] font-black leading-none text-white/[0.035]">{number}</div>
              <div className="grid h-8 w-8 place-items-center rounded-lg border border-orange-500/20 bg-orange-500/[0.08] text-orange-500"><Icon className="h-4 w-4" /></div>
              <h2 className="mt-4 text-[11px] font-extrabold text-white">{title}</h2>
              <p className="mt-2 text-[8px] leading-[1.7] text-slate-600">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how" className="relative border-y border-white/[0.055] bg-[#040c18]/75">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_45%,rgba(255,106,0,.055),transparent_46%)]" />
        <div className="relative mx-auto grid max-w-[1500px] gap-6 px-5 py-14 sm:px-8 lg:grid-cols-[.72fr_1.28fr] lg:px-12">
          <article id="pricing" className="rounded-2xl border border-orange-500/25 bg-[#07111f]/95 p-6 shadow-[0_0_55px_rgba(255,106,0,.055)] sm:p-8">
            <div className="text-[9px] font-black uppercase tracking-[.18em] text-orange-400">Founding Client Offer</div>
            <h2 className="mt-4 text-[28px] font-black tracking-[-.035em] sm:text-[34px]">Launch the complete system.</h2>
            <p className="mt-3 text-[10px] leading-5 text-slate-500">A focused starting package for local service businesses ready to capture and organize more opportunities.</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.08] bg-black/20 p-4">
                <div className="text-[7px] font-bold uppercase tracking-[.16em] text-slate-600">Setup</div>
                <div className="mt-1 text-[34px] font-black text-white">$299</div>
                <div className="text-[7px] text-slate-600">one time</div>
              </div>
              <div className="rounded-xl border border-orange-500/20 bg-orange-500/[0.035] p-4">
                <div className="text-[7px] font-bold uppercase tracking-[.16em] text-orange-400">Monthly</div>
                <div className="mt-1 text-[34px] font-black text-white">$199<span className="ml-1 text-[9px] font-semibold text-slate-600">/mo</span></div>
                <div className="text-[7px] text-slate-600">ongoing system</div>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-[9px] text-slate-400">
              {["Bilingual AI lead assistant", "Custom qualification flow", "Lead delivery to your team", "Hosting & maintenance", "Performance tracking", "Ongoing optimization"].map((item) => (
                <div key={item} className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-orange-500" />{item}</div>
              ))}
            </div>

            <div className="mt-6 rounded-full border border-orange-500/25 bg-orange-500/[0.06] px-3 py-2 text-center text-[7px] font-black uppercase tracking-[.13em] text-orange-400">Limited founding-client availability</div>
            <div className="mt-5"><PrimaryButton href={`mailto:hello@localleadforge.com?subject=Strategy%20Call%20-%20${encodeURIComponent(prospectConfig.companyName)}`}>Book Your Strategy Call</PrimaryButton></div>
          </article>

          <article id="results" className="rounded-2xl border border-white/[0.09] bg-[#07111f]/95 p-6 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[.18em] text-orange-400">Illustrative Dashboard</div>
                <h2 className="mt-3 text-[25px] font-black tracking-[-.03em] sm:text-[32px]">Your Potential Results with Local Lead Forge</h2>
              </div>
              <div className="rounded-full border border-white/[0.08] bg-black/20 px-3 py-1.5 text-[7px] text-slate-600">Sample metrics — not a guarantee</div>
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-[1.45fr_.65fr]">
              <PotentialDashboard />
              <div className="space-y-5">
                <IconBenefit icon={Zap} title="Instant Response" copy="Engage prospects before they move on to the next contractor." />
                <IconBenefit icon={Target} title="Better Qualification" copy="Capture the details your team needs before follow-up begins." />
                <IconBenefit icon={TrendingUp} title="Clearer ROI" copy="Connect lead activity to appointments and closed work." />
                <IconBenefit icon={Clock3} title="After-Hours Coverage" copy="Keep capturing intent when your office is closed." />
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-12">
        <div className="grid gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.06] md:grid-cols-4">
          {[
            [ShieldCheck, "Private & Confidential", `Prepared specifically for ${prospectConfig.shortName}`],
            [Languages, "English + Spanish", "Bilingual lead conversations"],
            [Headphones, "U.S.-Based Support", "Direct implementation support"],
            [Wrench, "HVAC Focused Demo", prospectConfig.serviceArea],
          ].map(([Icon, title, copy]) => {
            const I = Icon as ComponentType<{ className?: string }>;
            return (
              <div key={String(title)} className="flex items-center gap-3 bg-[#050d19] px-5 py-5">
                <I className="h-4 w-4 shrink-0 text-orange-500" />
                <div><div className="text-[9px] font-bold text-slate-300">{String(title)}</div><div className="mt-0.5 text-[7px] text-slate-600">{String(copy)}</div></div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 border-y border-white/[0.055] py-7 text-center">
          <div className="text-[7px] font-black uppercase tracking-[.2em] text-slate-700">Designed to fit leading HVAC workflows and equipment brands</div>
          <div className="mx-auto mt-5 flex max-w-[850px] flex-wrap items-center justify-center gap-x-9 gap-y-4 text-[11px] font-black tracking-[.04em] text-slate-600">
            {['Carrier', 'Trane', 'Lennox', 'Rheem', 'Goodman', 'American Standard'].map((brand) => <span key={brand}>{brand}</span>)}
          </div>
        </div>

        <footer className="grid gap-6 py-8 text-[8px] text-slate-600 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <Logo />
          <div className="max-w-[520px] text-center leading-4">Private concept demo prepared for {prospectConfig.companyName}. This page is for demonstration purposes and is not the company’s official website.</div>
          <div className="flex flex-wrap justify-start gap-4 md:justify-end">
            <span className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-orange-500" />{prospectConfig.phoneDisplay}</span>
            <span>localleadforge.com</span>
          </div>
        </footer>
      </section>
    </main>
  );
}
