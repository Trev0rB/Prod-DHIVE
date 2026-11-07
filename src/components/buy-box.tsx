import { buyProduct } from "@/app/checkout/actions";
import { checkoutFor } from "@/lib/fees";
import { formatAmount, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

const ERRORS: Record<string, string> = {
  disabled: "Card payments open very soon. Check back shortly.",
  "seller-payouts": "This seller is still setting up payouts, so it can't be bought yet.",
  own: "This is your own listing.",
  unavailable: "This listing is no longer available.",
  failed: "We couldn't start the payment. Please try again.",
  invalid: "Something went wrong. Please try again.",
};

/** Price, fee breakdown and the Buy button. Server-rendered; the button posts to a Server Action. */
export function BuyBox({
  product,
  checkoutError,
  paymentsLive,
}: {
  product: Product;
  checkoutError?: string;
  paymentsLive: boolean;
}) {
  const free = product.priceCents === 0;
  const { feeCents, totalCents } = checkoutFor(product.priceCents);
  const canBuy = free || (paymentsLive && product.sellerPayoutsReady);
  const error = checkoutError ? (ERRORS[checkoutError] ?? ERRORS.invalid) : null;

  return (
    <aside className="h-fit rounded-xl border border-line p-6 lg:sticky lg:top-24">
      <p className="font-display text-4xl font-bold">{formatPrice(product.priceCents)}</p>
      <p className="mt-1 text-sm text-ink-soft">Once-off · instant digital download</p>

      {!free && (
        <dl className="mt-5 space-y-1.5 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-soft">Price (goes to the seller)</dt>
            <dd>{formatPrice(product.priceCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-soft">Payment processing</dt>
            <dd>{formatAmount(feeCents)}</dd>
          </div>
          <div className="flex justify-between font-semibold">
            <dt>Total</dt>
            <dd>{formatAmount(totalCents)}</dd>
          </div>
        </dl>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-honey-wash p-3 text-sm text-amber-900">
          {error}
        </p>
      )}

      <form action={buyProduct} className="mt-5">
        <input type="hidden" name="productId" value={product.id} />
        <input type="hidden" name="slug" value={product.slug} />
        <button
          type="submit"
          disabled={!canBuy}
          className="w-full rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-paper hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-brand/50"
        >
          {free ? "Get it free" : canBuy ? `Buy for ${formatAmount(totalCents)}` : "Not available yet"}
        </button>
      </form>

      <ul className="mt-5 space-y-2 text-sm text-ink-soft">
        {!free && <li>✓ Secure card payment with Paystack</li>}
        <li>✓ {free ? "Free download" : "100% of the price goes to the seller"}</li>
        <li>✓ Download any time from your library</li>
      </ul>
    </aside>
  );
}
