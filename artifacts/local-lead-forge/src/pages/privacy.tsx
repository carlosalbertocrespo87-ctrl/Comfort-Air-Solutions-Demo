import { LegalShell, ReleaseBlockedNotice } from "@/components/legal-shell";
import { LEGAL_RELEASED } from "@/lib/legal-release";

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy">
      {!LEGAL_RELEASED ? (
        <ReleaseBlockedNotice />
      ) : (
        <>
          <h2>Overview</h2>
          <p>Local Lead Forge explains here how information is collected, used, disclosed, retained, and protected in connection with its services.</p>
          <h2>Information we process</h2>
          <p>Business contact information, lead-submission information, onboarding/configuration information, billing/account metadata, and operational/security logs may be processed as applicable to the service.</p>
          <h2>Service providers</h2>
          <p>Production providers are disclosed from the final verified provider inventory in force at publication time.</p>
          <h2>Retention and requests</h2>
          <p>Retention periods and request procedures are governed by the final approved policy version and applicable contractual/legal requirements.</p>
        </>
      )}
    </LegalShell>
  );
}
