export type CheckoutLineInput = {
  slug: string;
  quantity: number;
};

export class CheckoutError extends Error {
  constructor(
    readonly code: "empty" | "stock" | "config" | "unknown",
    message: string,
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

export function parseCheckoutLines(raw: unknown): CheckoutLineInput[] {
  if (!raw || typeof raw !== "object" || !("lines" in raw)) {
    throw new CheckoutError("empty", "Le panier est vide.");
  }

  const lines = (raw as { lines: unknown }).lines;
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new CheckoutError("empty", "Le panier est vide.");
  }

  const merged = new Map<string, number>();
  for (const item of lines) {
    if (!item || typeof item !== "object") continue;
    const slug = "slug" in item ? item.slug : undefined;
    const quantity = "quantity" in item ? item.quantity : undefined;
    if (typeof slug !== "string" || slug.length === 0) continue;
    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      continue;
    }
    merged.set(slug, Math.min(99, (merged.get(slug) ?? 0) + quantity));
  }

  if (merged.size === 0) {
    throw new CheckoutError("empty", "Le panier est vide.");
  }
  if (merged.size > 30) {
    throw new CheckoutError("empty", "Trop de lignes dans le panier.");
  }

  return [...merged.entries()].map(([slug, quantity]) => ({ slug, quantity }));
}
