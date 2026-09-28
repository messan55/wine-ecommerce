import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountAddressForm } from "@/components/account-address-form";
import { getCurrentUser } from "@/lib/auth";
import { getUserAddress } from "@/lib/user-address";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Modifier l’adresse",
  description: "Mettre à jour une adresse de livraison.",
};

export default async function EditAddressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { id } = await params;
  const address = await getUserAddress(user.id, id);
  if (!address) notFound();

  return (
    <div>
      <h2 className="font-serif text-3xl">Modifier l’adresse</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        France métropolitaine uniquement.
      </p>
      <div className="mt-6">
        <AccountAddressForm address={address} addressId={address.id} />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        <Link href="/compte/adresses" className="underline underline-offset-4">
          Retour aux adresses
        </Link>
      </p>
    </div>
  );
}
