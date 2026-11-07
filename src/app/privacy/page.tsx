import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { COMPANY, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      intro={`How ${COMPANY.name} (the responsible party for DHIVE) collects and uses your personal information, in line with the Protection of Personal Information Act (POPIA).`}
    >
      <section>
        <h2>1. What we collect</h2>
        <ul>
          <li>
            <strong>Account:</strong> your email address and the display name you choose.
          </li>
          <li>
            <strong>Purchases and sales:</strong> what you bought or sold, amounts and dates.
          </li>
          <li>
            <strong>Sellers:</strong> listings and files you upload. Bank details for payouts are sent directly to
            Paystack; DHIVE does not store your account number.
          </li>
          <li>
            <strong>Technical:</strong> sign-in cookies needed to keep you logged in, and basic server logs.
          </li>
        </ul>
        <p>We don&apos;t collect card details. Payments are handled entirely by Paystack.</p>
      </section>

      <section>
        <h2>2. Why we use it</h2>
        <ul>
          <li>To run your account, process purchases and deliver what you bought.</li>
          <li>To pay sellers and keep records we&apos;re legally required to keep.</li>
          <li>To prevent fraud and keep the platform secure.</li>
          <li>To contact you about your account or purchases. We don&apos;t send marketing without your consent.</li>
        </ul>
      </section>

      <section>
        <h2>3. Who we share it with</h2>
        <p>Only the service providers needed to run DHIVE, under their own data protection terms:</p>
        <ul>
          <li>
            <strong>Paystack</strong>: payment processing and seller payouts.
          </li>
          <li>
            <strong>Supabase</strong>: database, sign-in and file storage (hosted in the EU).
          </li>
          <li>
            <strong>Vercel</strong>: website hosting.
          </li>
        </ul>
        <p>
          Sellers see what was sold and when, but not who bought it. Some providers
          process data outside South Africa; we only use providers with adequate protection, as POPIA requires.
        </p>
      </section>

      <section>
        <h2>4. How long we keep it</h2>
        <p>
          While your account is active, and afterwards only as long as needed for legal, tax and dispute purposes.
        </p>
      </section>

      <section>
        <h2>5. Your rights</h2>
        <p>
          You can ask to access, correct or delete your personal information, or object to how it&apos;s used, by emailing{" "}
          {SUPPORT_EMAIL}. You may also complain to the Information Regulator (South Africa) at inforegulator.org.za.
        </p>
      </section>

      <section>
        <h2>6. Contact</h2>
        <p>Information Officer, {COMPANY.name}: {SUPPORT_EMAIL}.</p>
      </section>
    </LegalPage>
  );
}
