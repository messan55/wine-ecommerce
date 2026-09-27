import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OrderAddress } from "@/components/order-address";
import { OrderAmounts } from "@/components/order-amounts";
import { Button } from "@/components/ui/button";
import { formatBottleCount, formatEur } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth";
import { VISIBLE_STATUSES } from "@/lib/checkout";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Commande",
  description: "Détail d’une commande Cave Solive.",
};

export default async function AccountOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/compte/connexion?next=/compte");
  }

  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: user.id, status: { in: [...VISIBLE_STATUSES] } },
    include: { lines: { orderBy: { name: "asc" } } },
  });
  if (!order) notFound();

  const bottles = order.lines.reduce((sum, line) => sum + line.quantity, 0);
  const when = order.paidAt ?? order.createdAt;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="text-sm text-muted-foreground">
        <Link href="/compte" className="hover:text-foreground">
          Vos commandes
        </Link>
      </nav>
      <h1 className="mt-4 font-serif text-4xl sm:text-5xl">
        {formatDate(when)}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {formatBottleCount(bottles)} · {formatEur(order.totalCents)} TTC ·{" "}
        {order.status === "paid"
          ? "Payée"
          : order.status === "pending"
            ? "En cours"
            : "Enregistrée"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Référence {order.id}
      </p>

      <ul className="mt-8 divide-y divide-border border-y border-border">
        {order.lines.map((line) => (
          <li
            key={line.id}
            className="flex items-baseline justify-between gap-4 py-4"
          >
            <div>
              <p className="font-serif text-xl">{line.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {line.quantity} × {formatEur(line.unitCents)}
              </p>
            </div>
            <p className="font-serif text-xl">
              {formatEur(line.unitCents * line.quantity)}
            </p>
          </li>
        ))}
      </ul>
      <OrderAddress order={order} />
      <OrderAmounts
        subtotalCents={order.totalCents - order.shippingCents}
        shippingCents={order.shippingCents}
      />

      <Button asChild className="mt-8 h-10" variant="outline">
        <Link href="/compte">Retour aux commandes</Link>
      </Button>
    </div>
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
  }).format(value);
}
