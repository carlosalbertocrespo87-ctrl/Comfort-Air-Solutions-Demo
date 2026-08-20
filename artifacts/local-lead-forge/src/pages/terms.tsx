import { LegalShell, ReleaseBlockedNotice } from "@/components/legal-shell";
import { LEGAL_RELEASED } from "@/lib/legal-release";

export default function TermsPage() {
  return (
    <LegalShell title="Service Terms">
      {!LEGAL_RELEASED ? (
        <ReleaseBlockedNotice />
      ) : (
        <>
          <h2>Service scope</h2>
          <p>The applicable Order Form and Service Agreement define the subscribed Local Lead Forge services, pricing, responsibilities, limitations, and support terms.</p>
          <h2>Fees and billing</h2>
          <p>Fees, billing cadence, cancellation timing, and any refund treatment are governed by the customer-ready agreement version accepted before checkout.</p>
          <h2>No guaranteed outcomes</h2>
          <p>Local Lead Forge does not guarantee a specific number of leads, appointments, sales, revenue, search rankings, or return on investment.</p>
          <h2>Third-party services</h2>
          <p>Some functionality depends on third-party providers and may be subject to their availability and terms.</p>
        </>
      )}
    </LegalShell>
  );
}
