import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Globe2,
  Languages,
  MailCheck,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRoundCheck,
  Wrench,
} from "lucide-react";

type FormData = {
  legalBusinessName: string;
  dbaName: string;
  businessAddress: string;
  authorizedContactName: string;
  authorizedContactTitle: string;
  authorizedContactEmail: string;
  authorizedContactPhone: string;
  websiteUrl: string;
  professionalLicense: string;
  socialProfiles: string;
  brandColors: string;
  brandMessage: string;
  approvedReviews: string;
  brandUseAuthorized: boolean;
  servicesOffered: string;
  servicesNotOffered: string;
  equipmentBrands: string;
  customerType: string;
  areasServed: string;
  businessHours: string;
  afterHoursProtocol: string;
  emergencyService: string;
  promotions: string;
  financing: string;
  assistantLanguage: "en" | "en-es";
  minimumLeadInfo: string;
  priorityJobs: string;
  unwantedJobs: string;
  urgencyDefinition: string;
  forbiddenQuestions: string;
  forbiddenClaims: string;
  pricingPermission: string;
  arrivalTimePermission: string;
  schedulingPermission: string;
  leadDeliveryEmail: string;
  backupLeadEmail: string;
  crmDestination: string;
  leadReviewHours: string;
  followupOwner: string;
  requiredLeadData: string;
  sensitiveDataRestrictions: string;
  retentionPreference: string;
  privacyContact: string;
  websitePlatform: string;
  websiteAdminContact: string;
  dnsHostingController: string;
  installationCoordination: string;
  accuracyConfirmed: boolean;
  configurationAuthorized: boolean;
};

const STORAGE_KEY = "llf-client-onboarding-v2";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlPattern = /^https?:\/\/.+/i;

const emptyForm: FormData = {
  legalBusinessName: "",
  dbaName: "",
  businessAddress: "",
  authorizedContactName: "",
  authorizedContactTitle: "",
  authorizedContactEmail: "",
  authorizedContactPhone: "",
  websiteUrl: "",
  professionalLicense: "",
  socialProfiles: "",
  brandColors: "",
  brandMessage: "",
  approvedReviews: "",
  brandUseAuthorized: false,
  servicesOffered: "",
  servicesNotOffered: "",
  equipmentBrands: "",
  customerType: "",
  areasServed: "",
  businessHours: "",
  afterHoursProtocol: "",
  emergencyService: "",
  promotions: "",
  financing: "",
  assistantLanguage: "en-es",
  minimumLeadInfo: "Name, phone, service needed, city/ZIP, urgency",
  priorityJobs: "",
  unwantedJobs: "",
  urgencyDefinition: "",
  forbiddenQuestions: "",
  forbiddenClaims: "Do not invent prices, guarantees, appointment confirmations, arrival times, licenses, promotions or services.",
  pricingPermission: "No — do not quote or estimate prices unless separately approved.",
  arrivalTimePermission: "No — do not promise arrival times without real-time data.",
  schedulingPermission: "No — do not confirm appointments without a live scheduling integration.",
  leadDeliveryEmail: "",
  backupLeadEmail: "",
  crmDestination: "",
  leadReviewHours: "",
  followupOwner: "",
  requiredLeadData: "",
  sensitiveDataRestrictions: "Do not collect passwords, API keys, Social Security numbers, payment-card data or unnecessary sensitive information.",
  retentionPreference: "",
  privacyContact: "",
  websitePlatform: "",
  websiteAdminContact: "",
  dnsHostingController: "",
  installationCoordination: "",
  accuracyConfirmed: false,
  configurationAuthorized: false,
};

const steps = [
  { title: "Welcome", short: "Welcome", icon: Sparkles },
  { title: "Business & brand", short: "Business", icon: Building2 },
  { title: "Operations", short: "Operations", icon: Wrench },
  { title: "Lead delivery", short: "Leads", icon: MailCheck },
  { title: "Website & access", short: "Website", icon: Globe2 },
  { title: "Assistant guardrails", short: "Assistant", icon: Languages },
  { title: "Review & authorize", short: "Review", icon: ClipboardCheck },
] as const;

function Logo() {
  return (
    <a href="/" className="flex items-center gap-3" aria-label="Local Lead Forge home">
      <div className="relative grid h-11 w-11 place-items-center rounded-xl border border-orange-500/45 bg-[#0a1423] shadow-[0_0_28px_rgba(255,106,0,0.16)]">
        <div className="absolute inset-[5px] rounded-lg border border-orange-500/25" />
        <span className="relative text-[13px] font-black tracking-[-0.08em] text-orange-500">LLF</span>
      </div>
      <div className="leading-none">
        <div className="text-[12px] font-extrabold tracking-[0.19em] text-white">LOCAL LEAD</div>
        <div className="mt-1 text-[12px] font-extrabold tracking-[0.26em] text-orange-500">FORGE</div>
      </div>
    </a>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", required = false, hint }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; required?: boolean; hint?: string }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-200">{label}{required && <span className="text-orange-400">*</span>}</span>
      {hint && <span className="mt-1 block text-[9px] leading-4 text-slate-600">{hint}</span>}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-white/[0.09] bg-[#050d18] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-orange-500/55 focus:ring-2 focus:ring-orange-500/10" />
    </label>
  );
}

function TextAreaField({ label, value, onChange, placeholder, required = false, hint }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean; hint?: string }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-200">{label}{required && <span className="text-orange-400">*</span>}</span>
      {hint && <span className="mt-1 block text-[9px] leading-4 text-slate-600">{hint}</span>}
      <textarea rows={4} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 w-full resize-y rounded-xl border border-white/[0.09] bg-[#050d18] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-700 focus:border-orange-500/55 focus:ring-2 focus:ring-orange-500/10" />
    </label>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/[0.07] bg-black/20 p-4"><div className="text-[9px] font-black uppercase tracking-[.15em] text-slate-600">{label}</div><div className="mt-2 whitespace-pre-wrap text-[12px] leading-5 text-slate-200">{value || "Not provided"}</div></div>;
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loaded, setLoaded] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setForm({ ...emptyForm, ...JSON.parse(stored) });
    } catch {
      // Ignore malformed/unavailable local storage.
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded || submitState === "success") return;
    const timeout = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
        setSavedAt(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
      } catch {
        // Form remains usable when storage is unavailable.
      }
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [form, loaded, submitState]);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSubmitState("idle");
    setSubmitMessage("");
  };

  const clearSavedProgress = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setForm(emptyForm);
    setStep(0);
    setSavedAt(null);
    setSubmitState("idle");
    setSubmitMessage("");
  };

  const stepValid = useMemo(() => {
    switch (step) {
      case 0: return true;
      case 1: return Boolean(form.legalBusinessName.trim() && form.businessAddress.trim() && form.authorizedContactName.trim() && form.authorizedContactTitle.trim() && emailPattern.test(form.authorizedContactEmail.trim()) && form.authorizedContactPhone.trim() && urlPattern.test(form.websiteUrl.trim()) && form.brandUseAuthorized);
      case 2: return Boolean(form.servicesOffered.trim() && form.servicesNotOffered.trim() && form.customerType.trim() && form.areasServed.trim() && form.businessHours.trim() && form.afterHoursProtocol.trim() && form.emergencyService.trim());
      case 3: return Boolean(emailPattern.test(form.leadDeliveryEmail.trim()) && form.leadReviewHours.trim() && form.followupOwner.trim() && form.requiredLeadData.trim() && form.privacyContact.trim());
      case 4: return Boolean(form.websitePlatform.trim() && form.websiteAdminContact.trim() && form.dnsHostingController.trim() && form.installationCoordination.trim());
      case 5: return Boolean(form.minimumLeadInfo.trim() && form.priorityJobs.trim() && form.unwantedJobs.trim() && form.urgencyDefinition.trim() && form.forbiddenClaims.trim() && form.pricingPermission.trim() && form.arrivalTimePermission.trim() && form.schedulingPermission.trim());
      case 6: return form.accuracyConfirmed && form.configurationAuthorized;
      default: return false;
    }
  }, [form, step]);

  const goNext = () => {
    if (!stepValid) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep((current) => Math.max(current - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    if (!stepValid || submitState === "sending") return;
    const endpoint = import.meta.env.VITE_ONBOARDING_ENDPOINT as string | undefined;
    if (!endpoint) {
      setSubmitState("error");
      setSubmitMessage("Secure submission is not enabled on this preview yet. Your progress remains saved on this device.");
      return;
    }
    setSubmitState("sending");
    setSubmitMessage("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, source: "localleadforge.com/onboarding", schemaVersion: 2, submittedAt: new Date().toISOString() }),
      });
      if (!response.ok) throw new Error(`Submission failed with ${response.status}`);
      setSubmitState("success");
      setSubmitMessage("Thank you. Your onboarding details were submitted successfully. Local Lead Forge will review the business facts before implementation begins.");
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      setSubmitState("error");
      setSubmitMessage("We could not submit the form right now. Your progress is still saved on this device, so nothing was lost.");
    }
  };

  const activeStep = steps[step];
  const progress = Math.round((step / (steps.length - 1)) * 100);

  return (
    <main className="min-h-screen overflow-hidden bg-[#020813] text-white selection:bg-orange-500/30">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(255,106,0,.08),transparent_30%),radial-gradient(circle_at_85%_25%,rgba(34,94,255,.07),transparent_32%)]" />
      <header className="relative border-b border-white/[0.06] bg-[#030a14]/90 backdrop-blur-xl"><div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 sm:px-8"><Logo /><div className="hidden items-center gap-2 text-[10px] font-semibold text-slate-500 sm:flex"><ShieldCheck className="h-4 w-4 text-orange-500" />Secure client onboarding</div></div></header>

      <div className="relative mx-auto grid max-w-[1240px] gap-7 px-5 py-8 sm:px-8 lg:grid-cols-[270px_1fr] lg:py-12">
        <aside className="lg:sticky lg:top-8 lg:h-fit">
          <div className="rounded-2xl border border-white/[0.08] bg-[#06101d]/90 p-4 shadow-2xl shadow-black/20">
            <div className="mb-4 flex items-center justify-between text-[9px] font-black uppercase tracking-[.15em] text-slate-600"><span>Onboarding progress</span><span className="text-orange-400">{progress}%</span></div>
            <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-orange-500 transition-all duration-300" style={{ width: `${progress}%` }} /></div>
            <div className="grid grid-cols-4 gap-2 lg:grid-cols-1">
              {steps.map(({ short, icon: Icon }, index) => {
                const active = index === step;
                const done = index < step;
                return <button type="button" key={short} onClick={() => index <= step && setStep(index)} className={`flex min-w-0 items-center gap-2 rounded-xl border px-3 py-3 text-left transition ${active ? "border-orange-500/35 bg-orange-500/[0.08] text-white" : done ? "border-emerald-500/15 bg-emerald-500/[0.035] text-slate-300" : "cursor-default border-transparent text-slate-700"}`}><div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${active ? "bg-orange-500 text-white" : done ? "bg-emerald-500/10 text-emerald-400" : "bg-white/[0.025]"}`}>{done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}</div><span className="hidden truncate text-[10px] font-bold lg:block">{short}</span></button>;
              })}
            </div>
            <div className="mt-5 border-t border-white/[0.06] pt-4 text-[9px] leading-5 text-slate-600">Progress is saved only in this browser until successful submission.{savedAt && <div className="mt-1 flex items-center gap-1.5 text-slate-500"><Save className="h-3 w-3" /> Saved {savedAt}</div>}<button type="button" onClick={clearSavedProgress} className="mt-3 inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-300"><Trash2 className="h-3 w-3" /> Clear saved progress</button></div>
          </div>
        </aside>

        <section>
          <div className="rounded-3xl border border-white/[0.08] bg-[#06101d]/92 shadow-[0_30px_90px_rgba(0,0,0,.36)]">
            <div className="border-b border-white/[0.06] px-6 py-6 sm:px-9 sm:py-8"><div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.18em] text-orange-400"><activeStep.icon className="h-4 w-4" />Step {step + 1} of {steps.length}</div><h1 className="mt-3 text-3xl font-black tracking-[-.035em] text-white sm:text-[42px]">{activeStep.title}</h1></div>
            <div className="px-6 py-7 sm:px-9 sm:py-9">
              {step === 0 && <div><div className="max-w-[780px]"><div className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/[0.06] px-3 py-1.5 text-[9px] font-black uppercase tracking-[.16em] text-orange-400"><BadgeCheck className="h-3.5 w-3.5" /> Welcome to Local Lead Forge</div><h2 className="mt-5 max-w-[700px] text-3xl font-black tracking-[-.035em] text-white sm:text-[46px] sm:leading-[1.04]">Your setup is officially underway.</h2><p className="mt-5 max-w-[720px] text-[13px] leading-7 text-slate-400">The next step is a short business intake so we can configure your site experience, AI assistant, lead qualification and lead delivery around how your company actually operates. Once we have the required information, we’ll build and test the system before activation. We’ll only ask you to review business facts that require your approval.</p></div><div className="mt-8 grid gap-3 sm:grid-cols-3">{[[UserRoundCheck,"Verified facts","We configure from approved business information."],[MailCheck,"Lead routing","You choose exactly where qualified leads go."],[ShieldCheck,"Safe access","Never submit passwords, API keys or unnecessary sensitive data."]].map(([Icon,title,copy]) => { const I = Icon as typeof UserRoundCheck; return <div key={String(title)} className="rounded-2xl border border-white/[0.075] bg-black/20 p-5"><I className="h-5 w-5 text-orange-500" /><div className="mt-4 text-[12px] font-extrabold text-white">{String(title)}</div><div className="mt-2 text-[10px] leading-5 text-slate-600">{String(copy)}</div></div>; })}</div></div>}

              {step === 1 && <div className="space-y-7"><div className="grid gap-5 sm:grid-cols-2"><Field required label="Legal business name" value={form.legalBusinessName} onChange={(v)=>update("legalBusinessName",v)} /><Field label="DBA / public business name" value={form.dbaName} onChange={(v)=>update("dbaName",v)} /><Field required label="Business address" value={form.businessAddress} onChange={(v)=>update("businessAddress",v)} /><Field required label="Authorized contact name" value={form.authorizedContactName} onChange={(v)=>update("authorizedContactName",v)} /><Field required label="Authorized contact title" value={form.authorizedContactTitle} onChange={(v)=>update("authorizedContactTitle",v)} placeholder="Owner, GM, Marketing Director…" /><Field required type="email" label="Authorized contact email" value={form.authorizedContactEmail} onChange={(v)=>update("authorizedContactEmail",v)} /><Field required type="tel" label="Authorized contact phone" value={form.authorizedContactPhone} onChange={(v)=>update("authorizedContactPhone",v)} /><Field required type="url" label="Website URL" value={form.websiteUrl} onChange={(v)=>update("websiteUrl",v)} placeholder="https://example.com" /><Field label="Professional license number (optional)" value={form.professionalLicense} onChange={(v)=>update("professionalLicense",v)} hint="Only enter it if you want it displayed and confirm it is valid." /><Field label="Brand colors" value={form.brandColors} onChange={(v)=>update("brandColors",v)} /><TextAreaField label="Social profiles" value={form.socialProfiles} onChange={(v)=>update("socialProfiles",v)} /><TextAreaField label="Approved slogan / key messages" value={form.brandMessage} onChange={(v)=>update("brandMessage",v)} /><TextAreaField label="Approved testimonials / reviews" value={form.approvedReviews} onChange={(v)=>update("approvedReviews",v)} hint="Only include reviews you have the right to use." /></div><label className="flex gap-3 rounded-2xl border border-white/[0.075] bg-black/20 p-5"><input type="checkbox" checked={form.brandUseAuthorized} onChange={(e)=>update("brandUseAuthorized",e.target.checked)} className="mt-1 h-4 w-4 accent-orange-500" /><span><span className="block text-[11px] font-extrabold text-white">I authorize Local Lead Forge to use the logo, brand assets and approved materials I provide.</span><span className="mt-1 block text-[9px] leading-5 text-slate-600">Do not upload or provide materials you do not have permission to use.</span></span></label></div>}

              {step === 2 && <div className="grid gap-5 sm:grid-cols-2"><TextAreaField required label="Services offered" value={form.servicesOffered} onChange={(v)=>update("servicesOffered",v)} /><TextAreaField required label="Services NOT offered" value={form.servicesNotOffered} onChange={(v)=>update("servicesNotOffered",v)} /><Field label="Equipment / brands serviced" value={form.equipmentBrands} onChange={(v)=>update("equipmentBrands",v)} /><Field required label="Customer type" value={form.customerType} onChange={(v)=>update("customerType",v)} placeholder="Residential, commercial, or both" /><TextAreaField required label="Cities / ZIP codes / service areas" value={form.areasServed} onChange={(v)=>update("areasServed",v)} /><Field required label="Normal business hours" value={form.businessHours} onChange={(v)=>update("businessHours",v)} /><TextAreaField required label="After-hours protocol" value={form.afterHoursProtocol} onChange={(v)=>update("afterHoursProtocol",v)} /><TextAreaField required label="Emergency service — exact wording" value={form.emergencyService} onChange={(v)=>update("emergencyService",v)} /><TextAreaField label="Current promotions + expiration dates" value={form.promotions} onChange={(v)=>update("promotions",v)} /><TextAreaField label="Verified financing options" value={form.financing} onChange={(v)=>update("financing",v)} /></div>}

              {step === 3 && <div className="space-y-6"><div className="grid gap-5 sm:grid-cols-2"><Field required type="email" label="Primary lead-delivery email" value={form.leadDeliveryEmail} onChange={(v)=>update("leadDeliveryEmail",v)} /><Field type="email" label="Backup lead-delivery email" value={form.backupLeadEmail} onChange={(v)=>update("backupLeadEmail",v)} /><Field label="CRM / external destination (if contracted)" value={form.crmDestination} onChange={(v)=>update("crmDestination",v)} /><Field required label="Hours your team reviews leads" value={form.leadReviewHours} onChange={(v)=>update("leadReviewHours",v)} /><Field required label="Person responsible for lead follow-up" value={form.followupOwner} onChange={(v)=>update("followupOwner",v)} /><Field required label="Privacy / incident contact" value={form.privacyContact} onChange={(v)=>update("privacyContact",v)} /><TextAreaField required label="Lead data your team actually needs" value={form.requiredLeadData} onChange={(v)=>update("requiredLeadData",v)} /><TextAreaField label="Sensitive data that must NOT be collected" value={form.sensitiveDataRestrictions} onChange={(v)=>update("sensitiveDataRestrictions",v)} /><Field label="Retention preference (if applicable)" value={form.retentionPreference} onChange={(v)=>update("retentionPreference",v)} /></div><div className="rounded-2xl border border-orange-500/20 bg-orange-500/[0.035] p-5 text-[10px] leading-5 text-slate-400">SMS routing is not enabled from this form. It requires separate consent and approved configuration before activation.</div></div>}

              {step === 4 && <div className="grid gap-5 sm:grid-cols-2"><Field required label="Website platform" value={form.websitePlatform} onChange={(v)=>update("websitePlatform",v)} placeholder="WordPress, Wix, Squarespace, GoDaddy, not sure…" /><Field required label="Website administrator / contact" value={form.websiteAdminContact} onChange={(v)=>update("websiteAdminContact",v)} /><Field required label="Who controls DNS / hosting?" value={form.dnsHostingController} onChange={(v)=>update("dnsHostingController",v)} /><TextAreaField required label="Preferred installation coordination" value={form.installationCoordination} onChange={(v)=>update("installationCoordination",v)} hint="Do not enter passwords, secrets or API keys. LLF prefers delegated or temporary access with minimum required permissions." /><div className="sm:col-span-2 rounded-2xl border border-white/[0.075] bg-black/20 p-5 text-[10px] leading-6 text-slate-400"><strong className="text-white">Access policy:</strong> Local Lead Forge prefers delegated access and only the permissions needed for implementation. You keep control and can revoke access when it is no longer required.</div></div>}

              {step === 5 && <div className="space-y-6"><div><div className="text-[11px] font-bold text-slate-200">Assistant language <span className="text-orange-400">*</span></div><div className="mt-3 grid gap-3 sm:grid-cols-2">{[["en","English only"],["en-es","English + Spanish"]].map(([value,title])=>{const selected=form.assistantLanguage===value; return <button key={value} type="button" onClick={()=>update("assistantLanguage",value as FormData["assistantLanguage"])} className={`rounded-2xl border p-5 text-left ${selected?"border-orange-500/45 bg-orange-500/[0.07]":"border-white/[0.075] bg-black/20"}`}><div className="flex items-center justify-between"><span className="text-[12px] font-extrabold text-white">{title}</span>{selected&&<CheckCircle2 className="h-5 w-5 text-orange-500" />}</div></button>;})}</div></div><div className="grid gap-5 sm:grid-cols-2"><TextAreaField required label="Minimum information before follow-up" value={form.minimumLeadInfo} onChange={(v)=>update("minimumLeadInfo",v)} /><TextAreaField required label="Jobs / lead types to prioritize" value={form.priorityJobs} onChange={(v)=>update("priorityJobs",v)} /><TextAreaField required label="Jobs / lead types you do NOT want" value={form.unwantedJobs} onChange={(v)=>update("unwantedJobs",v)} /><TextAreaField required label="What counts as urgent?" value={form.urgencyDefinition} onChange={(v)=>update("urgencyDefinition",v)} /><TextAreaField label="Questions the assistant must not ask" value={form.forbiddenQuestions} onChange={(v)=>update("forbiddenQuestions",v)} /><TextAreaField required label="Claims the assistant must never make" value={form.forbiddenClaims} onChange={(v)=>update("forbiddenClaims",v)} /><TextAreaField required label="Pricing permission" value={form.pricingPermission} onChange={(v)=>update("pricingPermission",v)} /><TextAreaField required label="Arrival-time permission" value={form.arrivalTimePermission} onChange={(v)=>update("arrivalTimePermission",v)} /><TextAreaField required label="Scheduling permission" value={form.schedulingPermission} onChange={(v)=>update("schedulingPermission",v)} /></div></div>}

              {step === 6 && <div><div className="grid gap-3 sm:grid-cols-2"><ReviewItem label="Authorized business" value={`${form.legalBusinessName}${form.dbaName ? `\nDBA: ${form.dbaName}` : ""}\n${form.businessAddress}\n${form.authorizedContactName} — ${form.authorizedContactTitle}\n${form.authorizedContactEmail}\n${form.authorizedContactPhone}\n${form.websiteUrl}`} /><ReviewItem label="Operations" value={`Services: ${form.servicesOffered}\nNot offered: ${form.servicesNotOffered}\nAreas: ${form.areasServed}\nHours: ${form.businessHours}\nEmergency: ${form.emergencyService}`} /><ReviewItem label="Lead delivery" value={`${form.leadDeliveryEmail}${form.backupLeadEmail ? `\nBackup: ${form.backupLeadEmail}` : ""}\nFollow-up: ${form.followupOwner}\nReview hours: ${form.leadReviewHours}`} /><ReviewItem label="Website coordination" value={`${form.websitePlatform}\nAdmin: ${form.websiteAdminContact}\nDNS/hosting: ${form.dnsHostingController}\n${form.installationCoordination}`} /><ReviewItem label="Assistant" value={`${form.assistantLanguage === "en-es" ? "English + Spanish" : "English only"}\nPrioritize: ${form.priorityJobs}\nDo not send: ${form.unwantedJobs}\nUrgent: ${form.urgencyDefinition}`} /><ReviewItem label="Guardrails" value={`${form.pricingPermission}\n${form.arrivalTimePermission}\n${form.schedulingPermission}\nNever claim: ${form.forbiddenClaims}`} /></div><div className="mt-6 space-y-3"><label className="flex gap-3 rounded-2xl border border-white/[0.075] bg-black/20 p-5"><input type="checkbox" checked={form.accuracyConfirmed} onChange={(e)=>update("accuracyConfirmed",e.target.checked)} className="mt-1 h-4 w-4 accent-orange-500" /><span><span className="block text-[11px] font-extrabold text-white">I confirm the business information above is accurate and approved for use.</span><span className="mt-1 block text-[9px] leading-5 text-slate-600">LLF relies on these facts when configuring content, qualification and lead delivery.</span></span></label><label className="flex gap-3 rounded-2xl border border-white/[0.075] bg-black/20 p-5"><input type="checkbox" checked={form.configurationAuthorized} onChange={(e)=>update("configurationAuthorized",e.target.checked)} className="mt-1 h-4 w-4 accent-orange-500" /><span><span className="block text-[11px] font-extrabold text-white">I authorize Local Lead Forge to prepare the agreed lead-capture system using this information.</span><span className="mt-1 block text-[9px] leading-5 text-slate-600">Deployment/access changes remain separately coordinated when required.</span></span></label></div>{submitMessage && <div className={`mt-5 rounded-2xl border p-5 text-[11px] leading-6 ${submitState === "success" ? "border-emerald-500/25 bg-emerald-500/[0.06] text-emerald-200" : "border-amber-500/25 bg-amber-500/[0.06] text-amber-200"}`}>{submitMessage}</div>}</div>}
            </div>

            <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-white/[0.06] px-6 py-5 sm:flex-row sm:items-center sm:px-9"><button type="button" onClick={goBack} disabled={step===0} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.09] px-5 py-3 text-[11px] font-bold text-slate-400 transition hover:text-white disabled:pointer-events-none disabled:opacity-0"><ArrowLeft className="h-4 w-4" /> Back</button>{step < steps.length - 1 ? <button type="button" onClick={goNext} disabled={!stepValid} className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-400/90 bg-orange-600 px-6 py-3 text-[11px] font-extrabold text-white shadow-[0_0_26px_rgba(255,106,0,.24)] transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-900 disabled:text-slate-700 disabled:shadow-none">{step===0 ? "Start onboarding" : "Continue"} <ArrowRight className="h-4 w-4" /></button> : <button type="button" onClick={submit} disabled={!stepValid || submitState==="sending" || submitState==="success"} className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-400/90 bg-orange-600 px-6 py-3 text-[11px] font-extrabold text-white shadow-[0_0_26px_rgba(255,106,0,.24)] transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-900 disabled:text-slate-700 disabled:shadow-none">{submitState==="sending" ? "Submitting…" : submitState==="success" ? "Submitted" : "Complete onboarding"}{submitState==="success" ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}</button>}</div>
          </div>
          <div className="mt-5 flex flex-col items-center justify-between gap-2 px-2 text-center text-[9px] leading-5 text-slate-700 sm:flex-row sm:text-left"><span>© 2026 Local Lead Forge. Client onboarding.</span><span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-orange-500/70" /> Never enter passwords, API keys or payment data in this form.</span></div>
        </section>
      </div>
    </main>
  );
}
