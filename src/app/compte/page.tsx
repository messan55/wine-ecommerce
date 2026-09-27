import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/compte/actions";
import { Button } from "@/components/ui/button";
import { formatBottleCount, formatEur } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth";
import { VISIBLE_STATUSES } from "@/lib/checkout";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Votre compte",
  description: "Historique des commandes Cave Solive.",
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/compte/connexion?next=/compte");
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id, status: { in: [...VISIBLE_STATUSES] } },
    include: { lines: { orderBy: { name: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
            Compte
          </p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl">
            Vos commandes
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {user.isAdmin ? (
            <Button asChild variant="outline" className="h-10">
              <Link href="/admin">Administration</Link>
            </Button>
          ) : null}
          <form action={logoutAction}>
            <Button type="submit" variant="outline" className="h-10">
              Se déconnecter
            </Button>
          </form>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="mt-10 max-w-lg border border-dashed border-border bg-card px-6 py-12">
          <h2 className="font-serif text-3xl">Aucune commande pour l’instant.</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Les commandes passées avec ce compte s’afficheront ici.
          </p>
          <Button asChild className="mt-6 h-10">
            <Link href="/">Retour à la cave</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-border border-y border-border">
          {orders.map((order) => {
            const bottles = order.lines.reduce(
              (sum, line) => sum + line.quantity,
              0,
            );
            const when = order.paidAt ?? order.createdAt;
            return (
              <li key={order.id}>
                <Link
                  href={`/compte/commandes/${order.id}`}
                  className="flex flex-col gap-1 py-5 hover:text-wine sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <div>
                    <p className="font-serif text-2xl">
                      {formatDate(when)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatBottleCount(bottles)} · {formatEur(order.totalCents)}
                    </p>
                  </div>
                  <p className="text-sm tracking-wide uppercase">
                    {orderStatusLabel(order.status)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
  }).format(value);
}

function orderStatusLabel(status: string) {
  if (status === "paid") return "Payée";
  if (status === "pending") return "En cours";
  return "Enregistrée";
}
