import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_EFFECTIVE_DATE,
  LEGAL_RELEASED,
  LEGAL_VERSION,
} from "@/lib/legal-release";

type LegalShellProps = {
  title: string;
  children: React.ReactNode;
  version?: string;
  effectiveDate?: string;
  showReleaseGate?: boolean;
};

export function LegalShell({
  title,
  children,
  version = LEGAL_VERSION,
  effectiveDate = LEGAL_EFFECTIVE_DATE,
  showReleaseGate = true,
}: LegalShellProps) {
  return (
    <main className="min-h-screen bg-[#030914] px-5 py-10 text-slate-200 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <a href="/" className="text-sm font-black tracking-[0.14em] text-orange-500">LOCAL LEAD FORGE</a>
        <div className="mt-8 rounded-2xl border border-white/10 bg-[#07111f] p-6 sm:p-10">
          {showReleaseGate && !LEGAL_RELEASED && (
            <div className="mb-7 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              Internal release gate active. This page is technically prepared but is not customer-ready legal content yet.
            </div>
          )}
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-400">Legal</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h1>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
            <span>Version: {version}</span>
            <span>Effective: {effectiveDate}</span>
          </div>
          <div className="prose prose-invert mt-8 max-w-none prose-headings:text-white prose-a:text-orange-400 prose-p:text-slate-300 prose-li:text-slate-300">
            {children}
          </div>
          <div className="mt-10 border-t border-white/10 pt-6 text-xs text-slate-500">
            Contact: <a className="text-orange-400" href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>
          </div>
        </div>
      </div>
    </main>
  );
}

export function ReleaseBlockedNotice() {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-5 text-sm leading-6 text-slate-300">
      Customer-ready language will appear here only after final entity/address facts are complete and the appropriate legal review/decision is recorded. No draft terms are being presented as approved legal terms.
    </div>
  );
}
