import { formatEur } from "@/lib/catalog";

export function OrderAmounts({
  subtotalCents,
  shippingCents,
}: {
  subtotalCents: number;
  shippingCents: number;
}) {
  return (
    <div className="mt-6 space-y-2 border-t border-border pt-4">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span>Sous-total TTC</span>
        <span>{formatEur(subtotalCents)}</span>
      </div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span>Livraison</span>
        <span>{shippingCents === 0 ? "Offerte" : formatEur(shippingCents)}</span>
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm">Total TTC</span>
        <span className="font-serif text-2xl">
          {formatEur(subtotalCents + shippingCents)}
        </span>
      </div>
    </div>
  );
}
