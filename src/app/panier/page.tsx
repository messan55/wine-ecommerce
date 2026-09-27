import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { getCurrentUser } from "@/lib/auth";
import { cancelCheckoutSession } from "@/lib/checkout";
import { listWineCatalog } from "@/lib/wines";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Panier",
  description: "Les bouteilles retenues sur cet appareil, avant la commande.",
};

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const canceled = first(raw.annule) === "1";
  const sessionId = first(raw.session_id);
  if (canceled && sessionId) {
    await cancelCheckoutSession(sessionId);
  }

  const [wines, user] = await Promise.all([
    listWineCatalog(),
    getCurrentUser(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
        Avant la commande
      </p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Votre panier</h1>
      <div className="mt-8">
        <CartView
          wines={wines}
          canceled={canceled}
          signedIn={Boolean(user)}
        />
      </div>
    </div>
  );
}

function first(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}
