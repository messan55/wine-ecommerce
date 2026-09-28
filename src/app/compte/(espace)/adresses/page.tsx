import type { Metadata } from "next";
import Link from "next/link";
import {
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/app/compte/actions";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { formatBookLines } from "@/lib/address";
import { listUserAddresses } from "@/lib/user-address";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Adresses",
  description: "Adresses de livraison enregistrées sur le compte.",
};

export default async function AccountAddressesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const addresses = await listUserAddresses(user.id);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="max-w-xl text-sm text-muted-foreground">
          France métropolitaine. L’adresse habituelle est reprise au checkout.
        </p>
        <Button asChild className="h-10">
          <Link href="/compte/adresses/nouvelle">Ajouter une adresse</Link>
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="mt-8 max-w-lg border border-dashed border-border bg-card px-6 py-12">
          <h2 className="font-serif text-3xl">Aucune adresse pour l’instant.</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Enregistrez-en une, plus besoin de la retaper à chaque commande.
          </p>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {addresses.map((address) => (
            <li
              key={address.id}
              className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start sm:justify-between"
            >
              <div>
                <p className="font-serif text-2xl">{address.name}</p>
                {formatBookLines(address).map((line) => (
                  <p
                    key={line}
                    className="mt-1 text-sm text-muted-foreground first:mt-2"
                  >
                    {line}
                  </p>
                ))}
                {address.phone ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {address.phone}
                  </p>
                ) : null}
                {address.isDefault ? (
                  <p className="mt-2 text-xs tracking-[0.18em] text-wine uppercase">
                    Habituelle
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" className="h-10">
                  <Link href={`/compte/adresses/${address.id}`}>Modifier</Link>
                </Button>
                {!address.isDefault ? (
                  <form action={setDefaultAddressAction}>
                    <input type="hidden" name="id" value={address.id} />
                    <Button type="submit" variant="outline" className="h-10">
                      Habituelle
                    </Button>
                  </form>
                ) : null}
                <form action={deleteAddressAction}>
                  <input type="hidden" name="id" value={address.id} />
                  <Button type="submit" variant="outline" className="h-10">
                    Retirer
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
