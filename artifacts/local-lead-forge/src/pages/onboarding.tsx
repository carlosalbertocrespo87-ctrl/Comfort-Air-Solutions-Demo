import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
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
  assetLinks: string;
  approvedPhotos: string;
  approvedReviews: string;
  brandUseAuthorized: boolean;
  servicesOffered: string;
  servicesNotOffered: string;
  equipmentBrands: string;
  customerType: string;
  customerLanguages: string;
  areasServed: string;
  businessHours: string;
  afterHoursProtocol: string;
  emergencyService: string;
  promotions: string;
  financing: string;
  faqs: string;
  schedulingDetails: string;
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

const STORAGE_KEY = "llf-client-onboarding-v3";
const PERSIST_KEY = "llf-client-onboarding-save-enabled";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlPattern = /^https?:\/\/.+/i;

const emptyForm: FormData = {
  legalBusinessName: "", dbaName: "", businessAddress: "", authorizedContactName: "", authorizedContactTitle: "", authorizedContactEmail: "", authorizedContactPhone: "", websiteUrl: "", professionalLicense: "", socialProfiles: "", brandColors: "", brandMessage: "", assetLinks: "", approvedPhotos: "", approvedReviews: "", brandUseAuthorized: false, servicesOffered: "", servicesNotOffered: "", equipmentBrands: "", customerType: "", customerLanguages: "", areasServed: "", businessHours: "", afterHoursProtocol: "", emergencyService: "", promotions: "", financing: "", faqs: "", schedulingDetails: "", assistantLanguage: "en-es", minimumLeadInfo: "Name, phone, service needed, city/ZIP, urgency", priorityJobs: "", unwantedJobs: "", urgencyDefinition: "", forbiddenQuestions: "", forbiddenClaims: "Do not invent prices, guarantees, appointment confirmations, arrival times, licenses, promotions or services.", pricingPermission: "No — do not quote or estimate prices unless separately approved.", arrivalTimePermission: "No — do not promise arrival times without real-time data.", schedulingPermission: "No — do not confirm appointments without a live scheduling integration.", leadDeliveryEmail: "", backupLeadEmail: "", crmDestination: "", leadReviewHours: "", followupOwner: "", requiredLeadData: "", sensitiveDataRestrictions: "Do not collect passwords, API keys, Social Security numbers, payment-card data or unnecessary sensitive information.", retentionPreference: "", privacyContact: "", websitePlatform: "", websiteAdminContact: "", dnsHostingController: "", installationCoordination: "", accuracyConfirmed: false, configurationAuthorized: false,
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
  return <a href="/" className="flex items-center gap-3" aria-label="Local Lead Forge home"><div className="relative grid h-11 w-11 place-items-center rounded-xl border border-orange-500/45 bg-[#0a1423] shadow-[0_0_28px_rgba(255,106,0,0.16)]"><div className="absolute inset-[5px] rounded-lg border border-orange-500/25" /><span className="relative text-[13px] font-black tracking-[-0.08em] text-orange-500">LLF</span></div><div className="leading-none"><div className="text-[12px] font-extrabold tracking-[0.19em] text-white">LOCAL LEAD</div><div className="mt-1 text-[12px] font-extrabold tracking-[0.26em] text-orange-500">FORGE</div></div></a>;
}
function Field({ label, value, onChange, placeholder, type = "text", required = false, hint }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; required?: boolean; hint?: string }) {
  return <label className="block"><span className="flex items-center gap-1 text-[11px] font-bold text-slate-200">{label}{required && <span className="text-orange-400">*</span>}</span>{hint && <span className="mt-1 block text-[9px] leading-4 text-slate-500">{hint}</span>}<input type={type} value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-white/[0.09] bg-[#050d18] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-orange-500/55 focus:ring-2 focus:ring-orange-500/10" /></label>;
}
function TextAreaField({ label, value, onChange, placeholder, required = false, hint }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean; hint?: string }) {
  return <label className="block"><span className="flex items-center gap-1 text-[11px] font-bold text-slate-200">{label}{required && <span className="text-orange-400">*</span>}</span>{hint && <span className="mt-1 block text-[9px] leading-4 text-slate-500">{hint}</span>}<textarea rows={4} value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} className="mt-2 w-full resize-y rounded-xl border border-white/[0.09] bg-[#050d18] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-700 focus:border-orange-500/55 focus:ring-2 focus:ring-orange-500/10" /></label>;
}
function ReviewItem({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/[0.07] bg-black/20 p-4"><div className="text-[9px] font-black uppercase tracking-[.15em] text-slate-500">{label}</div><div className="mt-2 whitespace-pre-wrap text-[12px] leading-5 text-slate-200">{value || "Not provided"}</div></div>; }

export default function OnboardingPage() {
  const [step,setStep]=useState(0); const [form,setForm]=useState<FormData>(emptyForm); const [loaded,setLoaded]=useState(false); const [saveOnDevice,setSaveOnDevice]=useState(false); const [savedAt,setSavedAt]=useState<string|null>(null); const [submitState,setSubmitState]=useState<"idle"|"sending"|"success"|"error">("idle"); const [submitMessage,setSubmitMessage]=useState("");
  useEffect(()=>{ try { const persist=localStorage.getItem(PERSIST_KEY)==="1"; setSaveOnDevice(persist); if(persist){const stored=localStorage.getItem(STORAGE_KEY); if(stored)setForm({...emptyForm,...JSON.parse(stored)});} } catch{} finally{setLoaded(true);} },[]);
  useEffect(()=>{ if(!loaded||!saveOnDevice||submitState==="success")return; const t=window.setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(form));setSavedAt(new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}));}catch{}},350); return()=>clearTimeout(t); },[form,loaded,saveOnDevice,submitState]);
  const update=<K extends keyof FormData>(key:K,value:FormData[K])=>{setForm(c=>({...c,[key]:value}));setSubmitState("idle");setSubmitMessage("");};
  const changePersistence=(enabled:boolean)=>{setSaveOnDevice(enabled);try{if(enabled){localStorage.setItem(PERSIST_KEY,"1");localStorage.setItem(STORAGE_KEY,JSON.stringify(form));setSavedAt(new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}));}else{localStorage.removeItem(PERSIST_KEY);localStorage.removeItem(STORAGE_KEY);setSavedAt(null);}}catch{setSavedAt(null);}};
  const clearSavedProgress=()=>{try{localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(PERSIST_KEY);}catch{}setSaveOnDevice(false);setForm(emptyForm);setStep(0);setSavedAt(null);setSubmitState("idle");setSubmitMessage("");};
  const missingFields=useMemo(()=>{const m:string[]=[];const req=(l:string,v:string)=>{if(!v.trim())m.push(l);}; switch(step){case 1:req("Legal business name",form.legalBusinessName);req("Business address",form.businessAddress);req("Authorized contact name",form.authorizedContactName);req("Authorized contact title",form.authorizedContactTitle);if(!emailPattern.test(form.authorizedContactEmail.trim()))m.push("Valid contact email");req("Contact phone",form.authorizedContactPhone);if(!urlPattern.test(form.websiteUrl.trim()))m.push("Website URL starting with http:// or https://");if(!form.brandUseAuthorized)m.push("Brand-use authorization");break;case 2:req("Services offered",form.servicesOffered);req("Services not offered",form.servicesNotOffered);req("Customer type",form.customerType);req("Languages served",form.customerLanguages);req("Service areas",form.areasServed);req("Business hours",form.businessHours);req("After-hours protocol",form.afterHoursProtocol);req("Emergency-service wording",form.emergencyService);req("Real customer FAQs",form.faqs);break;case 3:if(!emailPattern.test(form.leadDeliveryEmail.trim()))m.push("Valid primary lead-delivery email");if(form.backupLeadEmail.trim()&&!emailPattern.test(form.backupLeadEmail.trim()))m.push("Valid backup lead-delivery email");req("Lead review hours",form.leadReviewHours);req("Follow-up owner",form.followupOwner);req("Required lead data",form.requiredLeadData);req("Privacy / incident contact",form.privacyContact);break;case 4:req("Website platform",form.websitePlatform);req("Website administrator/contact",form.websiteAdminContact);req("DNS / hosting controller",form.dnsHostingController);req("Installation coordination",form.installationCoordination);break;case 5:req("Minimum lead information",form.minimumLeadInfo);req("Priority jobs",form.priorityJobs);req("Unwanted jobs",form.unwantedJobs);req("Urgency definition",form.urgencyDefinition);req("Forbidden claims",form.forbiddenClaims);req("Pricing permission",form.pricingPermission);req("Arrival-time permission",form.arrivalTimePermission);req("Scheduling permission",form.schedulingPermission);break;case 6:if(!form.accuracyConfirmed)m.push("Accuracy confirmation");if(!form.configurationAuthorized)m.push("Configuration authorization");break;}return m;},[form,step]);
  const stepValid=missingFields.length===0; const goNext=()=>{if(stepValid){setStep(c=>Math.min(c+1,steps.length-1));scrollTo({top:0,behavior:"smooth"});}}; const goBack=()=>{setStep(c=>Math.max(c-1,0));scrollTo({top:0,behavior:"smooth"});};
  const submit=async()=>{if(!stepValid||submitState==="sending")return;const endpoint=import.meta.env.VITE_ONBOARDING_ENDPOINT as string|undefined;if(!endpoint){setSubmitState("error");setSubmitMessage("Secure submission is not enabled on this preview yet. Nothing was sent.");return;}setSubmitState("sending");setSubmitMessage("");try{const r=await fetch(endpoint,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...form,source:"localleadforge.com/onboarding",schemaVersion:3,submittedAt:new Date().toISOString()})});if(!r.ok)throw new Error();setSubmitState("success");setSubmitMessage("Thank you. Your onboarding details were submitted successfully. Local Lead Forge will review the business facts before implementation begins.");try{localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(PERSIST_KEY);}catch{}setSaveOnDevice(false);setSavedAt(null);}catch{setSubmitState("error");setSubmitMessage(saveOnDevice?"We could not submit the form right now. Your saved progress remains on this device.":"We could not submit the form right now. Nothing was sent; please try again before closing this page.");}};
  const activeStep=steps[step]; const ActiveIcon=activeStep.icon; const progress=Math.round((step/(steps.length-1))*100);
  const fieldsByStep = step===1 ? <div className="grid gap-5 sm:grid-cols-2"><Field required label="Legal business name" value={form.legalBusinessName} onChange={v=>update("legalBusinessName",v)}/><Field label="DBA / public business name" value={form.dbaName} onChange={v=>update("dbaName",v)}/><Field required label="Business address" value={form.businessAddress} onChange={v=>update("businessAddress",v)}/><Field required label="Authorized contact name" value={form.authorizedContactName} onChange={v=>update("authorizedContactName",v)}/><Field required label="Authorized contact title" value={form.authorizedContactTitle} onChange={v=>update("authorizedContactTitle",v)}/><Field required type="email" label="Authorized contact email" value={form.authorizedContactEmail} onChange={v=>update("authorizedContactEmail",v)}/><Field required type="tel" label="Authorized contact phone" value={form.authorizedContactPhone} onChange={v=>update("authorizedContactPhone",v)}/><Field required type="url" label="Website URL" value={form.websiteUrl} onChange={v=>update("websiteUrl",v)} placeholder="https://example.com"/><TextAreaField label="Approved slogan / key messages" value={form.brandMessage} onChange={v=>update("brandMessage",v)}/><TextAreaField label="Logo / brand asset links" value={form.assetLinks} onChange={v=>update("assetLinks",v)}/><label className="sm:col-span-2 flex gap-3 rounded-2xl border border-white/[0.075] bg-black/20 p-5"><input type="checkbox" checked={form.brandUseAuthorized} onChange={e=>update("brandUseAuthorized",e.target.checked)} className="mt-1 h-4 w-4 accent-orange-500"/><span className="text-[10px] text-slate-300">I authorize Local Lead Forge to use the logo, brand assets and approved materials I provide.</span></label></div> : step===2 ? <div className="grid gap-5 sm:grid-cols-2"><TextAreaField required label="Services offered" value={form.servicesOffered} onChange={v=>update("servicesOffered",v)}/><TextAreaField required label="Services NOT offered" value={form.servicesNotOffered} onChange={v=>update("servicesNotOffered",v)}/><Field required label="Customer type" value={form.customerType} onChange={v=>update("customerType",v)}/><Field required label="Languages your team serves" value={form.customerLanguages} onChange={v=>update("customerLanguages",v)}/><TextAreaField required label="Cities / ZIP codes / service areas" value={form.areasServed} onChange={v=>update("areasServed",v)}/><Field required label="Normal business hours" value={form.businessHours} onChange={v=>update("businessHours",v)}/><TextAreaField required label="After-hours protocol" value={form.afterHoursProtocol} onChange={v=>update("afterHoursProtocol",v)}/><TextAreaField required label="Emergency service — exact wording" value={form.emergencyService} onChange={v=>update("emergencyService",v)}/><TextAreaField required label="Real customer FAQs" value={form.faqs} onChange={v=>update("faqs",v)}/></div> : step===3 ? <div className="grid gap-5 sm:grid-cols-2"><Field required type="email" label="Primary lead-delivery email" value={form.leadDeliveryEmail} onChange={v=>update("leadDeliveryEmail",v)}/><Field type="email" label="Backup lead-delivery email" value={form.backupLeadEmail} onChange={v=>update("backupLeadEmail",v)}/><Field required label="Hours your team reviews leads" value={form.leadReviewHours} onChange={v=>update("leadReviewHours",v)}/><Field required label="Person responsible for lead follow-up" value={form.followupOwner} onChange={v=>update("followupOwner",v)}/><TextAreaField required label="Lead data your team actually needs" value={form.requiredLeadData} onChange={v=>update("requiredLeadData",v)}/><Field required label="Privacy / incident contact" value={form.privacyContact} onChange={v=>update("privacyContact",v)}/></div> : step===4 ? <div className="grid gap-5 sm:grid-cols-2"><Field required label="Website platform" value={form.websitePlatform} onChange={v=>update("websitePlatform",v)}/><Field required label="Website administrator / contact" value={form.websiteAdminContact} onChange={v=>update("websiteAdminContact",v)}/><Field required label="Who controls DNS / hosting?" value={form.dnsHostingController} onChange={v=>update("dnsHostingController",v)}/><TextAreaField required label="Preferred installation coordination" value={form.installationCoordination} onChange={v=>update("installationCoordination",v)}/></div> : step===5 ? <div className="grid gap-5 sm:grid-cols-2"><TextAreaField required label="Minimum information before your team calls a lead" value={form.minimumLeadInfo} onChange={v=>update("minimumLeadInfo",v)}/><TextAreaField required label="Jobs / leads to prioritize" value={form.priorityJobs} onChange={v=>update("priorityJobs",v)}/><TextAreaField required label="Jobs / leads you do NOT want" value={form.unwantedJobs} onChange={v=>update("unwantedJobs",v)}/><TextAreaField required label="What should count as urgent?" value={form.urgencyDefinition} onChange={v=>update("urgencyDefinition",v)}/><TextAreaField required label="Claims the assistant must NEVER make" value={form.forbiddenClaims} onChange={v=>update("forbiddenClaims",v)}/><TextAreaField required label="Pricing permission" value={form.pricingPermission} onChange={v=>update("pricingPermission",v)}/><TextAreaField required label="Arrival-time permission" value={form.arrivalTimePermission} onChange={v=>update("arrivalTimePermission",v)}/><TextAreaField required label="Scheduling permission" value={form.schedulingPermission} onChange={v=>update("schedulingPermission",v)}/></div> : step===6 ? <div className="space-y-4"><ReviewItem label="Business" value={`${form.legalBusinessName}\n${form.authorizedContactName} — ${form.authorizedContactTitle}`}/><ReviewItem label="Lead delivery" value={`${form.leadDeliveryEmail}\nFollow-up: ${form.followupOwner}`}/><label className="flex gap-3 rounded-2xl border border-white/[0.075] bg-black/20 p-5"><input type="checkbox" checked={form.accuracyConfirmed} onChange={e=>update("accuracyConfirmed",e.target.checked)} className="mt-1 h-4 w-4 accent-orange-500"/><span className="text-[10px] text-slate-300">I confirm the business information I provided is accurate.</span></label><label className="flex gap-3 rounded-2xl border border-white/[0.075] bg-black/20 p-5"><input type="checkbox" checked={form.configurationAuthorized} onChange={e=>update("configurationAuthorized",e.target.checked)} className="mt-1 h-4 w-4 accent-orange-500"/><span className="text-[10px] text-slate-300">I authorize Local Lead Forge to configure the purchased system using these approved business facts and materials.</span></label></div> : <div><div className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/[0.06] px-3 py-1.5 text-[9px] font-black uppercase tracking-[.16em] text-orange-400"><BadgeCheck className="h-3.5 w-3.5"/>Welcome to Local Lead Forge</div><h2 className="mt-5 max-w-[700px] text-3xl font-black tracking-[-.035em] text-white sm:text-[46px] sm:leading-[1.04]">Your setup is officially underway.</h2><p className="mt-5 max-w-[720px] text-[13px] leading-7 text-slate-400">The next step is a short business intake so we can configure your site experience, AI assistant, lead qualification and lead delivery around how your company actually operates.</p></div>;
  return <main className="min-h-screen overflow-hidden bg-[#020813] text-white"><header className="border-b border-white/[0.06] bg-[#030a14]/90"><div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 sm:px-8"><Logo/><div className="hidden items-center gap-2 text-[10px] font-semibold text-slate-500 sm:flex"><ShieldCheck className="h-4 w-4 text-orange-500"/>Secure client onboarding</div></div></header><div className="mx-auto grid max-w-[1240px] gap-7 px-5 py-8 sm:px-8 lg:grid-cols-[270px_1fr]"><aside><div className="rounded-2xl border border-white/[0.08] bg-[#06101d]/90 p-4"><div className="mb-4 flex justify-between text-[9px] font-black uppercase tracking-[.15em] text-slate-500"><span>Onboarding progress</span><span className="text-orange-400">{progress}%</span></div><div className="mb-5 h-1.5 rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-orange-500" style={{width:`${progress}%`}}/></div>{steps.map(({short,icon:Icon},i)=><button type="button" key={short} disabled={i>step} onClick={()=>i<=step&&setStep(i)} className="mb-2 flex w-full items-center gap-2 rounded-xl border border-white/[0.06] px-3 py-3 text-left text-[10px]"><Icon className="h-3.5 w-3.5"/>{short}</button>)}<label className="mt-4 flex cursor-pointer items-start gap-2 text-[9px] leading-5 text-slate-500"><input type="checkbox" checked={saveOnDevice} onChange={e=>changePersistence(e.target.checked)} className="mt-1 accent-orange-500"/><span>Save progress on this device. Avoid enabling this on a shared computer.</span></label>{saveOnDevice&&savedAt&&<div className="mt-2 text-[9px] text-slate-500"><Save className="mr-1 inline h-3 w-3"/>Saved {savedAt}</div>}<button type="button" onClick={clearSavedProgress} className="mt-3 text-[9px] text-slate-500"><Trash2 className="mr-1 inline h-3 w-3"/>Clear form and saved progress</button></div></aside><section><div className="rounded-3xl border border-white/[0.08] bg-[#06101d]/92"><div className="border-b border-white/[0.06] px-6 py-6 sm:px-9"><div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.18em] text-orange-400"><ActiveIcon className="h-4 w-4"/>Step {step+1} of {steps.length}</div><h1 className="mt-3 text-3xl font-black">{activeStep.title}</h1></div><div className="px-6 py-7 sm:px-9">{fieldsByStep}{step>0&&missingFields.length>0&&<div className="mt-7 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] px-4 py-3 text-[10px] text-amber-200/80">Complete the required items before continuing: {missingFields.join(", ")}.</div>}{submitMessage&&<div className={`mt-7 rounded-xl border px-4 py-3 text-[10px] ${submitState==="success"?"border-emerald-500/20 text-emerald-300":"border-red-500/20 text-red-300"}`}>{submitMessage}</div>}<div className="mt-8 flex justify-between border-t border-white/[0.06] pt-6"><button type="button" onClick={goBack} disabled={step===0||submitState==="sending"||submitState==="success"} className="rounded-xl border border-white/[0.09] px-5 py-3 text-[11px]"><ArrowLeft className="mr-2 inline h-4 w-4"/>Back</button>{step<steps.length-1?<button type="button" onClick={goNext} disabled={!stepValid} className="rounded-xl bg-orange-500 px-6 py-3 text-[11px] font-black text-[#07111f]">Continue<ArrowRight className="ml-2 inline h-4 w-4"/></button>:<button type="button" onClick={submit} disabled={!stepValid||submitState==="sending"||submitState==="success"} className="rounded-xl bg-orange-500 px-6 py-3 text-[11px] font-black text-[#07111f]">{submitState==="sending"?"Submitting securely…":submitState==="success"?"Information received":"Submit onboarding"}<BadgeCheck className="ml-2 inline h-4 w-4"/></button>}</div></div></div><p className="mx-auto mt-5 max-w-[760px] text-center text-[9px] leading-5 text-slate-600">Do not submit passwords, API keys, banking information, payment-card data, Social Security numbers, identity documents or recovery codes.</p></section></div></main>;
}
