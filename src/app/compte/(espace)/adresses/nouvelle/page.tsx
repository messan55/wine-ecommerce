import type { Metadata } from "next";
import Link from "next/link";
import { AccountAddressForm } from "@/components/account-address-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nouvelle adresse",
  description: "Ajouter une adresse de livraison.",
};

export default function NewAddressPage() {
  return (
    <div>
      <h2 className="font-serif text-3xl">Nouvelle adresse</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        France métropolitaine uniquement.
      </p>
      <div className="mt-6">
        <AccountAddressForm />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        <Link href="/compte/adresses" className="underline underline-offset-4">
          Retour aux adresses
        </Link>
      </p>
    </div>
  );
}
