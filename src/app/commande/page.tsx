import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/checkout-form";
import { getCurrentUser } from "@/lib/auth";
import { getLastShippingAddress } from "@/lib/checkout";
import { listWineCatalog } from "@/lib/wines";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Commande",
  description: "Adresse, frais et confirmation de votre sélection.",
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/compte/connexion?next=/commande");
  }

  const [wines, lastAddress] = await Promise.all([
    listWineCatalog(),
    getLastShippingAddress(user.id),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
        Commande
      </p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">
        Où l’envoyer ?
      </h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        {user.email}. Les frais de livraison sont calculés ici, avant le
        règlement.
      </p>
      <div className="mt-8">
        <CheckoutForm wines={wines} lastAddress={lastAddress} />
      </div>
    </div>
  );
}
