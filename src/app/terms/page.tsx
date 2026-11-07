import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { COMPANY, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      intro={`These terms apply when you use DHIVE, a marketplace operated by ${COMPANY.name} in ${COMPANY.country}. By using DHIVE you agree to them.`}
    >
      <section>
        <h2>1. What DHIVE is</h2>
        <p>
          DHIVE is a marketplace where independent sellers list digital products such as AI tools, automations,
          templates, ebooks and courses. When you buy something on DHIVE, you buy it from the seller. DHIVE provides
          the platform, but is not the seller of the products listed.
        </p>
      </section>

      <section>
        <h2>2. Your account</h2>
        <ul>
          <li>You sign in with a one-time link sent to your email. Keep access to that inbox secure.</li>
          <li>You must be at least 18, or have a parent or guardian&apos;s permission, to buy on DHIVE.</li>
          <li>You&apos;re responsible for activity on your account. Tell us at {SUPPORT_EMAIL} if you think it&apos;s been misused.</li>
        </ul>
      </section>

      <section>
        <h2>3. Buying</h2>
        <ul>
          <li>Prices are in South African rand. The listing price goes to the seller in full.</li>
          <li>
            Card payments are processed by Paystack. A payment processing fee is shown separately at checkout and added
            to the total. DHIVE does not charge buyers or sellers a commission.
          </li>
          <li>After payment, the product is available to download from your purchases page.</li>
          <li>
            You receive a personal licence to use what you buy, on the terms the seller describes. You may not resell
            or redistribute it unless the seller says you can.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Refunds</h2>
        <p>
          Because products are digital and delivered instantly, purchases are generally final. If a product is
          materially different from its description, doesn&apos;t work as described, or can&apos;t be downloaded, contact
          us at {SUPPORT_EMAIL} within 14 days. We&apos;ll work with the seller to fix it or arrange a refund. Your rights
          under the Consumer Protection Act and the Electronic Communications and Transactions Act are not affected.
        </p>
      </section>

      <section>
        <h2>5. What you may not do</h2>
        <ul>
          <li>Use DHIVE for anything unlawful, fraudulent or harmful.</li>
          <li>Upload or sell content you don&apos;t have the rights to, or malware.</li>
          <li>Try to access other people&apos;s accounts, files or data, or interfere with the platform.</li>
        </ul>
        <p>We may suspend accounts or remove listings that break these terms.</p>
      </section>

      <section>
        <h2>6. Liability</h2>
        <p>
          Sellers are responsible for their products. To the extent the law allows, DHIVE is not liable for losses
          arising from products bought from sellers, or from the platform being temporarily unavailable. Nothing in
          these terms limits liability that can&apos;t be limited under South African law.
        </p>
      </section>

      <section>
        <h2>7. Changes and contact</h2>
        <p>
          We may update these terms; the date at the top shows the latest version. These terms are governed by the laws
          of South Africa. Questions: {SUPPORT_EMAIL}.
        </p>
      </section>
    </LegalPage>
  );
}
