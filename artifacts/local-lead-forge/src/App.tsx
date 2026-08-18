import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  BriefcaseBusiness,
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
  Play,
  Settings2,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wrench,
  Zap,
} from "lucide-react";

const ORANGE = "#ff6a00";

const features = [
  {
    number: "1",
    icon: Languages,
    title: "Bilingual AI Assistant",
    copy: "Engages every visitor instantly in English or Spanish, 24/7.",
  },
  {
    number: "2",
    icon: Target,
    title: "Lead Capture & Qualification",
    copy: "Collects the details your team needs and filters for real opportunities.",
  },
  {
    number: "3",
    icon: MousePointerClick,
    title: "Self-Closing Funnel",
    copy: "Moves high-intent visitors from first question to a clear next step.",
  },
  {
    number: "4",
    icon: Gauge,
    title: "Client Portal & ROI",
    copy: "See leads, appointments, jobs and revenue in one simple dashboard.",
  },
  {
    number: "5",
    icon: Zap,
    title: "Faster Response",
    copy: "Respond while prospects are still on your site — even after hours.",
  },
];

const dashboardNav = [
  [LayoutDashboard, "Overview", true],
  [Users, "Leads", false],
  [MessageSquareText, "Conversations", false],
  [CalendarCheck2, "Appointments", false],
  [TrendingUp, "ROI Tracking", false],
  [MousePointerClick, "Funnels", false],
  [Settings2, "Settings", false],
] as const;

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#top" className="flex items-center gap-3" aria-label="Local Lead Forge home">
      <div className="relative grid h-10 w-10 place-items-center rounded-lg border border-orange-500/45 bg-[#0a1423] shadow-[0_0_24px_rgba(255,106,0,0.15)]">
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

function OrangeButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="group inline-flex items-center justify-center gap-2 rounded-lg border border-orange-400/90 bg-orange-600 px-6 py-3 text-sm font-extrabold text-white shadow-[0_0_26px_rgba(255,106,0,0.28)] transition duration-200 hover:-translate-y-0.5 hover:bg-orange-500 hover:shadow-[0_0_36px_rgba(255,106,0,0.42)]"
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}

function MetricCard({
  icon: Icon,
  value,
  label,
  delta,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  delta: string;
  tone: "orange" | "blue" | "green" | "purple";
}) {
  const styles = {
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    blue: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    green: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    purple: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  }[tone];

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#071222] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
      <div className="flex items-start justify-between gap-2">
        <div className={`grid h-8 w-8 place-items-center rounded-lg border ${styles}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[9px] font-bold text-emerald-400">{delta}</span>
      </div>
      <div className="mt-3 text-[21px] font-black leading-none text-white">{value}</div>
      <div className="mt-1.5 text-[9px] font-medium text-slate-500">{label}</div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[690px]">
      <div className="absolute -inset-12 -z-10 rounded-full bg-orange-600/[0.07] blur-3xl" />
      <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-[#050c17] shadow-[0_32px_90px_rgba(0,0,0,.55),0_0_80px_rgba(255,106,0,.06)]">
        <div className="flex h-9 items-center gap-2 border-b border-white/[0.07] bg-[#080f1b] px-4">
          <span className="h-2 w-2 rounded-full bg-[#ff5f56]" />
          <span className="h-2 w-2 rounded-full bg-[#ffbd2e]" />
          <span className="h-2 w-2 rounded-full bg-[#27c93f]" />
          <div className="mx-auto h-4 w-40 rounded bg-white/[0.035]" />
          <div className="w-6" />
        </div>

        <div className="grid min-h-[385px] grid-cols-[132px_1fr] sm:grid-cols-[150px_1fr]">
          <aside className="border-r border-white/[0.07] bg-[#050b14] px-3 py-4">
            <Logo compact />
            <div className="mt-7 space-y-1">
              {dashboardNav.map(([Icon, label, active]) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-[9px] font-semibold ${
                    active ? "border border-orange-500/20 bg-orange-500/10 text-orange-400" : "text-slate-600"
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{label}</span>
                </div>
              ))}
            </div>
          </aside>

          <div className="min-w-0 bg-[#060e1b] p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-black text-white">Performance Overview</div>
                <div className="mt-1 text-[8px] text-slate-600">Live lead and revenue activity</div>
              </div>
              <div className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[7px] text-slate-500">Last 7 Days</div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              <MetricCard icon={Users} value="158" label="New Leads" delta="+18.4%" tone="orange" />
              <MetricCard icon={BadgeCheck} value="97" label="Qualified" delta="+12.8%" tone="blue" />
              <MetricCard icon={CalendarCheck2} value="32" label="Appointments" delta="+9.3%" tone="green" />
              <MetricCard icon={CircleDollarSign} value="14" label="Closed Jobs" delta="+21.6%" tone="purple" />
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[1.7fr_.95fr]">
              <div className="rounded-xl border border-white/[0.08] bg-[#071222] p-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-white">Lead Activity</div>
                    <div className="mt-0.5 text-[7px] text-slate-600">Visitors converted into leads</div>
                  </div>
                  <div className="text-[7px] text-orange-400">● Leads</div>
                </div>
                <svg viewBox="0 0 410 135" className="mt-3 h-[130px] w-full overflow-visible" role="img" aria-label="Lead activity chart">
                  <defs>
                    <linearGradient id="leadFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={ORANGE} stopOpacity=".28" />
                      <stop offset="100%" stopColor={ORANGE} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[20, 52, 84, 116].map((y) => (
                    <line key={y} x1="0" x2="410" y1={y} y2={y} stroke="rgba(148,163,184,.08)" strokeWidth="1" />
                  ))}
                  <path d="M0 112 C35 106 50 88 76 92 C102 96 112 68 145 75 C176 82 190 52 220 61 C248 70 266 46 294 51 C326 56 342 20 410 27 L410 135 L0 135 Z" fill="url(#leadFill)" />
                  <path d="M0 112 C35 106 50 88 76 92 C102 96 112 68 145 75 C176 82 190 52 220 61 C248 70 266 46 294 51 C326 56 342 20 410 27" fill="none" stroke={ORANGE} strokeWidth="2.5" strokeLinecap="round" />
                  {[76, 145, 220, 294, 410].map((x, i) => {
                    const ys = [92, 75, 61, 51, 27];
                    return <circle key={x} cx={x} cy={ys[i]} r="3.5" fill="#071222" stroke={ORANGE} strokeWidth="2" />;
                  })}
                </svg>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#071222] p-3.5">
                <div className="text-[10px] font-bold text-white">Lead Sources</div>
                <div className="mt-1 text-[7px] text-slate-600">Where your opportunities begin</div>
                <div className="mx-auto mt-5 grid h-[88px] w-[88px] place-items-center rounded-full bg-[conic-gradient(#ff6a00_0_43%,#2563eb_43%_68%,#16a34a_68%_86%,#7c3aed_86%_100%)] shadow-[0_0_35px_rgba(255,106,0,.08)]">
                  <div className="grid h-[57px] w-[57px] place-items-center rounded-full bg-[#071222] text-center">
                    <div><div className="text-[13px] font-black text-white">158</div><div className="text-[6px] text-slate-600">TOTAL</div></div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-1.5 text-[7px] text-slate-500">
                  <span><b className="text-orange-500">●</b> AI Chat 43%</span>
                  <span><b className="text-blue-500">●</b> Forms 25%</span>
                  <span><b className="text-green-500">●</b> Search 18%</span>
                  <span><b className="text-violet-500">●</b> Other 14%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BackgroundLines() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute left-1/2 top-0 h-[720px] w-[1100px] -translate-x-1/2 rounded-full bg-orange-600/[0.045] blur-[120px]" />
      <svg className="absolute left-0 top-[155px] h-[520px] w-full opacity-45" viewBox="0 0 1800 520" fill="none" preserveAspectRatio="none">
        <path d="M-80 365 C210 270 265 245 510 298 C760 353 860 112 1120 181 C1377 250 1508 168 1880 16" stroke="url(#lineOne)" strokeWidth="1.1" />
        <path d="M-60 430 C250 325 358 312 566 340 C783 370 927 165 1177 215 C1417 263 1572 209 1880 72" stroke="rgba(255,106,0,.13)" strokeWidth="1" />
        <path d="M-50 250 C245 185 333 198 525 245 C730 295 866 71 1095 143 C1324 215 1518 121 1865 -28" stroke="rgba(255,106,0,.08)" strokeWidth="1" />
        <defs>
          <linearGradient id="lineOne" x1="0" x2="1800" y1="0" y2="0">
            <stop stopColor={ORANGE} stopOpacity="0" />
            <stop offset=".2" stopColor={ORANGE} stopOpacity=".24" />
            <stop offset=".58" stopColor={ORANGE} stopOpacity=".55" />
            <stop offset="1" stopColor={ORANGE} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function App() {
  return (
    <main id="top" className="relative min-h-screen overflow-hidden bg-[#030914] font-sans text-white selection:bg-orange-500 selection:text-white">
      <BackgroundLines />

      <header className="relative z-40 border-b border-white/[0.065] bg-[#030914]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[82px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Logo />

          <nav className="hidden items-center gap-8 text-[13px] font-semibold text-slate-400 lg:flex">
            <a className="transition hover:text-orange-400" href="#solutions">Solutions</a>
            <a className="transition hover:text-orange-400" href="#how-it-works">How It Works</a>
            <a className="transition hover:text-orange-400" href="#pricing">Pricing</a>
            <a className="transition hover:text-orange-400" href="#results">Results</a>
            <a className="transition hover:text-orange-400" href="#about">About</a>
          </nav>

          <OrangeButton href="#pricing">Book a Demo</OrangeButton>
        </div>
      </header>

      <section className="relative mx-auto grid max-w-[1500px] gap-14 px-5 pb-14 pt-16 sm:px-8 lg:grid-cols-[.88fr_1.12fr] lg:items-center lg:px-12 lg:pb-16 lg:pt-20">
        <div className="relative z-10 max-w-[630px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/[0.07] px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.17em] text-orange-400">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Lead Capture for Local Service Businesses
          </div>

          <h1 className="mt-7 text-[44px] font-black leading-[1.02] tracking-[-0.045em] text-white sm:text-[58px] lg:text-[68px] xl:text-[76px]">
            Turn More Visitors Into <span className="text-orange-500">Qualified Leads.</span>
          </h1>

          <p className="mt-7 max-w-[590px] text-[15px] leading-7 text-slate-400 sm:text-[16px]">
            Local Lead Forge combines bilingual AI, smart automation and high-converting demo pages to help local service businesses capture more opportunities and turn website traffic into measurable revenue.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <OrangeButton href="#how-it-works">See How It Works</OrangeButton>
            <a href="#solutions" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.14] bg-white/[0.025] px-6 py-3 text-sm font-bold text-slate-200 transition hover:border-orange-500/40 hover:bg-orange-500/[0.05] hover:text-white">
              <Play className="h-4 w-4 fill-current" /> Watch 90-Second Demo
            </a>
          </div>

          <div className="mt-10 grid max-w-[610px] grid-cols-2 gap-x-4 gap-y-3 text-[11px] font-semibold text-slate-400 sm:grid-cols-4">
            {[
              [Languages, "Bilingual (EN/ES)"],
              [Bot, "AI-Powered"],
              [MailCheck, "Automated Follow-Up"],
              [Wrench, "Built for Local Services"],
            ].map(([Icon, label]) => {
              const I = Icon as React.ComponentType<{ className?: string }>;
              return (
                <div key={String(label)} className="flex items-center gap-2">
                  <I className="h-3.5 w-3.5 text-orange-500" />
                  <span>{String(label)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 lg:pl-3">
          <DashboardMockup />
        </div>
      </section>

      <section id="solutions" className="relative mx-auto max-w-[1500px] px-5 pb-16 sm:px-8 lg:px-12">
        <div className="grid gap-3 md:grid-cols-5">
          {features.map(({ number, icon: Icon, title, copy }) => (
            <article key={number} className="group relative min-h-[180px] overflow-hidden rounded-xl border border-white/[0.09] bg-[#07111f]/90 p-5 transition duration-300 hover:-translate-y-1 hover:border-orange-500/35 hover:bg-[#091525]">
              <div className="absolute right-3 top-2 text-[38px] font-black leading-none text-white/[0.035]">{number}</div>
              <div className="grid h-8 w-8 place-items-center rounded-lg border border-orange-500/20 bg-orange-500/[0.08] text-orange-500">
                <Icon className="h-4 w-4" />
              </div>
              <h2 className="mt-5 text-[13px] font-extrabold text-white">{title}</h2>
              <p className="mt-2 text-[10px] leading-[1.65] text-slate-500">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="relative border-y border-white/[0.055] bg-[#040c18]/75">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,106,0,.055),transparent_48%)]" />
        <div className="relative mx-auto grid max-w-[1500px] gap-7 px-5 py-16 sm:px-8 lg:grid-cols-[.82fr_1.18fr] lg:px-12">
          <article id="pricing" className="rounded-2xl border border-orange-500/25 bg-[#07111f]/95 p-7 shadow-[0_0_55px_rgba(255,106,0,.06)] sm:p-9">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-[10px] font-black uppercase tracking-[0.19em] text-orange-400">Founding Client Offer</div>
              <div className="rounded-full border border-orange-500/30 bg-orange-500/[0.07] px-3 py-1.5 text-[8px] font-black uppercase tracking-[.12em] text-orange-400">Limited to the first 5 clients</div>
            </div>

            <h2 className="mt-5 max-w-[520px] text-3xl font-black tracking-[-.03em] text-white sm:text-[40px]">Everything you need to capture more leads.</h2>
            <p className="mt-3 max-w-[520px] text-[12px] leading-6 text-slate-500">Launch with a complete lead-capture system built to engage, qualify and route opportunities automatically.</p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="rounded-xl border border-white/[0.08] bg-black/20 p-5">
                <div className="text-[9px] font-bold uppercase tracking-[.16em] text-slate-500">Setup</div>
                <div className="mt-2 text-[42px] font-black tracking-[-.04em] text-white">$299</div>
                <div className="text-[9px] text-slate-600">One-time setup</div>
              </div>
              <div className="rounded-xl border border-orange-500/20 bg-orange-500/[0.035] p-5">
                <div className="text-[9px] font-bold uppercase tracking-[.16em] text-orange-400">Monthly</div>
                <div className="mt-2 text-[42px] font-black tracking-[-.04em] text-white">$199<span className="ml-1 text-[12px] font-semibold text-slate-500">/MONTH</span></div>
                <div className="text-[9px] text-slate-600">Hosting, AI capture & optimization</div>
              </div>
            </div>

            <div className="mt-6 grid gap-2.5 text-[10px] text-slate-400 sm:grid-cols-2">
              {[
                "Bilingual AI assistant",
                "Lead qualification flow",
                "Automated lead delivery",
                "Client reporting & ROI",
                "Hosting and maintenance",
                "Ongoing optimization",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-orange-500" />{item}</div>
              ))}
            </div>

            <div className="mt-8"><OrangeButton href="#about">Start With Local Lead Forge</OrangeButton></div>
          </article>

          <article id="results" className="rounded-2xl border border-white/[0.09] bg-[#07111f]/95 p-7 sm:p-9">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.19em] text-orange-400">Performance Snapshot</div>
                <h2 className="mt-3 text-2xl font-black tracking-[-.03em] sm:text-[32px]">Results you can actually see.</h2>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500/70" />
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["158+", "New Leads", "This Week"],
                ["32", "Appointments", "Booked"],
                ["14", "Jobs Closed", "This Week"],
                ["$28,450", "Revenue", "Generated"],
              ].map(([value, label, sub]) => (
                <div key={label} className="rounded-xl border border-white/[0.075] bg-black/20 p-4">
                  <div className="text-[24px] font-black tracking-[-.03em] text-orange-400">{value}</div>
                  <div className="mt-1 text-[9px] font-bold text-white">{label}</div>
                  <div className="mt-0.5 text-[8px] text-slate-600">{sub}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 rounded-xl border border-white/[0.07] bg-black/20 p-5 sm:grid-cols-[1fr_.9fr]">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[.15em] text-slate-500">Built for service businesses</div>
                <div className="mt-3 grid grid-cols-2 gap-y-2 text-[10px] font-semibold text-slate-300">
                  {["HVAC", "Plumbing", "Electrical", "Roofing", "Landscaping", "And More"].map((item) => (
                    <span key={item} className="flex items-center gap-2"><Check className="h-3 w-3 text-orange-500" />{item}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center rounded-lg border border-orange-500/15 bg-orange-500/[0.035] p-4">
                <div>
                  <div className="text-[24px] font-black text-white">18.4%</div>
                  <div className="mt-1 text-[9px] text-slate-500">average weekly lead growth in this dashboard example</div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-12">
        <div className="grid gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.06] md:grid-cols-4">
          {[
            [BriefcaseBusiness, "No Long-Term Contracts"],
            [Clock3, "Cancel Anytime"],
            [TrendingUp, "100% Focused on ROI"],
            [Headphones, "U.S.-Based Support"],
          ].map(([Icon, label]) => {
            const I = Icon as React.ComponentType<{ className?: string }>;
            return (
              <div key={String(label)} className="flex items-center justify-center gap-3 bg-[#050d19] px-5 py-5 text-[10px] font-bold text-slate-300">
                <I className="h-4 w-4 text-orange-500" />
                {String(label)}
              </div>
            );
          })}
        </div>

        <footer className="flex flex-col items-center justify-between gap-4 py-8 text-[9px] text-slate-600 sm:flex-row">
          <Logo />
          <div>© 2026 Local Lead Forge. AI-powered lead capture for local service businesses.</div>
          <a href="#top" className="flex items-center gap-1 text-slate-500 transition hover:text-orange-400">Back to top <ChevronRight className="h-3 w-3 -rotate-90" /></a>
        </footer>
      </section>
    </main>
  );
}
