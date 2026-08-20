import { LegalShell, ReleaseBlockedNotice } from "@/components/legal-shell";
import { LEGAL_RELEASED } from "@/lib/legal-release";

export default function DpaPage() {
  return (
    <LegalShell title="Data Processing Addendum">
      {!LEGAL_RELEASED ? (
        <ReleaseBlockedNotice />
      ) : (
        <>
          <h2>Applicability</h2>
          <p>This addendum applies when Local Lead Forge processes personal data on a client&apos;s behalf as described in the applicable agreement.</p>
          <h2>Roles and instructions</h2>
          <p>The final approved DPA identifies the parties&apos; roles, documented processing instructions, confidentiality obligations, security measures, subprocessors, and deletion/return obligations.</p>
          <h2>Subprocessors</h2>
          <p>The subprocessor list is populated from the production provider inventory verified immediately before customer-ready release.</p>
        </>
      )}
    </LegalShell>
  );
}
