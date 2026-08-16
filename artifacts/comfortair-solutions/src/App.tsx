import {
  type FormEvent,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Route, Switch, useLocation, Router as WouterRouter } from "wouter";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleCheck,
  Clock3,
  Facebook,
  Fan,
  Flame,
  Gauge,
  Instagram,
  Menu,
  MessageCircle,
  Phone,
  Pin,
  Send,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Star,
  Wrench,
  X,
} from "lucide-react";

const queryClient = new QueryClient();

type Language = "en" | "es";

const translations = {
  en: {
    nav: {
      services: "Services",
      approach: "Our approach",
      area: "Service area",
      reviews: "Reviews",
    },
    headerChat: "Chat with our AI assistant",
    languageLabel: "Language",
    hero: {
      eyebrow: "Atlanta's local comfort team",
      title1: "Fast, Reliable",
      title2: "HVAC Service",
      title3: "in Atlanta",
      subhead:
        "Air conditioning and heating repair, maintenance, and installation.",
      request: "Request Service",
      chat: "Chat With Our AI Assistant",
      trust: [
        "Licensed & insured",
        "Upfront communication",
        "Local technicians",
      ],
      peaceLabel: "Peace of mind",
      peaceText: "The work is not done until your home feels right.",
      quote1: "“The team you call",
      quote2: "when comfort matters.”",
      imageAlt: "ComfortAir technician inspecting an HVAC system",
    },
    services: {
      eyebrow: "What we do",
      title1: "Comfort,",
      title2: "handled.",
      intro:
        "From the first call to the final check, you get clear communication, careful work, and a home that feels better than we found it.",
      selected: "Selected service",
      learn: "Learn more",
      items: [
        {
          id: "ac",
          title: "AC Repair",
          copy: "Quiet, capable fixes for the Atlanta heat. We find the root cause and explain it plainly.",
          detail:
            "From strange sounds to a system that will not start, our technicians arrive prepared for the most common repairs.",
        },
        {
          id: "heat",
          title: "Heating Repair",
          copy: "Warmth restored without the guesswork, rushed upsells, or cold-room shuffle.",
          detail:
            "Furnaces, heat pumps, and thermostats — handled by technicians who know how Atlanta homes actually heat.",
        },
        {
          id: "maint",
          title: "HVAC Maintenance",
          copy: "A small seasonal check can prevent a very large, very inconvenient surprise.",
          detail:
            "Our tune-ups protect efficiency, extend equipment life, and catch wear before it becomes a weekend emergency.",
        },
        {
          id: "install",
          title: "New System Installation",
          copy: "Right-sized comfort systems, thoughtfully installed for the way your home lives.",
          detail:
            "We make the options clear, then install the system with care for your home, air quality, and long-term comfort.",
        },
      ],
    },
    why: {
      eyebrow: "Why ComfortAir",
      title1: "Good work",
      title2: "feels different.",
      body: "You should never need an engineering degree to understand your own home. We pair technical excellence with the kind of human service that makes a stressful day feel manageable.",
      imageAlt: "Technician checking air conditioning equipment",
      since: "Serving Atlanta since",
      features: [
        [
          "We show up prepared",
          "The right tools, parts, and context to make the first visit count.",
        ],
        [
          "We explain the why",
          "Plain language. Honest options. No pressure to decide on the spot.",
        ],
        [
          "We leave it better",
          "Careful shoe covers, clean work areas, and respect for your home.",
        ],
        [
          "We think long-term",
          "Solutions designed for comfort today and fewer surprises tomorrow.",
        ],
      ],
    },
    area: {
      eyebrow: "Close to home",
      title1: "Neighbors",
      title2: "helping",
      title3: "neighbors.",
      copy: "We are proud to serve the neighborhoods that make metro Atlanta feel like home. If you are nearby and not on the list, give us a call — we are happy to talk.",
      phone: "(470) 555-0124",
      live: "local service area",
      cities: [
        "Atlanta",
        "Decatur",
        "Marietta",
        "Roswell",
        "Smyrna",
        "Sandy Springs",
        "Brookhaven",
        "Alpharetta",
        "East Cobb",
        "Dunwoody",
        "Vinings",
        "Tucker",
      ],
    },
    reviews: {
      eyebrow: "Kind words",
      title1: "Comfortable",
      title2: "company.",
      items: [
        {
          quote:
            "Our upstairs was finally comfortable again by dinner. The technician found the issue quickly and took time to show me what he was doing.",
          name: "Marianne R.",
          location: "Decatur, GA",
          initials: "MR",
        },
        {
          quote:
            "No pressure, no mystery invoice — just a thoughtful diagnosis and a clean repair. ComfortAir is now our first call.",
          name: "Daniel K.",
          location: "East Cobb, GA",
          initials: "DK",
        },
        {
          quote:
            "The installation team treated our home like it was their own. Quiet, tidy, and our energy bill noticed the difference.",
          name: "Priya S.",
          location: "Brookhaven, GA",
          initials: "PS",
        },
      ],
    },
    contact: {
      eyebrow: "Let's get comfortable",
      title1: "Your home",
      title2: "called.",
      body: "Tell us a little about what is going on. We will follow up with next steps — no pressure, no robotic runaround.",
      hours: "Mon–Sat · 7:00am–7:00pm",
      chat: "Prefer to chat? Meet our AI assistant",
      successTitle: "We got it.",
      successBody:
        "Thanks for reaching out. A ComfortAir team member will review your note and follow up during business hours.",
      reset: "Send another request",
      formTitle: "Request service",
      formIntro: "A few details helps us make the first conversation useful.",
      name: "Name",
      namePlaceholder: "Your name",
      phone: "Phone",
      phonePlaceholder: "(470) 555-0124",
      help: "What can we help with?",
      helpPlaceholder: "Tell us what your system is doing (or not doing)...",
      consent:
        "I agree to be contacted about this request. No marketing lists, no pressure.",
      submit: "Send request",
    },
    footer: {
      description:
        "A local HVAC team for the homes, neighborhoods, and weather we know best.",
      explore: "Explore",
      exploreLinks: ["Services", "Our approach", "Customer reviews"],
      serviceArea: "Service area",
      serviceAreaItems: [
        "Atlanta & Midtown",
        "Decatur & East Cobb",
        "Marietta & Roswell",
        "North Metro Atlanta",
      ],
      talk: "Talk to us",
      hours: "Mon–Sat · 7:00am–7:00pm",
      licensed: "Licensed & insured in Georgia",
      copyright: "© 2025 ComfortAir Solutions",
      tagline: "Built for better home days.",
    },
    chat: {
      assistantTitle: "ComfortAir AI Assistant",
      assistantSubtitle: "Here to point you in the right direction",
      greeting:
        "Hi there — I’m ComfortAir’s virtual assistant. I can collect a few details for our team. I won’t estimate pricing or promise a technician time, but I can make your next step easier.",

      promptProblem: "What is happening with your heating or air conditioning?",
      promptLocation: "What city or ZIP code is the home in?",
      promptTiming:
        "When would you ideally like help? (For example: today, this week, or flexible.)",
      promptDetails: "Last step: what is your name and best phone number?",

      quickProblem: ["AC blowing warm air", "No heat", "Strange noise"],
      quickTiming: ["Today", "This week", "I’m flexible"],
      placeholderDetails: "Name, phone number",
      answerPlaceholder: "Type your answer...",
      finalSummary:
        "Thanks, {name}. Here’s what I’ll pass to the ComfortAir team: {issue} in {location}, ideally {timing}. Phone: {phone}. A team member will review this during business hours — this chat does not confirm pricing or an appointment time.",
      closeNote:
        "You can close this window — your summary is ready for the team.",
    },
    demo: {
      label: "Try the demo",
      placeholder: "Your email address",
      button: "Try demo",
      error: "Enter a valid email",
    },
  },
  es: {
    nav: {
      services: "Servicios",
      approach: "Nuestro enfoque",
      area: "Área de servicio",
      reviews: "Reseñas",
    },

    headerChat: "Chatea con nuestro asistente de IA",
    languageLabel: "Idioma",
    hero: {
      eyebrow: "El equipo local de confort de Atlanta",
      title1: "Servicio de HVAC",
      title2: "rápido y confiable",
      title3: "en Atlanta",
      subhead:
        "Reparación, mantenimiento e instalación de aire acondicionado y calefacción.",
      request: "Solicitar servicio",
      chat: "Hablar con nuestro asistente de IA",
      trust: [
        "Con licencia y asegurados",
        "Comunicación clara",
        "Técnicos locales",
      ],
      peaceLabel: "Tranquilidad",
      peaceText: "El trabajo no termina hasta que tu hogar se sienta bien.",
      quote1: "“El equipo al que llamas",
      quote2: "cuando el confort importa.”",
      imageAlt: "Técnico de ComfortAir inspeccionando un sistema de HVAC",
    },
    services: {
      eyebrow: "Lo que hacemos",
      title1: "Confort,",
      title2: "resuelto.",
      intro:
        "Desde la primera llamada hasta la revisión final, recibes comunicación clara, trabajo cuidadoso y un hogar que se siente mejor que cuando llegamos.",
      selected: "Servicio seleccionado",
      learn: "Más información",
      items: [
        {
          id: "ac",
          title: "Reparación de aire acondicionado",
          copy: "Soluciones confiables para el calor de Atlanta. Encontramos la causa del problema y te la explicamos claramente.",
          detail:
            "Desde ruidos extraños hasta un sistema que no enciende, nuestros técnicos llegan preparados para las reparaciones más comunes.",
        },
        {
          id: "heat",
          title: "Reparación de calefacción",
          copy: "Recupera el calor de tu hogar sin complicaciones, presión ni explicaciones confusas.",
          detail:
            "Trabajamos con hornos, bombas de calor y termostatos, buscando una solución clara y confiable.",
        },
        {
          id: "maint",
          title: "Mantenimiento HVAC",
          copy: "Una revisión preventiva puede evitar una avería grande e inesperada.",
          detail:
            "Nuestro mantenimiento ayuda a mejorar la eficiencia, prolongar la vida del equipo y detectar desgaste antes de una emergencia.",
        },
        {
          id: "install",
          title: "Instalación de sistemas nuevos",
          copy: "Sistemas de climatización adecuados para tu hogar e instalados cuidadosamente.",
          detail:
            "Te explicamos las opciones y realizamos la instalación pensando en el confort, la calidad del aire y el rendimiento a largo plazo.",
        },
      ],
    },
    why: {
      eyebrow: "Por qué ComfortAir",
      title1: "El buen trabajo",
      title2: "se siente distinto.",
      copy: "No deberías necesitar un título de ingeniería para entender tu propio hogar. Combinamos excelencia técnica con un servicio humano que hace que un día estresante se sienta manejable.",
      features: [
        [
          "01",
          "Llegamos preparados",
          "Las herramientas, las piezas y el contexto correcto para que la primera visita cuente.",
        ],
        [
          "02",
          "Explicamos el porqué",
          "Lenguaje claro. Opciones honestas. Sin presión para decidir en el momento.",
        ],
        [
          "03",
          "Lo dejamos mejor",
          "Cuidamos los zapatos, mantenemos el área limpia y respetamos tu hogar.",
        ],
        [
          "04",
          "Pensamos a largo plazo",
          "Soluciones diseñadas para el confort de hoy y menos sorpresas mañana.",
        ],
      ],
    },
    area: {
      eyebrow: "Cerca de casa",
      title1: "Vecinos",
      title2: "ayudando a vecinos.",
      copy: "Nos enorgullece servir los vecindarios que hacen que el área metropolitana de Atlanta se sienta como hogar. Si estás cerca y no estás en la lista, llámanos — con gusto conversamos.",
      phone: "(470) 555-0124",
      live: "área de servicio local",
    },
    reviews: {
      eyebrow: "Palabras amables",
      title1: "Compañía",
      title2: "confortable.",
    },
    contact: {
      eyebrow: "Hagamos que te sientas cómodo",
      title1: "Tu hogar",
      title2: "habló.",
      copy: "Cuéntanos un poco de lo que está pasando. Te daremos los siguientes pasos — sin presión, sin vueltas robóticas.",
      phone: "(470) 555-0124",
      hours: "Lun–Sáb · 7:00am–7:00pm",
      chat: "¿Prefieres chatear? Conoce a nuestro asistente de IA",
      successTitle: "Lo recibimos.",
      successCopy:
        "Gracias por contactarnos. Un miembro del equipo ComfortAir revisará tu nota y hará seguimiento en horario comercial.",
      sentAgain: "Enviar otra solicitud",
      formTitle: "Solicitar servicio",
      formCopy:
        "Unos pocos detalles ayudan a que la primera conversación sea útil.",
      nameLabel: "Nombre",
      phoneLabel: "Teléfono",
      helpLabel: "¿En qué podemos ayudarte?",
      consentCopy:
        "Acepto ser contactado sobre esta solicitud. Sin listas de marketing, sin presión.",
      submit: "Enviar solicitud",
    },
    footer: {
      description:
        "Un equipo local de HVAC para los hogares, vecindarios y clima que conocemos mejor.",
      explore: "Explorar",
      exploreLinks: ["Servicios", "Nuestro enfoque", "Reseñas de clientes"],
      serviceArea: "Área de servicio",
      serviceAreaItems: [
        "Atlanta y Midtown",
        "Decatur y East Cobb",
        "Marietta y Roswell",
        "Norte del metro de Atlanta",
      ],
      talk: "Contáctanos",
      phone: "(470) 555-0124",
      hours: "Lun–Sáb · 7:00am–7:00pm",
      licensed: "Con licencia y asegurados en Georgia",
      copyright: "© 2025 ComfortAir Solutions",
      tagline: "Construido para mejores días en casa.",
    },
    chat: {
      assistantTitle: "Asistente IA ComfortAir",
      assistantSubtitle: "Aquí para guiarte en la dirección correcta",
      greeting:
        "Hola — soy el asistente virtual de ComfortAir. Puedo recopilar algunos detalles para nuestro equipo. No estimaré precios ni prometo una hora de técnico, pero puedo hacer tu siguiente paso más sencillo.",
      promptProblem:
        "¿Qué está pasando con tu calefacción o aire acondicionado?",
      promptLocation: "¿En qué ciudad o código postal está la casa?",
      promptTiming:
        "¿Cuándo te gustaría idealmente recibir ayuda? (Por ejemplo: hoy, esta semana o flexible.)",
      promptDetails:
        "Último paso: ¿cuál es tu nombre y el mejor número de teléfono?",
      quickProblem: ["El aire sale tibio", "No hay calor", "Ruido extraño"],
      quickTiming: ["Hoy", "Esta semana", "Soy flexible"],
      placeholderAnswer: "Escribe tu respuesta...",
      placeholderDetails: "Nombre, número de teléfono",
      finalSummary:
        "Gracias, {name}. Esto es lo que enviaré al equipo de ComfortAir: {issue} en {location}, idealmente {timing}. Teléfono: {phone}. Un miembro del equipo revisará esto durante el horario comercial; este chat no confirma precios ni hora de cita.",
      doneNote:
        "Puedes cerrar esta ventana — tu resumen está listo para el equipo.",
    },
    demo: {
      label: "Prueba la demo",
      placeholder: "Tu correo electrónico",
      button: "Probar demo",
      error: "Introduce un correo válido",
    },
  },
};

const serviceIcons = [Snowflake, Flame, Gauge, Wrench] as const;

const testimonials = [
  {
    quote:
      "Our upstairs was finally comfortable again by dinner. The technician found the issue quickly and took time to show me what he was doing.",
    name: "Marianne R.",
    location: "Decatur, GA",
    initials: "MR",
  },
  {
    quote:
      "No pressure, no mystery invoice — just a thoughtful diagnosis and a clean repair. ComfortAir is now our first call.",
    name: "Daniel K.",
    location: "East Cobb, GA",
    initials: "DK",
  },
  {
    quote:
      "The installation team treated our home like it was their own. Quiet, tidy, and our energy bill noticed the difference.",
    name: "Priya S.",
    location: "Brookhaven, GA",
    initials: "PS",
  },
];

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a
      href="#top"
      data-testid="link-logo"
      className="flex items-center gap-3 group"
    >
      <span
        className={`grid size-10 place-items-center rounded-xl ${light ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]" : "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"} transition-transform group-hover:-rotate-6`}
      >
        <Fan size={21} strokeWidth={2.3} />
      </span>
      <span className="leading-none">
        <span
          className={`block text-[15px] font-bold tracking-[-.04em] ${light ? "text-[hsl(var(--background))]" : "text-[hsl(var(--foreground))]"}`}
        >
          COMFORTAIR
        </span>
        <span
          className={`font-mono-ui text-[9px] tracking-[.21em] ${light ? "text-[hsl(var(--background)/.64)]" : "text-[hsl(var(--muted-foreground))]"}`}
        >
          SOLUTIONS
        </span>
      </span>
    </a>
  );
}

function Button({
  children,
  variant = "primary",
  onClick,
  testId,
  type = "button",
}: {
  children: ReactNode;
  variant?: "primary" | "outline" | "light";
  onClick?: () => void;
  testId: string;
  type?: "button" | "submit";
}) {
  const styles =
    variant === "primary"
      ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(20_87%_51%)]"
      : variant === "light"
        ? "bg-[hsl(var(--background))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))]"
        : "border border-[hsl(var(--border)/.5)] text-[hsl(var(--background))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))]";
  return (
    <button
      type={type}
      onClick={onClick}
      data-testid={testId}
      className={`group inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--primary))] ${styles}`}
    >
      {children}
      <ArrowRight
        size={16}
        className="transition-transform group-hover:translate-x-1"
      />
    </button>
  );
}

function Header({
  onChat,
  language,
  onLanguageChange,
}: {
  onChat: () => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
}) {
  const [open, setOpen] = useState(false);
  const t = translations[language];
  const links = [
    [t.nav.services, "#services"],
    [t.nav.approach, "#why"],
    [t.nav.area, "#area"],
    [t.nav.reviews, "#reviews"],
  ];
  const languageSelector = (
    <div
      className="flex items-center gap-1 text-xs font-bold"
      aria-label={t.languageLabel}
    >
      <button
        type="button"
        onClick={() => onLanguageChange("en")}
        aria-pressed={language === "en"}
        className={
          language === "en"
            ? "text-[hsl(var(--accent))]"
            : "text-[hsl(var(--background)/.55)]"
        }
      >
        EN
      </button>
      <span className="text-[hsl(var(--background)/.35)]">|</span>
      <button
        type="button"
        onClick={() => onLanguageChange("es")}
        aria-pressed={language === "es"}
        className={
          language === "es"
            ? "text-[hsl(var(--accent))]"
            : "text-[hsl(var(--background)/.55)]"
        }
      >
        ES
      </button>
    </div>
  );
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-10">
        <Logo light />
        <nav className="hidden items-center gap-8 md:flex">
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              data-testid={`link-nav-${label.toLowerCase().replace(" ", "-")}`}
              className="text-sm font-semibold text-[hsl(var(--background)/.75)] transition-colors hover:text-[hsl(var(--accent))]"
            >
              {label}
            </a>
          ))}
          {languageSelector}
          <a
            href="tel:4705550124"
            data-testid="link-header-phone"
            className="flex items-center gap-2 border-l border-[hsl(var(--background)/.2)] pl-7 text-sm font-bold text-[hsl(var(--background))]"
          >
            <Phone size={15} /> (470) 555-0124
          </a>
        </nav>
        <button
          onClick={() => setOpen(!open)}
          data-testid="button-mobile-menu"
          className="rounded-lg p-2 text-[hsl(var(--background))] md:hidden"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="mx-4 rounded-2xl border border-[hsl(var(--background)/.15)] bg-[hsl(var(--primary)/.97)] p-4 shadow-xl md:hidden">
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              data-testid={`link-mobile-${label.toLowerCase().replace(" ", "-")}`}
              className="block border-b border-[hsl(var(--background)/.1)] px-3 py-3 text-sm font-bold text-[hsl(var(--background))]"
            >
              {label}
            </a>
          ))}
          <div className="flex items-center justify-between px-3 pt-4 text-[hsl(var(--background))]">
            <span className="text-xs font-bold">{t.languageLabel}</span>
            {languageSelector}
          </div>
          <button
            onClick={() => {
              setOpen(false);
              onChat();
            }}
            data-testid="button-mobile-chat"
            className="mt-3 flex w-full items-center justify-between rounded-xl bg-[hsl(var(--accent))] px-4 py-3 text-sm font-bold text-[hsl(var(--accent-foreground))]"
          >
            {t.headerChat} <MessageCircle size={17} />
          </button>
        </div>
      )}
    </header>
  );
}

function Hero({
  onChat,
  onRequest,
  language,
}: {
  onChat: () => void;
  onRequest: () => void;
  language: Language;
}) {
  const t = translations[language].hero;

  return (
    <section
      id="top"
      className="relative min-h-[760px] overflow-hidden bg-[hsl(var(--primary))] pt-28 text-[hsl(var(--background))]"
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(115deg, hsl(193 62% 25% / .95) 0%, transparent 60%), url("https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=2200&q=85")',
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      />
      <div className="absolute -right-36 top-44 size-[480px] rounded-full border border-[hsl(var(--accent)/.28)] lg:size-[650px]" />
      <div className="absolute -right-20 top-60 size-[320px] rounded-full border border-[hsl(var(--accent)/.2)] lg:size-[500px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 lg:grid-cols-[1fr_410px] lg:px-10 lg:pb-28">
        <div className="max-w-3xl pt-16 lg:pt-24">
          <div className="reveal mb-7 flex items-center gap-3 font-mono-ui text-[10px] font-bold uppercase tracking-[.22em] text-[hsl(var(--accent))]">
            <span className="h-px w-9 bg-[hsl(var(--accent))]" /> {t.eyebrow}
          </div>
          <h1 className="reveal reveal-delay-1 max-w-3xl font-display text-[clamp(4rem,8vw,7.2rem)] leading-[.84] tracking-[-.045em]">
            {t.title1}
            <br />
            <em className="text-[hsl(var(--accent))]">{t.title2}</em>
            <br />
            <span className="text-[hsl(var(--background)/.83)]">
              {t.title3}
            </span>
          </h1>
          <p className="reveal reveal-delay-2 mt-8 max-w-md text-lg leading-relaxed text-[hsl(var(--background)/.75)]">
            {t.subhead}
          </p>
          <div className="reveal reveal-delay-3 mt-9 flex flex-wrap gap-3">
            <Button onClick={onRequest} testId="button-hero-request">
              {t.request}
            </Button>
            <Button
              onClick={onChat}
              variant="outline"
              testId="button-hero-chat"
            >
              {t.chat}
            </Button>
          </div>
          <div className="reveal reveal-delay-3 mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold text-[hsl(var(--background)/.68)]">
            {t.trust.map((item) => (
              <span key={item} className="flex items-center gap-2">
                <CircleCheck size={15} className="text-[hsl(var(--accent))]" />{" "}
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="reveal reveal-delay-2 relative hidden lg:block">
          <div className="float-slow absolute -left-20 top-7 z-10 w-48 rounded-2xl border border-[hsl(var(--background)/.17)] bg-[hsl(var(--background)/.1)] p-4 backdrop-blur-md">
            <div className="mb-3 flex items-center gap-2 text-[hsl(var(--accent))]">
              <ShieldCheck size={18} />
              <span className="font-mono-ui text-[9px] uppercase tracking-wider">
                {t.peaceLabel}
              </span>
            </div>
            <p className="text-sm font-semibold leading-snug">{t.peaceText}</p>
          </div>
          <div className="relative ml-auto w-[350px] rounded-[2.4rem] bg-[hsl(var(--accent))] p-2 shadow-2xl shadow-[hsl(207_38%_8%/.3)]">
            <img
              src="/images/technician.jpg"
              alt={t.imageAlt}
              className="h-[490px] w-full rounded-[2rem] object-cover object-center mix-blend-multiply opacity-75"
            />
            <div className="absolute inset-2 rounded-[2rem] bg-gradient-to-t from-[hsl(var(--primary)/.8)] via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <div className="mb-2 flex gap-1 text-[hsl(var(--accent))]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="font-display text-2xl leading-none">
                {t.quote1}
                <br />
                {t.quote2}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[hsl(var(--background))] to-transparent" />
    </section>
  );
}

function Services({ lang }: { lang: Language }) {
  const [active, setActive] = useState("ac");
  const servicesText = translations[lang].services;
  return (
    <section
      id="services"
      className="bg-[hsl(var(--background))] px-5 py-24 lg:px-10 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 grid gap-5 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div>
            <p className="font-mono-ui text-[10px] font-bold uppercase tracking-[.22em] text-[hsl(var(--accent-foreground))]">
              {servicesText.eyebrow}
            </p>
            <h2 className="mt-4 max-w-xl font-display text-5xl leading-[.9] tracking-tight text-[hsl(var(--foreground))] lg:text-7xl">
              {servicesText.title1}
              <br />
              <em className="text-[hsl(var(--primary))]">
                {servicesText.title2}
              </em>
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-[hsl(var(--muted-foreground))]">
            {servicesText.intro}
          </p>
        </div>
        <div className="grid border-t border-[hsl(var(--border))] lg:grid-cols-4">
          {servicesText.items.map((service, i) => {
            const Icon = serviceIcons[i];
            const isActive = active === service.id;
            return (
              <button
                key={service.id}
                onClick={() => setActive(service.id)}
                data-testid={`button-service-${service.id}`}
                className={`group relative border-b border-[hsl(var(--border))] p-6 text-left transition-colors lg:border-b-0 lg:border-r lg:p-8 ${isActive ? "bg-[hsl(var(--primary))] text-[hsl(var(--background))]" : "hover:bg-[hsl(var(--secondary)/.55)]"} ${i === 0 ? "lg:border-l" : ""}`}
              >
                <div
                  className={`mb-16 flex items-center justify-between ${isActive ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--primary))]"}`}
                >
                  <Icon size={27} strokeWidth={1.6} />
                  <span
                    className={`font-mono-ui text-[10px] ${isActive ? "text-[hsl(var(--background)/.55)]" : "text-[hsl(var(--muted-foreground))]"}`}
                  >
                    0{i + 1}
                  </span>
                </div>
                <h3 className="text-xl font-bold">{service.title}</h3>
                <p
                  className={`mt-3 text-sm leading-relaxed ${isActive ? "text-[hsl(var(--background)/.68)]" : "text-[hsl(var(--muted-foreground))]"}`}
                >
                  {isActive ? service.detail : service.copy}
                </p>
                <span
                  className={`mt-8 flex items-center gap-2 text-xs font-bold ${isActive ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--primary))]"}`}
                >
                  {isActive ? servicesText.selected : servicesText.learn}{" "}
                  <ChevronRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WhyChooseUs({ lang }: { lang: Language }) {
  const why = translations[lang].why;
  return (
    <section
      id="why"
      className="overflow-hidden bg-[hsl(var(--secondary))] px-5 py-24 lg:px-10 lg:py-32"
    >
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <div className="relative">
          <div className="absolute -left-8 -top-8 size-48 rounded-full border border-[hsl(var(--accent)/.5)]" />
          <div className="relative aspect-[.9] overflow-hidden rounded-[2rem] bg-[hsl(var(--primary))]">
            <img
              src="/images/technician.jpg"
              alt="Technician checking air conditioning equipment"
              className="h-full w-full object-cover mix-blend-luminosity opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary)/.5)] to-[hsl(var(--primary)/.1)]" />
            <div className="absolute bottom-7 left-7 rounded-xl border border-[hsl(var(--background)/.2)] bg-[hsl(var(--primary)/.75)] p-4 backdrop-blur-sm">
              <p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[hsl(var(--accent))]">
                Serving Atlanta since
              </p>
              <p className="mt-1 font-display text-4xl text-[hsl(var(--background))]">
                2011
              </p>
            </div>
          </div>
        </div>
        <div>
          <p className="font-mono-ui text-[10px] font-bold uppercase tracking-[.22em] text-[hsl(var(--accent-foreground))]">
            {why.eyebrow}
          </p>
          <h2 className="mt-4 max-w-xl font-display text-5xl leading-[.93] tracking-tight text-[hsl(var(--foreground))] lg:text-7xl">
            {why.title1}
            <br />
            <em className="text-[hsl(var(--primary))]">{why.title2}</em>
          </h2>
          <p className="mt-7 max-w-lg text-base leading-relaxed text-[hsl(var(--muted-foreground))]">
            {why.copy}
          </p>
          <div className="mt-9 grid gap-5 sm:grid-cols-2">
            {why.features.map(([n, title, copy]) => (
              <div
                key={n}
                className="border-t border-[hsl(var(--border))] pt-4"
              >
                <div className="flex gap-4">
                  <span className="font-mono-ui text-[10px] text-[hsl(var(--accent-foreground))]">
                    {n}
                  </span>
                  <div>
                    <h3 className="font-bold text-[hsl(var(--foreground))]">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                      {copy}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Area({ lang }: { lang: Language }) {
  const area = translations[lang].area;
  const cities = [
    "Atlanta",
    "Decatur",
    "Marietta",
    "Roswell",
    "Smyrna",
    "Sandy Springs",
    "Brookhaven",
    "Alpharetta",
    "East Cobb",
    "Dunwoody",
    "Vinings",
    "Tucker",
  ];
  return (
    <section
      id="area"
      className="bg-[hsl(var(--primary))] px-5 py-24 text-[hsl(var(--background))] lg:px-10 lg:py-28"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.85fr_1.15fr]">
        <div>
          <p className="font-mono-ui text-[10px] font-bold uppercase tracking-[.22em] text-[hsl(var(--accent))]">
            {area.eyebrow}
          </p>
          <h2 className="mt-4 font-display text-5xl leading-[.9] lg:text-7xl">
            {area.title1}
            <br />
            <em>{area.title2}</em>
            {"title3" in area && area.title3 ? <> {area.title3}</> : null}
          </h2>
          <p className="mt-7 max-w-md leading-relaxed text-[hsl(var(--background)/.68)]">
            {area.copy}
          </p>
          <a
            href="tel:4705550124"
            data-testid="link-area-phone"
            className="mt-8 inline-flex items-center gap-2 font-bold text-[hsl(var(--accent))] hover:underline"
          >
            <Phone size={17} /> {area.phone}
          </a>
        </div>
        <div className="relative min-h-[300px] overflow-hidden rounded-3xl border border-[hsl(var(--background)/.12)] bg-[hsl(var(--primary)/.45)] p-8">
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(hsl(var(--accent)) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative grid grid-cols-2 gap-x-10 gap-y-5 sm:grid-cols-3">
            {cities.map((city, i) => (
              <div
                key={city}
                className="flex items-center gap-2 border-b border-[hsl(var(--background)/.1)] pb-3 text-sm font-semibold text-[hsl(var(--background)/.78)]"
              >
                <Pin
                  size={13}
                  className={
                    i === 0
                      ? "text-[hsl(var(--accent))]"
                      : "text-[hsl(var(--background)/.45)]"
                  }
                />
                {city}
              </div>
            ))}
          </div>
          <div className="absolute bottom-7 right-7 flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-4 py-2 font-mono-ui text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--accent-foreground))]">
            <span className="size-2 animate-pulse rounded-full bg-[hsl(var(--accent-foreground))]" />{" "}
            {area.live}
          </div>
        </div>
      </div>
    </section>
  );
}

function Reviews({ lang }: { lang: Language }) {
  const [active, setActive] = useState(0);
  const review = testimonials[active];
  const reviewsText = translations[lang].reviews;
  return (
    <section
      id="reviews"
      className="bg-[hsl(var(--background))] px-5 py-24 lg:px-10 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="font-mono-ui text-[10px] font-bold uppercase tracking-[.22em] text-[hsl(var(--accent-foreground))]">
              {reviewsText.eyebrow}
            </p>
            <h2 className="mt-4 font-display text-5xl leading-[.9] text-[hsl(var(--foreground))] lg:text-7xl">
              {reviewsText.title1}
              <br />
              <em className="text-[hsl(var(--primary))]">
                {reviewsText.title2}
              </em>
            </h2>
          </div>
          <div className="flex gap-2">
            {testimonials.map((item, i) => (
              <button
                key={item.name}
                onClick={() => setActive(i)}
                data-testid={`button-review-${i}`}
                className={`size-11 rounded-full border text-xs font-bold transition-colors ${active === i ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--background))]" : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--accent))]"}`}
              >
                0{i + 1}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-14 grid gap-8 border-t border-[hsl(var(--border))] pt-10 lg:grid-cols-[1fr_1.3fr] lg:items-center">
          <div className="flex items-center gap-4">
            <div className="grid size-14 place-items-center rounded-full bg-[hsl(var(--accent))] font-display text-xl text-[hsl(var(--accent-foreground))]">
              {review.initials}
            </div>
            <div>
              <p className="font-bold text-[hsl(var(--foreground))]">
                {review.name}
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {review.location}
              </p>
            </div>
            <div className="ml-4 flex gap-1 text-[hsl(var(--accent))]">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={13} fill="currentColor" />
              ))}
            </div>
          </div>
          <blockquote className="font-display text-4xl leading-[.98] tracking-tight text-[hsl(var(--foreground))] lg:text-6xl">
            “{review.quote}”
          </blockquote>
        </div>
      </div>
    </section>
  );
}

function Contact({ onChat, lang }: { onChat: () => void; lang: Language }) {
  const [sent, setSent] = useState(false);
  const contact = translations[lang].contact;
  return (
    <section
      id="contact"
      className="bg-[hsl(var(--accent))] px-5 py-24 lg:px-10 lg:py-28"
    >
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <p className="font-mono-ui text-[10px] font-bold uppercase tracking-[.22em] text-[hsl(var(--accent-foreground)/.7)]">
            {contact.eyebrow}
          </p>
          <h2 className="mt-4 font-display text-6xl leading-[.87] tracking-tight text-[hsl(var(--accent-foreground))] lg:text-8xl">
            {contact.title1}
            <br />
            {contact.title2}
          </h2>
          <p className="mt-7 max-w-sm text-base leading-relaxed text-[hsl(var(--accent-foreground)/.72)]">
            {contact.copy}
          </p>
          <div className="mt-9 flex flex-col gap-4">
            <a
              href="tel:4705550124"
              data-testid="link-contact-phone"
              className="flex items-center gap-3 text-xl font-bold text-[hsl(var(--accent-foreground))]"
            >
              <Phone size={21} /> {contact.phone}
            </a>
            <span className="flex items-center gap-3 text-sm font-semibold text-[hsl(var(--accent-foreground)/.7)]">
              <Clock3 size={18} /> {contact.hours}
            </span>
          </div>
          <button
            onClick={onChat}
            data-testid="button-contact-chat"
            className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--accent-foreground))] underline decoration-[hsl(var(--accent-foreground)/.35)] underline-offset-4 hover:decoration-[hsl(var(--accent-foreground))]"
          >
            {contact.chat} <MessageCircle size={16} />
          </button>
        </div>
        <div className="rounded-[2rem] bg-[hsl(var(--background))] p-6 shadow-xl lg:p-9">
          {sent ? (
            <div className="flex min-h-[390px] flex-col items-center justify-center text-center">
              <div className="grid size-16 place-items-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                <Check size={28} />
              </div>
              <h3 className="mt-6 font-display text-4xl text-[hsl(var(--foreground))]">
                {contact.successTitle}
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                {contact.successCopy}
              </p>
              <button
                onClick={() => setSent(false)}
                data-testid="button-contact-reset"
                className="mt-7 text-sm font-bold text-[hsl(var(--primary))] underline underline-offset-4"
              >
                {contact.sentAgain}
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <h3 className="font-display text-4xl text-[hsl(var(--foreground))]">
                {contact.formTitle}
              </h3>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                {contact.formCopy}
              </p>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <label className="text-xs font-bold text-[hsl(var(--foreground))]">
                  {contact.nameLabel}
                  <input
                    required
                    data-testid="input-contact-name"
                    className="mt-2 w-full rounded-xl border border-[hsl(var(--border))] bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-[hsl(var(--primary))]"
                    placeholder={lang === "es" ? "Tu nombre" : "Your name"}
                  />
                </label>
                <label className="text-xs font-bold text-[hsl(var(--foreground))]">
                  {contact.phoneLabel}
                  <input
                    required
                    type="tel"
                    data-testid="input-contact-phone"
                    className="mt-2 w-full rounded-xl border border-[hsl(var(--border))] bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-[hsl(var(--primary))]"
                    placeholder="(470) 555-0124"
                  />
                </label>
              </div>
              <label className="mt-5 block text-xs font-bold text-[hsl(var(--foreground))]">
                {contact.helpLabel}
                <textarea
                  required
                  data-testid="input-contact-message"
                  className="mt-2 min-h-28 w-full resize-y rounded-xl border border-[hsl(var(--border))] bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-[hsl(var(--primary))]"
                  placeholder={
                    lang === "es"
                      ? "Cuéntanos qué hace (o no hace) tu sistema..."
                      : "Tell us what your system is doing (or not doing)..."
                  }
                />
              </label>
              <div className="mt-5 flex items-start gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                <input
                  type="checkbox"
                  required
                  data-testid="input-contact-consent"
                  className="mt-0.5 accent-[hsl(var(--primary))]"
                />
                <span>{contact.consentCopy}</span>
              </div>
              <button
                type="submit"
                data-testid="button-contact-submit"
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--background))] transition-transform hover:-translate-y-0.5"
              >
                {contact.submit} <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

type ChatStep = "problem" | "location" | "timing" | "details" | "done";
function extractContactDetails(value: string) {
  const trimmed = value.trim();

  const phoneMatch = trimmed.match(
    /(?:\+?1[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}/,
  );

  const phone = phoneMatch?.[0]?.trim() ?? "";

  let name = phoneMatch ? trimmed.replace(phoneMatch[0], "").trim() : trimmed;

  name = name
    .replace(/^[\s,;:-]+|[\s,;:-]+$/g, "")
    .replace(/^(my name is|i am|i'm|mi nombre es|me llamo)\s+/i, "")
    .replace(
      /\s+(and\s+)?(my\s+)?(phone|phone number|teléfono|telefono|número|numero)\s*(is|es)?\s*$/i,
      "",
    )
    .replace(/[\s,;:-]+$/g, "")
    .trim();

  return { name: name || trimmed, phone };
}

function ChatWidget({
  open,
  onClose,
  lang,
  demoEmail,
}: {
  open: boolean;
  onClose: () => void;
  lang: Language;
  demoEmail?: string;
}) {
  const [step, setStep] = useState<ChatStep>("problem");
  const [lead, setLead] = useState({
    problem: "",
    location: "",
    timing: "",
    name: "",
    phone: "",
  });
  const [processing, setProcessing] = useState(false);
  const processingRef = useRef(false);
  const lastResponseRef = useRef<{ key: string; at: number } | null>(null);
  const submittedLeadKey = useRef<string | null>(null);
  const [draft, setDraft] = useState("");
  const chat = translations[lang].chat;
  const [messages, setMessages] = useState<
    Array<{ from: "bot" | "user"; text: string }>
  >([{ from: "bot", text: chat.greeting }]);

    useEffect(() => {
      if (step === "problem") {
        setMessages([{ from: "bot", text: chat.greeting }]);
      }
    }, [chat.greeting, step]);

  const prompts = useMemo(
    () => ({
      problem: chat.promptProblem,
      location: chat.promptLocation,
      timing: chat.promptTiming,
      details: chat.promptDetails,
    }),
    [chat],
  );
  useEffect(() => {
    if (open)
      setTimeout(() => document.getElementById("chat-input")?.focus(), 100);
  }, [open]);
  if (!open) return null;

  const submitFinalizedLead = (finalizedLead: {
    name: string;
    phone: string;
    issue: string;
    location: string;
    timing: string;
    language: Language;
    demoEmail?: string;
  }) => {
    const leadKey = JSON.stringify(finalizedLead);
    if (submittedLeadKey.current === leadKey) return;
    submittedLeadKey.current = leadKey;
    console.log("Submitting ComfortAir lead");
    void fetch("https://local-lead-forge-demo-mailer.localleadforgeagency.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalizedLead),
    })
      .then((response) => {
        if (!response.ok)
          throw new Error(
            `Lead submission failed with status ${response.status}`,
          );
        console.log("ComfortAir lead submission successful");
      })
      .catch((error) => {
        console.error("ComfortAir lead submission failed", error);
      });
  };

  const handleUserResponse = (
    rawValue: string,
    event: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    const value = rawValue.trim();
    if (!value || processingRef.current || step === "done") return;

    const current = step;
    const responseKey = `${current}:${value}`;
    const now = Date.now();
    if (
      lastResponseRef.current?.key === responseKey &&
      now - lastResponseRef.current.at < 1000
    )
      return;
    processingRef.current = true;
    lastResponseRef.current = { key: responseKey, at: now };
    setProcessing(true);
    setMessages((m) => [...m, { from: "user", text: value.trim() }]);
    setDraft("");

    if (current === "problem") {
      setLead((l) => ({ ...l, problem: value }));
      setStep("location");
      setMessages((m) => [...m, { from: "bot", text: prompts.location }]);
    }
    if (current === "location") {
      setLead((l) => ({ ...l, location: value }));
      setStep("timing");
      setMessages((m) => [...m, { from: "bot", text: prompts.timing }]);
    }
    if (current === "timing") {
      setLead((l) => ({ ...l, timing: value }));
      setStep("details");
      setMessages((m) => [...m, { from: "bot", text: prompts.details }]);
    }
    if (current === "details") {
      const { name, phone } = extractContactDetails(value);
      const finalizedLead = {
        name,
        phone,
        issue: lead.problem,
        location: lead.location,
        timing: lead.timing,
        language: lang,
      };
      setLead((l) => ({ ...l, name, phone }));
      setStep("done");
      const summary = chat.finalSummary
        .replace("{name}", name)
        .replace(
          "{issue}",
          lead.problem || (lang === "es" ? "servicio HVAC" : "HVAC service"),
        )
        .replace(
          "{location}",
          lead.location || (lang === "es" ? "tu área" : "your area"),
        )
        .replace("{timing}", lead.timing || (lang === "es" ? "pronto" : "soon"))
        .replace(
          "{phone}",
          phone || (lang === "es" ? "No proporcionado" : "Not provided"),
        );
      setMessages((m) => [...m, { from: "bot", text: summary }]);
      const payload =
        demoEmail && demoEmail.trim()
          ? { ...finalizedLead, demoEmail: demoEmail.trim() }
          : finalizedLead;
      if (Object.values(finalizedLead).every(Boolean))
        submitFinalizedLead(payload);

      processingRef.current = false;
      setProcessing(false);
    }

    if (current !== "details") {
      window.setTimeout(() => {
        processingRef.current = false;
        setProcessing(false);
      }, 350);
    }
  };
  const quick =
    step === "problem"
      ? chat.quickProblem
      : step === "timing"
        ? chat.quickTiming
        : [];
  return (
    <div
      className="fixed bottom-5 right-5 z-40 w-[min(calc(100vw-2rem),390px)] overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-2xl shadow-[hsl(207_38%_16%/.22)]"
      data-testid="widget-chat"
    >
      <div className="flex items-center justify-between bg-[hsl(var(--primary))] px-5 py-4 text-[hsl(var(--background))]">
        <div className="flex items-center gap-3">
          <div className="relative grid size-10 place-items-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]">
            <Sparkles size={18} />
            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-[hsl(var(--primary))] bg-emerald-400" />
          </div>
          <div>
            <p className="font-bold">{chat.assistantTitle}</p>
            <p className="font-mono-ui text-[9px] uppercase tracking-wider text-[hsl(var(--background)/.55)]">
              {chat.assistantSubtitle}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          data-testid="button-chat-close"
          className="rounded-full p-1.5 text-[hsl(var(--background)/.65)] hover:bg-[hsl(var(--background)/.12)] hover:text-[hsl(var(--background))]"
        >
          <X size={18} />
        </button>
      </div>
      <div className="max-h-[340px] min-h-[250px] space-y-3 overflow-y-auto p-4">
        {messages.map((message, i) => (
          <div
            key={`${message.text}-${i}`}
            data-testid={`chat-message-${i}`}
            className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${message.from === "user" ? "ml-auto rounded-br-sm bg-[hsl(var(--primary))] text-[hsl(var(--background))]" : "rounded-bl-sm bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]"}`}
          >
            {message.text}
          </div>
        ))}
        {step !== "done" && quick.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {quick.map((item) => (
              <button
                type="button"
                key={item}
                onClick={(event) => handleUserResponse(item, event)}
                disabled={processing}
                data-testid={`button-chat-quick-${item.toLowerCase().replaceAll(" ", "-")}`}
                className="rounded-full border border-[hsl(var(--primary)/.35)] px-3 py-1.5 text-xs font-bold text-[hsl(var(--primary))] transition-colors hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--background))]"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>
      {step !== "done" ? (
        <form
          onSubmit={(event) => handleUserResponse(draft, event)}
          className="flex gap-2 border-t border-[hsl(var(--border))] p-3"
        >
          <input
            id="chat-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={processing}
            data-testid="input-chat-message"
            className="min-w-0 flex-1 rounded-xl border border-[hsl(var(--border))] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))]"
            placeholder={
              step === "details"
                ? chat.placeholderDetails
                : chat.placeholderAnswer
            }
          />
          <button
            type="submit"
            disabled={processing}
            data-testid="button-chat-send"
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(20_87%_51%)]"
          >
            <Send size={16} />
          </button>
        </form>
      ) : (
        <div className="border-t border-[hsl(var(--border))] px-4 py-3 text-center text-xs text-[hsl(var(--muted-foreground))]">
          {chat.doneNote}
        </div>
      )}
    </div>
  );
}

function Footer({ lang }: { lang: Language }) {
  const footer = translations[lang].footer;
  return (
    <footer className="bg-[hsl(var(--primary))] px-5 pb-8 pt-16 text-[hsl(var(--background))] lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-[hsl(var(--background)/.14)] pb-14 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-[hsl(var(--background)/.6)]">
              {footer.description}
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://www.instagram.com"
                data-testid="link-instagram"
                aria-label="Instagram"
                className="rounded-full border border-[hsl(var(--background)/.18)] p-2.5 hover:border-[hsl(var(--accent))]"
              >
                <Instagram size={15} />
              </a>
              <a
                href="https://www.facebook.com"
                data-testid="link-facebook"
                aria-label="Facebook"
                className="rounded-full border border-[hsl(var(--background)/.18)] p-2.5 hover:border-[hsl(var(--accent))]"
              >
                <Facebook size={15} />
              </a>
            </div>
          </div>
          <div>
            <p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent))]">
              {footer.explore}
            </p>
            <div className="mt-5 flex flex-col gap-3 text-sm text-[hsl(var(--background)/.67)]">
              {footer.exploreLinks.map((link, index) => (
                <a
                  key={link}
                  href={
                    index === 0
                      ? "#services"
                      : index === 1
                        ? "#why"
                        : "#reviews"
                  }
                  data-testid={`link-footer-${index}`}
                  className="hover:text-[hsl(var(--accent))]"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent))]">
              {footer.serviceArea}
            </p>
            <div className="mt-5 flex flex-col gap-3 text-sm text-[hsl(var(--background)/.67)]">
              {footer.serviceAreaItems.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent))]">
              {footer.talk}
            </p>
            <a
              href="tel:4705550124"
              data-testid="link-footer-phone"
              className="mt-5 block text-lg font-bold hover:text-[hsl(var(--accent))]"
            >
              {footer.phone}
            </a>
            <p className="mt-2 text-sm text-[hsl(var(--background)/.6)]">
              {footer.hours}
            </p>
            <p className="mt-5 flex items-center gap-2 text-xs text-[hsl(var(--background)/.6)]">
              <ShieldCheck size={15} className="text-[hsl(var(--accent))]" />{" "}
              {footer.licensed}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-4 pt-7 font-mono-ui text-[9px] uppercase tracking-wider text-[hsl(var(--background)/.4)]">
          <span>{footer.copyright}</span>
          <span>{footer.tagline}</span>
        </div>
      </div>
    </footer>
  );
}

function Home() {
  const [chatOpen, setChatOpen] = useState(false);
  const [lang, setLang] = useState<Language>("en");
  const [demoEmail, setDemoEmail] = useState<string>("");
  const [demoExpanded, setDemoExpanded] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);
  const request = () =>
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });

  const startDemo = () => {
    const re = /^\S+@\S+\.\S+$/;
    if (!re.test(demoEmail.trim())) {
      setDemoError(
        translations[lang].demo?.error ??
          (lang === "es"
            ? "Introduce un correo válido"
            : "Please enter a valid email"),
      );
      return;
    }
    setDemoError(null);
    setDemoExpanded(false);
    setChatOpen(true);
  };

  return (
    <div className="noise min-h-[100dvh] bg-[hsl(var(--background))]">
      <Header
        onChat={() => setChatOpen(true)}
        language={lang}
        onLanguageChange={setLang}
      />
      <main>
        <Hero
          onChat={() => setChatOpen(true)}
          onRequest={request}
          language={lang}
        />
        <Services lang={lang} />
        <WhyChooseUs lang={lang} />
        <Area lang={lang} />
        <Reviews lang={lang} />
        <Contact onChat={() => setChatOpen(true)} lang={lang} />
      </main>
      <Footer lang={lang} />

      <div
        className={`fixed bottom-5 right-24 z-30 flex items-center gap-2 ${
          demoExpanded ? "left-5" : ""
        } sm:bottom-20 sm:right-5 sm:left-auto`}
      >
        <input
          value={demoEmail}
          onChange={(e) => setDemoEmail(e.target.value)}
          placeholder={translations[lang].demo.placeholder}
          data-testid="input-demo-email"
          className={`${demoExpanded ? "block" : "hidden"} min-w-0 flex-1 rounded-full px-3 py-2 text-sm shadow-sm sm:block sm:flex-none`}
        />
        <button
          onClick={() => {
            const isMobile = window.matchMedia("(max-width: 639px)").matches;
            if (isMobile && !demoExpanded) {
              setDemoExpanded(true);
              return;
            }
            startDemo();
          }}
          data-testid="button-demo-start"
          className="shrink-0 rounded-full bg-[hsl(var(--accent))] px-4 py-2 text-sm font-bold text-[hsl(var(--accent-foreground))]"
        >
          {translations[lang].demo.button}
        </button>
      </div>
      {demoError && (
        <div className="fixed bottom-32 left-5 right-5 z-40 text-center text-xs text-red-500 sm:bottom-16 sm:left-auto sm:right-5 sm:text-left">
          {demoError}
        </div>
      )}

      <button
        onClick={() => setChatOpen(true)}
        data-testid="button-chat-open"
        aria-label={translations[lang].headerChat}
        className={`fixed bottom-5 right-5 z-30 flex items-center gap-3 rounded-full bg-[hsl(var(--accent))] px-4 py-3 font-bold text-[hsl(var(--accent-foreground))] shadow-xl shadow-[hsl(20_87%_30%/.2)] transition-all hover:-translate-y-1 ${chatOpen ? "pointer-events-none scale-0 opacity-0" : "scale-100 opacity-100"}`}
      >
        <span className="grid size-8 place-items-center rounded-full bg-[hsl(var(--accent-foreground)/.12)]">
          <MessageCircle size={18} />
        </span>
        <span className="hidden text-sm sm:block">
          {translations[lang].headerChat}
        </span>
      </button>

      <ChatWidget
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        lang={lang}
        demoEmail={demoEmail}
      />
    </div>
  );
}
function Router() {
  return (
    <ErrorBoundary resetKey={useLocation()[0]}>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
export default App;
