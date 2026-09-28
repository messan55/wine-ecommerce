import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderAddress } from "@/components/order-address";
import { OrderAmounts } from "@/components/order-amounts";
import { ShipOrderButton } from "@/components/ship-order-button";
import { Button } from "@/components/ui/button";
import { formatBottleCount, formatEur } from "@/lib/catalog";
import { canShipOrder, orderStatusLabel } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Commande",
  description: "Détail d’une commande à traiter.",
};

export default async function AdminOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const raw = await searchParams;
  const shipped = first(raw.expediee) === "1";
  const mailSkipped = first(raw.courrier) === "0";
  const already = first(raw.erreur) === "deja";

  const order = await prisma.order.findUnique({
    where: { id },
    include: { lines: { orderBy: { name: "asc" } }, user: { select: { email: true } } },
  });
  if (!order) notFound();

  const bottles = order.lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="text-sm text-muted-foreground">
        <Link href="/admin/commandes" className="hover:text-foreground">
          Commandes
        </Link>
      </nav>
      <h1 className="mt-4 font-serif text-4xl sm:text-5xl">
        {formatDate(order.createdAt)}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {formatBottleCount(bottles)} · {formatEur(order.totalCents)} TTC ·{" "}
        {orderStatusLabel(order.status)}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {order.email ?? order.user?.email ?? "Sans e-mail"} · Référence {order.id}
      </p>
      {order.shippedAt ? (
        <p className="mt-1 text-sm text-muted-foreground">
          Expédiée le {formatDate(order.shippedAt)}
        </p>
      ) : null}

      {shipped ? (
        <p className="mt-6 text-sm" role="status">
          {mailSkipped
            ? "Commande expédiée. L’e-mail n’est pas parti (SMTP absent ou en erreur)."
            : "Commande expédiée. Un e-mail est parti au client."}
        </p>
      ) : null}
      {already ? (
        <p className="mt-6 text-sm text-destructive" role="alert">
          Cette commande n’est plus à expédier.
        </p>
      ) : null}

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

      <div className="mt-8 flex flex-wrap gap-3">
        {canShipOrder(order.status) ? <ShipOrderButton id={order.id} /> : null}
        <Button asChild variant="outline" className="h-10">
          <Link href="/admin/commandes">Retour aux commandes</Link>
        </Button>
      </div>
    </div>
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
  }).format(value);
}

function first(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}
