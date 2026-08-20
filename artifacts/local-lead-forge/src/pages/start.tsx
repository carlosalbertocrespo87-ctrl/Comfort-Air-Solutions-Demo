import { useMemo, useState } from "react";

import { CHECKOUT_URLS, LEGAL_PATHS, LEGAL_RELEASED, LEGAL_VERSION } from "@/lib/legal-release";

export default function StartPage() {
  const [accepted, setAccepted] = useState(false);
  const checkoutConfigured = Boolean(CHECKOUT_URLS.setup && CHECKOUT_URLS.monthly);
  const canContinue = LEGAL_RELEASED && checkoutConfigured && accepted;
  const target = useMemo(() => CHECKOUT_URLS.setup || "#", []);

  return (
    <main className="min-h-screen bg-[#030914] px-5 py-10 text-slate-200 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="text-sm font-black tracking-[0.14em] text-orange-500">LOCAL LEAD FORGE</a>
        <div className="mt-8 rounded-2xl border border-white/10 bg-[#07111f] p-6 sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-400">Founding Client Checkout</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Review and accept before payment.</h1>
          <p className="mt-4 text-sm leading-6 text-slate-400">Setup: $299 one time. Monthly service: $199/month. Final scope and billing terms are controlled by the customer-ready Order Form and Service Agreement version presented before checkout.</p>

          {!LEGAL_RELEASED && (
            <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-200">
              Checkout release is intentionally locked until final entity/address facts, legal review/decision, and publication QA are complete.
            </div>
          )}

          <div className="mt-7 rounded-xl border border-white/10 bg-black/20 p-5">
            <div className="text-sm font-bold text-white">Documents in force</div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <a className="text-orange-400 hover:text-orange-300" href={LEGAL_PATHS.terms}>Service Terms</a>
              <a className="text-orange-400 hover:text-orange-300" href={LEGAL_PATHS.privacy}>Privacy Policy</a>
              <a className="text-orange-400 hover:text-orange-300" href={LEGAL_PATHS.dpa}>DPA</a>
            </div>
            <div className="mt-3 text-xs text-slate-500">Version: {LEGAL_VERSION}</div>
          </div>

          <label className="mt-6 flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-5 text-sm leading-6 text-slate-300">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-orange-500"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              disabled={!LEGAL_RELEASED}
            />
            <span>I have reviewed and agree to the customer-ready Service Terms, Privacy Policy, applicable Order Form, and DPA where applicable.</span>
          </label>

          <a
            href={canContinue ? target : undefined}
            aria-disabled={!canContinue}
            className={`mt-6 inline-flex w-full items-center justify-center rounded-lg px-6 py-3 text-sm font-extrabold transition ${
              canContinue
                ? "bg-orange-600 text-white hover:bg-orange-500"
                : "cursor-not-allowed border border-white/10 bg-white/5 text-slate-600"
            }`}
          >
            Continue to secure payment
          </a>

          <p className="mt-3 text-xs text-slate-600">The acceptance checkbox is never pre-checked. Payment remains blocked unless legal release is active, the exact legal version is displayed, and a checkout destination is configured.</p>
        </div>
      </div>
    </main>
  );
}
