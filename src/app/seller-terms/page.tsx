import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Seller terms" };

export default function SellerTermsPage() {
  return (
    <LegalPage
      title="Seller terms"
      intro="These terms apply in addition to the general terms of use when you sell on DHIVE."
    >
      <section>
        <h2>1. Zero commission</h2>
        <p>
          DHIVE takes no commission on your sales. You receive the full listing price. Buyers pay the card processing
          fee on top at checkout. DHIVE may offer optional paid extras, such as featured placement, which you choose
          whether to buy.
        </p>
      </section>

      <section>
        <h2>2. Getting paid</h2>
        <ul>
          <li>
            Payouts are made by Paystack to the bank account you add in your dashboard, on Paystack&apos;s settlement
            schedule (usually the next business day).
          </li>
          <li>Make sure your bank details are correct. Paystack and DHIVE can&apos;t recover payouts sent to a wrong account you entered.</li>
          <li>You&apos;re responsible for declaring your income and any tax (including VAT, if you&apos;re registered).</li>
        </ul>
      </section>

      <section>
        <h2>3. What you can sell</h2>
        <ul>
          <li>Only products you created or have the right to sell, and only digital products you can deliver as a file.</li>
          <li>Describe products accurately, including what buyers need to use them.</li>
          <li>
            No malware, nothing unlawful, nothing that infringes someone else&apos;s rights, and nothing that collects
            people&apos;s data without their knowledge.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Your content</h2>
        <p>
          You keep ownership of what you upload. You give DHIVE permission to store it, show your listing, and deliver
          the file to people who buy or claim it.
        </p>
      </section>

      <section>
        <h2>5. Refunds and disputes</h2>
        <p>
          If a buyer reports that a product doesn&apos;t match its description or doesn&apos;t work, we&apos;ll contact you to
          resolve it. Where a refund is justified, it is funded from the sale proceeds. Card chargebacks are handled by
          Paystack under its rules.
        </p>
      </section>

      <section>
        <h2>6. Removal</h2>
        <p>
          We may unpublish listings or close seller accounts that break these terms, and will tell you why. Buyers keep
          access to products they&apos;ve already paid for. Questions: {SUPPORT_EMAIL}.
        </p>
      </section>
    </LegalPage>
  );
}
