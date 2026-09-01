import { useEffect, useState, type ReactNode } from 'react';
import { MessageCircle, MessageSquareText, X } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaWhatsapp } from 'react-icons/fa';
import SupportChat from '@/components/support-chat';

const contactLinks = {
  whatsapp: import.meta.env.VITE_LLF_WHATSAPP_URL as string | undefined,
  sms: import.meta.env.VITE_LLF_SMS_URL as string | undefined,
};

const socialLinks = [
  { label: 'Facebook', href: import.meta.env.VITE_LLF_FACEBOOK_URL as string | undefined, Icon: FaFacebookF },
  { label: 'Instagram', href: import.meta.env.VITE_LLF_INSTAGRAM_URL as string | undefined, Icon: FaInstagram },
  { label: 'LinkedIn', href: import.meta.env.VITE_LLF_LINKEDIN_URL as string | undefined, Icon: FaLinkedinIn },
  { label: 'YouTube', href: import.meta.env.VITE_LLF_YOUTUBE_URL as string | undefined, Icon: FaYoutube },
] as const;

function ActionLink({ href, label, icon }: { href?: string; label: string; icon: ReactNode }) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-xl border border-orange-500/25 bg-orange-500/[0.07] px-3 py-2 text-xs font-black text-orange-200 transition hover:border-orange-400/50 hover:bg-orange-500/[0.12]"
    >
      {icon}{label}
    </a>
  );
}

export function PreviewSocialFooter() {
  const activeSocialLinks = socialLinks.filter(({ href }) => Boolean(href));
  if (activeSocialLinks.length === 0) return null;

  return (
    <div className="llf-preview-contact border-t border-white/10 bg-[#020711] px-5 pb-10 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[12px] font-black uppercase tracking-[0.15em] text-slate-400">Follow Local Lead Forge</div>
          <div className="mt-1 text-[12px] text-slate-600">Official LLF social profiles.</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeSocialLinks.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open Local Lead Forge on ${label}`}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition hover:border-orange-500/40 hover:bg-orange-500/[0.08] hover:text-orange-300"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

type PreviewLang = 'en' | 'es';

const supportCopy = {
  en: {
    title: 'LLF Support + Direct Contact',
    close: 'Close contact panel',
    direct: 'Direct contact',
    trigger: 'Questions? Ask LLF',
  },
  es: {
    title: 'Soporte LLF + contacto directo',
    close: 'Cerrar panel de contacto',
    direct: 'Contacto directo',
    trigger: '¿Preguntas? Consulta a LLF',
  },
} as const;

export function PreviewSupportChat() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<PreviewLang>(() => document.documentElement.lang === 'en' ? 'en' : 'es');
  const hasDirectContact = Boolean(contactLinks.whatsapp || contactLinks.sms);
  const t = supportCopy[lang];

  useEffect(() => {
    const handleLanguageChange = (event: Event) => {
      const next = (event as CustomEvent<PreviewLang>).detail;
      if (next === 'en' || next === 'es') setLang(next);
    };
    window.addEventListener('llf-language-change', handleLanguageChange);
    return () => window.removeEventListener('llf-language-change', handleLanguageChange);
  }, []);

  return (
    <div className="llf-preview-contact fixed bottom-4 right-4 z-[70] sm:bottom-6 sm:right-6">
      {open ? (
        <div className="w-[min(430px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-orange-500/25 bg-[#06101d] shadow-[0_30px_90px_rgba(0,0,0,.6)]">
          <div className="flex items-center justify-between border-b border-white/10 bg-[#081421] px-4 py-3">
            <div className="text-xs font-black text-white">{t.title}</div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white" aria-label={t.close}><X className="h-4 w-4" /></button>
          </div>
          <SupportChat audience="prospect" embedded defaultOpen />
          {hasDirectContact && (
            <div className="border-t border-white/10 bg-[#050d19] p-3">
              <div className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{t.direct}</div>
              <div className="flex flex-wrap gap-2">
                <ActionLink href={contactLinks.whatsapp} label="WhatsApp" icon={<FaWhatsapp className="h-4 w-4" />} />
                <ActionLink href={contactLinks.sms} label="SMS" icon={<MessageSquareText className="h-4 w-4" />} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-3 rounded-full border border-orange-400/40 bg-orange-600 px-5 py-3 text-sm font-black text-white shadow-[0_18px_55px_rgba(255,106,0,.28)]"
        >
          <MessageCircle className="h-5 w-5" /> {t.trigger}
        </button>
      )}
    </div>
  );
}