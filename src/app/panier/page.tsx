import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { listWineCatalog } from "@/lib/wines";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Panier",
  description: "Les bouteilles retenues sur cet appareil, avant le paiement.",
};

export default async function CartPage() {
  const wines = await listWineCatalog();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
        Avant le paiement
      </p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Votre panier</h1>
      <div className="mt-8">
        <CartView wines={wines} />
      </div>
    </div>
  );
}
