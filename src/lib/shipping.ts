import { formatEur } from "@/lib/catalog";

export const FREE_SHIPPING_FROM_CENTS = 8000;
export const SHIPPING_SMALL_CENTS = 800;
export const SHIPPING_CASE_CENTS = 1200;

export function shippingUnits(formatLabel: string, quantity: number) {
  const compact = formatLabel.toLowerCase().replace(/\s/g, "").replace(",", ".");
  if (compact.includes("150cl") || compact.includes("magnum")) {
    return quantity * 2;
  }
  return quantity;
}

export function shippingCents(subtotalCents: number, units: number) {
  if (units <= 0) return 0;
  if (subtotalCents >= FREE_SHIPPING_FROM_CENTS) return 0;
  return units >= 6 ? SHIPPING_CASE_CENTS : SHIPPING_SMALL_CENTS;
}

export function shippingHint(subtotalCents: number, feeCents: number) {
  if (feeCents === 0 && subtotalCents >= FREE_SHIPPING_FROM_CENTS) {
    return "Livraison offerte en France métropolitaine.";
  }
  const missing = FREE_SHIPPING_FROM_CENTS - subtotalCents;
  if (missing > 0) {
    return `France métropolitaine. Offerte dès 80 € (encore ${formatEur(missing)}).`;
  }
  return "France métropolitaine.";
}
