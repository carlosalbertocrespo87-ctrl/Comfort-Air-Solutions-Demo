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
  UserRoundCheck,
  Wrench,
} from "lucide-react";

type FormData = {
  authorizedContactName: string;
  authorizedContactEmail: string;
  businessName: string;
  websiteUrl: string;
  mainPhone: string;
  mainContactEmail: string;
  serviceArea: string;
  businessHours: string;
  leadDeliveryEmail: string;
  backupLeadEmail: string;
  websitePlatform: string;
  websiteAdminContact: string;
  dnsHostingController: string;
  installationCoordination: string;
  assistantLanguage: "en" | "en-es";
  services: string;
  areasServed: string;
  restrictedStatements: string;
  accuracyConfirmed: boolean;
  configurationAuthorized: boolean;
};

const STORAGE_KEY = "llf-client-onboarding-v1";

const emptyForm: FormData = {
  authorizedContactName: "",
  authorizedContactEmail: "",
  businessName: "",
  websiteUrl: "",
  mainPhone: "",
  mainContactEmail: "",
  serviceArea: "",
  businessHours: "",
  leadDeliveryEmail: "",
  backupLeadEmail: "",
  websitePlatform: "",
  websiteAdminContact: "",
  dnsHostingController: "",
  installationCoordination: "",
  assistantLanguage: "en-es",
  services: "",
  areasServed: "",
  restrictedStatements: "",
  accuracyConfirmed: false,
  configurationAuthorized: false,
};

const steps = [
  { title: "Welcome", short: "Welcome", icon: Sparkles },
  { title: "Business", short: "Business", icon: Building2 },
  { title: "Lead delivery", short: "Leads", icon: MailCheck },
  { title: "Website", short: "Website", icon: Globe2 },
  { title: "Assistant", short: "Assistant", icon: Languages },
  { title: "Review", short: "Review", icon: ClipboardCheck },
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

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-200">
        {label}
        {required && <span className="text-orange-400">*</span>}
      </span>
      {hint && <span className="mt-1 block text-[9px] leading-4 text-slate-600">{hint}</span>}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-white/[0.09] bg-[#050d18] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-orange-500/55 focus:ring-2 focus:ring-orange-500/10"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-200">
        {label}
        {required && <span className="text-orange-400">*</span>}
      </span>
      {hint && <span className="mt-1 block text-[9px] leading-4 text-slate-600">{hint}</span>}
      <textarea
        rows={4}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full resize-y rounded-xl border border-white/[0.09] bg-[#050d18] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-700 focus:border-orange-500/55 focus:ring-2 focus:ring-orange-500/10"
      />
    </label>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/20 p-4">
      <div className="text-[9px] font-black uppercase tracking-[.15em] text-slate-600">{label}</div>
      <div className="mt-2 whitespace-pre-wrap text-[12px] leading-5 text-slate-200">{value || "Not provided"}</div>
    </div>
  );
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
      // Ignore malformed or unavailable browser storage.
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const timeout = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
        setSavedAt(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
      } catch {
        // The form remains fully usable even when localStorage is unavailable.
      }
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [form, loaded]);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSubmitState("idle");
    setSubmitMessage("");
  };

  const stepValid = useMemo(() => {
    switch (step) {
      case 0:
        return true;
      case 1:
        return Boolean(
          form.authorizedContactName.trim() &&
            form.authorizedContactEmail.trim() &&
            form.businessName.trim() &&
            form.websiteUrl.trim() &&
            form.mainPhone.trim() &&
            form.mainContactEmail.trim() &&
            form.serviceArea.trim() &&
            form.businessHours.trim(),
        );
      case 2:
        return Boolean(form.leadDeliveryEmail.trim());
      case 3:
        return Boolean(
          form.websitePlatform.trim() &&
            form.websiteAdminContact.trim() &&
            form.dnsHostingController.trim() &&
            form.installationCoordination.trim(),
        );
      case 4:
        return Boolean(form.services.trim() && form.areasServed.trim());
      case 5:
        return form.accuracyConfirmed && form.configurationAuthorized;
      default:
        return false;
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
      setSubmitMessage("Secure submission is not enabled on this preview yet. Your progress is saved on this device.");
      return;
    }

    setSubmitState("sending");
    setSubmitMessage("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, source: "localleadforge.com/onboarding", submittedAt: new Date().toISOString() }),
      });
      if (!response.ok) throw new Error(`Onboarding submission failed with ${response.status}`);
      setSubmitState("success");
      setSubmitMessage("Thank you. Your onboarding details were submitted successfully. Local Lead Forge will review everything before implementation begins.");
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
      <div className="pointer-events-none fixed inset-0 opacity-[0.13] [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:36px_36px]" />

      <header className="relative border-b border-white/[0.06] bg-[#030a14]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 sm:px-8">
          <Logo />
          <div className="hidden items-center gap-2 text-[10px] font-semibold text-slate-500 sm:flex">
            <ShieldCheck className="h-4 w-4 text-orange-500" />
            Secure client onboarding
          </div>
        </div>
      </header>

      <div className="relative mx-auto grid max-w-[1240px] gap-7 px-5 py-8 sm:px-8 lg:grid-cols-[270px_1fr] lg:py-12">
        <aside className="lg:sticky lg:top-8 lg:h-fit">
          <div className="rounded-2xl border border-white/[0.08] bg-[#06101d]/90 p-4 shadow-2xl shadow-black/20">
            <div className="mb-4 flex items-center justify-between text-[9px] font-black uppercase tracking-[.15em] text-slate-600">
              <span>Onboarding progress</span>
              <span className="text-orange-400">{progress}%</span>
            </div>
            <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-orange-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>

            <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
              {steps.map(({ short, icon: Icon }, index) => {
                const active = index === step;
                const done = index < step;
                return (
                  <button
                    type="button"
                    key={short}
                    onClick={() => index <= step && setStep(index)}
                    className={`flex min-w-0 items-center gap-2 rounded-xl border px-3 py-3 text-left transition ${
                      active
                        ? "border-orange-500/35 bg-orange-500/[0.08] text-white"
                        : done
                          ? "border-emerald-500/15 bg-emerald-500/[0.035] text-slate-300 hover:border-emerald-500/25"
                          : "cursor-default border-transparent text-slate-700"
                    }`}
                  >
                    <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${active ? "bg-orange-500 text-white" : done ? "bg-emerald-500/10 text-emerald-400" : "bg-white/[0.025]"}`}>
                      {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                    </div>
                    <span className="hidden truncate text-[10px] font-bold lg:block">{short}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 hidden border-t border-white/[0.06] pt-4 text-[9px] leading-5 text-slate-600 lg:block">
              Your answers are automatically saved in this browser while you work.
              {savedAt && <div className="mt-1 flex items-center gap-1.5 text-slate-500"><Save className="h-3 w-3" /> Saved {savedAt}</div>}
            </div>
          </div>
        </aside>

        <section>
          <div className="rounded-3xl border border-white/[0.08] bg-[#06101d]/92 shadow-[0_30px_90px_rgba(0,0,0,.36)]">
            <div className="border-b border-white/[0.06] px-6 py-6 sm:px-9 sm:py-8">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.18em] text-orange-400">
                <activeStep.icon className="h-4 w-4" />
                Step {step + 1} of {steps.length}
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-[-.035em] text-white sm:text-[42px]">{activeStep.title}</h1>
            </div>

            <div className="px-6 py-7 sm:px-9 sm:py-9">
              {step === 0 && (
                <div>
                  <div className="max-w-[760px]">
                    <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/[0.06] px-3 py-1.5 text-[9px] font-black uppercase tracking-[.16em] text-orange-400">
                      <BadgeCheck className="h-3.5 w-3.5" /> Welcome to Local Lead Forge
                    </div>
                    <h2 className="mt-5 max-w-[680px] text-3xl font-black tracking-[-.035em] text-white sm:text-[46px] sm:leading-[1.04]">
                      Let’s get your lead-capture system ready to work.
                    </h2>
                    <p className="mt-5 max-w-[690px] text-[13px] leading-7 text-slate-400">
                      This short onboarding gives us the verified business, lead-delivery and website information we need to configure your system correctly. Most clients can complete it in about 5–10 minutes.
                    </p>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {[
                      [UserRoundCheck, "Business details", "Confirm the information customers should see."],
                      [MailCheck, "Lead delivery", "Tell us exactly where new leads should go."],
                      [Wrench, "Website setup", "Give us the coordination details for installation."],
                    ].map(([Icon, title, copy]) => {
                      const I = Icon as typeof UserRoundCheck;
                      return (
                        <div key={String(title)} className="rounded-2xl border border-white/[0.075] bg-black/20 p-5">
                          <I className="h-5 w-5 text-orange-500" />
                          <div className="mt-4 text-[12px] font-extrabold text-white">{String(title)}</div>
                          <div className="mt-2 text-[10px] leading-5 text-slate-600">{String(copy)}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 rounded-2xl border border-orange-500/20 bg-orange-500/[0.035] p-5 sm:p-6">
                    <div className="flex gap-3">
                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                      <div>
                        <div className="text-[11px] font-extrabold text-white">We only ask for what is needed to configure the service.</div>
                        <p className="mt-2 text-[10px] leading-5 text-slate-500">Do not enter passwords, API keys, Social Security numbers or other unnecessary sensitive information in this form.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field required label="Authorized contact name" value={form.authorizedContactName} onChange={(value) => update("authorizedContactName", value)} placeholder="Jane Smith" />
                  <Field required type="email" label="Authorized contact email" value={form.authorizedContactEmail} onChange={(value) => update("authorizedContactEmail", value)} placeholder="jane@company.com" />
                  <Field required label="Business name" value={form.businessName} onChange={(value) => update("businessName", value)} placeholder="Company display name" />
                  <Field required type="url" label="Website URL" value={form.websiteUrl} onChange={(value) => update("websiteUrl", value)} placeholder="https://example.com" />
                  <Field required type="tel" label="Main phone" value={form.mainPhone} onChange={(value) => update("mainPhone", value)} placeholder="(770) 555-0123" />
                  <Field required type="email" label="Main contact email" value={form.mainContactEmail} onChange={(value) => update("mainContactEmail", value)} placeholder="service@example.com" />
                  <Field required label="Service area" value={form.serviceArea} onChange={(value) => update("serviceArea", value)} placeholder="Gwinnett County + Metro Atlanta" hint="Use only areas your business actually serves." />
                  <Field required label="Business hours" value={form.businessHours} onChange={(value) => update("businessHours", value)} placeholder="Mon–Fri 8 AM–6 PM; Sat 9 AM–2 PM" />
                </div>
              )}

              {step === 2 && (
                <div className="max-w-[760px] space-y-5">
                  <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-5 text-[11px] leading-6 text-slate-400">
                    New qualified leads will be routed to the primary address below. A backup recipient is optional.
                  </div>
                  <Field required type="email" label="Primary lead-delivery email" value={form.leadDeliveryEmail} onChange={(value) => update("leadDeliveryEmail", value)} placeholder="leads@example.com" />
                  <Field type="email" label="Backup lead recipient" value={form.backupLeadEmail} onChange={(value) => update("backupLeadEmail", value)} placeholder="Optional" />
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field required label="Website platform" value={form.websitePlatform} onChange={(value) => update("websitePlatform", value)} placeholder="WordPress, Wix, Squarespace, GoDaddy, Not sure…" />
                  <Field required label="Website administrator / contact" value={form.websiteAdminContact} onChange={(value) => update("websiteAdminContact", value)} placeholder="Name or company that manages the website" />
                  <Field required label="Who controls DNS / hosting?" value={form.dnsHostingController} onChange={(value) => update("dnsHostingController", value)} placeholder="Owner, webmaster, agency, not sure…" />
                  <Field required label="Preferred installation coordination" value={form.installationCoordination} onChange={(value) => update("installationCoordination", value)} placeholder="Email with webmaster, owner coordinates access…" hint="Do not enter passwords here." />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <div className="text-[11px] font-bold text-slate-200">Assistant language <span className="text-orange-400">*</span></div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {[
                        ["en", "English only", "The assistant will communicate in English."],
                        ["en-es", "English + Spanish", "Visitors can use either English or Spanish."],
                      ].map(([value, title, copy]) => {
                        const selected = form.assistantLanguage === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => update("assistantLanguage", value as FormData["assistantLanguage"])}
                            className={`rounded-2xl border p-5 text-left transition ${selected ? "border-orange-500/45 bg-orange-500/[0.07]" : "border-white/[0.075] bg-black/20 hover:border-white/[0.13]"}`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-[12px] font-extrabold text-white">{title}</div>
                              {selected && <CheckCircle2 className="h-5 w-5 text-orange-500" />}
                            </div>
                            <div className="mt-2 text-[10px] leading-5 text-slate-600">{copy}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <TextAreaField required label="Services to represent" value={form.services} onChange={(value) => update("services", value)} placeholder="AC repair, heating repair, maintenance, installation…" hint="List only services you actually provide." />
                  <TextAreaField required label="Areas actually served" value={form.areasServed} onChange={(value) => update("areasServed", value)} placeholder="Cities, ZIP codes, counties or other service-area rules" />
                  <TextAreaField label="Anything the assistant must NOT say" value={form.restrictedStatements} onChange={(value) => update("restrictedStatements", value)} placeholder="Examples: do not quote prices, do not promise same-day availability…" />
                </div>
              )}

              {step === 5 && (
                <div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ReviewItem label="Authorized contact" value={`${form.authorizedContactName}\n${form.authorizedContactEmail}`} />
                    <ReviewItem label="Business" value={`${form.businessName}\n${form.websiteUrl}\n${form.mainPhone}\n${form.mainContactEmail}`} />
                    <ReviewItem label="Service area & hours" value={`${form.serviceArea}\n${form.businessHours}`} />
                    <ReviewItem label="Lead delivery" value={`${form.leadDeliveryEmail}${form.backupLeadEmail ? `\nBackup: ${form.backupLeadEmail}` : ""}`} />
                    <ReviewItem label="Website coordination" value={`${form.websitePlatform}\nAdmin: ${form.websiteAdminContact}\nDNS/hosting: ${form.dnsHostingController}\n${form.installationCoordination}`} />
                    <ReviewItem label="Assistant" value={`${form.assistantLanguage === "en-es" ? "English + Spanish" : "English only"}\nServices: ${form.services}\nAreas: ${form.areasServed}${form.restrictedStatements ? `\nMust not say: ${form.restrictedStatements}` : ""}`} />
                  </div>

                  <div className="mt-6 space-y-3">
                    <label className="flex cursor-pointer gap-3 rounded-2xl border border-white/[0.075] bg-black/20 p-5">
                      <input type="checkbox" checked={form.accuracyConfirmed} onChange={(event) => update("accuracyConfirmed", event.target.checked)} className="mt-1 h-4 w-4 accent-orange-500" />
                      <span>
                        <span className="block text-[11px] font-extrabold text-white">I confirm the business information above is accurate.</span>
                        <span className="mt-1 block text-[9px] leading-5 text-slate-600">Local Lead Forge will use approved information when configuring the client system.</span>
                      </span>
                    </label>
                    <label className="flex cursor-pointer gap-3 rounded-2xl border border-white/[0.075] bg-black/20 p-5">
                      <input type="checkbox" checked={form.configurationAuthorized} onChange={(event) => update("configurationAuthorized", event.target.checked)} className="mt-1 h-4 w-4 accent-orange-500" />
                      <span>
                        <span className="block text-[11px] font-extrabold text-white">I authorize Local Lead Forge to use these details to prepare the agreed lead-capture system.</span>
                        <span className="mt-1 block text-[9px] leading-5 text-slate-600">Website access or deployment changes will still be coordinated separately when required.</span>
                      </span>
                    </label>
                  </div>

                  {submitMessage && (
                    <div className={`mt-5 rounded-2xl border p-5 text-[11px] leading-6 ${submitState === "success" ? "border-emerald-500/25 bg-emerald-500/[0.06] text-emerald-200" : "border-amber-500/25 bg-amber-500/[0.06] text-amber-200"}`}>
                      {submitMessage}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-white/[0.06] px-6 py-5 sm:flex-row sm:items-center sm:px-9">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.09] px-5 py-3 text-[11px] font-bold text-slate-400 transition hover:border-white/[0.16] hover:text-white disabled:pointer-events-none disabled:opacity-0"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>

              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!stepValid}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-400/90 bg-orange-600 px-6 py-3 text-[11px] font-extrabold text-white shadow-[0_0_26px_rgba(255,106,0,.24)] transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-900 disabled:text-slate-700 disabled:shadow-none"
                >
                  {step === 0 ? "Start onboarding" : "Continue"} <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={!stepValid || submitState === "sending" || submitState === "success"}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-400/90 bg-orange-600 px-6 py-3 text-[11px] font-extrabold text-white shadow-[0_0_26px_rgba(255,106,0,.24)] transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-900 disabled:text-slate-700 disabled:shadow-none"
                >
                  {submitState === "sending" ? "Submitting…" : submitState === "success" ? "Submitted" : "Complete onboarding"}
                  {submitState === "success" ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-col items-center justify-between gap-2 px-2 text-center text-[9px] leading-5 text-slate-700 sm:flex-row sm:text-left">
            <span>© 2026 Local Lead Forge. Client onboarding.</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-orange-500/70" /> Never enter passwords or API keys in this form.</span>
          </div>
        </section>
      </div>
    </main>
  );
}
